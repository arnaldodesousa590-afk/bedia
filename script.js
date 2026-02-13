// Lista de capítulos do mangá 20 SOBRE LOVE
const capítulos = [
    { nome: "Capítulo 01", arquivo: "20 SOBRE LOVE - 01.pdf" },
    { nome: "Capítulo 02", arquivo: "20 SOBRE LOVE - 02.pdf" },
    { nome: "Capítulo 03", arquivo: "20 SOBRE LOVE - 03_compressed.pdf" }, // Nome atualizado conforme a foto
    { nome: "Capítulo 04", arquivo: "20 SOBRE LOVE - 04.pdf" },
    { nome: "Capítulo 05", arquivo: "20 SOBRE LOVE - 05.pdf" },
    { nome: "Capítulo 05.5", arquivo: "20 SOBRE LOVE - 05.5.pdf" },
    { nome: "Capítulo 06", arquivo: "20 SOBRE LOVE - 06.pdf" },
    { nome: "Capítulo 06.5", arquivo: "20 SOBRE LOVE - 06.5.pdf" },
    { nome: "Capítulo 07", arquivo: "20 SOBRE LOVE - 07.pdf" }
];

const listaElement = document.getElementById('lista-capitulos');

// Função para gerar a lista no site
capítulos.forEach(cap => {
    const li = document.createElement('li');
    li.innerHTML = <a href="${cap.arquivo}" target="_blank">${cap.nome}</a>;
    listaElement.appendChild(li);
});

console.log("Portal Bédia carregado com sucesso!");