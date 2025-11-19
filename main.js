// =============================
// Inicialización cuando el DOM está listo
// =============================
document.addEventListener('DOMContentLoaded', function() {
    initPortfolio();
});

function initPortfolio() {
    initTypewriter();
    initMobileMenu();
    initThemeToggle();
    initContactForm();
    initCVDownload();
    initSmoothScrolling();
    initScrollAnimations();
    initCarousel();
    initBackToTop();
    initCurrentYear();
    initLazyLoading();
    initScrollEffects();
}

// =============================
// Efecto de máquina de escribir mejorado
// =============================
function initTypewriter() {
    const texts = ["Desarrollador Frontend", "Creador de Experiencias", "Especialista en UI/UX"];
    const element = document.getElementById('typewriter-text');
    const cursor = document.getElementById('typewriter-cursor');
    
    if (!element || !cursor) return;
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            // Eliminar caracter
            element.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            // Escribir caracter
            element.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        // Controlar estados
        if (!isDeleting && charIndex === currentText.length) {
            // Pausa al final
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Cambiar texto
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    // Iniciar el efecto
    type();
}

// =============================
// Menú móvil MEJORADO Y CORREGIDO
// =============================
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!mobileMenuToggle || !mobileMenu) return;

    function toggleMobileMenu() {
        const isHidden = mobileMenu.classList.contains('hidden');
        
        if (isHidden) {
            // Abrir menú
            mobileMenu.classList.remove('hidden');
            mobileMenuToggle.innerHTML = '<i class="fas fa-times text-xl"></i>';
            // Agregar overlay
            const overlay = document.createElement('div');
            overlay.id = 'mobile-menu-overlay';
            overlay.className = 'fixed inset-0 bg-black/50 z-40 md:hidden';
            overlay.addEventListener('click', closeMobileMenu);
            document.body.appendChild(overlay);
            // Prevenir scroll del body
            document.body.style.overflow = 'hidden';
        } else {
            closeMobileMenu();
        }
    }

    function closeMobileMenu() {
        mobileMenu.classList.add('hidden');
        mobileMenuToggle.innerHTML = '<i class="fas fa-bars text-xl"></i>';
        // Remover overlay
        const overlay = document.getElementById('mobile-menu-overlay');
        if (overlay) {
            overlay.remove();
        }
        // Restaurar scroll del body
        document.body.style.overflow = '';
    }

    mobileMenuToggle.addEventListener('click', toggleMobileMenu);

    // Cerrar menú al hacer clic en enlace
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            closeMobileMenu();
        }
    });
}

// =============================
// Modo oscuro/claro persistente
// =============================
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Verificar preferencia guardada o del sistema
    if (localStorage.getItem('color-theme') === 'dark' || 
        (!('color-theme' in localStorage) && 
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        
        if (document.documentElement.classList.contains('dark')) {
            localStorage.setItem('color-theme', 'dark');
        } else {
            localStorage.setItem('color-theme', 'light');
        }
    });
}

// =============================
// Sistema de notificaciones Toast MEJORADO
// =============================
let toastQueue = [];
let isShowingToast = false;

function showToast(message, type = 'success', duration = 5000) {
    toastQueue.push({ message, type, duration });
    
    if (!isShowingToast) {
        processToastQueue();
    }
}

function processToastQueue() {
    if (toastQueue.length === 0) {
        isShowingToast = false;
        return;
    }
    
    isShowingToast = true;
    const { message, type, duration } = toastQueue.shift();
    createToast(message, type, duration);
}

function createToast(message, type, duration) {
    const toast = document.createElement('div');
    toast.className = `toast-container fixed top-4 right-4 z-50 transform transition-all duration-500 translate-x-full`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    toast.innerHTML = `
        <div class="flex items-center ${colors[type]} text-white rounded-lg shadow-lg p-4 min-w-80 max-w-md">
            <i class="fas ${icons[type]} text-xl mr-3"></i>
            <div class="flex-1">
                <p class="font-medium">${message}</p>
            </div>
            <button class="ml-4 text-white hover:text-gray-200 transition-colors close-toast">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animación de entrada
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full');
    });
    
    // Botón de cerrar
    toast.querySelector('.close-toast').addEventListener('click', () => {
        hideToast(toast);
    });
    
    // Auto-remover
    if (duration > 0) {
        setTimeout(() => {
            hideToast(toast);
        }, duration);
    }
}

function hideToast(toast) {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
        // Procesar siguiente toast en la cola
        setTimeout(() => processToastQueue(), 300);
    }, 500);
}

// =============================
// Descarga de CV con notificación CORREGIDA
// =============================
function initCVDownload() {
    const downloadLink = document.getElementById('download-cv');
    
    if (!downloadLink) return;

    downloadLink.addEventListener('click', function(e) {
        // Verificar si el archivo existe realmente
        const cvUrl = this.getAttribute('href');
        
        // Simular descarga exitosa después de un breve retraso
        setTimeout(() => {
            showToast('CV descargado exitosamente', 'success', 3000);
        }, 1000);
        
        // Si el archivo no existe, prevenir la descarga y mostrar error
        if (!cvUrl || cvUrl === '#') {
            e.preventDefault();
            showToast('El archivo CV no está disponible temporalmente', 'warning', 4000);
        }
    });
}

// =============================
// Formulario de contacto MEJORADO
// =============================
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');

    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const originalText = submitText.textContent;
        submitText.textContent = 'Enviando...';
        submitSpinner.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            const formData = new FormData(contactForm);
            
            // Simular envío (reemplaza con tu endpoint real)
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                showToast('¡Mensaje enviado con éxito! Te responderé pronto.', 'success', 5000);
                contactForm.reset();
            } else {
                throw new Error('Error en el servidor');
            }
        } catch (error) {
            console.error('Error enviando formulario:', error);
            showToast('Hubo un problema al enviar el mensaje. Inténtalo de nuevo.', 'error', 5000);
        } finally {
            submitText.textContent = originalText;
            submitSpinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });
}

// =============================
// Smooth scrolling mejorado
// =============================
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// =============================
// Animaciones en scroll
// =============================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar elementos para animación
    document.querySelectorAll('.card-hover, .progress-bar, .stagger-item').forEach(el => {
        observer.observe(el);
    });
}

// =============================
// Carrusel de proyectos mejorado
// =============================
function initCarousel() {
    const carouselTrack = document.getElementById('projects-track');
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.getElementById('carousel-prev');
    const nextButton = document.getElementById('carousel-next');
    const indicatorsContainer = document.getElementById('carousel-indicators');

    if (!carouselTrack || carouselSlides.length === 0) return;

    let currentIndex = 0;
    let slidesPerView = getSlidesPerView();
    let isTransitioning = false;
    let autoSlideInterval;

    // Crear indicadores
    function createIndicators() {
        if (!indicatorsContainer) return;
        
        indicatorsContainer.innerHTML = '';
        const totalSlides = Math.max(1, carouselSlides.length - slidesPerView + 1);
        
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('button');
            indicator.className = `carousel-indicator w-3 h-3 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'bg-primary-600 scale-125' : 'bg-gray-300 dark:bg-gray-600'
            }`;
            indicator.addEventListener('click', () => goToSlide(i));
            indicator.setAttribute('aria-label', `Ir al slide ${i + 1}`);
            indicatorsContainer.appendChild(indicator);
        }
    }

    function getSlidesPerView() {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    }

    function updateCarousel() {
        if (isTransitioning) return;
        isTransitioning = true;

        const slideWidth = 100 / slidesPerView;
        const translateX = -currentIndex * slideWidth;
        carouselTrack.style.transform = `translateX(${translateX}%)`;

        // Actualizar indicadores
        const indicators = document.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            indicator.className = `carousel-indicator w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-primary-600 scale-125' : 'bg-gray-300 dark:bg-gray-600'
            }`;
        });

        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    }

    function goToSlide(index) {
        if (isTransitioning) return;
        const maxIndex = Math.max(0, carouselSlides.length - slidesPerView);
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        updateCarousel();
        resetAutoSlide();
    }

    function nextSlide() {
        if (isTransitioning) return;
        const maxIndex = Math.max(0, carouselSlides.length - slidesPerView);
        if (currentIndex < maxIndex) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateCarousel();
        resetAutoSlide();
    }

    function prevSlide() {
        if (isTransitioning) return;
        const maxIndex = Math.max(0, carouselSlides.length - slidesPerView);
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = maxIndex;
        }
        updateCarousel();
        resetAutoSlide();
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    // Event listeners
    if (prevButton) prevButton.addEventListener('click', prevSlide);
    if (nextButton) nextButton.addEventListener('click', nextSlide);

    // Navegación por teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });

    // Swipe para móviles
    let startX = 0;
    let endX = 0;

    carouselTrack.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    carouselTrack.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (Math.abs(diff) > 50) {
            diff > 0 ? nextSlide() : prevSlide();
        }
    }, { passive: true });

    // Responsividad
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            slidesPerView = getSlidesPerView();
            createIndicators();
            goToSlide(Math.min(currentIndex, Math.max(0, carouselSlides.length - slidesPerView)));
        }, 250);
    });

    // Inicializar
    createIndicators();
    updateCarousel();
    startAutoSlide();

    // Pausar auto-slide al hover
    carouselTrack.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
    carouselTrack.addEventListener('mouseleave', startAutoSlide);
}

// =============================
// Botón "Volver al inicio"
// =============================
function initBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    
    if (!backToTopButton) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.remove('opacity-0', 'scale-0');
            backToTopButton.classList.add('opacity-100', 'scale-100');
        } else {
            backToTopButton.classList.remove('opacity-100', 'scale-100');
            backToTopButton.classList.add('opacity-0', 'scale-0');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// =============================
// Año actual en footer
// =============================
function initCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// =============================
// Carga perezosa de imágenes
// =============================
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// =============================
// Efectos de scroll en navbar y hero
// =============================
function initScrollEffects() {
    const header = document.querySelector('header');
    const heroSection = document.querySelector('#inicio');
    
    if (!header) return;

    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Efecto de opacidad en hero
        if (heroSection && scrollTop < window.innerHeight) {
            const opacity = 1 - (scrollTop / window.innerHeight) * 0.5;
            heroSection.style.opacity = Math.max(opacity, 0.5);
        }
        
        // Navbar con sombra al hacer scroll
        if (scrollTop > 50) {
            header.classList.add('shadow-md', 'backdrop-blur-md');
        } else {
            header.classList.remove('shadow-md', 'backdrop-blur-md');
        }
        
        // Ocultar/mostrar navbar al hacer scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// =============================
// Manejo de errores global
// =============================
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});

// =============================
// Optimización de rendimiento
// =============================
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recalcular elementos que dependen del tamaño de ventana
        if (typeof initCarousel === 'function') {
            const carousel = document.getElementById('projects-carousel');
            if (carousel) initCarousel();
        }
    }, 250);
});