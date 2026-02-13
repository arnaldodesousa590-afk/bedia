document.addEventListener("DOMContentLoaded", function() {
    // 1. Configurações da Bédia-DB (Supabase)
    const SB_URL = "https://vskczoxyspfyjeuyffbl.supabase.co";
    const SB_KEY = "sb_publishable_PMTgG1tjs9lLO6k6lV6_fA_MkErLXJe"; // Tua chave da foto

    // 2. Lista de Capítulos (Mantendo os teus dados originais)
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

    // Seleção de Elementos do HTML
    const menu = document.getElementById("sideMenu");
    const modal = document.getElementById("chapterModal");
    const grid = document.getElementById("mangaGrid");
    const listaDiv = document.getElementById("chapterList");
    const likeCountLabel = document.getElementById("likeCount");

    // --- FUNÇÕES DO SISTEMA ---

    // Abrir Modal e Listar Capítulos
    function abrirModal() {
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
    }

    // Menu Lateral (Abrir/Fechar)
    document.getElementById("btnAbrirMenu").addEventListener("click", () => menu.style.width = "250px");
    document.getElementById("btnFecharMenu").addEventListener("click", () => menu.style.width = "0");

    // Fechar Janela Modal
    document.getElementById("btnFecharJanela").addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

    // --- LIGAÇÃO REAL COM A BASE DE DATA (LIKES) ---

    async function carregarLikes() {
        try {
            const res = await fetch(`${SB_URL}/rest/v1/interacoes?obra_nome=eq.20%20SOBRE%20LOVE`, {
                headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
            });
            const dados = await res.json();
            if (dados.length > 0) {
                likeCountLabel.innerText = dados[0].like; // Usa o nome 'like' da tua tabela
            }
        } catch (err) { console.error("Erro ao carregar likes:", err); }
    }

    async function adicionarLike() {
        let atual = parseInt(likeCountLabel.innerText);
        let novo = atual + 1;

        await fetch(`${SB_URL}/rest/v1/interacoes?obra_nome=eq.20%20SOBRE%20LOVE`, {
            method: 'PATCH',
            headers: { 
                "apikey": SB_KEY, 
                "Authorization": `Bearer ${SB_KEY}`,
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ like: novo })
        });
        likeCountLabel.innerText = novo;
        document.getElementById("likeBtn").style.color = "#ff0000";
    }

    document.getElementById("likeBtn").addEventListener("click", adicionarLike);

    // --- CRIAÇÃO DA CAPA NA TELA ---
    if (grid) {
        const card = document.createElement("div");
        card.className = "manga-card";
        card.innerHTML = `<img src="capa.jpeg" alt="Capa"><p>20 SOBRE LOVE</p>`;
        card.addEventListener("click", abrirModal);
        grid.appendChild(card);
    }

    // Iniciar
    carregarLikes();
});