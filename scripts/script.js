document.addEventListener('DOMContentLoaded', () => {

    // 1. Fetch News from local JSON file
    fetch('data/noticias.json')
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
            let imageUrl = item.image || 'images/capa-noticias.png';

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
                    <img src="${imageUrl}" alt="${item.title}" onerror="this.src='images/capa-noticias.png'">
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
                window.location.href = `noticia.html?id=${item.id}`;
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

            if (nextBtn && prevBtn) {
                nextBtn.addEventListener('click', () => {
                    clearInterval(interval);
                    moveNext();
                    interval = setInterval(moveNext, 5000);
                });

                prevBtn.addEventListener('click', () => {
                    clearInterval(interval);
                    movePrev();
                    interval = setInterval(moveNext, 5000);
                });
            }

            // Pause on hover
            carousel.addEventListener('mouseenter', () => clearInterval(interval));
            carousel.addEventListener('mouseleave', () => {
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

            if (nextBtn && prevBtn) {
                nextBtn.addEventListener('click', () => {
                    clearInterval(interval); moveNext(); interval = setInterval(moveNext, 5000);
                });
                prevBtn.addEventListener('click', () => {
                    clearInterval(interval); movePrev(); interval = setInterval(moveNext, 5000);
                });
            }
            cursosCarousel.addEventListener('mouseenter', () => clearInterval(interval));
            cursosCarousel.addEventListener('mouseleave', () => { interval = setInterval(moveNext, 5000); });

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
            fetch('data/noticias.json')
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
                        
                        if (item.image) {
                            imgWrapper.innerHTML = `<img id="page-article-image" src="${item.image}" alt="Capa da notícia" style="width: 100%; height: auto; border-radius: 8px 8px 0 0; display: block; max-width: 800px; margin: 0 auto;">`;
                            const img = document.getElementById('page-article-image');
                            img.onerror = () => { imgWrapper.style.display = 'none'; };
                        } else {
                            imgWrapper.innerHTML = `<img id="page-article-image" src="images/header-noticias.png" alt="Capa da notícia" style="width: 100%; height: auto; border-radius: 8px 8px 0 0; display: block; max-width: 800px; margin: 0 auto;">`;
                            const img = document.getElementById('page-article-image');
                            img.onerror = () => { imgWrapper.style.display = 'none'; };
                        }
                        
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
});
