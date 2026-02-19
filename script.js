// Variáveis globais
var mangas = [];
var capitulos = [];
var usuarioLogado = null;

// Sistema de persistência de sessão
function salvarSessao() {
    if (usuarioLogado) {
        localStorage.setItem('bedia_usuario_logado', JSON.stringify(usuarioLogado));
    } else {
        localStorage.removeItem('bedia_usuario_logado');
    }
}

function carregarSessao() {
    var sessao = localStorage.getItem('bedia_usuario_logado');
    if (sessao) {
        usuarioLogado = JSON.parse(sessao);
        var btnPerfil = document.getElementById('btnPerfil');
        if (btnPerfil) {
            btnPerfil.textContent = '👤 ' + usuarioLogado.nome;
        }
    }
}

function fazerLogout() {
    usuarioLogado = null;
    salvarSessao();
    var btnPerfil = document.getElementById('btnPerfil');
    if (btnPerfil) {
        btnPerfil.textContent = '👤 Entrar';
    }
}

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
        
        // Carregar mangás adicionados pelos usuários
        var mangasAdicionados = JSON.parse(localStorage.getItem("bedia_mangas") || "[]");
        
        // Adicionar mangás novos à lista principal (sem duplicar)
        mangasAdicionados.forEach(function(manga) {
            if (!mangas.find(function(m) { return m.id === manga.id; })) {
                mangas.push(manga);
            }
        });
        
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
        var genero = esc(m.genero || "");
        var likes = m.likes || 0;
        var dislikes = m.dislikes || 0;
        var commentsCount = m.commentsCount || 0;
        
        // Calcular média de avaliações do localStorage
        var data = getLocalReacoes();
        var avaliacaoMedia = 0;
        if (data.avaliacoes && data.avaliacoes[id]) {
            var avaliacoes = data.avaliacoes[id];
            if (avaliacoes.length > 0) {
                var soma = avaliacoes.reduce(function(total, av) {
                    return total + av.avaliacao;
                }, 0);
                avaliacaoMedia = (soma / avaliacoes.length).toFixed(1);
            }
        }

        var card = document.createElement("div");
        card.className = "card";
        card.innerHTML =
            "<div class='container-info'>" +
            "<img src=\"" + esc(capa) + "\" alt=\"" + nome + "\">" +
            "<h4>" + nome + "</h4>" +
            "</div>" +
            "<div class='container-interacao'>" +
            "<div class='avaliacao-container'>" +
            "<div class='estrelas-container' data-manga-id=\"" + esc(id) + "\">" +
            "<span class='estrela' data-avaliacao='1'>⭐</span>" +
            "<span class='estrela' data-avaliacao='2'>⭐</span>" +
            "<span class='estrela' data-avaliacao='3'>⭐</span>" +
            "<span class='estrela' data-avaliacao='4'>⭐</span>" +
            "<span class='estrela' data-avaliacao='5'>⭐</span>" +
            "</div>" +
            "<span class='avaliacao-numero'>" + avaliacaoMedia + "/5</span>" +
            "</div>" +
            "<div class='card-reacoes'>" +
            "<div class='reacoes-botoes'>" +
            "<button type='button' class='btn-like' data-manga-id=\"" + esc(id) + "\" title='Gostei'>👍 <span class='num'>" + likes + "</span></button>" +
            "<button type='button' class='btn-dislike' data-manga-id=\"" + esc(id) + "\" title='Não gostei'>👎 <span class='num'>" + dislikes + "</span></button>" +
            "<button type='button' class='btn-comentarios' data-manga-id=\"" + esc(id) + "\" data-manga-nome='" + nome + "'>💬 Comentários (" + commentsCount + ")</button>" +
            "</div>" +
            "</div>" +
            "<div class='visualizacoes'>👁️ " + (m.visualizacoes || 0) + " leituras</div>" +
            "</div>" +
            "<div class='container-ler'>" +
            "<button class='btn-ler' onclick='abrirCapitulos(\"" + esc(id) + "\")'>Ler</button>" +
            "</div>";
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
    // Fechar modal de seleção de mangás (Ler Agora)
    var modalManga = document.getElementById("modalManga");
    if (modalManga) {
        modalManga.style.display = "none";
    }
    
    // Abrir modal de capítulos
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
                    // Fallback localStorage - salvar avaliação permanentemente
                    var data = getLocalReacoes();
                    
                    // Inicializar avaliações do mangá se não existir
                    if (!data.avaliacoes) data.avaliacoes = {};
                    if (!data.avaliacoes[mangaId]) data.avaliacoes[mangaId] = [];
                    
                    // Verificar se usuário já avaliou este mangá
                    var avaliacaoExistente = data.avaliacoes[mangaId].find(function(av) {
                        return av.usuario_id === usuarioLogado.id;
                    });
                    
                    if (avaliacaoExistente) {
                        // Atualizar avaliação existente
                        avaliacaoExistente.avaliacao = avaliacao;
                        avaliacaoExistente.data = new Date().toISOString();
                    } else {
                        // Adicionar nova avaliação
                        data.avaliacoes[mangaId].push({
                            usuario_id: usuarioLogado.id,
                            usuario_nome: usuarioLogado.nome,
                            avaliacao: avaliacao,
                            data: new Date().toISOString()
                        });
                    }
                    
                    // Salvar no localStorage
                    saveLocalReacoes(data);
                    
                    // Atualizar visualmente
                    estrelas.forEach(function(e, i) {
                        if (i < avaliacao) {
                            e.classList.add("ativa");
                        } else {
                            e.classList.remove("ativa");
                        }
                    });
                    
                    // Calcular e mostrar média
                    var avaliacoesManga = data.avaliacoes[mangaId];
                    if (avaliacoesManga && avaliacoesManga.length > 0) {
                        var soma = avaliacoesManga.reduce(function(total, av) {
                            return total + av.avaliacao;
                        }, 0);
                        var media = (soma / avaliacoesManga.length).toFixed(1);
                        
                        var avaliacaoNumero = container.parentElement.querySelector(".avaliacao-numero");
                        if (avaliacaoNumero) {
                            avaliacaoNumero.textContent = media + "/5";
                        }
                    }
                    
                    // Mostrar confirmação
                    console.log("Avaliação salva:", {
                        manga_id: mangaId,
                        usuario: usuarioLogado.nome,
                        estrelas: avaliacao,
                        media: data.avaliacoes[mangaId].length > 0 ? 
                            (data.avaliacoes[mangaId].reduce(function(s, a) { return s + a.avaliacao; }, 0) / data.avaliacoes[mangaId].length).toFixed(1) : 0
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
            
            // Verificar se usuário está logado
            if (!usuarioLogado) {
                alert("Você precisa estar logado para comentar. Clique em 'Entrar' para criar sua conta!");
                return;
            }
            
            // Abrir modal de comentários
            if (commentsModal) {
                document.getElementById("commentsModalTitulo").textContent = "Comentários - " + nome;
                document.getElementById("commentMangaId").value = mangaId;
                commentsModal.style.display = "flex";
                carregarComentarios(mangaId);
            }
        };
    });
    
    // Carregar avaliação do usuário logado nas estrelas
    if (usuarioLogado) {
        mangaList.querySelectorAll(".estrelas-container").forEach(function(container) {
            var mangaId = container.getAttribute("data-manga-id");
            var data = getLocalReacoes();
            
            if (data.avaliacoes && data.avaliacoes[mangaId]) {
                var avaliacaoUsuario = data.avaliacoes[mangaId].find(function(av) {
                    return av.usuario_id === usuarioLogado.id;
                });
                
                if (avaliacaoUsuario) {
                    var estrelas = container.querySelectorAll(".estrela");
                    estrelas.forEach(function(estrela, i) {
                        if (i < avaliacaoUsuario.avaliacao) {
                            estrela.classList.add("ativa");
                        } else {
                            estrela.classList.remove("ativa");
                        }
                    });
                }
            }
        });
    }
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
    if (!commentsList) {
        commentsList = document.getElementById("commentsList");
    }
    
    if (!commentsList) return;
    
    commentsList.innerHTML = "<p class='loading'>A carregar...</p>";
    
    // Usar apenas localStorage
    var local = getLocalComments(mangaId);
    renderComentariosLista(local);
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
    // Carregar sessão persistente
    carregarSessao();
    
    // Esperar um pouco para garantir que todos os elementos existam
    setTimeout(function() {
        // Obter elementos do DOM
        modal = document.getElementById("chapterModal");
        mangaList = document.getElementById("mangaList");
        chapterListModal = document.getElementById("chapterListModal");
        addMangaModal = document.getElementById("addMangaModal");
        commentsModal = document.getElementById("commentsModal");
        commentsList = document.getElementById("commentsList");
        
        console.log("Elementos encontrados:", {
            modal: !!modal,
            mangaList: !!mangaList,
            chapterListModal: !!chapterListModal,
            commentsModal: !!commentsModal,
            commentsList: !!commentsList
        });
        
        // Eventos dos modais
        var btnFecharModal = document.getElementById("btnFecharModal");
        if (btnFecharModal) {
            btnFecharModal.onclick = function() {
                if (modal) modal.style.display = "none";
            };
        }
        
        var btnFecharComments = document.getElementById("btnFecharComments");
        if (btnFecharComments) {
            btnFecharComments.onclick = function() {
                if (commentsModal) commentsModal.style.display = "none";
            };
        }
        
        // Botão Entrar/Perfil
        var btnPerfil = document.getElementById("btnPerfil");
        if (btnPerfil) {
            btnPerfil.onclick = function() {
                if (usuarioLogado) {
                    // Usuário logado - mostrar opções de perfil
                    if (confirm("Deseja sair da sua conta?")) {
                        fazerLogout();
                    }
                } else {
                    // Usuário não logado - abrir login
                    var contaModal = document.getElementById("contaModal");
                    if (contaModal) contaModal.style.display = "flex";
                }
            };
        }
        
        // Botão de fechar login (X no modal)
        var btnFecharLogin = document.getElementById("btnFecharLogin");
        if (btnFecharLogin) {
            btnFecharLogin.onclick = function() {
                var contaModal = document.getElementById("contaModal");
                if (contaModal) contaModal.style.display = "none";
            };
        }
        
        // Botão Login
        var btnLogin = document.getElementById("btnLogin");
        if (btnLogin) {
            btnLogin.onclick = function() {
                var email = document.getElementById("loginEmail").value;
                var senha = document.getElementById("loginSenha").value;
                var msgEl = document.getElementById("loginMsg");
                
                if (!email || !senha) {
                    if (msgEl) {
                        msgEl.textContent = "Preencha email e senha.";
                        msgEl.className = "form-msg erro";
                    }
                    return;
                }
                
                // Simular login (fallback)
                var usuarios = JSON.parse(localStorage.getItem("bedia_usuarios") || "[]");
                var usuario = usuarios.find(function(u) { return u.email === email && u.senha === senha; });
                
                if (usuario) {
                    usuarioLogado = usuario;
                    salvarSessao(); // Salvar sessão no localStorage
                    btnPerfil.textContent = "👤 " + usuario.nome;
                    var contaModal = document.getElementById("contaModal");
                    if (contaModal) contaModal.style.display = "none";
                    if (msgEl) msgEl.textContent = "";
                } else {
                    if (msgEl) {
                        msgEl.textContent = "Email ou senha incorretos.";
                        msgEl.className = "form-msg erro";
                    }
                }
            };
        }
        
        // Link para cadastro
        var linkParaCadastro = document.getElementById("linkParaCadastro");
        if (linkParaCadastro) {
            linkParaCadastro.onclick = function(e) {
                e.preventDefault();
                var loginForm = document.getElementById("loginForm");
                var cadastroForm = document.getElementById("cadastroForm");
                
                if (loginForm && cadastroForm) {
                    loginForm.style.display = "none";
                    cadastroForm.style.display = "block";
                }
            };
        }
        
        // Link para voltar ao login
        var linkParaLogin = document.getElementById("linkParaLogin");
        if (linkParaLogin) {
            linkParaLogin.onclick = function(e) {
                e.preventDefault();
                var loginForm = document.getElementById("loginForm");
                var cadastroForm = document.getElementById("cadastroForm");
                
                if (loginForm && cadastroForm) {
                    loginForm.style.display = "block";
                    cadastroForm.style.display = "none";
                }
            };
        }
        
        // Botão de fechar conta geral
        var btnFecharConta = document.getElementById("btnFecharConta");
        if (btnFecharConta) {
            btnFecharConta.onclick = function() {
                var contaModal = document.getElementById("contaModal");
                if (contaModal) contaModal.style.display = "none";
            };
        }
        
        // Botão de cadastro
        var btnCadastrar = document.getElementById("btnCadastrar");
        if (btnCadastrar) {
            btnCadastrar.onclick = function() {
                var nome = document.getElementById("cadNome").value;
                var email = document.getElementById("cadEmail").value;
                var senha = document.getElementById("cadSenha").value;
                var msgEl = document.getElementById("cadMsg");
                
                if (!nome || !email || !senha) {
                    if (msgEl) {
                        msgEl.textContent = "Preencha todos os campos.";
                        msgEl.className = "form-msg erro";
                    }
                    return;
                }
                
                // Salvar usuário
                var usuarios = JSON.parse(localStorage.getItem("bedia_usuarios") || "[]");
                
                // Verificar se email já existe
                if (usuarios.find(function(u) { return u.email === email; })) {
                    if (msgEl) {
                        msgEl.textContent = "Email já cadastrado.";
                        msgEl.className = "form-msg erro";
                    }
                    return;
                }
                
                var novoUsuario = {
                    id: "user_" + Date.now(),
                    nome: nome,
                    email: email,
                    senha: senha
                };
                
                usuarios.push(novoUsuario);
                localStorage.setItem("bedia_usuarios", JSON.stringify(usuarios));
                
                if (msgEl) {
                    msgEl.textContent = "Conta criada com sucesso! Faça login.";
                    msgEl.className = "form-msg sucesso";
                }
                
                // Voltar para login após 2 segundos
                setTimeout(function() {
                    var loginForm = document.getElementById("loginForm");
                    var cadastroForm = document.getElementById("cadastroForm");
                    
                    if (loginForm && cadastroForm) {
                        loginForm.style.display = "block";
                        cadastroForm.style.display = "none";
                    }
                    
                    if (msgEl) msgEl.textContent = "";
                }, 2000);
            };
        }
        
        // Botão Ler Agora (hero)
        var btnLerAgora = document.getElementById("btnLerAgora");
        if (btnLerAgora) {
            btnLerAgora.onclick = function() {
                if (mangas && mangas.length > 0) {
                    // Mostrar modal de seleção de mangás
                    var modalManga = document.getElementById("modalManga");
                    if (modalManga) {
                        var html = '<div class="modal-manga-conteudo">' +
                        '<button class="fechar-modal-manga" onclick="fecharModalManga()">✖</button>' +
                        '<h2>Escolha um Mangá para Ler</h2>' +
                        '<div class="mangas-lista">';
                        
                        mangas.forEach(function(manga) {
                            html += '<div class="manga-item" onclick="abrirCapitulos(\'' + esc(manga.id) + '\')">' +
                            '<img src="' + esc(manga.capa) + '" alt="' + esc(manga.nome) + '">' +
                            '<div class="manga-item-info">' +
                            '<h4>' + esc(manga.nome) + '</h4>' +
                            '<p>' + esc(manga.genero || "Sem gênero") + '</p>' +
                            '</div>' +
                            '</div>';
                        });
                        
                        html += '</div>' +
                        '<button class="btn-modal-fechar" onclick="fecharModalManga()">Fechar</button>' +
                        '</div>';
                        
                        modalManga.querySelector(".modal-manga-conteudo").innerHTML = html;
                        modalManga.style.display = "flex";
                    }
                } else {
                    alert("Nenhum mangá disponível ainda.");
                }
            };
        }
        
        // Menu lateral - versão simplificada
        var btnAbrirMenu = document.getElementById("btnAbrirMenu");
        var btnFecharMenu = document.getElementById("btnFecharMenu");
        var sideMenu = document.getElementById("sideMenu");
        
        console.log("Elementos do menu:", {
            btnAbrirMenu: !!btnAbrirMenu,
            btnFecharMenu: !!btnFecharMenu,
            sideMenu: !!sideMenu
        });
        
        // Abrir menu
        if (btnAbrirMenu) {
            btnAbrirMenu.onclick = function() {
                console.log("Clique no botão abrir menu");
                if (sideMenu) {
                    sideMenu.style.display = "block";
                    sideMenu.classList.add("active");
                    console.log("Menu deve estar aberto");
                }
            };
        }
        
        // Fechar menu
        if (btnFecharMenu) {
            btnFecharMenu.onclick = function() {
                console.log("Clique no botão fechar menu");
                if (sideMenu) {
                    sideMenu.style.display = "none";
                    sideMenu.classList.remove("active");
                    console.log("Menu deve estar fechado");
                }
            };
        }
        
        // Links do menu - navegação na mesma aba (só rolar)
        document.querySelectorAll(".menu-link").forEach(function(link) {
            link.onclick = function(e) {
                e.preventDefault();
                
                var href = this.getAttribute("href");
                
                // Se for link externo (WhatsApp), abrir em nova aba
                if (href.includes("http") || href.includes("wa.me")) {
                    window.open(href, "_blank");
                    return;
                }
                
                // Se for link de telefone
                if (href.includes("tel:")) {
                    window.location.href = href;
                    return;
                }
                
                // Esconder todas as seções primeiro
                document.querySelectorAll("section").forEach(function(section) {
                    section.style.display = "none";
                });
                
                // Mostrar seção correspondente (se existir)
                var targetId = href.substring(1); // remover #
                var targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.style.display = "block";
                    
                    // Se for "inicio", mostrar tudo junto (como ao abrir o site)
                    if (targetId === "inicio") {
                        // Mostrar tudo: início + mangás + últimos capítulos
                        var inicioSection = document.getElementById("inicio");
                        if (inicioSection) {
                            inicioSection.style.display = "block";
                        }
                        
                        // Mostrar mangás
                        var mangasSection = document.getElementById("mangas");
                        if (mangasSection) {
                            mangasSection.style.display = "block";
                        }
                        
                        // Mostrar últimos capítulos
                        var ultimosSection = document.getElementById("ultimos");
                        if (ultimosSection) {
                            ultimosSection.style.display = "block";
                        }
                        
                        // Rolar para o topo
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    } else {
                        // Rolar suavemente para outras seções
                        targetSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
                
                // Fechar menu
                var menu = document.getElementById("sideMenu");
                if (menu) {
                    menu.style.display = "none";
                    menu.classList.remove("active");
                }
            };
        });
        
        // Formulário de Reclamação
        var formReclamacao = document.getElementById("formReclamacao");
        if (formReclamacao) {
            formReclamacao.onsubmit = function(e) {
                e.preventDefault();
                
                var nome = document.getElementById("reclamacaoNome").value;
                var email = document.getElementById("reclamacaoEmail").value;
                var tipo = document.getElementById("reclamacaoTipo").value;
                var mensagem = document.getElementById("reclamacaoMensagem").value;
                
                if (!nome || !email || !tipo || !mensagem) {
                    alert("Por favor, preencha todos os campos.");
                    return;
                }
                
                // Salvar no localStorage
                var reclamacoes = JSON.parse(localStorage.getItem("bedia_reclamacoes") || "[]");
                reclamacoes.push({
                    nome: nome,
                    email: email,
                    tipo: tipo,
                    mensagem: mensagem,
                    data: new Date().toISOString()
                });
                localStorage.setItem("bedia_reclamacoes", JSON.stringify(reclamacoes));
                
                // Limpar formulário
                formReclamacao.reset();
                
                // Mostrar sucesso
                alert("Reclamação enviada com sucesso! Entraremos em contato em breve.");
                
                // Voltar para início após 2 segundos
                setTimeout(function() {
                    document.getElementById("reclamacao").style.display = "none";
                    document.getElementById("inicio").style.display = "block";
                    window.scrollTo(0, 0);
                }, 2000);
            };
        }
        
        // Pesquisa (botão) - abrir aba com o mangá pesquisado
        window.pesquisarComBotao = function() {
            var searchInput = document.getElementById("searchInput");
            var resultadosContainer = document.getElementById("resultadosPesquisa");
            
            if (!searchInput || !resultadosContainer) {
                return;
            }
            
            var termo = searchInput.value.toLowerCase().trim();
            
            if (!termo) {
                alert("Por favor, digite algo para pesquisar.");
                return;
            }
            
            // Procurar mangá exato ou que contenha o termo
            var resultados = mangas.filter(function(manga) {
                return manga.nome.toLowerCase().includes(termo);
            });
            
            if (resultados.length > 0) {
                // Abrir o primeiro mangá encontrado
                var manga = resultados[0];
                selecionarManga(manga.id);
                resultadosContainer.style.display = "none";
                searchInput.value = "";
            } else {
                alert("Nenhum mangá encontrado com: " + termo);
            }
        };
        
        // Pesquisa ao digitar (mostrar sugestões)
        var searchInput = document.getElementById("searchInput");
        if (searchInput) {
            searchInput.oninput = function() {
                var resultadosContainer = document.getElementById("resultadosPesquisa");
                
                if (!resultadosContainer) return;
                
                var termo = this.value.toLowerCase().trim();
                
                if (!termo) {
                    resultadosContainer.style.display = "none";
                    return;
                }
                
                // Mostrar mangás que começam com o termo
                var resultados = mangas.filter(function(manga) {
                    return manga.nome.toLowerCase().startsWith(termo);
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
                            searchInput.value = "";
                        };
                        
                        resultadosContainer.appendChild(div);
                    });
                    resultadosContainer.style.display = "block";
                } else {
                    resultadosContainer.innerHTML = '<p class="sem-resultados">Nenhum mangá encontrado.</p>';
                    resultadosContainer.style.display = "block";
                }
            };
        }
        
        // Fechar pesquisa ao clicar fora
        document.addEventListener("click", function(e) {
            if (!e.target.closest(".search-container")) {
                var resultadosContainer = document.getElementById("resultadosPesquisa");
                if (resultadosContainer) resultadosContainer.style.display = "none";
            }
        });
        
        // Formulário de comentários
        var formComment = document.getElementById("formComment");
        if (formComment) {
            formComment.onsubmit = function(e) {
                e.preventDefault();
                
                // Verificar se usuário está logado
                if (!usuarioLogado) {
                    alert("Você precisa estar logado para comentar. Clique em 'Entrar' para criar sua conta!");
                    return;
                }
                
                var mangaId = document.getElementById("commentMangaId").value;
                var autor = usuarioLogado.nome; // Usar nome do usuário logado
                var texto = document.getElementById("commentTexto").value.trim();
                
                if (!texto) {
                    alert("Por favor, escreva um comentário.");
                    return;
                }
                
                // Salvar comentário no localStorage
                var data = getLocalReacoes();
                data.comments[mangaId] = data.comments[mangaId] || [];
                data.comments[mangaId].push({
                    autor: autor,
                    texto: texto,
                    data: new Date().toISOString().slice(0, 16).replace("T", " ")
                });
                saveLocalReacoes(data);
                
                // Limpar formulário
                document.getElementById("commentTexto").value = "";
                
                // Recarregar comentários
                carregarComentarios(mangaId);
                
                // Mostrar sucesso
                alert("Comentário adicionado com sucesso!");
            };
        }
        
        // Carregar dados iniciais
        carregarDados();
        
        // Configurar página inicial completa (hero + mangás + últimos capítulos)
        setTimeout(function() {
            console.log("Configurando página inicial completa...");
            
            // Mostrar seção de início
            var inicioSection = document.getElementById("inicio");
            if (inicioSection) {
                inicioSection.style.display = "block";
            }
            
            // Mostrar também seção de mangás
            var mangasSection = document.getElementById("mangas");
            if (mangasSection) {
                mangasSection.style.display = "block";
            }
            
            // Mostrar também seção de últimos capítulos
            var ultimosSection = document.getElementById("ultimos");
            if (ultimosSection) {
                ultimosSection.style.display = "block";
            }
            
            // Esconder outras seções
            var outrasSecoes = ["estatisticas", "reclamacao"];
            outrasSecoes.forEach(function(id) {
                var section = document.getElementById(id);
                if (section) {
                    section.style.display = "none";
                }
            });
            
            console.log("Página inicial configurada: Início + Mangás + Últimos Capítulos visíveis");
        }, 500);
        
        // Botões Ver Mais
        var btnVerMaisMangas = document.getElementById("btnVerMaisMangas");
        if (btnVerMaisMangas) {
            btnVerMaisMangas.onclick = function() {
                alert("Em breve: mais mangás disponíveis para você explorar!");
            };
        }
        
        // Botão Adicionar Mangá
        var btnAddManga = document.getElementById("btnAddManga");
        if (btnAddManga) {
            btnAddManga.onclick = function() {
                // Verificar se usuário está logado
                if (!usuarioLogado) {
                    alert("Você precisa estar logado para adicionar mangás. Clique em 'Entrar' para criar sua conta!");
                    return;
                }
                
                if (addMangaModal) addMangaModal.style.display = "flex";
            };
        }
        
        // Botão Cancelar Adicionar Mangá
        var btnFecharAddManga = document.getElementById("btnFecharAddManga");
        if (btnFecharAddManga) {
            btnFecharAddManga.onclick = function() {
                if (addMangaModal) addMangaModal.style.display = "none";
            };
        }
        
        var formAddManga = document.getElementById("formAddManga");
        if (formAddManga) {
            formAddManga.onsubmit = function(e) {
                e.preventDefault();
                
                // Verificar se usuário está logado
                if (!usuarioLogado) {
                    alert("Você precisa estar logado para adicionar mangás. Clique em 'Entrar' para criar sua conta!");
                    return;
                }
                
                var nome = document.getElementById("addMangaNome").value;
                var genero = document.getElementById("addMangaGenero").value;
                var capaFile = document.getElementById("addMangaCapaFile").files[0];
                var pdfFile = document.getElementById("addMangaPdfFile").files[0];
                var tituloCap = document.getElementById("addMangaTituloCap").value;
                
                if (!nome || !genero || !capaFile || !pdfFile) {
                    alert("Por favor, preencha todos os campos obrigatórios.");
                    return;
                }
                
                // Simular envio (salvar em localStorage)
                var mangasSalvos = JSON.parse(localStorage.getItem("bedia_mangas") || "[]");
                var novoManga = {
                    id: "manga_" + Date.now(),
                    nome: nome,
                    genero: genero,
                    capa: URL.createObjectURL(capaFile),
                    pdf: URL.createObjectURL(pdfFile),
                    tituloCap: tituloCap,
                    autor: usuarioLogado.nome,
                    data: new Date().toISOString()
                };
                
                mangasSalvos.push(novoManga);
                localStorage.setItem("bedia_mangas", JSON.stringify(mangasSalvos));
                
                // Limpar formulário
                formAddManga.reset();
                
                // Fechar modal
                if (addMangaModal) {
                    addMangaModal.style.display = "none";
                }
                
                // Mostrar sucesso
                alert("Mangá adicionado com sucesso! Já está disponível na lista.");
            };
        }
        
        var btnVerMaisCapitulos = document.getElementById("btnVerMaisCapitulos");
        if (btnVerMaisCapitulos) {
            btnVerMaisCapitulos.onclick = function() {
                // Carregar mangás adicionados pelos usuários
                var mangasAdicionados = JSON.parse(localStorage.getItem("bedia_mangas") || "[]");
                
                if (mangasAdicionados.length === 0) {
                    alert("Nenhum mangá adicionado pelos usuários ainda. Seja o primeiro a adicionar!");
                    return;
                }
                
                // Adicionar mangás novos à lista principal
                mangasAdicionados.forEach(function(manga) {
                    if (!mangas.find(function(m) { return m.id === manga.id; })) {
                        mangas.push(manga);
                    }
                });
                
                // Recarregar a lista de mangás
                carregarMangas();
                
                // Mostrar sucesso
                alert(mangasAdicionados.length + " mangá(s) adicionado(s) pelos usuários! Já estão disponíveis na lista.");
            };
        }
    }, 200); // Aumentar timeout para 200ms
});
