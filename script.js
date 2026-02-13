// 1. Configurações da tua Bédia-DB
const SB_URL = "https://vskczoxyspfyjeuyffbl.supabase.co";
const SB_KEY = "sb_publishable_PMTgG1tjs9LLOGk6lv6_fA_MkErLXJe";

// 2. Função para carregar os likes quando o site abre
async function carregarLikes() {
    try {
        const resposta = await fetch(`${SB_URL}/rest/v1/interacoes?obra_nome=eq.20%20SOBRE%20LOVE`, {
            headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
        });
        const dados = await resposta.json();
        
        if (dados.length > 0) {
            document.getElementById('contagem-likes').innerText = dados[0].like;
        }
    } catch (erro) {
        console.error("Erro ao carregar:", erro);
    }
}

// 3. Função para dar Like quando clicas no coração
async function darLike() {
    try {
        // Primeiro, vamos ver quantos likes existem agora
        const resposta = await fetch(`${SB_URL}/rest/v1/interacoes?obra_nome=eq.20%20SOBRE%20LOVE`, {
            headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
        });
        const dados = await resposta.json();
        let likesAtuais = dados[0].like;

        // Segundo, somamos +1 e enviamos para o Supabase
        await fetch(`${SB_URL}/rest/v1/interacoes?obra_nome=eq.20%20SOBRE%20LOVE`, {
            method: 'PATCH',
            headers: { 
                "apikey": SB_KEY, 
                "Authorization": `Bearer ${SB_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            body: JSON.stringify({ like: likesAtuais + 1 })
        });

        // Atualiza o número no teu site
        document.getElementById('contagem-likes').innerText = likesAtuais + 1;
        
    } catch (erro) {
        alert("Erro ao guardar o like!");
    }
}

// Inicia o site carregando os likes da base de dados
carregarLikes();