// Lista com os 2 capítulos que tens no GitHub
const capitulos = [
    { 
        nome: "20 SOBRE LOVE - 01", 
        arquivo: "20 SOBRE LOVE - 01.pdf", 
        capa: "capa.jpeg" 
    },
    { 
        nome: "20 SOBRE LOVE - 02", 
        arquivo: "20 SOBRE LOVE - 02.pdf", 
        capa: "capa.jpeg" 
    }
];

// O ID aqui tem de ser igual ao do HTML
const container = document.getElementById('listaMangas');

if (container) {
    container.innerHTML = ""; // Limpa para não duplicar
    
    capitulos.forEach(cap => {
        const card = document.createElement('div');
        card.className = 'manga-card'; // Usa a tua classe do CSS
        card.innerHTML = `
            <img src="${cap.capa}" alt="${cap.nome}" style="width: 100%; border-radius: 8px;">
            <p style="margin-top: 10px;">${cap.nome}</p>
            <a href="${cap.arquivo}" target="_blank" style="color: #ff4500; text-decoration: none; font-weight: bold; display: block; margin-top: 5px;">Ler agora</a>
        `;
        container.appendChild(card);
    });
}