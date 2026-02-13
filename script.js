// 1. LISTA DE CAPÍTULOS
const listaCapitulos = [
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

// 2. FUNÇÃO DO MENU (3 TRAÇOS)
function toggleMenu() {
    const menu = document.getElementById("sideMenu");
    if (menu) {
        menu.style.width = (menu.style.width === "250px") ? "0" : "250px";
    }
}

// 3. FUNÇÕES DA JANELA (MODAL)
function abrirJanela() {
    const modal = document.getElementById('chapterModal');
    const listaDiv = document.getElementById('chapterList');
    
    if (modal && listaDiv) {
        modal.style.display = "flex";
        listaDiv.innerHTML = ""; // Limpa antes de carregar
        
        listaCapitulos.forEach(cap => {
            const botao = document.createElement('a');
            botao.href = cap.l;
            botao.target = "_blank";
            botao.className = "chapter-btn";
            botao.innerText = cap.n;
            listaDiv.appendChild(botao);
        });
    }
}

function fecharJanela() {
    const modal = document.getElementById('chapterModal');
    if (modal) modal.style.display = "none";
}

// 4. SISTEMA DE LIKE
let totalLikes = 0;
function darLike() {
    totalLikes++;
    const num = document.getElementById('likeCount');
    const btn = document.getElementById('likeBtn');
    if (num) num.innerText = totalLikes;
    if (btn) btn.style.color = "#ff0000";
}

// 5. FECHAR SE CLICAR FORA
window.onclick = function(event) {
    const modal = document.getElementById('chapterModal');
    if (event.target === modal) fecharJanela();
};

// 6. CARREGAR TUDO QUANDO A PÁGINA ABRIR
document.addEventListener("DOMContentLoaded", function() {
    const grade = document.getElementById('mangaGrid');
    if (grade) {
        const card = document.createElement('div');
        card.className = 'manga-card';
        card.innerHTML = `
            <img src="capa.jpeg" alt="20 SOBRE LOVE">
            <p>20 SOBRE LOVE</p>
        `;
        card.onclick = abrirJanela;
        grade.appendChild(card);
    }
});