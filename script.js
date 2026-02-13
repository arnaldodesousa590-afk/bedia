/* ==========================================
   1. CONFIGURAÇÕES DA BÉDIA-DB (SUPABASE)
   ========================================== */
   const SB_URL = "https://vskczoxyspfyjeuyffbl.supabase.co";
   const SB_KEY = "sb_publishable_PMTgG1tjs9LLOGk6lv6_fA_MkErLXJe";
   
   /* ==========================================
      2. FUNÇÕES DO MENU (OS TRÊS TRACINHOS)
      ========================================== */
   function toggleMenu() {
       const menu = document.getElementById("menu-mobile");
       if (menu.style.display === "block") {
           menu.style.display = "none";
       } else {
           menu.style.display = "block";
       }
   }
   
   /* ==========================================
      3. FUNÇÕES DA BASE DE DADOS (LIKES)
      ========================================== */
   
   // Esta função carrega os likes assim que o site abre
   async function carregarLikes() {
       try {
           const resposta = await fetch(`${SB_URL}/rest/v1/interacoes?obra_nome=eq.20%20SOBRE%20LOVE`, {
               headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
           });
           const dados = await resposta.json();
           
           if (dados && dados.length > 0) {
               const spanLike = document.getElementById('contagem-likes');
               if (spanLike) spanLike.innerText = dados[0].like;
           }
       } catch (erro) {
           console.error("Erro ao carregar likes:", erro);
       }
   }
   
   // Esta função guarda o like quando clicas no coração
   async function darLike() {
       try {
           // 1. Vai buscar o valor atual
           const resposta = await fetch(`${SB_URL}/rest/v1/interacoes?obra_nome=eq.20%20SOBRE%20LOVE`, {
               headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
           });
           const dados = await resposta.json();
           let likesAtuais = dados[0].like;
   
           // 2. Atualiza para +1
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
   
           // 3. Mostra o novo número no site
           const spanLike = document.getElementById('contagem-likes');
           if (spanLike) spanLike.innerText = likesAtuais + 1;
   
       } catch (erro) {
           console.error("Erro ao dar like:", erro);
       }
   }
   
   /* ==========================================
      4. INICIALIZAÇÃO (O QUE RODA AO ABRIR)
      ========================================== */
   window.onload = function() {
       carregarLikes();
       // Se tiveres outras funções de carregar mangás, elas ficam aqui
   };