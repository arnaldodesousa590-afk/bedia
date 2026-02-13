// 1. LISTA DE MANGÁS (Adiciona aqui os teus volumes novos)
const capitulos = [
    { 
        nome: "20 SOBRE LOVE - Vol 1", 
        arquivo: "20_SOBRE_LOVE_VOL_1.pdf", // Confirma se o nome do PDF no GitHub é este
        capa: "capa.jpeg" 
    },
    { 
        nome: "Volume Novo", 
        arquivo: "NOME_DO_TEU_NOVO_PDF.pdf", 
        capa: "capa.jpeg" 
    }
];

// 2. MOSTRAR OS MANGÁS NO SITE
// CORREÇÃO: O ID tem de ser 'listaMangas' igual ao HTML
const container = document.getElementById('listaMangas');

if (container) {
    capitulos.forEach(cap => {
        const mangaCard = document.createElement('div');
        mangaCard.className = 'manga-card';
        mangaCard.innerHTML = `
            <img src="${cap.capa}" alt="${cap.nome}" style="width: 1…