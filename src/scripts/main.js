// main.js - Optimizado para rendimiento y accesibilidad
'use strict';

// VARIABLES GLOBALES CACHEADAS
let cachedElements = {};
let activeToasts = new Set();

document.addEventListener('DOMContentLoaded', function() {
    // MEDICIÓN DE PERFORMANCE
    const perfStart = performance.now();
    console.log('🚀 Portafolio inicializado - Performance tracking activado');
    
    // 1. AÑO ACTUAL (operación rápida)
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    // 2. CACHEAR SELECTORES CRÍTICOS UNA SOLA VEZ
    cachedElements = {
        html: document.documentElement,
        header: document.querySelector('header'),
        themeToggle: document.querySelectorAll('[id*="theme-toggle"]'),
        mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
        mobileMenu: document.getElementById('mobile-menu'),
        downloadBtn: document.getElementById('download-cv'),
        downloadText: document.getElementById('download-cv-text'),
        typewriterText: document.getElementById('typewriter-text'),
        typewriterCursor: document.getElementById('typewriter-cursor'),
        progressBars: document.querySelectorAll('.progress-bar')
    };
    
    // 3. INICIALIZACIONES EN ORDEN DE PRIORIDAD (críticas para UX)
    initThemeToggle();
    initMobileMenu();
    initSmoothScroll();
    
    // Typewriter inicia después de un breve retraso (no crítico)
    setTimeout(initTypewriter, 300);
    
    // 4. INICIALIZACIONES DIFERIDAS (no críticas para LCP)
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            initProgressBars();
            initCVDownload();
        }, { timeout: 1000 });
    } else {
        // Fallback para navegadores sin requestIdleCallback
        setTimeout(() => {
            initProgressBars();
            initCVDownload();
        }, 500);
    }
    
    // 5. LOG DE PERFORMANCE
    const perfEnd = performance.now();
    console.log(`⏱️ Tiempo de inicialización: ${(perfEnd - perfStart).toFixed(2)}ms`);
    
    // 6. LIMPIAR CACHE EN RESIZE (pero con debounce)
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Invalidar cache de altura del header
            if (cachedElements.headerHeight) {
                cachedElements.headerHeight = null;
            }
        }, 250);
    });
});

// ===== FUNCIONES OPTIMIZADAS =====

function initThemeToggle() {
    // Configurar tema inicial
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    if (isDark) {
        cachedElements.html.classList.add('dark');
    }
    
    // ACTUALIZAR ÍCONOS INICIALES SIN REFLOW
    requestAnimationFrame(() => {
        updateThemeIcons(isDark);
    });
    
    // Evento para todos los botones de tema
    cachedElements.themeToggle.forEach(button => {
        button.addEventListener('click', function() {
            // Usar classList.toggle es eficiente
            const isDarkNow = cachedElements.html.classList.toggle('dark');
            localStorage.setItem('theme', isDarkNow ? 'dark' : 'light');
            
            // Actualizar íconos en el próximo frame
            requestAnimationFrame(() => {
                updateThemeIcons(isDarkNow);
            });
            
            // Anunciar cambio para accesibilidad
            announceToScreenReader(`Modo ${isDarkNow ? 'oscuro' : 'claro'} activado`);
        });
    });
}

function updateThemeIcons(isDark) {
    // Actualizar todos los íconos de luna/sol usando classList
    const moonIcons = document.querySelectorAll('.icon-moon');
    const sunIcons = document.querySelectorAll('.icon-sun');
    
    moonIcons.forEach(icon => {
        icon.classList.toggle('hidden', isDark);
    });
    
    sunIcons.forEach(icon => {
        icon.classList.toggle('hidden', !isDark);
    });
    
    // Actualizar estado ARIA de botones
    cachedElements.themeToggle.forEach(button => {
        button.setAttribute('aria-pressed', isDark.toString());
    });
}

function initMobileMenu() {
    const toggleBtn = cachedElements.mobileMenuToggle;
    const menu = cachedElements.mobileMenu;
    
    if (!toggleBtn || !menu) return;
    
    toggleBtn.addEventListener('click', function() {
        const isOpen = menu.classList.toggle('open');
        
        // Actualizar atributos ARIA
        toggleBtn.setAttribute('aria-expanded', isOpen);
        
        // Cambiar ícono usando classList (eficiente)
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('icon-cancel', isOpen);
            icon.classList.toggle('icon-menu', !isOpen);
        }
        
        // Prevenir scroll cuando el menú está abierto
        document.body.style.overflow = isOpen ? 'hidden' : '';
        
        // Enfocar primer enlace si se abre (no crítico, diferir)
        if (isOpen) {
            setTimeout(() => {
                const firstLink = menu.querySelector('a');
                if (firstLink) firstLink.focus();
            }, 50);
        }
    });
    
    // Cerrar menú al hacer clic en enlace
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (menu.classList.contains('open')) {
                menu.classList.remove('open');
                document.body.style.overflow = '';
                toggleBtn.setAttribute('aria-expanded', 'false');
                
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('icon-cancel');
                    icon.classList.add('icon-menu');
                }
            }
        });
    });
    
    // Cerrar con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menu.classList.contains('open')) {
            menu.classList.remove('open');
            document.body.style.overflow = '';
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.focus();
            
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('icon-cancel');
                icon.classList.add('icon-menu');
            }
        }
    });
}

function initSmoothScroll() {
    // Cachear altura del header UNA SOLA VEZ
    if (!cachedElements.headerHeight) {
        cachedElements.headerHeight = cachedElements.header ? cachedElements.header.offsetHeight : 80;
    }
    
    // Navegación suave para anclas
    const anchors = document.querySelectorAll('a[href^="#"]');
    
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const targetId = href.substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                e.preventDefault();
                
                // Cerrar menú móvil si está abierto
                if (cachedElements.mobileMenu && cachedElements.mobileMenu.classList.contains('open')) {
                    cachedElements.mobileMenu.classList.remove('open');
                    document.body.style.overflow = '';
                }
                
                // EVITAR REFLOW FORZADO: Usar getBoundingClientRect() UNA VEZ
                const targetRect = target.getBoundingClientRect();
                const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                const targetPosition = targetRect.top + scrollPosition - cachedElements.headerHeight;
                
                // Scroll suave
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Actualizar URL sin recargar
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
                
                // Enfocar objetivo para accesibilidad (diferido)
                setTimeout(() => {
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                    
                    // Limpiar tabindex después de un tiempo
                    setTimeout(() => {
                        target.removeAttribute('tabindex');
                    }, 1000);
                }, 500);
            }
        });
    });
}

function initTypewriter() {
    const textEl = cachedElements.typewriterText;
    const cursorEl = cachedElements.typewriterCursor;
    
    if (!textEl || !cursorEl) return;
    
    const phrases = [
        'Desarrollador Frontend',
        'Especialista en React',
        'Enfocado en Accesibilidad',
        'Creador de Experiencias Web'
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    let animationFrameId = null;
    
    function type(timestamp) {
        if (isPaused) {
            animationFrameId = requestAnimationFrame(type);
            return;
        }
        
        const currentPhrase = phrases[phraseIndex];
        
        if (!isDeleting && charIndex <= currentPhrase.length) {
            // Escribiendo
            textEl.textContent = currentPhrase.substring(0, charIndex);
            charIndex++;
            setTimeout(() => {
                animationFrameId = requestAnimationFrame(type);
            }, 100);
        } else if (isDeleting && charIndex >= 0) {
            // Borrando
            textEl.textContent = currentPhrase.substring(0, charIndex);
            charIndex--;
            setTimeout(() => {
                animationFrameId = requestAnimationFrame(type);
            }, 50);
        } else {
            // Cambiar dirección
            isDeleting = !isDeleting;
            
            if (!isDeleting) {
                phraseIndex = (phraseIndex + 1) % phrases.length;
            }
            
            // Pausa antes de continuar
            isPaused = true;
            setTimeout(() => {
                isPaused = false;
                animationFrameId = requestAnimationFrame(type);
            }, 1500);
        }
    }
    
    // Iniciar con retraso
    setTimeout(() => {
        animationFrameId = requestAnimationFrame(type);
    }, 1000);
    
    // Limpiar animation frame si la página se desmonta
    window.addEventListener('beforeunload', () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    });
}

function initProgressBars() {
    const progressBars = cachedElements.progressBars;
    if (!progressBars.length) return;
    
    // Observar cuando las barras son visibles
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    
                    // Animar la barra con requestAnimationFrame
                    requestAnimationFrame(() => {
                        const width = bar.style.width;
                        bar.style.width = '0%';
                        bar.style.transition = 'width 1.5s ease-out';
                        
                        requestAnimationFrame(() => {
                            bar.style.width = width;
                        });
                    });
                    
                    observer.unobserve(bar);
                }
            });
        }, { 
            threshold: 0.3,
            rootMargin: '50px'
        });
        
        progressBars.forEach(bar => observer.observe(bar));
    } else {
        // Fallback simple
        setTimeout(() => {
            progressBars.forEach(bar => {
                bar.style.transition = 'width 1.5s ease-out';
            });
        }, 500);
    }
}

function initCVDownload() {
    const downloadBtn = cachedElements.downloadBtn;
    const downloadText = cachedElements.downloadText;
    
    if (!downloadBtn || !downloadText) return;
    
    // Guardar estado original
    const originalText = downloadText.textContent;
    const icon = downloadBtn.querySelector('i');
    const originalIconClass = icon?.className || '';
    
    downloadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Si ya está descargando, prevenir doble clic
        if (this.classList.contains('downloading')) {
            return;
        }
        
        // Cambiar a estado "descargando"
        this.classList.add('downloading');
        downloadText.textContent = 'Descargando...';
        
        if (icon) {
            icon.className = 'icon-spinner animate-spin ml-2';
        }
        
        // Crear enlace temporal para descargar
        const a = document.createElement('a');
        a.href = 'public/docs/cv.pdf';
        a.download = 'CV_Aldair_Sarmiento.pdf';
        a.style.display = 'none';
        document.body.appendChild(a);
        
        // Usar requestAnimationFrame para el clic
        requestAnimationFrame(() => {
            a.click();
            
            // Remover el enlace después del clic
            setTimeout(() => {
                document.body.removeChild(a);
            }, 100);
            
            // Mostrar mensaje de éxito después de un breve retraso
            setTimeout(() => {
                showToast('CV descargado correctamente', 'success');
                
                // Restaurar estado original
                this.classList.remove('downloading');
                downloadText.textContent = originalText;
                
                if (icon) {
                    icon.className = originalIconClass;
                }
            }, 800);
        });
    });
}

// ===== FUNCIONES DE UTILIDAD =====

function showToast(message, type = 'info') {
    // Verificar si ya hay un toast idéntico activo
    const toastKey = `${message}-${type}`;
    if (activeToasts.has(toastKey)) {
        return; // No mostrar toast duplicado
    }
    
    // Crear toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.dataset.key = toastKey;
    
    // Botón para cerrar
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '<i class="icon-cancel" aria-hidden="true"></i>';
    closeBtn.setAttribute('aria-label', 'Cerrar notificación');
    
    closeBtn.addEventListener('click', () => {
        removeToast(toast, toastKey);
    });
    
    toast.appendChild(closeBtn);
    
    // Crear contenedor si no existe
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    activeToasts.add(toastKey);
    
    // Animación de entrada
    requestAnimationFrame(() => {
        toast.classList.add('toast-visible');
    });
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
        removeToast(toast, toastKey);
    }, 4000);
}

function removeToast(toast, key) {
    if (!toast.parentNode) return;
    
    activeToasts.delete(key);
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-exiting');
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

function announceToScreenReader(message) {
    let region = document.getElementById('live-region');
    if (!region) {
        region = document.createElement('div');
        region.id = 'live-region';
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        region.className = 'sr-only';
        document.body.appendChild(region);
    }
    
    region.textContent = message;
    
    // Limpiar después de 1 segundo
    setTimeout(() => {
        region.textContent = '';
    }, 1000);
}

// ===== OPTIMIZACIONES DE PERFORMANCE =====

// Debounce para eventos resize/scroll
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

// Throttle para eventos de scroll
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Preconectar recursos críticos
function preconnectCriticalResources() {
    const resources = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://formspree.io',
        'https://polyfill.io'
    ];
    
    resources.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    });
}

// Inicializar preconexiones cuando el navegador está inactivo
if ('requestIdleCallback' in window) {
    requestIdleCallback(preconnectCriticalResources);
}

// ===== EXPOSICIÓN GLOBAL SEGURA =====

// Verificar que no sobrescribimos funciones existentes
if (!window.showToast) {
    window.showToast = showToast;
}

if (!window.announceToScreenReader) {
    window.announceToScreenReader = announceToScreenReader;
}

// Exportar para módulos (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        announceToScreenReader,
        debounce,
        throttle
    };
}

// Marcar como inicializado
window.__PORTFOLIO_OPTIMIZED_INITIALIZED__ = true;
