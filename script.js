document.addEventListener("DOMContentLoaded", function() {
    // 1. Lista de Capítulos
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

    // 2. Elementos da Página
    const menu = document.getElementById("sideMenu");
    const modal = document.getElementById("chapterModal");
    const grid = document.getElementById("mangaGrid");
    const listaDiv = document.getElementById("chapterList");

    // 3. Funções do Menu
    document.getElementById("btnAbrirMenu").addEventListener("click", () => menu.style.width = "250px");
    document.getElementById("btnFecharMenu").addEventListener("click", () => menu.style.width = "0");

    // 4. Funções da Janela (Modal)
    function abrirModal() {
        modal.style.display = "flex";
        listaDiv.innerHTML = "";
        capitulos.forEach(cap => {
            const a = document.createElement("a");
            a.href = cap.l;
            a.target = "_blank";
            a.className = "chapter-btn";
            a.innerText = cap.n;
            listaDiv.appendChild(a);
        });
    }

    document.getElementById("btnFecharJanela").addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

    // 5. Sistema de Like
    let likes = 0;
    const btnLike = document.getElementById("likeBtn");
    btnLike.addEventListener("click", () => {
        likes++;
        document.getElementById("likeCount").innerText = likes;
        btnLike.style.color = "#ff0000";
    });

    // 6. Criar a Capa do Mangá
    if (grid) {
        const card = document.createElement("div");
        card.className = "manga-card";
        card.innerHTML = `<img src="capa.jpeg" alt="Capa"><p>20 SOBRE LOVE</p>`;
        card.addEventListener("click", abrirModal);
        grid.appendChild(card);
    }
});