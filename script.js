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

    const modal = document.getElementById("chapterModal");
    const listaDiv = document.getElementById("chapterList");

    // --- FUNÇÃO PARA CARREGAR TUDO DA DB ---
    async function carregarDadosDB() {
        // Carregar Likes e Dislikes
        const res = await fetch(`${SB_URL}/rest/v1/interacoes?obra_nome=eq.20%20SOBRE%20LOVE`, {
            headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
        });
        const dados = await res.json();
        if (dados.length > 0) {
            document.getElementById("likeCount").innerText = dados[0].like || 0;
            document.getElementById("dislikeCount").innerText = dados[0].dislikes || 0;
        }

        // Carregar Comentários
        const resC = await fetch(`${SB_URL}/rest/v1/comentarios_bedia?obra_nome=eq.20%20SOBRE%20LOVE&order=created_at.desc`, {
            headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
        });
        const coments = await resC.json();
        const listaC = document.getElementById("listaComentarios");
        listaC.innerHTML = "";
        coments.forEach(c => {
            listaC.innerHTML += `<p><strong>${c.leitor_nome}:</strong> ${c.mensagem}</p>`;
        });
    }

    // --- BOTÕES DE VOTO ---
    async function votar(coluna) {
        let label = document.getElementById(coluna === 'like' ? "likeCount" : "dislikeCount");
        let novoValor = parseInt(label.innerText) + 1;

        await fetch(`${SB_URL}/rest/v1/interacoes?obra_nome=eq.20%20SOBRE%20LOVE`, {
            method: 'PATCH',
            headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ [coluna]: novoValor })
        });
        label.innerText = novoValor;
    }

    document.getElementById("likeBtn").onclick = () => votar('like');
    document.getElementById("dislikeBtn").onclick = () => votar('dislikes');

    // --- BOTÃO ENVIAR COMENTÁRIO ---
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
        carregarDadosDB();
    };

    // --- ABRIR MODAL (IGUAL AO TEU CÓDIGO) ---
    window.abrirModal = function() {
        modal.style.display = "flex";
        listaDiv.innerHTML = "";
        capitulos.forEach(cap => {
            const a = document.createElement("a");
            a.href = cap.l;
            a.target = "_blank";
            a.className = "chapter-btn";
            a.innerText = cap.n;
            listaDiv.appendChild(a);
        });
        carregarDadosDB();
    };

    document.getElementById("btnFecharJanela").onclick = () => modal.style.display = "none";
    
    // Configuração do Menu Lateral (Teu código)
    document.getElementById("btnAbrirMenu").onclick = () => document.getElementById("sideMenu").style.width = "250px";
    document.getElementById("btnFecharMenu").onclick = () => document.getElementById("sideMenu").style.width = "0";
});