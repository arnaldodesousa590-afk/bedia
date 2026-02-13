// 1. Dados da Obra (Garante que os nomes dos PDFs batem com o GitHub)
const obra = {
    titulo: "20 SOBRE LOVE",
    capa: "capa.jpeg",
    capitulos: [
        { nome: "Capítulo 1", link: "20 SOBRE LOVE - 01.pdf" },
        { nome: "Capítulo 2", link: "20 SOBRE LOVE - 02.pdf" }
    ]
};

// 2. Funções do Menu Lateral (Os 3 traços)
function toggleMenu() {
    const menu = document.getElementById("sideMenu");
    if (menu) {
        menu.style.width = (menu.style.width === "250px") ? "0" : "250px";
    }
}

// 3. Funções da Janela de Capítulos (Modal)
function openModal() {
    const modal = document.getElementById('chapterModal');
    const list = document.getElementById('chapterList');
    
    if (modal && list) {
        modal.style.display = "flex"; // Usa flex para centralizar melhor
        list.innerHTML = ""; // Limpa para não acumular botões
        
        obra.capitulos.forEach(cap => {
            const btn = document.createElement('a');
            btn.href = cap.link;
            btn.target = "_blank";
            btn.className = "chapter-button"; // Classe para estilizar no CSS
            btn.innerText = cap.nome;
            list.appendChild(btn);
        });
    }
}

function closeModal() {
    const modal = document.getElementById('chapterModal');
    if (modal) modal.style.display = "none";
}

// 4. Fechar modal se clicar fora da caixa preta
window.onclick = function(event) {
    const modal = document.getElementById('chapterModal');
    if (event.target == modal) {
        closeModal();
    }
}

// 5. Inicialização do Site (Garante que o HTML já existe)
document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById('mangaGrid');
    
    if (grid) {
        const card = document.createElement('div');
        card.className = 'manga-card';
        card.innerHTML = `
            <img src="${obra.capa}" alt="${obra.titulo}">
            <p>${obra.titulo}</p>
        `;
        
        // Ao clicar na capa, chama a lista de capítulos
        card.addEventListener('click', openModal);
        grid.appendChild(card);
    }
});