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

function configurarRolagemResultados(container) {
    if (!container) return;
    if (container._rolagemConfigurada) return;
    container._rolagemConfigurada = true;
    function onWheel(e) {
        var canScroll = container.scrollHeight > container.clientHeight;
        if (!canScroll) return;
        container.scrollTop += e.deltaY;
    }
    container.addEventListener("wheel", onWheel, { passive: true });
    container.addEventListener("mousewheel", onWheel, { passive: true });
    container.addEventListener("DOMMouseScroll", onWheel, { passive: true });
    var lastY = 0;
    container.addEventListener("touchstart", function(t) {
        if (!t.touches || t.touches.length === 0) return;
        lastY = t.touches[0].clientY;
    }, { passive: true });
    container.addEventListener("touchmove", function(t) {
        var canScroll = container.scrollHeight > container.clientHeight;
        if (!canScroll) return;
        var curY = t.touches[0].clientY;
        var delta = lastY - curY;
        lastY = curY;
        container.scrollTop += delta;
    }, { passive: true });
}

var _searchScrollTrap = null;
function enableSearchScrollTrap(el) {
    if (!el) return;
    disableSearchScrollTrap();
    var wheelHandler = function(e) {
        var cont = document.getElementById("resultadosPesquisa");
        if (!cont || cont.style.display === "none") return;
        e.preventDefault();
        var delta = e.deltaY || e.wheelDelta || 0;
        var next = cont.scrollTop + delta;
        if (next < 0) next = 0;
        var max = cont.scrollHeight - cont.clientHeight;
        if (next > max) next = max;
        cont.scrollTop = next;
    };
    var lastY = 0;
    var touchStart = function(t) {
        if (!t.touches || t.touches.length === 0) return;
        lastY = t.touches[0].clientY;
    };
    var touchMove = function(t) {
        var cont = document.getElementById("resultadosPesquisa");
        if (!cont || cont.style.display === "none") return;
        var curY = t.touches[0].clientY;
        var delta = lastY - curY;
        lastY = curY;
        t.preventDefault();
        var next = cont.scrollTop + delta;
        if (next < 0) next = 0;
        var max = cont.scrollHeight - cont.clientHeight;
        if (next > max) next = max;
        cont.scrollTop = next;
    };
    document.addEventListener("wheel", wheelHandler, { passive: false, capture: true });
    document.addEventListener("touchstart", touchStart, { passive: true, capture: true });
    document.addEventListener("touchmove", touchMove, { passive: false, capture: true });
    _searchScrollTrap = { wheelHandler, touchStart, touchMove };
}
function disableSearchScrollTrap() {
    if (!_searchScrollTrap) return;
    document.removeEventListener("wheel", _searchScrollTrap.wheelHandler, true);
    document.removeEventListener("touchstart", _searchScrollTrap.touchStart, true);
    document.removeEventListener("touchmove", _searchScrollTrap.touchMove, true);
    _searchScrollTrap = null;
}

// Formatar datas para DD/MM/AAAA
function formatarData(input) {
    try {
        if (!input) return "indisponível";
        var d = new Date(input);
        if (isNaN(d.getTime())) {
            // tentar formato "YYYY-MM-DD HH:mm"
            var parts = String(input).split(/[ T]/)[0].split("-");
            if (parts.length === 3) {
                return parts[2] + "/" + parts[1] + "/" + parts[0];
            }
            return String(input);
        }
        var dia = String(d.getDate()).padStart(2, "0");
        var mes = String(d.getMonth() + 1).padStart(2, "0");
        var ano = d.getFullYear();
        return dia + "/" + mes + "/" + ano;
    } catch (e) {
        return "indisponível";
    }
}

// Fallback quando a API não responde
var fallbackMangas = [
    { 
        id: "20-sobre-love", 
        nome: "20 Sobre Love", 
        genero: "romance", 
        capa: "capa.jpeg", 
        usuario_id: null, 
        data_adicao: "2024-01-01 00:00", 
        avaliacao_media: 0.0, 
        avaliacoes: [], 
        visualizacoes: 0, 
        likes: 0, 
        dislikes: 0, 
        commentsCount: 0,
        autor: "Bédia Quadrinho",
        sinopse: "Numa divertida guerra entre uma professora e uma aluna, a vitória vai obviamente para a professora. Mas uma grande reviravolta ocorre quando a aluna é obrigada a levar o encarregado por causa da sua queda de notas e indisciplina. Essa reviravolta milagrosa é a paixão da Professora pelo pai viúvo da nossa protagonista que ganha vantagem e aproveita a situação com a proposta: Eu te ajudo com o meu pai, mas você me torna uma das 5 melhores em matemática."
    }
];

var fallbackCapitulos = [
    { n: "Capítulo 01", l: "20 SOBRE LOVE - 01.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love", data_adicao: "2024-01-01 01:00" },
    { n: "Capítulo 02", l: "20 SOBRE LOVE - 02.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love", data_adicao: "2024-01-02 02:00" },
    { n: "Capítulo 03", l: "20 SOBRE LOVE - 03_compressed.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love", data_adicao: "2024-01-03 03:00" },
    { n: "Capítulo 04", l: "20 SOBRE LOVE - 04.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love", data_adicao: "2024-01-04 04:00" },
    { n: "Capítulo 05", l: "20 SOBRE LOVE - 05.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love", data_adicao: "2024-01-05 05:00" },
    { n: "Capítulo 05.5", l: "20 SOBRE LOVE - 05.5.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love", data_adicao: "2024-01-05 06:00" },
    { n: "Capítulo 06", l: "20 SOBRE LOVE - 06.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love", data_adicao: "2024-01-06 07:00" },
    { n: "Capítulo 06.5", l: "20 SOBRE LOVE - 06.5.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love", data_adicao: "2024-01-06 08:00" },
    { n: "Capítulo 07", l: "20 SOBRE LOVE - 07.pdf", capa: "capa.jpeg", manga_id: "20-sobre-love", data_adicao: "2024-01-07 09:00" }
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
        carregarUltimosCapitulos(); // Prioridade máxima - carregar Home primeiro
        criarResultadosPesquisa();
    }).then(function() {
        // Garantir que Home seja carregada mesmo após Promise resolver
        setTimeout(function() {
            if (typeof carregarUltimosCapitulos === 'function') {
                console.log("Garantindo carregamento da Home após Promise");
                carregarUltimosCapitulos();
            }
        }, 200);
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
            "<div class=\"detalhes-panel\" style=\"display:none\">" +
            "<div class=\"detalhe-linha\"><strong>Autor:</strong> " + esc(m.autor || "Bédia Quadrinho") + "</div>" +
            "<div class=\"detalhe-linha\"><strong>Lançamento:</strong> " + esc(formatarData(m.data_adicao)) + "</div>" +
            "<div class=\"detalhe-linha\"><strong>Sinopse:</strong> <span class=\"detalhe-sinopse\">" + esc(m.sinopse || "Sem sinopse disponível.") + "</span></div>" +
            "</div>" +
            "<button type=\"button\" class=\"btn-detalhes\">DETALHES</button>" +
            "<button class=\"btn-ler\" onclick=\"abrirCapitulos('" + esc(id) + "')\">Ler</button>";
        mangaList.appendChild(card);
    });
    
    adicionarEventosAosCards();
    inicializarInteracoes(); // Inicializar sistema de interações profissionais
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
    
    // Garantir que temos dados de capítulos mesmo que localStorage esteja vazio
    var capitulosDoManga = capitulos.filter(function(cap) {
        return cap.manga_id === mangaId;
    });
    
    if (capitulosDoManga.length === 0) {
        html = '<p class="sem-capitulos-modal">Nenhum capítulo disponível para este mangá.</p>';
    } else {
        // Ordenar capítulos por número (tratando formato com zeros e decimais)
        capitulosDoManga.sort(function(a, b) {
            var numA = parseFloat(a.n.replace(/[^0-9.]/g, '')) || 0;
            var numB = parseFloat(b.n.replace(/[^0-9.]/g, '')) || 0;
            return numA - numB;
        });
        
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
    var chapterModal = document.getElementById("chapterModal");
    if (chapterModal) {
        chapterModal.style.display = "flex";
    }
    carregarModal(mangaId);
};

window.abrirCapitulosEFechar = function(mangaId) {
    // Fechar modal de mangás disponíveis
    var modalManga = document.getElementById("modalManga");
    if (modalManga) {
        modalManga.style.display = "none";
    }
    
    // Abrir capítulos do manga selecionado
    var chapterModal = document.getElementById("chapterModal");
    if (chapterModal) {
        chapterModal.style.display = "flex";
    }
    carregarModal(mangaId);
};

window.mostrarTodosMangas = function() {
    var modalManga = document.getElementById("modalManga");
    var modalConteudo = document.querySelector("#modalManga .modal-manga-conteudo");
    
    if (!modalManga || !modalConteudo) return;
    
    modalManga.style.display = "flex";
    
    var html = '<h2>Todos os Mangás Disponíveis</h2>';
    html += '<div class="mangas-lista-modal">';
    
    mangas.forEach(function(manga) {
        html += '<div class="manga-item-modal" onclick="abrirCapitulosEFechar(\'' + esc(manga.id) + '\')">';
        html += '<img src="' + esc(manga.capa) + '" alt="' + esc(manga.nome) + '">';
        html += '<div class="manga-info-modal">';
        html += '<h3>' + esc(manga.nome) + '</h3>';
        html += '<p>' + esc(manga.genero || "Não especificado") + '</p>';
        html += '</div>';
        html += '</div>';
    });
    
    html += '</div>';
    html += '<button class="btn-modal-fechar" onclick="fecharModalManga()">Fechar</button>';
    
    modalConteudo.innerHTML = html;
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
            if (!usuarioLogado) {
                alert("Você precisa estar logado para comentar. Clique em 'Entrar' para criar sua conta!");
                return;
            }
            
            var mangaId = this.getAttribute("data-manga-id");
            var nome = this.getAttribute("data-manga-nome") || "Mangá";
            document.getElementById("commentMangaId").value = mangaId;
            document.getElementById("commentMangaNome").textContent = nome;
            commentsModal.style.display = "flex";
            carregarComentarios(mangaId);
        };
    });
    
    // Botão Detalhes
    mangaList.querySelectorAll(".btn-detalhes").forEach(function(btn) {
        btn.onclick = function(e) {
            e.stopPropagation();
            var card = this.closest(".card");
            if (!card) return;
            var painel = card.querySelector(".detalhes-panel");
            if (!painel) return;
            var mostrando = painel.style.display === "block";
            painel.style.display = mostrando ? "none" : "block";
            this.textContent = mostrando ? "DETALHES" : "OCULTAR DETALHES";
        };
    });
}

// Sistema de pesquisa
// SISTEMA DE PESQUISA - REESCRITO DO ZERO
function criarResultadosPesquisa() {
    var resultadosContainer = document.getElementById("resultadosPesquisa");
    if (!resultadosContainer) return;
    
    // BLOQUEAR FUNDO DO SITE
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    // CRIAR ESTRUTURA DA JANELA DE PESQUISA
    resultadosContainer.innerHTML = 
        '<div class="resultados-header">' +
        '<span class="resultados-titulo">Resultados da Pesquisa</span>' +
        '<button type="button" id="fecharResultados" class="resultados-fechar" aria-label="Fechar resultados">✖</button>' +
        '</div>' +
        '<div class="resultados-conteudo" id="resultadosConteudo">' +
        '<p style="color: white; text-align: center; padding: 20px;">Carregando resultados...</p>' +
        '</div>';
    
    // CONFIGURAR JANELA COM ALTURA FIXA E SCROLL INTERNO
    resultadosContainer.style.cssText = 
        'display: block !important;' +
        'position: fixed !important;' +
        'top: 10% !important;' +
        'left: 50% !important;' +
        'transform: translateX(-50%) !important;' +
        'width: 90% !important;' +
        'max-width: 600px !important;' +
        'height: 80vh !important;' +
        'max-height: 80vh !important;' +
        'background: linear-gradient(145deg, #1a1a1a, #2d2d2d) !important;' +
        'border: 2px solid #ff0033 !important;' +
        'border-radius: 15px !important;' +
        'z-index: 999999 !important;' +
        'overflow-y: scroll !important;' +
        '-webkit-overflow-scrolling: touch !important;' +
        'box-shadow: 0 20px 60px rgba(0,0,0,0.9) !important;' +
        'pointer-events: auto !important;';
    
    // FOCO PARA CAPTURAR ROLAGEM
    resultadosContainer.setAttribute('tabindex', '-1');
    try { resultadosContainer.focus(); } catch (_) {}
    
    // CARREGAR MANGÁS DO DATA.JSON
    var resultadosConteudo = document.getElementById('resultadosConteudo');
    if (resultadosConteudo) {
        resultadosConteudo.innerHTML = '';
        
        mangas.forEach(function(manga) {
            var div = document.createElement("div");
            div.className = "resultado-pesquisa";
            div.style.cssText = 
                'display: flex !important;' +
                'padding: 15px !important;' +
                'border-bottom: 1px solid rgba(255,255,255,0.1) !important;' +
                'cursor: pointer !important;' +
                'transition: background 0.3s ease !important;';
            
            div.innerHTML = 
                '<img src="' + esc(manga.capa) + '" alt="' + esc(manga.nome) + '" style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;">' +
                '<div class="resultado-info" style="flex: 1;">' +
                '<h5 style="color: white; margin: 0 0 5px 0; font-size: 16px;">' + esc(manga.nome) + '</h5>' +
                '<p class="resultado-genero" style="color: #ccc; margin: 0; font-size: 14px;">' + esc(manga.genero || "Sem gênero") + '</p>' +
                '</div>';
            
            div.onclick = function() {
                selecionarManga(manga.id);
            };
            
            div.onmouseover = function() {
                this.style.background = 'rgba(255,255,255,0.1)';
            };
            
            div.onmouseout = function() {
                this.style.background = 'transparent';
            };
            
            resultadosConteudo.appendChild(div);
        });
    }
    
    // BOTÃO DE FECHAR - LIMPA REGRAS E RESTAURA NAVEGAÇÃO
    var fecharBtn = document.getElementById("fecharResultados");
    if (fecharBtn) {
        fecharBtn.onclick = function(e) {
            e.stopPropagation();
            
            // RESTAURAR NAVEGAÇÃO DO SITE
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            
            // FECHAR JANELA
            resultadosContainer.style.display = 'none';
            
            // LIMPAR SCROLL TRAP
            disableSearchScrollTrap();
        };
    }
    
    // FECHAR COM ESC
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape' && resultadosContainer.style.display === 'block') {
            // RESTAURAR NAVEGAÇÃO DO SITE
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            
            // FECHAR JANELA
            resultadosContainer.style.display = 'none';
            
            // LIMPAR SCROLL TRAP
            disableSearchScrollTrap();
            
            // REMOVER EVENT LISTENER
            document.removeEventListener('keydown', escHandler);
        }
    });
}

function selecionarManga(mangaId) {
    var manga = mangas.find(function(m) { return m.id === mangaId; });
    if (!manga) return;
    
    console.log("Manga selecionado:", manga);
    
    var modal = document.getElementById("modalManga");
    if (!modal) return;
    
    // GERAR HTML COMPLETO COM BOTÃO DETALHES E CAMPO SINOPSE
    modal.innerHTML = 
        '<div class="modal-manga-conteudo">' +
        '<button class="fechar-modal-manga" onclick="fecharModalManga()">✖</button>' +
        '<img src="' + esc(manga.capa) + '" alt="' + esc(manga.nome) + '" class="modal-manga-capa">' +
        '<div class="modal-manga-info-bloco">' +
        '<h2>' + esc(manga.nome) + '</h2>' +
        '<div class="modal-manga-autor">' +
        '<p class="autor-label">Escrito por:</p>' +
        '<h3 class="autor-nome">Bédia Quadrinho</h3>' +
        '<button class="like-btn" data-manga-id="' + esc(manga.id) + '">🔥</button>' +
        '</div>' +
        '<p class="modal-manga-genero">Gênero: ' + esc(manga.genero || "Não especificado") + '</p>' +
        '</div>' +
        '<div class="modal-manga-capitulos-bloco">' +
        '<h3>Capítulos</h3>' +
        '<div id="capitulos-container">' +
        '<p style="color: white;">Carregando capítulos...</p>' +
        '</div>' +
        '</div>' +
        '<div class="modal-manga-acoes">' +
        '<button id="btn-detalhes" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(5px); color: white; border-radius: 20px; width: 100%; margin-bottom: 10px; border: none; padding: 12px; font-size: 14px; cursor: pointer;" onclick="toggleSinopse()">📋 DETALHES</button>' +
        '<button id="btn-ler" class="btn-modal-ler" onclick="abrirCapitulos(\'' + esc(manga.id) + '\')" style="background: linear-gradient(135deg, #ff6b6b, #ff4757); border: none; color: white; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold;">📖 LER</button>' +
        '</div>' +
        '<div id="sinopse-container" style="display: none; margin: 15px 0; padding: 20px; background: rgba(20, 20, 20, 0.9); backdrop-filter: blur(10px); border-radius: 15px; border: 1px solid rgba(255, 255, 255, 0.1);">' +
        '<h3 style="color: white; margin-bottom: 15px; font-size: 18px; text-align: center;">Sinopse</h3>' +
        '<p style="color: white; font-weight: bold; margin-bottom: 10px;">Autor: ' + esc(manga.autor || 'Bédia Quadrinho') + '</p>' +
        '<p style="color: white; line-height: 1.6; text-align: justify; font-size: 14px;">' + esc(manga.sinopse || 'Sinopse não disponível.') + '</p>' +
        '</div>' +
        '</div>';
    
    // Exibir modal
    modal.style.display = "flex";
    document.body.classList.add("modal-aberto");
    document.body.style.overflow = "hidden";
    if (!modal._outsideCloseBound) {
        modal.addEventListener("click", function(e) {
            if (e.target === modal) {
                fecharModalManga();
            }
        });
        modal._outsideCloseBound = true;
    }
    var conteudo = modal.querySelector(".modal-content");
    if (conteudo) {
        if (!conteudo.hasAttribute("tabindex")) conteudo.setAttribute("tabindex", "-1");
        try { conteudo.focus(); } catch (_) {}
    }
    
    // Carregar capítulos
    setTimeout(function() {
        carregarCapitulosNoBlocoInferior(mangaId);
    }, 100);
    
    // Inicializar interações
    inicializarInteracoes();
}

// Função para mostrar/esconder sinopse
function toggleSinopse() {
    console.log('TOGGLE SINOPSE CHAMADO!');
    
    var sinopseContainer = document.getElementById('sinopse-container');
    var detalhesBtn = document.getElementById('btn-detalhes');
    
    if (sinopseContainer.style.display === 'none') {
        // Mostrar sinopse
        sinopseContainer.style.display = 'block';
        detalhesBtn.textContent = 'OCULTAR DETALHES';
        console.log('SINOPSE VISÍVEL!');
    } else {
        // Esconder sinopse
        sinopseContainer.style.display = 'none';
        detalhesBtn.textContent = 'DETALHES';
        console.log('SINOPSE ESCONDIDA!');
    }
}

// Função SIMPLES para o botão DETALHES
document.addEventListener('DOMContentLoaded', function() {
    var detalhesBtn = document.getElementById('btn-detalhes');
    if (detalhesBtn) {
        detalhesBtn.onclick = function() {
            alert('BOTÃO DETALHES CLICADO! FUNCIONANDO!');
        };
    }
});

// Função SIMPLES para mostrar sinopse
function mostrarSinopse() {
    console.log('FUNÇÃO MOSTRAR SINOPSE CHAMADA!');
    
    var campoSinopse = document.getElementById('campo-sinopse');
    var detalhesBtn = document.getElementById('btn-detalhes');
    
    if (campoSinopse.style.display === 'none') {
        // Mostrar sinopse
        campoSinopse.style.display = 'block';
        detalhesBtn.innerHTML = 'OCULTAR DETALHES';
        console.log('SINOPSE DA JUL E PROFESSORA ROSE VISÍVEL!');
    } else {
        // Ocultar sinopse
        campoSinopse.style.display = 'none';
        detalhesBtn.innerHTML = 'DETALHES';
        console.log('Sinopse ocultada');
    }
}

// Função TOGGLE para expandir/recolher detalhes
function toggleDetalhes() {
    console.log('FUNÇÃO TOGGLE DETALHES CHAMADA!');
    console.log('Arquivo: script.js');
    
    var detalhesBloco = document.getElementById('texto-detalhes');
    var detalhesBtn = document.getElementById('btn-detalhes');
    
    console.log('Elementos encontrados:', {
        bloco: detalhesBloco,
        botao: detalhesBtn
    });
    
    if (detalhesBloco.style.display === 'none') {
        // Expandir
        detalhesBloco.style.display = 'block';
        detalhesBtn.innerHTML = '📋 OCULTAR DETALHES';
        console.log('Detalhes EXPANDIDOS - TEXTO DA JUL VISÍVEL');
    } else {
        // Recolher
        detalhesBloco.style.display = 'none';
        detalhesBtn.innerHTML = '📋 DETALHES';
        console.log('Detalhes RECOLHIDOS');
    }
}

// Função separada para carregar capítulos APENAS no bloco inferior
function carregarCapitulosNoBlocoInferior(mangaId) {
    var capitulosContainer = document.getElementById('capitulos-container');
    if (!capitulosContainer) {
        console.log("ERRO: Container de capítulos não encontrado!");
        return;
    }
    
    // Obter capítulos do mangá
    var capitulosDoManga = capitulos.filter(function(cap) {
        return cap.manga_id === mangaId;
    });
    
    // Ordenar capítulos por número
    capitulosDoManga.sort(function(a, b) {
        var numA = parseFloat(a.n.replace(/[^0-9.]/g, '')) || 0;
        var numB = parseFloat(b.n.replace(/[^0-9.]/g, '')) || 0;
        return numA - numB;
    });
    
    // LIMPAR APENAS O CONTAINER DE CAPÍTULOS (NÃO APAGA O BLOCO SUPERIOR)
    capitulosContainer.innerHTML = '';
    
    // ADICIONAR capítulos
    capitulosDoManga.forEach(function(cap) {
        var capituloDiv = document.createElement('div');
        capituloDiv.className = 'capitulo-item';
        capituloDiv.style.cssText = 'padding: 10px; margin: 5px 0; background: rgba(255,255,255,0.1); border-radius: 5px; color: white;';
        capituloDiv.innerHTML = 
            '<strong style="color: white;">' + esc(cap.n) + '</strong> - ' +
            '<a href="' + esc(cap.l) + '" target="_blank" style="color: #4CAF50; text-decoration: none;">📖 Ler</a>';
        
        // ADICIONAR apenas no container de capítulos
        capitulosContainer.appendChild(capituloDiv);
    });
    
    console.log("Capítulos carregados no BLOCO INFERIOR sem afetar o BLOCO SUPERIOR");
}

function fecharModalManga() {
    var modal = document.getElementById("modalManga");
    if (modal) {
        modal.style.display = "none";
    }
    document.body.classList.remove("modal-aberto");
    document.body.style.overflow = "auto";
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
    
    // Carregar dados iniciais automaticamente
    carregarDados();
    
    // Eventos dos modais
    document.getElementById("btnFecharModal").onclick = function() {
        var chapterModal = document.getElementById("chapterModal");
        if (chapterModal) {
            chapterModal.style.display = "none";
        }
    };
    
    document.getElementById("btnFecharComments").onclick = function() {
        commentsModal.style.display = "none";
    };
    
    document.getElementById("btnFecharConta").onclick = function() {
        document.getElementById("contaModal").style.display = "none";
    };
    
    // Banner do site online: mostrar uma vez e permitir fechar
    (function() {
        var banner = document.getElementById("siteBanner");
        if (banner && !localStorage.getItem("bedia_banner_dismissed")) {
            banner.style.display = "block";
        }
        window.fecharBanner = function() {
            var el = document.getElementById("siteBanner");
            if (el) {
                el.style.display = "none";
            }
            try { localStorage.setItem("bedia_banner_dismissed", "1"); } catch (e) {}
        };
    })();
    
    // Funções de sessão de usuário
    function atualizarInterfaceUsuario() {
        var btnPerfil = document.getElementById("btnPerfil");
        var linkEst = document.getElementById("linkEstatisticas");
        if (usuarioLogado) {
            if (btnPerfil) btnPerfil.textContent = "👤 " + (usuarioLogado.nome || "Minha conta");
            if (linkEst) linkEst.style.display = "block";
        } else {
            if (btnPerfil) btnPerfil.textContent = "👤 Entrar";
            if (linkEst) linkEst.style.display = "none";
        }
    }
    (function restaurarSessao() {
        try {
            var atual = localStorage.getItem("usuario_atual") || sessionStorage.getItem("usuario_atual");
            if (atual) {
                usuarioLogado = JSON.parse(atual);
                atualizarInterfaceUsuario();
            }
        } catch (_) {}
    })();
    
    // Botão Entrar/Perfil com dropdown simples quando logado
    (function() {
        var btn = document.getElementById("btnPerfil");
        if (!btn) return;
        var menu = null;
        function fecharMenu() { if (menu) { menu.remove(); menu = null; } }
        btn.onclick = function() {
            if (!usuarioLogado) {
                document.getElementById("contaModal").style.display = "flex";
                return;
            }
            fecharMenu();
            menu = document.createElement("div");
            menu.style.cssText = "position:absolute;background:rgba(0,0,0,0.95);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:6px;z-index:4000;min-width:160px;";
            menu.innerHTML = '' +
                '<button id="mnConta" style="display:block;width:100%;padding:8px;border:none;background:none;color:#fff;text-align:left;border-radius:6px;cursor:pointer;">Minha conta</button>' +
                '<button id="mnSair" style="display:block;width:100%;padding:8px;border:none;background:none;color:#ff6b6b;text-align:left;border-radius:6px;cursor:pointer;">Sair</button>';
            document.body.appendChild(menu);
            var r = btn.getBoundingClientRect();
            menu.style.top = (window.scrollY + r.bottom + 6) + "px";
            menu.style.left = (window.scrollX + r.left) + "px";
            document.getElementById("mnConta").onclick = function() {
                document.getElementById("contaModal").style.display = "flex";
                fecharMenu();
            };
            document.getElementById("mnSair").onclick = function() {
                try { localStorage.removeItem("usuario_atual"); sessionStorage.removeItem("usuario_atual"); } catch (_) {}
                usuarioLogado = null;
                atualizarInterfaceUsuario();
                fecharMenu();
            };
            setTimeout(function() {
                function outside(e) {
                    if (menu && !menu.contains(e.target) && e.target !== btn) {
                        fecharMenu();
                        document.removeEventListener("click", outside);
                    }
                }
                document.addEventListener("click", outside);
            }, 0);
        };
    })();
    
    // Botão Login
    document.getElementById("btnLogin").onclick = function() {
        // Limpar erros anteriores
        document.getElementById("emailError").textContent = "";
        document.getElementById("emailError").classList.remove("show");
        document.getElementById("senhaError").textContent = "";
        document.getElementById("senhaError").classList.remove("show");
        
        var email = document.getElementById("loginEmail").value.trim();
        var senha = document.getElementById("loginSenha").value;
        var lembrarInput = document.getElementById("loginLembrar");
        var lembrar = !!(lembrarInput && lembrarInput.checked);
        var hasError = false;
        
        // Validação simples
        var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailOk) {
            document.getElementById("emailError").textContent = "Por favor, insira um e-mail válido.";
            document.getElementById("emailError").classList.add("show");
            hasError = true;
        }
        
        if (!senha || senha.length < 1) {
            document.getElementById("senhaError").textContent = "Por favor, insira sua senha.";
            document.getElementById("senhaError").classList.add("show");
            hasError = true;
        }
        
        if (hasError) return;
        
        // Simulação de carregamento por 2 segundos apenas
        var btn = this;
        var originalText = btn.querySelector(".btn-text").textContent;
        btn.classList.add("loading");
        btn.innerHTML = '<span class="spinner"></span><span class="btn-text">A carregar...</span>';
        btn.disabled = true;
        
        setTimeout(function() {
            btn.classList.remove("loading");
            btn.innerHTML = '<span class="btn-text">' + originalText + '</span>';
            btn.disabled = false;
            
            // Lógica de login existente
            var usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            var usuario = usuarios.find(function(u) { 
                return u.email === email && u.senha === senha; 
            });
            
            if (usuario) {
                usuarioLogado = usuario;
                try { 
                    if (lembrar) {
                        localStorage.setItem("usuario_atual", JSON.stringify(usuario));
                        sessionStorage.removeItem("usuario_atual");
                    } else {
                        sessionStorage.setItem("usuario_atual", JSON.stringify(usuario));
                        localStorage.removeItem("usuario_atual");
                    }
                } catch (_) {}
                document.getElementById("loginMsg").textContent = "Login realizado com sucesso!";
                document.getElementById("loginMsg").className = "form-msg sucesso";
                
                setTimeout(function() {
                    contaModal.style.display = "none";
                    atualizarInterfaceUsuario();
                    document.getElementById("loginMsg").textContent = "";
                }, 1500);
            } else {
                document.getElementById("loginMsg").textContent = "E-mail ou senha incorretos.";
                document.getElementById("loginMsg").className = "form-msg erro";
            }
        }, 2000);
    };
    
    // Envio com Enter e aviso de Caps Lock
    ["loginEmail","loginSenha"].forEach(function(id){
        var el = document.getElementById(id);
        if (el) {
            el.addEventListener("keydown", function(e){
                if (e.key === "Enter") {
                    document.getElementById("btnLogin").click();
                }
                if (id === "loginSenha" && e.getModifierState) {
                    var hint = document.getElementById("capsLockHint");
                    if (hint) hint.style.display = e.getModifierState("CapsLock") ? "block" : "none";
                }
            });
        }
    });
    
    // Função mostrar/ocultar senha
    window.toggleSenha = function(inputId) {
        var input = document.getElementById(inputId);
        if (input.type === "password") {
            input.type = "text";
        } else {
            input.type = "password";
        }
    };
    
    // Função login com Google
    window.loginComGoogle = function() {
        // Link profissional - abre página de escolha de conta em nova aba
        window.open('https://accounts.google.com/accountchooser?continue=https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin', '_blank');
    };
    
    // Link para cadastro - alternância instantânea sem travamentos
    document.getElementById("linkParaCadastro").onclick = function(e) {
        e.preventDefault();
        // Limpar qualquer estado de loading anterior
        document.querySelectorAll(".loading").forEach(function(el) {
            el.classList.remove("loading");
        });
        // Alternância instantânea
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("cadastroForm").style.display = "block";
    };
    
    // Link para voltar ao login - alternância instantânea sem travamentos
    document.getElementById("linkParaLogin").onclick = function(e) {
        e.preventDefault();
        // Limpar qualquer estado de loading anterior
        document.querySelectorAll(".loading").forEach(function(el) {
            el.classList.remove("loading");
        });
        // Alternância instantânea
        document.getElementById("cadastroForm").style.display = "none";
        document.getElementById("loginForm").style.display = "block";
    };
    
    // Cadastro
    (function() {
        var btnCad = document.getElementById("btnCadastrar");
        if (!btnCad) return;
        
        // Indicador de força da senha
        var cadSenha = document.getElementById("cadSenha");
        var bar = document.getElementById("cadStrengthBar");
        var txt = document.getElementById("cadStrengthText");
        function scoreSenha(s) {
            var score = 0;
            if (s.length >= 4) score += 1;
            if (s.length >= 6) score += 1;
            if (/[A-Z]/.test(s)) score += 1;
            if (/[0-9]/.test(s)) score += 1;
            if (/[^A-Za-z0-9]/.test(s)) score += 1;
            return Math.min(score, 5);
        }
        if (cadSenha && bar && txt) {
            cadSenha.addEventListener("input", function() {
                var sc = scoreSenha(cadSenha.value);
                var pct = (sc/5)*100;
                bar.style.width = pct + "%";
                var color = sc >= 4 ? "#51cf66" : sc >= 3 ? "#f1c40f" : "#ff6b6b";
                bar.style.background = color;
                var label = sc >= 4 ? "forte" : sc >= 3 ? "média" : sc > 0 ? "fraca" : "—";
                txt.textContent = "Força da senha: " + label;
            });
        }
        btnCad.onclick = function() {
            var nomeEl = document.getElementById("cadNome");
            var emailEl = document.getElementById("cadEmail");
            var senhaEl = document.getElementById("cadSenha");
            var msg = document.getElementById("cadMsg");
            var nome = (nomeEl && nomeEl.value || "").trim();
            var email = (emailEl && emailEl.value || "").trim();
            var senha = (senhaEl && senhaEl.value || "");
            var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!nome || !emailOk || senha.length < 4) {
                if (msg) { msg.textContent = "Preencha nome, e-mail válido e senha (mín. 4)."; msg.className = "form-msg erro"; }
                return;
            }
            var usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            if (usuarios.some(function(u){ return u.email.toLowerCase() === email.toLowerCase(); })) {
                if (msg) { msg.textContent = "E-mail já cadastrado."; msg.className = "form-msg erro"; }
                return;
            }
            var novo = { id: Date.now(), nome: nome, email: email, senha: senha };
            usuarios.push(novo);
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
            // Login automático
            usuarioLogado = novo;
            try { localStorage.setItem("usuario_atual", JSON.stringify(novo)); sessionStorage.removeItem("usuario_atual"); } catch (_) {}
            atualizarInterfaceUsuario();
            if (msg) { msg.textContent = "Conta criada com sucesso. Você está logado!"; msg.className = "form-msg sucesso"; }
            setTimeout(function(){
                document.getElementById("contaModal").style.display = "none";
                if (msg) msg.textContent = "";
            }, 1200);
        };
    })();
    
    // Sistema de Like Único (Fogo 🔥)
    function inicializarSistemaLikes() {
        var userLikes = JSON.parse(localStorage.getItem("userLikes") || "{}");
        
        // Adicionar eventos de like nos cards de mangás
        mangaList.querySelectorAll(".btn-like").forEach(function(btn) {
            var mangaId = btn.getAttribute("data-manga-id");
            var numElement = btn.querySelector(".num");
            var currentLikes = parseInt(numElement.textContent) || 0;
            
            // Verificar se usuário já deu like
            if (userLikes[mangaId]) {
                btn.classList.add("liked");
            }
            
            btn.onclick = function() {
                if (!usuarioLogado) {
                    alert("Você precisa estar logado para curtir. Clique em 'Entrar' para criar sua conta!");
                    return;
                }
                
                // Toggle like
                if (userLikes[mangaId]) {
                    // Remover like
                    delete userLikes[mangaId];
                    btn.classList.remove("liked");
                    numElement.textContent = Math.max(0, currentLikes - 1);
                } else {
                    // Adicionar like
                    userLikes[mangaId] = true;
                    btn.classList.add("liked");
                    numElement.textContent = currentLikes + 1;
                }
                
                // Salvar no localStorage
                localStorage.setItem("userLikes", JSON.stringify(userLikes));
            };
        });
    }
    
    // Sistema de Avaliação por Estrelas (Rating)
    function inicializarSistemaEstrelas() {
        var userRatings = JSON.parse(localStorage.getItem("userRatings") || "{}");
        var mangaRatings = JSON.parse(localStorage.getItem("mangaRatings") || "{}");
        
        // Adicionar eventos de estrelas nos cards de mangás
        mangaList.querySelectorAll(".estrelas").forEach(function(estrelasContainer) {
            var mangaId = estrelasContainer.getAttribute("data-manga-id");
            var estrelas = estrelasContainer.querySelectorAll(".estrela");
            
            // Verificar se usuário já avaliou
            var userRating = userRatings[mangaId];
            if (userRating) {
                // Mostrar avaliação do usuário
                estrelas.forEach(function(estrela, index) {
                    if (index < userRating) {
                        estrela.classList.add("active");
                    }
                });
            }
            
            // Calcular e mostrar média
            var ratings = mangaRatings[mangaId] || [];
            if (ratings.length > 0) {
                var media = ratings.reduce(function(a, b) { return a + b; }, 0) / ratings.length;
                var mediaElement = estrelasContainer.querySelector(".media-avaliacao");
                if (mediaElement) {
                    mediaElement.textContent = media.toFixed(1);
                }
            }
            
            estrelas.forEach(function(estrela, index) {
                estrela.onclick = function() {
                    if (!usuarioLogado) {
                        alert("Você precisa estar logado para avaliar. Clique em 'Entrar' para criar sua conta!");
                        return;
                    }
                    
                    // Só pode avaliar uma vez
                    if (userRatings[mangaId]) {
                        alert("Você já avaliou este mangá!");
                        return;
                    }
                    
                    var rating = index + 1;
                    
                    // Salvar avaliação do usuário
                    userRatings[mangaId] = rating;
                    localStorage.setItem("userRatings", JSON.stringify(userRatings));
                    
                    // Adicionar às avaliações do mangá
                    if (!mangaRatings[mangaId]) {
                        mangaRatings[mangaId] = [];
                    }
                    mangaRatings[mangaId].push(rating);
                    localStorage.setItem("mangaRatings", JSON.stringify(mangaRatings));
                    
                    // Atualizar visual
                    estrelas.forEach(function(e, i) {
                        if (i <= index) {
                            e.classList.add("active");
                        }
                    });
                    
                    // Atualizar média
                    var ratings = mangaRatings[mangaId];
                    var media = ratings.reduce(function(a, b) { return a + b; }, 0) / ratings.length;
                    var mediaElement = estrelasContainer.querySelector(".media-avaliacao");
                    if (mediaElement) {
                        mediaElement.textContent = media.toFixed(1);
                    }
                };
            });
        });
    }
    
    // Sistema de Visualizações Real
    function inicializarSistemaVisualizacoes() {
        var sessionViews = JSON.parse(sessionStorage.getItem("sessionViews") || "[]");
        var mangaViews = JSON.parse(localStorage.getItem("mangaViews") || "{}");
        
        // Adicionar eventos de clique nos cards de mangás
        mangaList.querySelectorAll(".card").forEach(function(card) {
            var mangaId = card.getAttribute("data-manga-id");
            var viewsElement = card.querySelector(".visualizacoes");
            
            // Mostrar visualizações atuais
            if (viewsElement && mangaViews[mangaId]) {
                viewsElement.textContent = mangaViews[mangaId] + " visualizações";
            }
            
            card.onclick = function(e) {
                // Não contar clique em botões de like/dislike/comentários
                if (e.target.closest(".btn-like") || e.target.closest(".btn-dislike") || e.target.closest(".btn-comentarios") || e.target.closest(".btn-detalhes")) {
                    return;
                }
                
                // Contar visualização apenas uma vez por sessão
                if (!sessionViews.includes(mangaId)) {
                    sessionViews.push(mangaId);
                    sessionStorage.setItem("sessionViews", JSON.stringify(sessionViews));
                    
                    // Incrementar visualizações do mangá
                    if (!mangaViews[mangaId]) {
                        mangaViews[mangaId] = 0;
                    }
                    mangaViews[mangaId]++;
                    localStorage.setItem("mangaViews", JSON.stringify(mangaViews));
                    
                    // Atualizar na tela
                    if (viewsElement) {
                        viewsElement.textContent = mangaViews[mangaId] + " visualizações";
                    }
                }
            };
        });
    }
    
    // Inicializar todos os sistemas de interação
    function inicializarInteracoes() {
        inicializarSistemaLikes();
        inicializarSistemaEstrelas();
        inicializarSistemaVisualizacoes();
    }
    
    // Botão Ler Agora (hero)
    document.getElementById("btnLerAgora").onclick = function() {
        mostrarTodosMangas();
    };
    
    // Botão Adicionar Mangá
    document.getElementById("btnAddManga").onclick = function() {
        if (!usuarioLogado) {
            alert("Você precisa estar logado para adicionar mangás. Clique em 'Entrar' para criar sua conta!");
            return;
        }
        addMangaModal.style.display = "flex";
    };
    
    // Botão fechar modal Adicionar Mangá
    document.getElementById("btnFecharAddManga").onclick = function() {
        addMangaModal.style.display = "none";
    };
    
    // Variáveis de estado diferentes para cada seção
    var isMangaExpanded = false;
    var isChaptersExpanded = false;
    
    // Botão Ver Mais Mangás
    document.getElementById("btnVerMaisMangas").onclick = function() {
        if (!isMangaExpanded) {
            expandirMangas();
            isMangaExpanded = true;
        } else {
            recolherMangas();
            isMangaExpanded = false;
        }
    };
    
    // Botão Ver Mais Capítulos
    document.getElementById("btnVerMaisCapitulos").onclick = function() {
        if (!isChaptersExpanded) {
            expandirCapitulos();
            isChaptersExpanded = true;
        } else {
            recolherCapitulos();
            isChaptersExpanded = false;
        }
    };
    
    // Função exclusiva para expandir mangás
    function expandirMangas() {
        var mangaContainer = document.getElementById("mangaList");
        mangaContainer.style.display = "block";
        
        // NÃO limpar o container - manter o conteúdo existente
        // Se já tiver conteúdo, apenas adicionar os que faltam
        if (mangaContainer.children.length === 0) {
            // Se estiver vazio, carregar todos os mangás
            var localReacoes = getLocalReacoes();
            mangas.forEach(function(m) {
                var id = m.id;
                var nome = m.nome;
                var capa = m.capa;
                var genero = m.genero || "Não especificado";
                var avaliacao = m.avaliacao_media || 0;
                var likes = m.likes || 0;
                var dislikes = m.dislikes || 0;
                var commentsCount = (m.commentsCount || 0) + ((localReacoes.comments[id] || []).length);
                
                var card = document.createElement("div");
                card.className = "card";
                card.setAttribute("data-manga-id", id);
                
                card.innerHTML = '<img src="' + esc(capa) + '" alt="' + esc(nome) + '">' +
                '<h4>' + esc(nome) + '</h4>' +
                '<p class="genero">' + esc(genero) + '</p>' +
                '<div class="avaliacao-container">' +
                '<div class="estrelas-container" data-manga-id="' + esc(id) + '">';
                
                for (var i = 1; i <= 5; i++) {
                    var filled = i <= Math.floor(avaliacao) ? "filled" : "";
                    card.innerHTML += '<span class="estrela ' + filled + '">★</span>';
                }
                
                card.innerHTML += '</div>' +
                '<span class="avaliacao-numero">' + avaliacao + '/5</span>' +
                '</div>' +
                '<div class="reacoes-botoes">' +
                '<button type="button" class="btn-like" data-manga-id="' + esc(id) + '" title="Gostei">🔥 <span class="num">' + likes + '</span></button>' +
                '<button type="button" class="btn-dislike" data-manga-id="' + esc(id) + '" title="Não gostei">👎 <span class="num">' + dislikes + '</span></button>' +
                '<button type="button" class="btn-comentarios" data-manga-id="' + esc(id) + '" data-manga-nome="' + nome + '">💬 Comentários (' + commentsCount + ')</button>' +
                '<div class="visualizacoes">👁️ ' + (m.visualizacoes || 0) + ' leituras</div>' +
                '</div>' +
                '</div>' +
                '<div class="detalhes-panel" style="display:none">' +
                '<div class="detalhe-linha"><strong>Autor:</strong> ' + esc(m.autor || "Bédia Quadrinho") + '</div>' +
                '<div class="detalhe-linha"><strong>Lançamento:</strong> ' + esc(formatarData(m.data_adicao)) + '</div>' +
                '<div class="detalhe-linha"><strong>Sinopse:</strong> <span class="detalhe-sinopse">' + esc(m.sinopse || "Sem sinopse disponível.") + '</span></div>' +
                '</div>' +
                '<button type="button" class="btn-detalhes">DETALHES</button>' +
                '<button class="btn-ler" onclick="abrirCapitulos(\'' + esc(id) + '\')">Ler</button>';
                
                mangaContainer.appendChild(card);
            });
            
            // Adicionar eventos aos novos cards
            adicionarEventosAosCards();
            inicializarInteracoes(); // Inicializar sistema de interações profissionais
        }
        
        // Mudar texto do botão
        document.getElementById("btnVerMaisMangas").textContent = "ver menos";
    }
    
    // Função exclusiva para recolher mangás
    function recolherMangas() {
        var mangaContainer = document.getElementById("mangaList");
        mangaContainer.innerHTML = "";
        mangaContainer.style.display = "none";
        document.getElementById("btnVerMaisMangas").textContent = "ver mais";
        // Recarregar mangás iniciais
        carregarMangas();
    }
    
    // Função exclusiva para expandir capítulos
    function expandirCapitulos() {
        var capitulosContainer = document.getElementById("mangaGrid");
        capitulosContainer.style.display = "block";
        capitulosContainer.innerHTML = "";
        
        // Ordenar capítulos por número (tratando formato com zeros e decimais)
        var capitulosOrdenados = capitulos.slice().sort(function(a, b) {
            var numA = parseFloat(a.n.replace(/[^0-9.]/g, '')) || 0;
            var numB = parseFloat(b.n.replace(/[^0-9.]/g, '')) || 0;
            return numA - numB;
        });
        
        // Renderizar todos os capítulos ordenados
        capitulosOrdenados.forEach(function(cap) {
            var manga = mangas.find(function(m) { return m.id === cap.manga_id; });
            var nomeManga = manga ? manga.nome : "Mangá Desconhecido";
            var capaManga = manga ? manga.capa : "capa-default.jpg";
            
            var card = document.createElement("div");
            card.className = "card";
            
            card.innerHTML = '<img src="' + esc(capaManga) + '" alt="' + esc(nomeManga) + '">' +
            '<h4>' + esc(cap.n) + '</h4>' +
            '<p class="manga-titulo">' + esc(nomeManga) + '</p>' +
            '<button class="btn-ler" onclick="window.open(\'' + esc(cap.l) + '\', \"_blank\")">📖 Ler Agora</button>';
            
            capitulosContainer.appendChild(card);
        });
        
        // Mudar texto do botão
        document.getElementById("btnVerMaisCapitulos").textContent = "ver menos";
    }
    
    // Função exclusiva para recolher capítulos
    function recolherCapitulos() {
        var capitulosContainer = document.getElementById("mangaGrid");
        capitulosContainer.innerHTML = "";
        capitulosContainer.style.display = "none";
        document.getElementById("btnVerMaisCapitulos").textContent = "ver mais";
        // Recarregar capítulos iniciais
        carregarUltimosCapitulos();
    }
    
    // Menu lateral
    document.getElementById("btnAbrirMenu").onclick = function() {
        document.getElementById("sideMenu").classList.add("active");
    };
    
    document.getElementById("btnFecharMenu").onclick = function() {
        document.getElementById("sideMenu").classList.remove("active");
    };
    
    // Fechar menu automaticamente ao clicar em qualquer link
    adicionarEventoFecharMenu();
    
    // Botão fechar modal de login
    var btnFecharLogin = document.getElementById("btnFecharLogin");
    var contaModal = document.getElementById("contaModal");
    
    if (btnFecharLogin && contaModal) {
        btnFecharLogin.onclick = function() {
            contaModal.style.display = "none";
        };
    }
    
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
            resultadosContainer.innerHTML = "<div class='resultados-header'><span class='resultados-titulo'>Resultados</span><button type='button' id='fecharResultados' class='resultados-fechar' aria-label='Fechar resultados'>✖</button></div>";
            resultadosContainer.setAttribute("tabindex", "-1");
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
            document.body.classList.add("modal-aberto");
            enableSearchScrollTrap(resultadosContainer);
            
            var fecharBtn = document.getElementById("fecharResultados");
            if (fecharBtn) {
                fecharBtn.onclick = function(e) {
                    e.stopPropagation();
                    resultadosContainer.style.display = "none";
                    document.body.classList.remove("modal-aberto");
                    disableSearchScrollTrap();
                };
            }
            
            configurarRolagemResultados(resultadosContainer);
        } else {
            resultadosContainer.innerHTML = '<p class="sem-resultados">Nenhum mangá encontrado.</p>';
            resultadosContainer.style.display = "block";
            configurarRolagemResultados(resultadosContainer);
            enableSearchScrollTrap(resultadosContainer);
            document.body.classList.add("modal-aberto");
        }
    };
    
    // Pesquisa ao digitar
    document.getElementById("searchInput").oninput = function() {
        pesquisarComBotao();
    };
    
    // Fechar pesquisa ao clicar fora
    document.addEventListener("click", function(e) {
        if (!e.target.closest(".search-container")) {
            var cont = document.getElementById("resultadosPesquisa");
            if (cont) cont.style.display = "none";
            document.body.classList.remove("modal-aberto");
            document.body.style.overflow = "auto";
        }
    });
    
    // Fechar pesquisa com ESC
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            var cont = document.getElementById("resultadosPesquisa");
            if (cont) cont.style.display = "none";
            document.body.classList.remove("modal-aberto");
            document.body.style.overflow = "auto";
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
    
    // Formulário de adicionar mangá
    document.getElementById("formAddManga").onsubmit = function(e) {
        e.preventDefault();
        
        var nome = document.getElementById("addMangaNome").value;
        var genero = document.getElementById("addMangaGenero").value;
        var capaFile = document.getElementById("addMangaCapaFile").files[0];
        var pdfFile = document.getElementById("addMangaPdfFile").files[0];
        var tituloCap = document.getElementById("addMangaTituloCap").value;
        var msgEl = document.getElementById("addMangaMsg");
        
        if (!nome || !genero || !capaFile || !pdfFile) {
            msgEl.textContent = "Preencha todos os campos obrigatórios.";
            msgEl.className = "form-msg erro";
            return;
        }
        
        // Simular upload e criação do mangá
        var reader = new FileReader();
        
        reader.onload = function() {
            var novoManga = {
                id: Date.now(),
                nome: nome,
                genero: genero,
                capa: reader.result,
                avaliacao_media: 0,
                likes: 0,
                dislikes: 0,
                visualizacoes: 0,
                data_adicao: new Date().toISOString()
            };
            
            mangas.push(novoManga);
            
            // Se houver título de capítulo, criar capítulo
            if (tituloCap.trim()) {
                var novoCapitulo = {
                    id: Date.now() + 1,
                    manga_id: novoManga.id,
                    n: tituloCap,
                    l: "#", // Aqui seria o link para o PDF
                    data_adicao: new Date().toISOString()
                };
                
                capitulos.push(novoCapitulo);
            }
            
            // Limpar formulário
            document.getElementById("formAddManga").reset();
            msgEl.textContent = "Mangá adicionado com sucesso!";
            msgEl.className = "form-msg sucesso";
            
            // Fechar modal após 2 segundos
            setTimeout(function() {
                addMangaModal.style.display = "none";
                msgEl.textContent = "";
                // Recarregar lista de mangás
                carregarMangas();
            }, 2000);
        };
        
        reader.readAsDataURL(capaFile);
    };
    
    // Carregar dados iniciais
    carregarDados();
});

// Chamada direta no final do script para garantir execução
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
        setTimeout(function() {
            // Verificar se variáveis globais estão disponíveis
            if (typeof carregarUltimosCapitulos === 'function' && typeof capitulos !== 'undefined' && typeof mangas !== 'undefined') {
                console.log("Executando carregarUltimosCapitulos - DOM loading");
                carregarUltimosCapitulos();
            } else {
                console.log("Aguardando variáveis globais...");
            }
            
            // Adicionar evento listener para fechar menu
            adicionarEventoFecharMenu();
        }, 100);
    });
} else {
    // Se o DOM já estiver carregado
    setTimeout(function() {
        // Verificar se variáveis globais estão disponíveis
        if (typeof carregarUltimosCapitulos === 'function' && typeof capitulos !== 'undefined' && typeof mangas !== 'undefined') {
            console.log("Executando carregarUltimosCapitulos - DOM ready");
            carregarUltimosCapitulos();
        } else {
            console.log("Aguardando variáveis globais...");
        }
        
        // Adicionar evento listener para fechar menu
        adicionarEventoFecharMenu();
    }, 100);
}

// Função para adicionar evento de fechar menu aos links
function adicionarEventoFecharMenu() {
    var menuLinks = document.querySelectorAll("#sideMenu .menu-link");
    menuLinks.forEach(function(link) {
        // Remover evento anterior para evitar duplicação
        link.removeEventListener("click", fecharMenuAoClicar);
        // Adicionar novo evento
        link.addEventListener("click", fecharMenuAoClicar);
    });
}

// Função para fechar menu ao clicar no link
function fecharMenuAoClicar(e) {
    // Pequeno delay para garantir que a navegação aconteça
    setTimeout(function() {
        var sideMenu = document.getElementById("sideMenu");
        if (sideMenu) {
            sideMenu.classList.remove("active");
        }
    }, 50);
}
