# Bédia Quadrinhos - Backend em Python (Flask)
import json
import os
import re
import uuid
from datetime import datetime
from flask import Flask, send_from_directory, request, jsonify
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder=".", static_url_path="")
DATA_FILE = os.path.join(os.path.dirname(__file__), "data.json")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_CAPAS = os.path.join(BASE_DIR, "uploads", "capas")
UPLOAD_PDF = os.path.join(BASE_DIR, "uploads", "pdf")
ALLOWED_IMAGES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_PDF = "application/pdf"

for d in (UPLOAD_CAPAS, UPLOAD_PDF):
    os.makedirs(d, exist_ok=True)


def slug(nome):
    """Gera um id único a partir do nome do mangá."""
    s = (nome or "").lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[-\s]+", "-", s).strip("-")
    return s or "manga"


def ler_dados():
    """Carrega mangás, capítulos e reações do ficheiro JSON."""
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            dados = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        dados = {"mangas": [], "capitulos": [], "reacoes": {}}
    # Garantir que cada mangá tem id
    for m in dados.get("mangas", []):
        if not m.get("id"):
            m["id"] = slug(m.get("nome", ""))
    return dados


def guardar_dados(dados):
    """Guarda dados no ficheiro JSON."""
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)


# ---------- API Mangás ----------

@app.route("/api/mangas", methods=["GET"])
def api_mangas():
    """Lista todos os mangás com contagem de likes/dislikes/comentários."""
    dados = ler_dados()
    reacoes = dados.get("reacoes", {})
    mangas = []
    for m in dados.get("mangas", []):
        mid = m.get("id") or slug(m.get("nome", ""))
        r = reacoes.get(mid, {"likes": 0, "dislikes": 0, "comments": []})
        mangas.append({
            "id": mid,
            "nome": m.get("nome", ""),
            "capa": m.get("capa", ""),
            "likes": r.get("likes", 0),
            "dislikes": r.get("dislikes", 0),
            "commentsCount": len(r.get("comments", []))
        })
    return jsonify(mangas)


@app.route("/api/mangas", methods=["POST"])
def api_add_manga():
    """Adiciona mangá: JSON (nome + capa URL) ou multipart (nome + ficheiro capa + ficheiro PDF)."""
    dados = ler_dados()
    nome = ""
    capa = ""
    pdf_path = ""
    titulo_capitulo = "Capítulo 01"

    if request.content_type and "multipart/form-data" in request.content_type:
        nome = (request.form.get("nome") or "").strip()
        f_capa = request.files.get("capa")
        f_pdf = request.files.get("pdf")
        if not nome:
            return jsonify({"erro": "Falta o nome do mangá."}), 400
        if not f_capa or not f_capa.filename:
            return jsonify({"erro": "Escolhe uma imagem de capa."}), 400
        if not f_pdf or not f_pdf.filename:
            return jsonify({"erro": "Escolhe o PDF do mangá/capítulo."}), 400
        if f_pdf.content_type != ALLOWED_PDF:
            return jsonify({"erro": "O ficheiro do mangá tem de ser PDF."}), 400
        mid = slug(nome)
        suf = uuid.uuid4().hex[:8]
        ext_capa = os.path.splitext(secure_filename(f_capa.filename))[1] or ".jpg"
        if ext_capa.lower() not in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
            ext_capa = ".jpg"
        fn_capa = f"{mid}_{suf}{ext_capa}"
        fn_pdf = f"{mid}_{suf}.pdf"
        path_capa = os.path.join(UPLOAD_CAPAS, fn_capa)
        path_pdf = os.path.join(UPLOAD_PDF, fn_pdf)
        try:
            f_capa.save(path_capa)
            f_pdf.save(path_pdf)
        except Exception as e:
            return jsonify({"erro": "Erro ao guardar ficheiros: " + str(e)}), 500
        capa = f"/uploads/capas/{fn_capa}"
        pdf_path = f"/uploads/pdf/{fn_pdf}"
        titulo_capitulo = request.form.get("titulo_capitulo", "").strip() or "Capítulo 01"
    else:
        body = request.get_json() or {}
        nome = (body.get("nome") or "").strip()
        capa = (body.get("capa") or "").strip()
        if not nome or not capa:
            return jsonify({"erro": "Faltam nome ou capa."}), 400
        mid = slug(nome)

    mid = mid or slug(nome)
    dados.setdefault("mangas", []).append({"id": mid, "nome": nome, "capa": capa})
    dados.setdefault("reacoes", {})[mid] = {"likes": 0, "dislikes": 0, "comments": []}
    if pdf_path:
        dados.setdefault("capitulos", []).append({
            "n": titulo_capitulo, "l": pdf_path, "capa": capa
        })
    guardar_dados(dados)
    return jsonify({"ok": True, "mangas": dados["mangas"]})


# ---------- API Capítulos ----------

@app.route("/api/capitulos", methods=["GET"])
def api_capitulos():
    dados = ler_dados()
    return jsonify(dados.get("capitulos", []))


@app.route("/api/capitulos", methods=["POST"])
def api_add_capitulo():
    dados = ler_dados()
    body = request.get_json() or {}
    n = (body.get("n") or "").strip()
    l = (body.get("l") or "").strip()
    capa = (body.get("capa") or "").strip()
    if not n or not l:
        return jsonify({"erro": "Faltam nome do capítulo (n) ou link/ficheiro (l)"}), 400
    if not capa:
        capa = "capa.jpeg"
    dados.setdefault("capitulos", []).append({"n": n, "l": l, "capa": capa})
    guardar_dados(dados)
    return jsonify({"ok": True, "capitulos": dados["capitulos"]})


# ---------- API Reações (like / dislike / comentários) ----------

@app.route("/api/reacoes/<manga_id>", methods=["GET"])
def api_get_reacoes(manga_id):
    """Devolve likes, dislikes e comentários de um mangá."""
    dados = ler_dados()
    r = dados.get("reacoes", {}).get(manga_id, {"likes": 0, "dislikes": 0, "comments": []})
    return jsonify({
        "likes": r.get("likes", 0),
        "dislikes": r.get("dislikes", 0),
        "comments": r.get("comments", [])
    })


@app.route("/api/reacoes/<manga_id>/like", methods=["POST"])
def api_like(manga_id):
    dados = ler_dados()
    dados.setdefault("reacoes", {})
    if manga_id not in dados["reacoes"]:
        dados["reacoes"][manga_id] = {"likes": 0, "dislikes": 0, "comments": []}
    dados["reacoes"][manga_id]["likes"] = dados["reacoes"][manga_id].get("likes", 0) + 1
    guardar_dados(dados)
    return jsonify({"ok": True, "likes": dados["reacoes"][manga_id]["likes"]})


@app.route("/api/reacoes/<manga_id>/dislike", methods=["POST"])
def api_dislike(manga_id):
    dados = ler_dados()
    dados.setdefault("reacoes", {})
    if manga_id not in dados["reacoes"]:
        dados["reacoes"][manga_id] = {"likes": 0, "dislikes": 0, "comments": []}
    dados["reacoes"][manga_id]["dislikes"] = dados["reacoes"][manga_id].get("dislikes", 0) + 1
    guardar_dados(dados)
    return jsonify({"ok": True, "dislikes": dados["reacoes"][manga_id]["dislikes"]})


@app.route("/api/reacoes/<manga_id>/comentarios", methods=["POST"])
def api_add_comment(manga_id):
    body = request.get_json() or {}
    autor = (body.get("autor") or "").strip() or "Anónimo"
    texto = (body.get("texto") or "").strip()
    if not texto:
        return jsonify({"erro": "Escreve um comentário."}), 400
    dados = ler_dados()
    dados.setdefault("reacoes", {})
    if manga_id not in dados["reacoes"]:
        dados["reacoes"][manga_id] = {"likes": 0, "dislikes": 0, "comments": []}
    dados["reacoes"][manga_id].setdefault("comments", []).append({
        "autor": autor[:80],
        "texto": texto[:500],
        "data": datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    })
    guardar_dados(dados)
    return jsonify({"ok": True, "comments": dados["reacoes"][manga_id]["comments"]})


# ---------- Uploads (capas e PDFs) ----------

@app.route("/uploads/<folder>/<filename>")
def serve_upload(folder, filename):
    if folder == "capas":
        return send_from_directory(UPLOAD_CAPAS, filename)
    if folder == "pdf":
        return send_from_directory(UPLOAD_PDF, filename)
    return "", 404


# ---------- Ficheiros estáticos ----------

@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/<path:path>")
def static_file(path):
    if path.startswith("uploads/"):
        parts = path.split("/", 2)
        if len(parts) >= 3 and parts[0] == "uploads":
            if parts[1] == "capas":
                return send_from_directory(UPLOAD_CAPAS, parts[2])
            if parts[1] == "pdf":
                return send_from_directory(UPLOAD_PDF, parts[2])
    return send_from_directory(".", path)


if __name__ == "__main__":
    print("Bédia Quadrinhos a correr em http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
