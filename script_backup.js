// Variáveis globais
var mangas = [];
var capitulos = [];
var usuarioLogado = null;

// Elementos do DOM
var modal, mangaList, chapterListModal, addMangaModal, commentsModal, commentsList;

// Função de escape HTML
function esc(s) {
    if (!s) return "";
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Fallback quando a API não responde
var fallbackMangas = [
    { id: "20-sobre-love", nome: "20 Sobre Love", genero: "romance", capa: "capa.jpeg", usuario_id: null, data_adicao: "2024-01-01 00:00", avaliacao_media: 0.0, avaliacoes: [], visualizacoes: 0, likes: 0, dislikes: 0, commentsCount: 0 }
];

var fallbackCapitulos = [
    { n: "Capítulo 01", l: "20 SOBRE LOVE - 01.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love" },
    { n: "Capítulo 02", l: "20 SOBRE LOVE - 02.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love" },
    { n: "Capítulo 03", l: "20 SOBRE LOVE - 03_compressed.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love" },
    { n: "Capítulo 04", l: "20 SOBRE LOVE - 04.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love" },
    { n: "Capítulo 05", l: "20 SOBRE LOVE - 05.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love" },
    { n: "Capítulo 05.5", l: "20 SOBRE LOVE - 05.5.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love" },
    { n: "Capítulo 06", l: "20 SOBRE LOVE - 06.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love" },
    { n: "Capítulo 06.5", l: "20 SOBRE LOVE - 06.5.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love" },
    { n: "Capítulo 07", l: "20 SOBRE LOVE - 07.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love" }
];

// Sistema de localStorage para reações
function getLocalReacoes() {
    var data = localStorage.getItem("bedia_reacoes");
    return data ? JSON.parse(data) : { likes: {}, dislikes: {}, comments: {} };
}

function saveLocalReacoes(data) {
    localStorage.setItem("bedia_reacoes", JSON.stringify(data));
}

function getLocalComments(mangaId) { 
    return getLocalReacoes().comments[mangaId] || []; 
}

// Função principal para carregar dados
function carregarDados() {
    Promise.all([
        fetch("/api/mangas").then(function(r) { return r.ok ? r.json() : []; }).catch(function() { return []; }),
        fetch("/api/capitulos").then(function(r) { return r.ok ? r.json() : []; }).catch(function() { return []; })
    ]).then(function(resultados) {
        mangas = resultados[0] && resultados[0].length > 0 ? resultados[0] : fallbackMangas;
        capitulos = resultados[1] && resultados[1].length > 0 ? resultados[1] : fallbackCapitulos;
        
        // Juntar contagens do localStorage
        var local = getLocalReacoes();
        mangas.forEach(function(m) {
            var id = m.id || "";
            m.likes = (m.likes || 0) + (local.likes[id] || 0);
            m.dislikes = (m.dislikes || 0) + (local.dislikes[id] || 0);
            m.commentsCount = (m.commentsCount || 0) + (local.comments[id] || []).length;
        });
        
        carregarMangas();
        carregarUltimosCapitulos();
        criarResultadosPesquisa();
    });
}

// Carregar mangás principais
function carregarMangas() {
    mangaList.innerHTML = "";
    mangas.forEach(function(m) {
        var id = m.id || "";
        var nome = esc(m.nome);
        var capa = m.capa || "";
        var likes = m.likes || 0;
        var dislikes = m.dislikes || 0;
        var commentsCount = m.commentsCount || 0;

        var card = document.createElement("div");
        card.className = "card";
        card.innerHTML =
            "<img src=\"" + esc(capa) + "\" alt=\"" + nome + "\">" +
            "<h4>" + nome + "</h4>" +
            "<div class=\"card-reacoes\">" +
            "<div class=\"avaliacao-container\">" +
            "<div class=\"estrelas-container\" data-manga-id=\"" + esc(id) + "\">" +
            "<span class=\"estrela\" data-avaliacao=\"1\">⭐</span>" +
            "<span class=\"estrela\" data-avaliacao=\"2\">⭐</span>" +
            "<span class=\"estrela\" data-avaliacao=\"3\">⭐</span>" +
            "<span class=\"estrela\" data-avaliacao=\"4\">⭐</span>" +
            "<span class=\"estrela\" data-avaliacao=\"5\">⭐</span>" +
            "</div>" +
            "<span class=\"avaliacao-numero\">" + (m.avaliacao_media || 0) + "/5</span>" +
            "</div>" +
            "<div class=\"reacoes-botoes\">" +
            "<button type=\"button\" class=\"btn-like\" data-manga-id=\"" + esc(id) + "\" title=\"Gostei\">🔥 <span class=\"num\">" + likes + "</span></button>" +
            "<button type=\"button\" class=\"btn-dislike\" data-manga-id=\"" + esc(id) + "\" title=\"Não gostei\">👎 <span class=\"num\">" + dislikes + "</span></button>" +
            "<button type=\"button\" class=\"btn-comentarios\" data-manga-id=\"" + esc(id) + "\" data-manga-nome=\"" + nome + "\">💬 Comentários (" + commentsCount + ")</button>" +
            "<div class=\"visualizacoes\">👁️ " + (m.visualizacoes || 0) + " leituras</div>" +
            "</div>" +
            "</div>" +
            "<button class=\"btn-ler\" onclick=\"abrirCapitulos('" + esc(id) + "')\">Ler</button>";
        mangaList.appendChild(card);
    });
    
    adicionarEventosAosCards();
}

// Carregar últimos capítulos
function carregarUltimosCapitulos() {
    var ultimosContainer = document.getElementById("mangaGrid");
    if (!ultimosContainer) return;
    
    if (capitulos.length === 0) {
        ultimosContainer.innerHTML = '<div class="sem-capitulos">Nenhum capítulo publicado ainda.</div>';
        return;
    }
    
    var capitulosOrdenados = capitulos.slice().sort(function(a, b) {
        return b.data_adicao ? b.data_adicao.localeCompare(a.data_adicao || "") : -1;
    });
    
    var ultimos6 = capitulosOrdenados.slice(0, 6);
    var html = '';
    
    ultimos6.forEach(function(cap) {
        var manga = mangas.find(function(m) { return m.id === cap.manga_id; });
        var nomeManga = manga ? manga.nome : "Mangá Desconhecido";
        var capaManga = manga ? manga.capa : "capa-default.jpg";
        
        html += '<div class="card">' +
        '<img src="' + esc(capaManga) + '" alt="' + esc(nomeManga) + '">' +
        '<h4>' + esc(cap.n) + '</h4>' +
        '<p class="manga-titulo">' + esc(nomeManga) + '</p>' +
        '<button class="btn-ler" onclick="window.open(\'' + esc(cap.l) + '\', \'_blank\')">📖 Ler Agora</button>' +
        '</div>';
    });
    
    ultimosContainer.innerHTML = html;
}

// Modal de capítulos
function carregarModal(mangaId) {
    var chapterListModal = document.getElementById("chapterListModal");
    if (!chapterListModal) return;
    
    var html = "";
    var capitulosDoManga = capitulos.filter(function(cap) {
        return cap.manga_id === mangaId;
    });
    
    if (capitulosDoManga.length === 0) {
        html = '<p class="sem-capitulos-modal">Nenhum capítulo disponível para este mangá.</p>';
    } else {
        capitulosDoManga.forEach(function(cap) {
            var manga = mangas.find(function(m) { return m.id === cap.manga_id; });
            var nomeManga = manga ? manga.nome : "Mangá Desconhecido";
            var capaManga = manga ? manga.capa : "capa-default.jpg";
            
            html += '<div class="chapter-item">' +
            '<img src="' + esc(capaManga) + '" alt="' + esc(nomeManga) + '" class="chapter-capa">' +
            '<div class="chapter-info">' +
            '<h4>' + esc(cap.n) + '</h4>' +
            '<p class="chapter-manga">' + esc(nomeManga) + '</p>' +
            '</div>' +
            '<button class="btn-ler-capitulo" onclick="window.open(\'' + esc(cap.l) + '\', \'_blank\')">📖 Ler</button>' +
            '</div>';
        });
    }
    
    chapterListModal.innerHTML = html;
}

window.abrirCapitulos = function(mangaId) {
    modal.style.display = "flex";
    carregarModal(mangaId);
};

// Adicionar eventos aos cards
function adicionarEventosAosCards() {
    // Sistema de Avaliação com Estrelas
    mangaList.querySelectorAll(".estrelas-container").forEach(function(container) {
        var mangaId = container.getAttribute("data-manga-id");
        var estrelas = container.querySelectorAll(".estrela");
        
        estrelas.forEach(function(estrela) {
            estrela.onclick = function() {
                if (!usuarioLogado) {
                    alert("Você precisa estar logado para avaliar. Clique em 'Entrar' para criar sua conta!");
                    return;
                }
                
                var avaliacao = parseInt(this.getAttribute("data-avaliacao"));
                
                fetch("/api/reacoes/" + encodeURIComponent(mangaId) + "/avaliar", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        "avaliacao": avaliacao,
                        "usuario_id": usuarioLogado.id
                    })
                })
                .then(function(r) { return r.json(); })
                .then(function(res) {
                    if (res.erro) { alert(res.erro); return; }
                    
                    // Atualizar estrelas
                    estrelas.forEach(function(e, i) {
                        if (i < avaliacao) {
                            e.classList.add("ativa");
                        } else {
                            e.classList.remove("ativa");
                        }
                    });
                    
                    // Atualizar número
                    var avaliacaoNumero = container.parentElement.querySelector(".avaliacao-numero");
                    if (avaliacaoNumero) {
                        avaliacaoNumero.textContent = avaliacao + "/5";
                    }
                })
                .catch(function() {
                    // Fallback localStorage
                    estrelas.forEach(function(e, i) {
                        if (i < avaliacao) {
                            e.classList.add("ativa");
                        } else {
                            e.classList.remove("ativa");
                        }
                    });
                });
            };
        });
    });
    
    // Botões Like
    mangaList.querySelectorAll(".btn-like").forEach(function(btn) {
        btn.onclick = function() {
            if (!usuarioLogado) {
                alert("Você precisa estar logado para curtir. Clique em 'Entrar' para criar sua conta!");
                return;
            }
            
            var mangaId = this.getAttribute("data-manga-id");
            var numElement = this.querySelector(".num");
            var currentLikes = parseInt(numElement.textContent) || 0;
            
            fetch("/api/reacoes/" + encodeURIComponent(mangaId) + "/like", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"usuario_id": usuarioLogado.id})
            })
            .then(function(r) { return r.json(); })
            .then(function(res) {
                if (res.erro) { alert(res.erro); return; }
                numElement.textContent = res.likes || currentLikes + 1;
            })
            .catch(function() {
                // Fallback localStorage
                var local = getLocalReacoes();
                local.likes[mangaId] = (local.likes[mangaId] || 0) + 1;
                saveLocalReacoes(local);
                numElement.textContent = currentLikes + 1;
            });
        };
    });
    
    // Botões Dislike
    mangaList.querySelectorAll(".btn-dislike").forEach(function(btn) {
        btn.onclick = function() {
            if (!usuarioLogado) {
                alert("Você precisa estar logado para avaliar. Clique em 'Entrar' para criar sua conta!");
                return;
            }
            
            var mangaId = this.getAttribute("data-manga-id");
            var numElement = this.querySelector(".num");
            var currentDislikes = parseInt(numElement.textContent) || 0;
            
            fetch("/api/reacoes/" + encodeURIComponent(mangaId) + "/dislike", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"usuario_id": usuarioLogado.id})
            })
            .then(function(r) { return r.json(); })
            .then(function(res) {
                if (res.erro) { alert(res.erro); return; }
                numElement.textContent = res.dislikes || currentDislikes + 1;
            })
            .catch(function() {
                // Fallback localStorage
                var local = getLocalReacoes();
                local.dislikes[mangaId] = (local.dislikes[mangaId] || 0) + 1;
                saveLocalReacoes(local);
                numElement.textContent = currentDislikes + 1;
            });
        };
    });
    
    // Botões Comentários
    mangaList.querySelectorAll(".btn-comentarios").forEach(function(btn) {
        btn.onclick = function() {
            var mangaId = this.getAttribute("data-manga-id");
            var nome = this.getAttribute("data-manga-nome") || "Mangá";
            document.getElementById("commentMangaId").value = mangaId;
            document.getElementById("commentMangaNome").textContent = nome;
            commentsModal.style.display = "flex";
            carregarComentarios(mangaId);
        };
    });
}

// Sistema de pesquisa
function criarResultadosPesquisa() {
    var resultadosContainer = document.getElementById("resultadosPesquisa");
    if (!resultadosContainer) return;
    
    resultadosContainer.innerHTML = "";
    
    mangas.forEach(function(manga) {
        var div = document.createElement("div");
        div.className = "resultado-pesquisa";
        div.setAttribute("data-manga-id", manga.id);
        div.innerHTML = 
            '<img src="' + esc(manga.capa) + '" alt="' + esc(manga.nome) + '">' +
            '<div class="resultado-info">' +
            '<h5>' + esc(manga.nome) + '</h5>' +
            '<p class="resultado-genero">' + esc(manga.genero || "Sem gênero") + '</p>' +
            '</div>';
        
        div.onclick = function() {
            selecionarManga(manga.id);
        };
        
        resultadosContainer.appendChild(div);
    });
}

function selecionarManga(mangaId) {
    var manga = mangas.find(function(m) { return m.id === mangaId; });
    if (!manga) return;
    
    var modal = document.getElementById("modalManga");
    if (!modal) return;
    
    modal.innerHTML = 
        '<div class="modal-manga-conteudo">' +
        '<button class="fechar-modal-manga" onclick="fecharModalManga()">✖</button>' +
        '<img src="' + esc(manga.capa) + '" alt="' + esc(manga.nome) + '" class="modal-manga-capa">' +
        '<div class="modal-manga-info">' +
        '<h2>' + esc(manga.nome) + '</h2>' +
        '<p class="modal-manga-genero">Gênero: ' + esc(manga.genero || "Não especificado") + '</p>' +
        '<p class="modal-manga-descricao">Este mangá está disponível para leitura. Clique em "Ler" para acessar os capítulos.</p>' +
        '<div class="modal-manga-acoes">' +
        '<button class="btn-modal-ler" onclick="abrirCapitulos(\'' + esc(manga.id) + '\')">📖 Ler Agora</button>' +
        '<button class="btn-modal-fechar" onclick="fecharModalManga()">Fechar</button>' +
        '</div>' +
        '</div>' +
        '</div>';
    
    modal.style.display = "flex";
}

function fecharModalManga() {
    var modal = document.getElementById("modalManga");
    if (modal) {
        modal.style.display = "none";
    }
}

// Carregar comentários
function carregarComentarios(mangaId) {
    commentsList.innerHTML = "<p class='loading'>A carregar...</p>";
    fetch("/api/reacoes/" + encodeURIComponent(mangaId))
    .then(function(r) { return r.json(); })
    .then(function(r) {
        var comments = r.comments || [];
        var local = getLocalComments(mangaId);
        renderComentariosLista(comments.concat(local));
    })
    .catch(function() {
        var local = getLocalComments(mangaId);
        renderComentariosLista(local);
    });
}

function renderComentariosLista(comments) {
    commentsList.innerHTML = "";
    if (!comments || comments.length === 0) {
        commentsList.innerHTML = "<p class='sem-comentarios'>Ainda não há comentários. Sê o primeiro!</p>";
        return;
    }
    comments.forEach(function(c) {
        var div = document.createElement("div");
        div.className = "comment-item";
        div.innerHTML = "<strong>" + esc(c.autor) + "</strong> <span class='comment-data'>" + esc(c.data || "") + "</span><p>" + esc(c.texto) + "</p>";
        commentsList.appendChild(div);
    });
}

// Inicialização quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", function() {
    // Obter elementos do DOM
    modal = document.getElementById("chapterModal");
    mangaList = document.getElementById("mangaList");
    chapterListModal = document.getElementById("chapterListModal");
    addMangaModal = document.getElementById("addMangaModal");
    commentsModal = document.getElementById("commentsModal");
    commentsList = document.getElementById("commentsList");
    
    // Eventos dos modais
    document.getElementById("btnFecharModal").onclick = function() {
        modal.style.display = "none";
    };
    
    document.getElementById("btnFecharComments").onclick = function() {
        commentsModal.style.display = "none";
    };
    
    // Botão Entrar/Perfil
    document.getElementById("btnPerfil").onclick = function() {
        document.getElementById("contaModal").style.display = "flex";
    };
    
    // Botão Login
    document.getElementById("btnLogin").onclick = function() {
        var email = document.getElementById("loginEmail").value;
        var senha = document.getElementById("loginSenha").value;
        var msgEl = document.getElementById("loginMsg");
        
        if (!email || !senha) {
            msgEl.textContent = "Preencha email e senha.";
            msgEl.className = "form-msg erro";
            return;
        }
        
        // Simular login (fallback)
        var usuarios = JSON.parse(localStorage.getItem("bedia_usuarios") || "[]");
        var usuario = usuarios.find(function(u) { return u.email === email && u.senha === senha; });
        
        if (usuario) {
            usuarioLogado = usuario;
            document.getElementById("btnPerfil").textContent = "👤 " + usuario.nome;
            document.getElementById("contaModal").style.display = "none";
            msgEl.textContent = "";
        } else {
            msgEl.textContent = "Email ou senha incorretos.";
            msgEl.className = "form-msg erro";
        }
    };
    
    // Botão Ler Agora (hero)
    document.getElementById("btnLerAgora").onclick = function() {
        if (mangas.length > 0) {
            abrirCapitulos(mangas[0].id);
        } else {
            alert("Nenhum mangá disponível ainda.");
        }
    };
    
    // Menu lateral
    document.getElementById("btnAbrirMenu").onclick = function() {
        document.getElementById("sideMenu").style.display = "block";
    };
    
    document.getElementById("btnFecharMenu").onclick = function() {
        document.getElementById("sideMenu").style.display = "none";
    };
    
    // Pesquisa
    window.pesquisarComBotao = function() {
        var termo = document.getElementById("searchInput").value.toLowerCase().trim();
        var resultadosContainer = document.getElementById("resultadosPesquisa");
        
        if (!termo) {
            resultadosContainer.style.display = "none";
            return;
        }
        
        var resultados = mangas.filter(function(manga) {
            return manga.nome.toLowerCase().includes(termo);
        });
        
        if (resultados.length > 0) {
            resultadosContainer.innerHTML = "";
            resultados.forEach(function(manga) {
                var div = document.createElement("div");
                div.className = "resultado-pesquisa";
                div.innerHTML = 
                    '<img src="' + esc(manga.capa) + '" alt="' + esc(manga.nome) + '">' +
                    '<div class="resultado-info">' +
                    '<h5>' + esc(manga.nome) + '</h5>' +
                    '<p class="resultado-genero">' + esc(manga.genero || "Sem gênero") + '</p>' +
                    '</div>';
                
                div.onclick = function() {
                    selecionarManga(manga.id);
                    resultadosContainer.style.display = "none";
                    document.getElementById("searchInput").value = "";
                };
                
                resultadosContainer.appendChild(div);
            });
            resultadosContainer.style.display = "block";
        } else {
            resultadosContainer.innerHTML = '<p class="sem-resultados">Nenhum mangá encontrado.</p>';
            resultadosContainer.style.display = "block";
        }
    };
    
    // Pesquisa ao digitar
    document.getElementById("searchInput").oninput = function() {
        pesquisarComBotao();
    };
    
    // Fechar pesquisa ao clicar fora
    document.addEventListener("click", function(e) {
        if (!e.target.closest(".search-container")) {
            document.getElementById("resultadosPesquisa").style.display = "none";
        }
    });
    
    // Formulário de comentários
    document.getElementById("formComment").onsubmit = function(e) {
        e.preventDefault();
        
        if (!usuarioLogado) {
            alert("Você precisa estar logado para comentar. Clique em 'Entrar' para criar sua conta!");
            return;
        }
        
        var mangaId = document.getElementById("commentMangaId").value;
        var autor = usuarioLogado.nome;
        var texto = document.getElementById("commentTexto").value.trim();
        if (!texto) return;
        
        fetch("/api/reacoes/" + encodeURIComponent(mangaId) + "/comentarios", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ autor: autor, texto: texto })
        })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (res.erro) { alert(res.erro); return; }
            document.getElementById("commentTexto").value = "";
            carregarComentarios(mangaId);
        })
        .catch(function() {
            // Fallback localStorage
            var data = getLocalReacoes();
            data.comments[mangaId] = data.comments[mangaId] || [];
            data.comments[mangaId].push({
                autor: autor,
                texto: texto,
                data: new Date().toISOString().slice(0, 16).replace("T", " ")
            });
            saveLocalReacoes(data);
            document.getElementById("commentTexto").value = "";
            carregarComentarios(mangaId);
        });
    };
    
    // Carregar dados iniciais
    carregarDados();
});
