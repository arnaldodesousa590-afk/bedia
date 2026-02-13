// Dados da Obra
const obraMangá = {
    titulo: "20 SOBRE LOVE",
    capa: "capa.jpeg", // Certifique-se que este arquivo existe no GitHub
    linkLeitura: "20 SOBRE LOVE - 01.pdf"
};

const grid = document.getElementById('mangaGrid');

function renderizarSite() {
    if (!grid) return;

    // Criando o card da obra
    const card = document.createElement('div');
    card.className = 'manga-card';
    card.innerHTML = `
        <img src="${obraMangá.capa}" alt="${obraMangá.titulo}">
        <p>${obraMangá.titulo}</p>
    `;

    // Função de clique para abrir o mangá
    card.onclick = () => {
        window.location.href = obraMangá.linkLeitura;
    };

    grid.appendChild(card);
}

// Inicializa quando a página carregar
window.onload = renderizarSite;