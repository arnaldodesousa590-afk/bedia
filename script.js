document.addEventListener("DOMContentLoaded", function () {

    var mangas = [];
    var capitulos = [];

    /* localStorage: likes/dislikes/comentários quando o servidor não está ligado */
    var STORAGE_KEY = "bedia_reacoes";
    function getLocalReacoes() {
        try {
            var s = localStorage.getItem(STORAGE_KEY);
            return s ? JSON.parse(s) : { likes: {}, dislikes: {}, comments: {} };
        } catch (e) { return { likes: {}, dislikes: {}, comments: {} }; }
    }
    function saveLocalReacoes(data) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
    }
    function getLocalLikes(mangaId) { return getLocalReacoes().likes[mangaId] || 0; }
    function getLocalDislikes(mangaId) { return getLocalReacoes().dislikes[mangaId] || 0; }
    function getLocalComments(mangaId) { return getLocalReacoes().comments[mangaId] || []; }

    /* Fallback quando a API não responde (ex.: abrir o ficheiro diretamente) */
    var fallbackMangas = [
        { id: "20-sobre-love", nome: "20 Sobre Love", capa: "capa.jpeg", likes: 0, dislikes: 0, commentsCount: 0 }
    ];
    var fallbackCapitulos = [
        { n: "Capítulo 01", l: "20 SOBRE LOVE - 01.pdf", capa: "capa.jpeg" },
        { n: "Capítulo 02", l: "20 SOBRE LOVE - 02.pdf", capa: "capa.jpeg" },
        { n: "Capítulo 03", l: "20 SOBRE LOVE - 03_compressed.pdf", capa: "capa.jpeg" },
        { n: "Capítulo 04", l: "20 SOBRE LOVE - 04.pdf", capa: "capa.jpeg" },
        { n: "Capítulo 05", l: "20 SOBRE LOVE - 05.pdf", capa: "capa.jpeg" },
        { n: "Capítulo 05.5", l: "20 SOBRE LOVE - 05.5.pdf", capa: "capa.jpeg" },
        { n: "Capítulo 06", l: "20 SOBRE LOVE - 06.pdf", capa: "capa.jpeg" },
        { n: "Capítulo 06.5", l: "20 SOBRE LOVE - 06.5.pdf", capa: "capa.jpeg" },
        { n: "Capítulo 07", l: "20 SOBRE LOVE - 07.pdf", capa: "capa.jpeg" }
    ];

    var menu = document.getElementById("sideMenu");
    var modal = document.getElementById("chapterModal");
    var chapterListModal = document.getElementById("chapterListModal");
    var mangaGrid = document.getElementById("mangaGrid");
    var mangaList = document.getElementById("mangaList");
    var addMangaModal = document.getElementById("addMangaModal");
    var commentsModal = document.getElementById("commentsModal");
    var commentsList = document.getElementById("commentsList");
    var commentsModalTitulo = document.getElementById("commentsModalTitulo");

    /* MENU */
    document.getElementById("btnAbrirMenu").onclick = function() { menu.classList.add("active"); };
    document.getElementById("btnFecharMenu").onclick = function() { menu.classList.remove("active"); };

    /* LINKS DO MENU */
    document.querySelectorAll(".menu-link").forEach(function(link) {
        link.addEventListener("click", function(e) {
            var href = this.getAttribute("href") || "";
            if (href.startsWith("tel:")) {
                menu.classList.remove("active");
                return;
            }
            e.preventDefault();
            if (href.startsWith("#")) {
                var sec = document.querySelector(href);
                if (sec) {
                    menu.classList.remove("active");
                    sec.scrollIntoView({ behavior: "smooth" });
                }
            }
        });
    });

    /* MODAL CAPÍTULOS */
    document.getElementById("btnLerAgora").onclick = function() {
        document.querySelector(".mangas").scrollIntoView({ behavior: "smooth" });
    };
    document.getElementById("btnFecharModal").onclick = function() {
        modal.style.display = "none";
    };
    document.getElementById("btnVerMaisMangas").onclick = function() {
        document.querySelector(".mangas").scrollIntoView({ behavior: "smooth" });
    };
    document.getElementById("btnVerMaisCapitulos").onclick = function() {
        modal.style.display = "flex";
        carregarModal();
    };

    /* MODAL ADICIONAR MANGÁ - upload de capa + PDF */
    document.getElementById("btnAddManga").onclick = function() {
        addMangaModal.style.display = "flex";
        document.getElementById("addMangaNome").value = "";
        document.getElementById("addMangaCapaFile").value = "";
        document.getElementById("addMangaPdfFile").value = "";
        document.getElementById("addMangaTituloCap").value = "";
        document.getElementById("addMangaMsg").textContent = "";
    };
    document.getElementById("btnFecharAddManga").onclick = function() {
        addMangaModal.style.display = "none";
    };
    document.getElementById("formAddManga").onsubmit = function(e) {
        e.preventDefault();
        var nome = document.getElementById("addMangaNome").value.trim();
        var capaFile = document.getElementById("addMangaCapaFile").files[0];
        var pdfFile = document.getElementById("addMangaPdfFile").files[0];
        var msgEl = document.getElementById("addMangaMsg");
        var btnSubmit = document.getElementById("btnSubmitManga");
        if (!nome) { msgEl.textContent = "Escreve o nome do mangá."; msgEl.className = "form-msg erro"; return; }
        if (!capaFile) { msgEl.textContent = "Escolhe uma imagem de capa."; msgEl.className = "form-msg erro"; return; }
        if (!pdfFile) { msgEl.textContent = "Escolhe o PDF do mangá."; msgEl.className = "form-msg erro"; return; }
        var tituloCap = document.getElementById("addMangaTituloCap").value.trim() || "Capítulo 01";
        var formData = new FormData();
        formData.append("nome", nome);
        formData.append("capa", capaFile);
        formData.append("pdf", pdfFile);
        formData.append("titulo_capitulo", tituloCap);
        msgEl.textContent = "A enviar...";
        msgEl.className = "form-msg";
        btnSubmit.disabled = true;
        fetch("/api/mangas", { method: "POST", body: formData })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            btnSubmit.disabled = false;
            if (res.erro) { msgEl.textContent = res.erro; msgEl.className = "form-msg erro"; return; }
            addMangaModal.style.display = "none";
            msgEl.textContent = "";
            alert("Mangá publicado! Já está disponível no site para todos lerem.");
            carregarDados();
        })
        .catch(function() {
            btnSubmit.disabled = false;
            msgEl.textContent = "Erro de ligação. Corre o servidor (python app.py) e tenta outra vez.";
            msgEl.className = "form-msg erro";
        });
    };

    /* MODAL COMENTÁRIOS */
    document.getElementById("btnFecharComments").onclick = function() {
        commentsModal.style.display = "none";
    };
    document.getElementById("formComment").onsubmit = function(e) {
        e.preventDefault();
        var mangaId = document.getElementById("commentMangaId").value;
        var autor = document.getElementById("commentAutor").value.trim();
        var texto = document.getElementById("commentTexto").value.trim();
        if (!texto) return;
        fetch("/api/reacoes/" + encodeURIComponent(mangaId) + "/comentarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ autor: autor || "Anónimo", texto: texto })
        })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (res.erro) { alert(res.erro); return; }
            document.getElementById("commentTexto").value = "";
            carregarComentarios(mangaId);
            var list = document.getElementById("commentsList");
            var p = document.createElement("p");
            p.className = "form-msg sucesso";
            p.textContent = "Comentário enviado!";
            list.insertBefore(p, list.firstChild);
            setTimeout(function() { p.remove(); }, 3000);
        })
        .catch(function() {
            /* Sem servidor: guardar no browser e atualizar a lista + contagem no card */
            var data = getLocalReacoes();
            data.comments[mangaId] = data.comments[mangaId] || [];
            data.comments[mangaId].push({
                autor: autor || "Anónimo",
                texto: texto,
                data: new Date().toISOString().slice(0, 16).replace("T", " ")
            });
            saveLocalReacoes(data);
            document.getElementById("commentTexto").value = "";
            carregarComentarios(mangaId);
            var btnCom = document.querySelector(".btn-comentarios[data-manga-id=\"" + mangaId + "\"]");
            if (btnCom) {
                var n = (parseInt(btnCom.textContent.replace(/\D/g, ""), 10) || 0) + 1;
                btnCom.textContent = "💬 Comentários (" + n + ")";
            }
        });
    };

    /* API - carregar dados (usa fallback se a API falhar ou devolver vazio) */
    function carregarDados() {
        Promise.all([
            fetch("/api/mangas").then(function(r) { return r.ok ? r.json() : []; }).catch(function() { return []; }),
            fetch("/api/capitulos").then(function(r) { return r.ok ? r.json() : []; }).catch(function() { return []; })
        ]).then(function(resultados) {
            mangas = resultados[0] && resultados[0].length > 0 ? resultados[0] : fallbackMangas;
            capitulos = resultados[1] && resultados[1].length > 0 ? resultados[1] : fallbackCapitulos;
            /* Juntar contagens do localStorage (quando abres o ficheiro sem servidor) */
            var local = getLocalReacoes();
            mangas.forEach(function(m) {
                var id = m.id || "";
                m.likes = (m.likes || 0) + (local.likes[id] || 0);
                m.dislikes = (m.dislikes || 0) + (local.dislikes[id] || 0);
                m.commentsCount = (m.commentsCount || 0) + (local.comments[id] || []).length;
            });
            carregarMangas();
            carregarUltimosCapitulos();
        });
    }

    function esc(s) {
        if (!s) return "";
        return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/"/g, "&quot;");
    }

    function carregarMangas() {
        mangaList.innerHTML = "";
        mangas.forEach(function(m) {
            var id = m.id || "";
            var nome = esc(m.nome);
            var capa = m.capa || "";
            var likes = m.likes || 0;
            var dislikes = m.dislikes || 0;
            var commentsCount = m.commentsCount || 0;

            var card = document.createElement("div");
            card.className = "card";
            card.innerHTML =
                "<img src=\"" + esc(capa) + "\" alt=\"" + nome + "\">" +
                "<h4>" + nome + "</h4>" +
                "<div class=\"card-reacoes\">" +
                "<button type=\"button\" class=\"btn-like\" data-manga-id=\"" + esc(id) + "\" title=\"Gostei\">👍 <span class=\"num\">" + likes + "</span></button>" +
                "<button type=\"button\" class=\"btn-dislike\" data-manga-id=\"" + esc(id) + "\" title=\"Não gostei\">👎 <span class=\"num\">" + dislikes + "</span></button>" +
                "<button type=\"button\" class=\"btn-comentarios\" data-manga-id=\"" + esc(id) + "\" data-manga-nome=\"" + nome + "\">💬 Comentários (" + commentsCount + ")</button>" +
                "</div>" +
                "<button class=\"btn-ler\" onclick=\"abrirCapitulos()\">Ler</button>";
            mangaList.appendChild(card);
        });

        /* Like: tenta servidor; se falhar, guarda no browser (localStorage) */
        mangaList.querySelectorAll(".btn-like").forEach(function(btn) {
            btn.onclick = function() {
                var mid = this.getAttribute("data-manga-id");
                var span = btn.querySelector(".num");
                fetch("/api/reacoes/" + encodeURIComponent(mid) + "/like", { method: "POST" })
                    .then(function(r) { return r.json(); })
                    .then(function(res) {
                        if (res.ok && res.likes !== undefined && span) span.textContent = res.likes;
                    })
                    .catch(function() {
                        var data = getLocalReacoes();
                        data.likes[mid] = (data.likes[mid] || 0) + 1;
                        saveLocalReacoes(data);
                        if (span) span.textContent = (parseInt(span.textContent, 10) || 0) + 1;
                    });
            };
        });
        /* Dislike: igual ao like */
        mangaList.querySelectorAll(".btn-dislike").forEach(function(btn) {
            btn.onclick = function() {
                var mid = this.getAttribute("data-manga-id");
                var span = btn.querySelector(".num");
                fetch("/api/reacoes/" + encodeURIComponent(mid) + "/dislike", { method: "POST" })
                    .then(function(r) { return r.json(); })
                    .then(function(res) {
                        if (res.ok && res.dislikes !== undefined && span) span.textContent = res.dislikes;
                    })
                    .catch(function() {
                        var data = getLocalReacoes();
                        data.dislikes[mid] = (data.dislikes[mid] || 0) + 1;
                        saveLocalReacoes(data);
                        if (span) span.textContent = (parseInt(span.textContent, 10) || 0) + 1;
                    });
            };
        });
        /* Abrir comentários */
        mangaList.querySelectorAll(".btn-comentarios").forEach(function(btn) {
            btn.onclick = function() {
                var mid = this.getAttribute("data-manga-id");
                var nome = this.getAttribute("data-manga-nome") || "Mangá";
                document.getElementById("commentMangaId").value = mid;
                commentsModalTitulo.textContent = "Comentários – " + nome;
                commentsModal.style.display = "flex";
                carregarComentarios(mid);
            };
        });
    }

    function renderComentariosLista(comments) {
        commentsList.innerHTML = "";
        if (!comments || comments.length === 0) {
            commentsList.innerHTML = "<p class=\"sem-comentarios\">Ainda não há comentários. Sê o primeiro!</p>";
            return;
        }
        comments.forEach(function(c) {
            var div = document.createElement("div");
            div.className = "comment-item";
            div.innerHTML = "<strong>" + esc(c.autor) + "</strong> <span class=\"comment-data\">" + esc(c.data || "") + "</span><p>" + esc(c.texto) + "</p>";
            commentsList.appendChild(div);
        });
    }
    function carregarComentarios(mangaId) {
        commentsList.innerHTML = "<p class=\"loading\">A carregar...</p>";
        fetch("/api/reacoes/" + encodeURIComponent(mangaId))
            .then(function(r) { return r.json(); })
            .then(function(r) {
                var comments = r.comments || [];
                var local = getLocalComments(mangaId);
                renderComentariosLista(comments.concat(local));
            })
            .catch(function() {
                renderComentariosLista(getLocalComments(mangaId));
            });
    }

    function carregarUltimosCapitulos() {
        mangaGrid.innerHTML = "";
        var ultimos = capitulos.slice(-4).reverse();
        ultimos.forEach(function(cap) {
            var card = document.createElement("div");
            card.className = "card";
            var link = (cap.l || "").replace(/"/g, "&quot;").replace(/'/g, "\\'");
            card.innerHTML =
                "<img src=\"" + esc(cap.capa) + "\" alt=\"" + esc(cap.n) + "\">" +
                "<h4>" + esc(cap.n) + "</h4>" +
                "<button onclick=\"window.open('" + link + "','_blank')\">Ler</button>";
            mangaGrid.appendChild(card);
        });
    }

    function carregarModal() {
        chapterListModal.innerHTML = "";
        capitulos.forEach(function(cap) {
            var a = document.createElement("a");
            a.href = cap.l || "#";
            a.target = "_blank";
            a.innerText = cap.n || "";
            chapterListModal.appendChild(a);
        });
    }

    window.abrirCapitulos = function() {
        modal.style.display = "flex";
        carregarModal();
    };

    carregarDados();
});
