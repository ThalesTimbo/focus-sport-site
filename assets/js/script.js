// Variáveis globais
let eventosFiltrados = [...eventos];
let eventosExibidos = 3;
let categoriaAtual = 'todos';
let termoBusca = '';
let dataInicial = '';
let dataFinal = '';

// Elementos DOM
const cardsGrid = document.getElementById('cards-grid');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const dateStart = document.getElementById('date-start');
const dateEnd = document.getElementById('date-end');
const clearDatesBtn = document.getElementById('clear-dates');
const loadMoreBtn = document.getElementById('load-more-btn');
const hamburgerToggle = document.getElementById('hamburger-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const desktopNavButtons = document.querySelectorAll('.nav-desktop .btn');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Detectar conexão lenta
    detectSlowConnection();
    
    // Aplicar otimizações para conexões lentas
    applySlowConnectionOptimizations();
    
    // Pré-carregar imagens críticas
    preloadCriticalImages();
    
    // Renderizar cards com lazy loading
    renderizarCards();
    setupEventListeners();
    setupSmoothScroll();
    
    // Inicializar lazy loading avançado
    initAdvancedLazyLoading();
});

// Configurar event listeners
function setupEventListeners() {
    // Busca
    searchInput.addEventListener('input', function(e) {
        termoBusca = e.target.value.toLowerCase();
        filtrarEventos();
    });

    // Filtros por categoria
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Adicionar classe active ao botão clicado
            this.classList.add('active');
            
            categoriaAtual = this.dataset.category;
            filtrarEventos();
        });
    });

    // Filtro por data
    dateStart.addEventListener('change', function(e) {
        dataInicial = e.target.value;
        filtrarEventos();
    });

    dateEnd.addEventListener('change', function(e) {
        dataFinal = e.target.value;
        filtrarEventos();
    });

    // Limpar filtros de data
    clearDatesBtn.addEventListener('click', function() {
        dateStart.value = '';
        dateEnd.value = '';
        dataInicial = '';
        dataFinal = '';
        filtrarEventos();
    });

    // Botão Ver Mais/Recolher
    loadMoreBtn.addEventListener('click', function() {
        if (eventosExibidos < eventosFiltrados.length) {
            // Expandir - mostrar todos os cards
            eventosExibidos = eventosFiltrados.length;
            this.textContent = 'Recolher';
        } else {
            // Recolher - mostrar apenas os primeiros 3
            eventosExibidos = 3;
            this.textContent = 'Ver Mais';
        }
        renderizarCards();
    });

    // Menu hamburguer mobile
    hamburgerToggle.addEventListener('change', function() {
        if (this.checked) {
            mobileMenu.classList.add('active');
        } else {
            mobileMenu.classList.remove('active');
        }
    });

    // Fechar menu mobile ao clicar em um link
    const mobileLinks = document.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburgerToggle.checked = false;
            mobileMenu.classList.remove('active');
        });
    });

    // Navegação desktop
    desktopNavButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.dataset.section;
            const targetElement = document.getElementById(section);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Filtrar eventos
function filtrarEventos() {
    eventosFiltrados = eventos.filter(evento => {
        const matchCategoria = categoriaAtual === 'todos' || evento.categoria === categoriaAtual;
        const matchBusca = evento.titulo.toLowerCase().includes(termoBusca) ||
                          evento.local.toLowerCase().includes(termoBusca) ||
                          evento.categoria.toLowerCase().includes(termoBusca);
        
        // Filtro por data
        let matchData = true;
        if (dataInicial || dataFinal) {
            const eventoData = new Date(evento.data);
            const dataIni = dataInicial ? new Date(dataInicial) : null;
            const dataFim = dataFinal ? new Date(dataFinal) : null;
            
            if (dataIni && dataFim) {
                matchData = eventoData >= dataIni && eventoData <= dataFim;
            } else if (dataIni) {
                matchData = eventoData >= dataIni;
            } else if (dataFim) {
                matchData = eventoData <= dataFim;
            }
        }
        
        return matchCategoria && matchBusca && matchData;
    });

    // Ordenar eventos por data (mais recentes primeiro)
    eventosFiltrados.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Resetar contador de eventos exibidos
    eventosExibidos = 3;
    
    // Renderizar cards
    renderizarCards();
}



// Renderizar cards
function renderizarCards() {
    const eventosParaExibir = eventosFiltrados.slice(0, eventosExibidos);
    
    if (eventosParaExibir.length === 0) {
        cardsGrid.innerHTML = `
            <div class="no-results">
                <h3>Nenhum evento encontrado</h3>
                <p>Tente ajustar os filtros ou termos de busca.</p>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
        return;
    }

    cardsGrid.innerHTML = eventosParaExibir.map(evento => criarCardHTML(evento)).join('');
    
    // Inicializar lazy loading avançado para todos os cards
    setTimeout(() => {
        initAdvancedLazyLoading();
    }, 100);
    
    // Atualizar botão "Ver Mais/Recolher"
    if (eventosFiltrados.length > 3) {
        loadMoreBtn.style.display = 'block';
        loadMoreBtn.textContent = eventosExibidos >= eventosFiltrados.length ? 'Recolher' : 'Ver Mais';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Inicializar lazy loading avançado
function initAdvancedLazyLoading() {
    const cards = document.querySelectorAll('.card-loading');
    let loadedCount = 0;
    const totalCards = cards.length;
    
    // Atualizar barra de progresso
    const updateProgress = () => {
        const progress = (loadedCount / totalCards) * 100;
        const progressBar = document.querySelector('.loading-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Ocultar barra quando completar
        if (loadedCount === totalCards) {
            setTimeout(() => {
                if (progressBar) {
                    progressBar.style.opacity = '0';
                    setTimeout(() => progressBar.remove(), 300);
                }
            }, 500);
        }
    };
    
    cards.forEach((card, index) => {
        const img = card.querySelector('.lazy-image');
        const imageSkeleton = card.querySelector('.image-skeleton');
        const contentSkeleton = card.querySelector('.content-skeleton');
        const contentReal = card.querySelector('.card-content-real');
        
        // Adicionar delay escalonado para animação
        setTimeout(() => {
            card.classList.add('card-loading-animation');
        }, index * 100);
        
        // Intersection Observer para lazy loading
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Adicionar classe de carregamento
                    card.classList.add('image-loading');
                    
                    // Carregar imagem com timeout
                    const loadImage = () => {
                        return new Promise((resolve, reject) => {
                            const timeout = setTimeout(() => {
                                reject(new Error('Timeout'));
                            }, 10000); // 10 segundos timeout
                            
                            img.src = img.dataset.src;
                            
                            img.onload = () => {
                                clearTimeout(timeout);
                                resolve();
                            };
                            
                            img.onerror = () => {
                                clearTimeout(timeout);
                                reject(new Error('Failed to load'));
                            };
                        });
                    };
                    
                    loadImage()
                        .then(() => {
                            // Imagem carregada com sucesso
                            img.classList.add('image-fade-in');
                            img.style.opacity = '1';
                            card.classList.remove('image-loading');
                            
                            // Animar skeleton de saída
                            imageSkeleton.style.opacity = '0';
                            
                            setTimeout(() => {
                                imageSkeleton.style.display = 'none';
                                contentSkeleton.style.opacity = '0';
                                contentReal.style.display = 'block';
                                
                                setTimeout(() => {
                                    contentSkeleton.style.display = 'none';
                                    contentReal.style.opacity = '1';
                                    card.classList.remove('card-loading', 'card-loading-animation');
                                    card.classList.add('card-loaded');
                                    
                                    // Incrementar contador e atualizar progresso
                                    loadedCount++;
                                    updateProgress();
                                }, 300);
                            }, 200);
                        })
                        .catch((error) => {
                            // Fallback em caso de erro
                            console.warn('Erro ao carregar imagem:', error);
                            img.src = 'https://via.placeholder.com/600x400/333/666?text=Imagem+Indisponível';
                            img.style.opacity = '1';
                            card.classList.remove('image-loading');
                            
                            imageSkeleton.style.display = 'none';
                            contentSkeleton.style.display = 'none';
                            contentReal.style.display = 'block';
                            contentReal.style.opacity = '1';
                            card.classList.remove('card-loading', 'card-loading-animation');
                            
                            // Incrementar contador mesmo com erro
                            loadedCount++;
                            updateProgress();
                        });
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.1
        });
        
        imageObserver.observe(img);
    });
    
    // Inicializar progresso
    updateProgress();
}



// Otimizar URL da imagem baseado no dispositivo
function getOptimizedImageUrl(originalUrl) {
    // Para imagens locais, retorna o caminho original
    // O sistema de lazy loading e otimizações CSS cuidam do resto
    return originalUrl;
}

// Pré-carregar imagens críticas
function preloadCriticalImages() {
    const criticalImages = [
        'assets/images/portfolio/futsal/the-futsal-sub15-2025.jpg',
        'assets/images/portfolio/futsal/the-futsal-sub17-2025.jpg',
        'assets/images/portfolio/volei/campeonato-4x4-misto.jpg'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// Detectar conexão lenta e ajustar qualidade
function detectSlowConnection() {
    if ('connection' in navigator) {
        const connection = navigator.connection;
        
        // Se é conexão lenta (2G, 3G lento, ou save-data ativo)
        if (connection.effectiveType === 'slow-2g' || 
            connection.effectiveType === '2g' || 
            connection.effectiveType === '3g' ||
            connection.saveData) {
            
            // Reduzir qualidade das imagens para conexões lentas
            window.isSlowConnection = true;
            console.log('Conexão lenta detectada - otimizando imagens');
        }
    }
}

// Aplicar otimizações para conexões lentas
function applySlowConnectionOptimizations() {
    if (window.isSlowConnection) {
        // Reduzir o número de cards exibidos inicialmente
        eventosExibidos = 2;
        
        // Adicionar classe para estilos específicos de conexão lenta
        document.body.classList.add('slow-connection');
    }
}





// Criar HTML do card
function criarCardHTML(evento) {
    const dataFormatada = formatarData(evento.data);
    const categoriaFormatada = formatarCategoria(evento.categoria);
    const optimizedImageUrl = getOptimizedImageUrl(evento.capa);
    
    return `
        <div class="card card-loading" data-categoria="${evento.categoria}">
            <div class="card-image">
                <div class="image-skeleton skeleton-pulse"></div>
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" 
                     data-src="${optimizedImageUrl}" 
                     alt="${evento.titulo}" 
                     class="lazy-image"
                     loading="lazy"
                     decoding="async">
            </div>
            <div class="card-content">
                <div class="content-skeleton">
                    <div class="skeleton-line skeleton-title skeleton-pulse"></div>
                    <div class="skeleton-line skeleton-date skeleton-pulse"></div>
                    <div class="skeleton-line skeleton-location skeleton-pulse"></div>
                    <div class="skeleton-line skeleton-category skeleton-pulse"></div>
                    <div class="skeleton-button skeleton-pulse"></div>
                </div>
                <div class="card-content-real" style="display: none;">
                    <h3 class="card-title">${evento.titulo}</h3>
                    <div class="card-info">
                        <span class="card-date">${dataFormatada}</span>
                        <span class="card-location">${evento.local}</span>
                    </div>
                    <div class="card-footer">
                        <span class="card-category">${categoriaFormatada}</span>
                        <a href="${evento.link}" class="card-link" target="_blank" rel="noopener noreferrer">
                            Ver Álbum
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Formatar data
function formatarData(dataString) {
    // Criar a data considerando o fuso horário local
    const [ano, mes, dia] = dataString.split('-');
    const data = new Date(ano, mes - 1, dia); // mes - 1 porque JavaScript conta meses de 0-11
    return data.toLocaleDateString('pt-BR');
}

// Formatar categoria
function formatarCategoria(categoria) {
    const categorias = {
        'futsal': 'Futsal',
        'volei': 'Vôlei',
        'corrida': 'Corrida',
        'ciclismo': 'Ciclismo',
        'futebol': 'Futebol',
        'outros': 'Outros'
    };
    return categorias[categoria] || categoria;
}

// Configurar scroll suave
function setupSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Animação de entrada dos cards
function animateCards() {
    const cards = document.querySelectorAll('.card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Debounce para busca
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Aplicar debounce na busca
searchInput.addEventListener('input', debounce(function(e) {
    termoBusca = e.target.value.toLowerCase();
    filtrarEventos();
}, 300));

// Efeito parallax no hero
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Animação de contador para estatísticas (opcional)
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Lazy loading para imagens
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Inicializar lazy loading
document.addEventListener('DOMContentLoaded', setupLazyLoading);

// Adicionar estilos CSS dinâmicos para animações
const style = document.createElement('style');
style.textContent = `
    .no-results {
        text-align: center;
        padding: 3rem;
        grid-column: 1 / -1;
    }
    
    .no-results h3 {
        color: var(--color-red);
        margin-bottom: 1rem;
    }
    
    .no-results p {
        color: var(--color-white);
        opacity: 0.7;
    }
    
    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
    }
    
    @media (max-width: 768px) {
        .card-footer {
            flex-direction: column;
            gap: 0.5rem;
            align-items: stretch;
        }
    }
`;
document.head.appendChild(style);

// Funções de debug para desenvolvimento
window.focusSportDebug = {
    // Ativar modo debug
    enableDebugMode: function() {
        document.body.classList.add('debug-mode');
        console.log('🔍 Modo debug ativado');
        console.log('📊 Informações de performance:', {
            connectionType: navigator.connection ? navigator.connection.effectiveType : 'N/A',
            isSlowConnection: window.isSlowConnection || false,
            totalImages: eventos.length,
            loadedImages: 0
        });
    },
    
    // Desativar modo debug
    disableDebugMode: function() {
        document.body.classList.remove('debug-mode');
        console.log('🔍 Modo debug desativado');
    },
    
    // Mostrar estatísticas de carregamento
    showStats: function() {
        const loadedCards = document.querySelectorAll('.card-loaded').length;
        const loadingCards = document.querySelectorAll('.card-loading').length;
        const totalCards = document.querySelectorAll('.card').length;
        
        console.log('📊 Estatísticas de carregamento:', {
            total: totalCards,
            loaded: loadedCards,
            loading: loadingCards,
            progress: `${((loadedCards / totalCards) * 100).toFixed(1)}%`
        });
    },
    
    // Forçar recarregamento de todas as imagens
    reloadAllImages: function() {
        const lazyImages = document.querySelectorAll('.lazy-image');
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
        console.log('🔄 Recarregamento de imagens forçado');
    },
    
    // Simular conexão lenta
    simulateSlowConnection: function() {
        window.isSlowConnection = true;
        document.body.classList.add('slow-connection');
        console.log('🐌 Simulação de conexão lenta ativada');
    },
    
    // Remover simulação de conexão lenta
    removeSlowConnection: function() {
        window.isSlowConnection = false;
        document.body.classList.remove('slow-connection');
        console.log('🚀 Simulação de conexão lenta removida');
    }
};

// Log de inicialização
console.log('🎯 Focus Sport Portfolio carregado com lazy loading avançado');
console.log('🔧 Comandos de debug disponíveis: focusSportDebug.enableDebugMode()'); 