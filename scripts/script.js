document.addEventListener('DOMContentLoaded', () => {

    // Determine base path to handle root vs subfolder
    const isSubfolder = window.location.pathname.includes('/pages/');
    const basePath = isSubfolder ? '../' : './';

    // 1. Fetch News from local JSON file
    fetch(basePath + 'data/noticias.json?t=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                renderNews(data);
            }
        })
        .catch(err => console.error('Erro ao buscar notícias:', err));

    function renderNews(items) {
        const track = document.querySelector('.noticias .carousel-track');
        const allNewsGrid = document.getElementById('all-news-grid');
        
        if (!track && !allNewsGrid) return;

        if (track) track.innerHTML = '';
        if (allNewsGrid) allNewsGrid.innerHTML = '';

        // Se for na página home (carrossel), pega 10. Se for noticias.html, pega tudo.
        const newsItems = allNewsGrid ? items : items.slice(0, 10);

        newsItems.forEach(item => {
            let imageUrl = (item.image && item.image !== "[empty]") ? item.image : basePath + 'images/capa-noticias.png';

            // Formatar data (assumindo formato YYYY-MM-DD ou similar)
            const dateObj = new Date(item.date);
            // Corrige timezone se necessário
            dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
            const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

            const card = document.createElement('div');
            card.className = 'news-card';

            let cleanContent = item.description || "Nenhum resumo disponível.";

            card.innerHTML = `
                <div class="news-img">
                    <img src="${imageUrl}" alt="${item.title}" onerror="this.src='${basePath}images/capa-noticias.png'">
                    <span class="badge">destaque</span>
                </div>
                <div class="news-content">
                    <p class="news-date"><i class="fa-regular fa-calendar"></i> ${dateStr}</p>
                    <h3 class="news-title">${item.title}</h3>
                    <a href="javascript:void(0)" class="read-more">Ler Mais <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            `;

            // Redireciona para a página da notícia
            card.querySelector('.read-more').addEventListener('click', () => {
                const targetPage = isSubfolder ? 'noticia.html' : 'pages/noticia.html';
                window.location.href = `${targetPage}?id=${item.id}`;
            });

            if (track) {
                track.appendChild(card);
            } else if (allNewsGrid) {
                allNewsGrid.appendChild(card);
            }
        });

        if (track) initCarousel();
    }

    // (Lógica de Modal removida, pois agora usamos uma página dedicada)

    // Função de Carrossel adaptada
    function initCarousel() {
        document.querySelectorAll('[data-carousel]').forEach(carousel => {
            const track = carousel.querySelector('.carousel-track');
            const prevBtn = carousel.querySelector('.prev-btn');
            const nextBtn = carousel.querySelector('.next-btn');

            // Se houver só o carrossel de eventos (que não é preenchido dinamicamente), não quebra
            if (!track.firstElementChild) return;

            let isAnimating = false;

            function moveNext() {
                if (isAnimating) return;
                isAnimating = true;
                track.style.transition = 'transform 0.5s ease-in-out';
                track.style.transform = 'translateX(calc(-33.333% - 10px))';

                setTimeout(() => {
                    track.style.transition = 'none';
                    track.appendChild(track.firstElementChild);
                    track.style.transform = 'translateX(0)';
                    isAnimating = false;
                }, 500);
            }

            function movePrev() {
                if (isAnimating) return;
                isAnimating = true;
                track.style.transition = 'none';
                track.insertBefore(track.lastElementChild, track.firstElementChild);
                track.style.transform = 'translateX(calc(-33.333% - 10px))';

                // Force reflow
                void track.offsetWidth;

                track.style.transition = 'transform 0.5s ease-in-out';
                track.style.transform = 'translateX(0)';

                setTimeout(() => {
                    isAnimating = false;
                }, 500);
            }

            let interval = setInterval(moveNext, 5000);
            let isHovered = false;

            if (nextBtn && prevBtn) {
                nextBtn.addEventListener('click', () => {
                    clearInterval(interval);
                    moveNext();
                    if (!isHovered) interval = setInterval(moveNext, 5000);
                });

                prevBtn.addEventListener('click', () => {
                    clearInterval(interval);
                    movePrev();
                    if (!isHovered) interval = setInterval(moveNext, 5000);
                });
            }

            // Pause on hover
            carousel.addEventListener('mouseenter', () => {
                isHovered = true;
                clearInterval(interval);
            });
            carousel.addEventListener('mouseleave', () => {
                isHovered = false;
                clearInterval(interval);
                interval = setInterval(moveNext, 5000);
            });
        });
    }

    // Iniciar o carrossel de eventos (já que ele é estático) separadamente, ou a função initCarousel já pega ele.
    // O problema é que initCarousel() é chamada *depois* do fetch. 
    // Para garantir que o carrossel de Cursos/Eventos funcione imediatamente:
    initCarouselStatic();

    function initCarouselStatic() {
        const cursosCarousel = document.querySelector('.cursos-eventos [data-carousel]');
        if (cursosCarousel) {
            // Inicializa apenas ele manualmente para não esperar o fetch
            const track = cursosCarousel.querySelector('.carousel-track');
            const prevBtn = cursosCarousel.querySelector('.prev-btn');
            const nextBtn = cursosCarousel.querySelector('.next-btn');
            let isAnimating = false;

            function moveNext() {
                if (isAnimating) return;
                isAnimating = true;
                track.style.transition = 'transform 0.5s ease-in-out';
                track.style.transform = 'translateX(calc(-33.333% - 10px))';

                setTimeout(() => {
                    track.style.transition = 'none';
                    track.appendChild(track.firstElementChild);
                    track.style.transform = 'translateX(0)';
                    isAnimating = false;
                }, 500);
            }

            function movePrev() {
                if (isAnimating) return;
                isAnimating = true;
                track.style.transition = 'none';
                track.insertBefore(track.lastElementChild, track.firstElementChild);
                track.style.transform = 'translateX(calc(-33.333% - 10px))';
                void track.offsetWidth;
                track.style.transition = 'transform 0.5s ease-in-out';
                track.style.transform = 'translateX(0)';
                setTimeout(() => { isAnimating = false; }, 500);
            }

            let interval = setInterval(moveNext, 5000);
            let isHovered = false;

            if (nextBtn && prevBtn) {
                nextBtn.addEventListener('click', () => {
                    clearInterval(interval); 
                    moveNext(); 
                    if (!isHovered) interval = setInterval(moveNext, 5000);
                });
                prevBtn.addEventListener('click', () => {
                    clearInterval(interval); 
                    movePrev(); 
                    if (!isHovered) interval = setInterval(moveNext, 5000);
                });
            }
            cursosCarousel.addEventListener('mouseenter', () => {
                isHovered = true;
                clearInterval(interval);
            });
            cursosCarousel.addEventListener('mouseleave', () => { 
                isHovered = false;
                clearInterval(interval);
                interval = setInterval(moveNext, 5000); 
            });

            // Marca para não inicializar de novo no fetch
            cursosCarousel.removeAttribute('data-carousel');
        }
    }

    // --- Lógica da Página de Artigo Completo (noticia.html) ---
    const articleContainer = document.querySelector('.article-page');
    if (articleContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (articleId) {
            fetch(basePath + 'data/noticias.json?t=' + new Date().getTime())
                .then(response => response.json())
                .then(data => {
                    const item = data.find(n => n.id == articleId);
                    if (item) {
                        document.getElementById('article-loading').style.display = 'none';
                        document.getElementById('article-content').style.display = 'block';
                        
                        document.getElementById('page-article-title').textContent = item.title;
                        
                        const dateObj = new Date(item.date);
                        dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
                        const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                        document.getElementById('page-article-meta').innerHTML = `<i class="fa-regular fa-calendar"></i> ${dateStr}`;
                        
                        const imgWrapper = document.querySelector('.article-image-wrapper');
                        
                        let imageUrl = (item.image && item.image !== "[empty]") ? item.image : basePath + "images/capa-noticias.png";
                        imgWrapper.innerHTML = `<img id="page-article-image" src="${imageUrl}" alt="Capa da notícia" style="width: 100%; height: 350px; object-fit: cover; border-radius: 8px 8px 0 0; display: block; max-width: 800px; margin: 0 auto;">`;
                        const img = document.getElementById('page-article-image');
                        img.onerror = function() {
                            if (!this.src.includes('capa-noticias.png')) {
                                this.src = basePath + 'images/capa-noticias.png';
                            } else {
                                imgWrapper.style.display = 'none';
                            }
                        };
                        
                        document.getElementById('page-article-body').innerHTML = item.description || "Conteúdo não disponível.";
                        
                        const sourceLink = document.getElementById('page-article-link');
                        if (item.link && item.link !== '#') {
                            sourceLink.href = item.link;
                        } else {
                            document.querySelector('.article-footer').style.display = 'none';
                        }
                    } else {
                        document.getElementById('article-loading').style.display = 'none';
                        document.getElementById('article-error').style.display = 'block';
                    }
                })
                .catch(err => {
                    console.error('Erro ao buscar notícia:', err);
                    document.getElementById('article-loading').style.display = 'none';
                    document.getElementById('article-error').style.display = 'block';
                });
        } else {
            document.getElementById('article-loading').style.display = 'none';
            document.getElementById('article-error').style.display = 'block';
        }
    }

    // --- Lógica de Busca Global ---
    
    // Injeta o HTML do modal de busca no body se não existir
    if (!document.getElementById('global-search-modal')) {
        const modalHtml = `
            <div id="global-search-modal" class="search-modal">
                <div class="search-modal-content">
                    <span class="close-search">&times;</span>
                    <h2>O que você procura?</h2>
                    <p style="color: #666; font-size: 0.95rem;">Pesquise por notícias, cursos, páginas e palavras-chave.</p>
                    <form class="global-search-form" id="global-search-form">
                        <input type="text" class="global-search-input" id="global-search-input" placeholder="Digite sua busca..." required>
                        <button type="submit" class="global-search-submit"><i class="fa-solid fa-search"></i></button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    const searchModal = document.getElementById('global-search-modal');
    const closeSearchBtn = document.querySelector('.close-search');
    const searchForm = document.getElementById('global-search-form');
    const searchInput = document.getElementById('global-search-input');

    // Abre o modal ao clicar em botões de busca
    document.querySelectorAll('.search-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            searchModal.classList.add('show');
            setTimeout(() => searchInput.focus(), 100);
        });
    });

    // Fecha o modal
    if(closeSearchBtn) {
        closeSearchBtn.addEventListener('click', () => {
            searchModal.classList.remove('show');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            searchModal.classList.remove('show');
        }
    });

    // Executa a busca (Redireciona para busca.html)
    if(searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                const searchPageUrl = isSubfolder ? 'busca.html' : 'pages/busca.html';
                window.location.href = `${searchPageUrl}?q=${encodeURIComponent(query)}`;
            }
        });
    }

    // Também interceptar a barra de busca local na página "notas.html"
    const localSearchForm = document.querySelector('.search-form');
    if (localSearchForm && !localSearchForm.id) {
        localSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const localInput = localSearchForm.querySelector('.search-input');
            if (localInput && localInput.value.trim()) {
                window.location.href = `busca.html?q=${encodeURIComponent(localInput.value.trim())}`;
            }
        });
    }

    // --- Lógica da Página de Resultados de Busca (busca.html) ---
    const searchResultsContainer = document.getElementById('search-results-container');
    const searchStatus = document.getElementById('search-status');
    
    if (searchResultsContainer && searchStatus) {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        
        if (!query) {
            searchStatus.innerHTML = "Por favor, digite um termo para pesquisar.";
            return;
        }

        searchStatus.innerHTML = `Buscando resultados para: <strong>"${query}"</strong>...`;
        
        // Buscar o índice estático e as notícias
        Promise.all([
            fetch(basePath + 'data/search-index.json?t=' + new Date().getTime()).then(r => r.json()).catch(() => []),
            fetch(basePath + 'data/noticias.json?t=' + new Date().getTime()).then(r => r.json()).catch(() => [])
        ]).then(([staticIndex, noticias]) => {
            // Unificar dados
            const allItems = [...staticIndex];
            
            noticias.forEach(noticia => {
                allItems.push({
                    id: noticia.id,
                    type: 'Notícia',
                    title: noticia.title,
                    url: `noticia.html?id=${noticia.id}`,
                    content: noticia.description || "",
                    keywords: ""
                });
            });
            
            const lowerQuery = query.toLowerCase();
            const results = [];
            
            // Algoritmo de Prioridade (Scoring)
            allItems.forEach(item => {
                let score = 0;
                const lowerTitle = (item.title || "").toLowerCase();
                const lowerContent = (item.content || "").toLowerCase();
                const lowerKeywords = (item.keywords || "").toLowerCase();
                
                // 1. Correspondência exata no título (Maior prioridade: 100)
                if (lowerTitle === lowerQuery) {
                    score += 100;
                } else if (lowerTitle.includes(lowerQuery)) {
                    // 2. Correspondência parcial no título
                    score += 50;
                }
                
                // 3. Correspondência nas palavras-chave (Keywords)
                if (lowerKeywords.includes(lowerQuery)) {
                    score += 40;
                }
                
                // 4. Correspondência no conteúdo
                if (lowerContent.includes(lowerQuery)) {
                    score += 10;
                }
                
                if (score > 0) {
                    results.push({ item, score });
                }
            });
            
            // Ordenar por score (maior para menor)
            results.sort((a, b) => b.score - a.score);
            
            if (results.length === 0) {
                searchStatus.innerHTML = `Não encontramos nenhum resultado para <strong>"${query}"</strong>. Tente usar outras palavras-chave.`;
            } else {
                searchStatus.innerHTML = `Encontramos ${results.length} resultado(s) para <strong>"${query}"</strong>:`;
                
                results.forEach(res => {
                    const { item } = res;
                    // Monta o resumo (até 200 caracteres)
                    let excerpt = item.content.replace(/<[^>]+>/g, ''); // Remove HTML
                    if (excerpt.length > 200) {
                        excerpt = excerpt.substring(0, 200) + "...";
                    }
                    
                    const resultHtml = `
                        <div class="post-item">
                            <span class="badge" style="background-color: var(--color-primary); color: #fff; display: inline-block; margin-bottom: 10px;">${item.type}</span>
                            <h3>${item.title}</h3>
                            <p class="post-excerpt">${excerpt}</p>
                            <a href="${isSubfolder ? '../' : ''}${item.url}" class="post-link">Acessar página <i class="fa-solid fa-arrow-right"></i></a>
                        </div>
                    `;
                    searchResultsContainer.insertAdjacentHTML('beforeend', resultHtml);
                });
            }
        });
    }

});
