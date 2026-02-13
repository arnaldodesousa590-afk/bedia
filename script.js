document.addEventListener("DOMContentLoaded", function() {
    const SB_URL = "https://vskczoxyspfyjeuyffbl.supabase.co";
    const SB_KEY = "sb_publishable_PMTgG1tjs9lLO6k6lV6_fA_MkErLXJe";

    const capitulos = [
        { n: "Capítulo 01", l: "20 SOBRE LOVE - 01.pdf" },
        { n: "Capítulo 02", l: "20 SOBRE LOVE - 02.pdf" },
        { n: "Capítulo 03", l: "20 SOBRE LOVE - 03_compressed.pdf" },
        { n: "Capítulo 04", l: "20 SOBRE LOVE - 04.pdf" },
        { n: "Capítulo 05", l: "20 SOBRE LOVE - 05.pdf" },
        { n: "Capítulo 05.5", l: "20 SOBRE LOVE - 05.5.pdf" },
        { n: "Capítulo 06", l: "20 SOBRE LOVE - 06.pdf" },
        { n: "Capítulo 06.5", l: "20 SOBRE LOVE - 06.5.pdf" },
        { n: "Capítulo 07", l: "20 SOBRE LOVE - 07.pdf" }
    ];

    async function carregarDB() {
        try {
            const resV = await fetch(`${SB_URL}/rest/v1/interacoes?obra_nome=eq.20%20SOBRE%20LOVE`, {
                headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
            });
            const dadosV = await resV.json();
            if (dadosV.length > 0) {
                document.getElementById("likeCount").innerText = dadosV[0].like || 0;
                document.getElementById("dislikeCount").innerText = dadosV[0].dislikes || 0;
            }

            const resC = await fetch(`${SB_URL}/rest/v1/comentarios_bedia?obra_nome=eq.20%20SOBRE%20LOVE&order=created_at.desc`, {
                headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
            });
            const coments = await resC.json();
            document.getElementById("listaComentarios").innerHTML = coments.map(c => 
                `<p><b>${c.leitor_nome}:</b> ${c.mensagem}</p>`
            ).join('');
        } catch (e) { console.error("Erro na base de dados"); }
    }

    window.abrirModal = function() {
        document.getElementById("chapterModal").style.display = "flex";
        const lista = document.getElementById("chapterList");
        lista.innerHTML = "";
        capitulos.forEach(cap => {
            const a = document.createElement("a");
            a.href = cap.l;
            a.target = "_blank";
            a.className = "chapter-btn";
            a.innerText = cap.n;
            lista.appendChild(a);
        });
        carregarDB();
    };

    document.getElementById("btnFecharJanela").onclick = () => document.getElementById("chapterModal").style.display = "none";

    document.getElementById("likeBtn").onclick = () => votar('like');
    document.getElementById("dislikeBtn").onclick = () => votar('dislikes');

    async function votar(tipo) {
        let span = document.getElementById(tipo === 'like' ? 'likeCount' : 'dislikeCount');
        let novo = parseInt(span.innerText) + 1;
        await fetch(`${SB_URL}/rest/v1/interacoes?obra_nome=eq.20%20SOBRE%20LOVE`, {
            method: 'PATCH',
            headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ [tipo]: novo })
        });
        span.innerText = novo;
    }

    document.getElementById("enviarComentBtn").onclick = async () => {
        const nome = document.getElementById("nomeUser").value || "Anónimo";
        const msg = document.getElementById("textoMsg").value;
        if (!msg) return;
        await fetch(`${SB_URL}/rest/v1/comentarios_bedia`, {
            method: 'POST',
            headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ obra_nome: "20 SOBRE LOVE", leitor_nome: nome, mensagem: msg })
        });
        document.getElementById("textoMsg").value = "";
        carregarDB();
    };
});