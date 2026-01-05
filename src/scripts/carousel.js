class SimpleCarousel {
    constructor() {
        // Evitar inicialización duplicada
        if (window.__CAROUSEL_INITIALIZED__) {
            return window.carousel;
        }
        
        this.track = document.getElementById('projects-track');
        this.prevBtn = document.getElementById('carousel-prev');
        this.nextBtn = document.getElementById('carousel-next');
        this.indicatorsContainer = document.getElementById('carousel-indicators');
        
        if (!this.track) {
            console.warn('Carrusel no encontrado');
            return;
        }
        
        this.slides = this.track.querySelectorAll('.carousel-slide');
        this.currentIndex = 0;
        this.slideWidth = 0;
        this.totalSlides = this.slides.length;
        this.isAnimating = false;
        
        this.init();
        
        // Marcar como inicializado
        window.__CAROUSEL_INITIALIZED__ = true;
        window.carousel = this;
    }
    
    init() {
        if (this.totalSlides === 0) return;
        
        // Medir ancho del slide
        this.measureSlides();
        
        // Crear indicadores
        this.createIndicators();
        
        // Configurar navegación
        this.setupNavigation();
        
        // Configurar eventos táctiles
        this.setupTouch();
        
        // Configurar teclado
        this.setupKeyboard();
        
        // Ir al primer slide
        this.goToSlide(0);
        
        // Auto-play opcional
        this.startAutoplay();
        
    }
    
    measureSlides() {
        if (this.slides.length > 0 && this.slides[0].offsetWidth > 0) {
            this.slideWidth = this.slides[0].offsetWidth;
        } else {
            // Fallback
            this.slideWidth = 400; // Ancho aproximado
        }
    }
    
    createIndicators() {
        if (!this.indicatorsContainer) return;
        
        this.indicatorsContainer.innerHTML = '';
        
        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('button');
            indicator.className = `w-3 h-3 rounded-full mx-1 transition-colors duration-300 ${i === 0 ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`;
            indicator.setAttribute('aria-label', `Ver proyecto ${i + 1}`);
            indicator.setAttribute('data-index', i);
            indicator.setAttribute('role', 'tab');
            indicator.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToSlide(i);
            });
            
            // Navegación por teclado en indicadores
            indicator.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.goToSlide(i);
                }
            });
            
            this.indicatorsContainer.appendChild(indicator);
        }
    }
    
    setupNavigation() {
        // Botón anterior
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.prevSlide();
            });
            
            this.prevBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.prevSlide();
                }
            });
        }
        
        // Botón siguiente
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextSlide();
            });
            
            this.nextBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.nextSlide();
                }
            });
        }
        
        // Recalcular en resize
        window.addEventListener('resize', () => {
            this.measureSlides();
            this.goToSlide(this.currentIndex);
        });
    }
    
    setupTouch() {
        let startX = 0;
        let endX = 0;
        let isSwiping = false;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isSwiping = true;
        }, { passive: true });
        
        this.track.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            endX = e.touches[0].clientX;
        }, { passive: true });
        
        this.track.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            
            const diff = startX - endX;
            const minSwipeDistance = 50;
            
            if (Math.abs(diff) > minSwipeDistance) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            isSwiping = false;
        }, { passive: true });
    }
    
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Solo si estamos en la sección de proyectos
            const proyectosSection = document.getElementById('proyectos');
            const isInProyectos = proyectosSection && 
                (proyectosSection.contains(document.activeElement) || 
                 document.activeElement.closest('#proyectos'));
            
            if (isInProyectos) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prevSlide();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextSlide();
                } else if (e.key >= '1' && e.key <= '9') {
                    const index = parseInt(e.key) - 1;
                    if (index < this.totalSlides) {
                        e.preventDefault();
                        this.goToSlide(index);
                    }
                }
            }
        });
    }
    
    goToSlide(index) {
        if (this.isAnimating) return;
        
        // Validar índice
        if (index < 0) index = this.totalSlides - 1;
        if (index >= this.totalSlides) index = 0;
        
        this.currentIndex = index;
        this.isAnimating = true;
        
        const offset = -index * this.slideWidth;
        
        // Aplicar transformación con transición
        this.track.style.transition = 'transform 0.5s ease-out';
        this.track.style.transform = `translateX(${offset}px)`;
        
        // Actualizar indicadores
        this.updateIndicators();
        
        // Actualizar accesibilidad
        this.updateAccessibility();
        
        // Resetear animación
        setTimeout(() => {
            this.isAnimating = false;
            this.track.style.transition = '';
        }, 500);
        
        // Anunciar para lectores de pantalla (con verificación segura)
        if (typeof window.announceToScreenReader === 'function') {
            window.announceToScreenReader(`Proyecto ${index + 1} de ${this.totalSlides}`);
        }
    }
    
    updateIndicators() {
        const indicators = this.indicatorsContainer?.querySelectorAll('button');
        if (indicators) {
            indicators.forEach((indicator, i) => {
                const isActive = i === this.currentIndex;
                indicator.classList.toggle('bg-primary-600', isActive);
                indicator.classList.toggle('bg-gray-300', !isActive);
                indicator.classList.toggle('dark:bg-gray-600', !isActive);
                indicator.setAttribute('aria-selected', isActive.toString());
            });
        }
    }
    
    updateAccessibility() {
        this.slides.forEach((slide, i) => {
            const isActive = i === this.currentIndex;
            slide.setAttribute('aria-hidden', (!isActive).toString());
            
            // Controlar tabindex para elementos dentro del slide
            const focusableElements = slide.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
            focusableElements.forEach(el => {
                if (!isActive) {
                    el.setAttribute('data-original-tabindex', el.tabIndex);
                    el.tabIndex = -1;
                } else {
                    const originalTabIndex = el.getAttribute('data-original-tabindex');
                    if (originalTabIndex !== null) {
                        el.tabIndex = parseInt(originalTabIndex);
                        el.removeAttribute('data-original-tabindex');
                    }
                }
            });
        });
    }
    
    nextSlide() {
        this.goToSlide(this.currentIndex + 1);
    }
    
    prevSlide() {
        this.goToSlide(this.currentIndex - 1);
    }
    
    startAutoplay() {
        // Auto-play cada 8 segundos
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, 8000);
        
        // Pausar autoplay en hover/focus
        const proyectosSection = document.getElementById('proyectos');
        if (proyectosSection) {
            proyectosSection.addEventListener('mouseenter', () => {
                clearInterval(this.autoplayInterval);
            });
            
            proyectosSection.addEventListener('mouseleave', () => {
                this.startAutoplay();
            });
            
            proyectosSection.addEventListener('focusin', () => {
                clearInterval(this.autoplayInterval);
            });
            
            proyectosSection.addEventListener('focusout', () => {
                this.startAutoplay();
            });
        }
    }
    
    destroy() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
        window.__CAROUSEL_INITIALIZED__ = false;
    }
}

// Inicializar automáticamente CON RETRASO para asegurar que main.js se cargue primero
setTimeout(() => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.__CAROUSEL_INITIALIZED__) {
                window.carousel = new SimpleCarousel();
            }
        });
    } else {
        if (!window.__CAROUSEL_INITIALIZED__) {
            window.carousel = new SimpleCarousel();
        }
    }
}, 100);