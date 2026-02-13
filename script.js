const capitulos = [
    { nome: "20 SOBRE LOVE - 01", arquivo: "20 SOBRE LOVE - 01.pdf", capa: "capa.jpeg" },
    { nome: "20 SOBRE LOVE - 02", arquivo: "20 SOBRE LOVE - 02.pdf", capa: "capa.jpeg" }
];

const listaElement = document.getElementById('listaMangas');

if (listaElement) {
    capitulos.forEach(cap => {
        const div = document.createElement('div');
        div.className = 'manga-card';
        div.innerHTML = `
            <img src="${cap.capa}" width="150" style="border-radius: 8px;">
            <p>${cap.nome}</p>
            <a href="${cap.arquivo}" target="_blank" style="color: #ff4500; font-weight: bold; text-decoration: none;">Ler agora</a>
        `;
        listaElement.appendChild(div);
    });
}