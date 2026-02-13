document.addEventListener("DOMContentLoaded", function() {
    // Configurações da Bédia-DB
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

    // Função para carregar Likes e Comentários
    async function carregarDadosDB() {
        try {
            // Busca Votos
            const resV = await fetch(`${SB_URL}/rest/v1/interacoes?obra_nome=eq.20%20SOBRE%20LOVE`, {
                headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
            });
            const dadosV = await resV.json();
            if (dadosV.length > 0) {
                document.getElementById("likeCount").innerText = dadosV[0].like || 0;
                document.getElementById("dislikeCount").innerText = dadosV[0].dislikes || 0;
            }

            // Busca Comentários
            const resC = await fetch(`${SB_URL}/rest/v1/comentarios_bedia?obra_nome=eq.20%20SOBRE%20LOVE&order=created_at.desc`, {
                headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
            });
            const coments = await resC.json();
            const lista = document.getElementById("listaComentarios");
            lista.innerHTML = coments.map(c => 
                `<div style="margin-bottom:8px; border-bottom:1px solid #222; padding-bottom:4px;">
                    <b style="color:#ff4d4d;">${c.leitor_nome}:</b> <span style="color:#ccc;">${c.mensagem}</span>
                </div>`
            ).join('');
        } catch (err) {
            console.error("Erro ao conectar com a Bédia-DB:", err);
        }
    }

    // Função para Abrir o Modal (Acionada pela capa do mangá)
    window.abrirModal = function() {
        const modal = document.getElementById("chapterModal");
        const lista = document.getElementById("chapterList");
        
        modal.style.display = "flex";
        lista.innerHTML = ""; // Limpa para não duplicar

        capitulos.forEach(cap => {
            const a = document.createElement("a");
            a.href = cap.l;
            a.target = "_blank";
            a.className = "chapter-btn"; // Usa a classe do teu CSS
            a.innerText = cap.n;
            lista.appendChild(a);
        });

        carregarDadosDB();
    };

    // Sistema de Votos Corrigido
    async function processarVoto(coluna) {
        let labelId = coluna === 'like' ? "likeCount" : "dislikeCount";
        let span = document.getElementById(labelId);
        let novoValor = parseInt(span.innerText) + 1;

        // Na tua DB, a coluna do dislike chama-se 'dislikes' (com S no final)
        const payload = {};
        payload[coluna] = novoValor;

        await fetch(`${SB_URL}/rest/v1/interacoes?obra_nome=eq.20%20SOBRE%20LOVE`, {
            method: 'PATCH',
            headers: { 
                "apikey": SB_KEY, 
                "Authorization": `Bearer ${SB_KEY}`,
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(payload)
        });
        span.innerText = novoValor;
    }

    // Eventos dos Botões
    document.getElementById("likeBtn").onclick = () => processarVoto('like');
    document.getElementById("dislikeBtn").onclick = () => processarVoto('dislikes');

    document.getElementById("enviarComentBtn").onclick = async () => {
        const nomeInput = document.getElementById("nomeUser");
        const msgInput = document.getElementById("textoMsg");
        
        if (!msgInput.value.trim()) return alert("Escreve uma mensagem!");

        await fetch(`${SB_URL}/rest/v1/comentarios_bedia`, {
            method: 'POST',
            headers: { 
                "apikey": SB_KEY, 
                "Authorization": `Bearer ${SB_KEY}`,
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                obra_nome: "20 SOBRE LOVE",
                leitor_nome: nomeInput.value || "Anónimo",
                mensagem: msgInput.value
            })
        });

        msgInput.value = "";
        carregarDadosDB();
    };

    // Fechar Modal
    document.getElementById("btnFecharJanela").onclick = () => {
        document.getElementById("chapterModal").style.display = "none";
    };
});