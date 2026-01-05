document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Portafolio inicializado');
    
    // 1. AÑO ACTUAL
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    // 2. TEMA CLARO/OSCURO (CORREGIDO)
    initThemeToggle();
    
    // 3. MENÚ MÓVIL
    initMobileMenu();
    
    // 4. NAVEGACIÓN SUAVE
    initSmoothScroll();
    
    // 5. EFECTO TYPEWRITER
    initTypewriter();
    
    // 6. BARRAS DE PROGRESO ANIMADAS
    initProgressBars();
    
    // 7. DESCARGAR CV
    initCVDownload();
    
    // 8. ELIMINADO: Inicialización duplicada del carrusel
    // 9. ELIMINADO: Inicialización duplicada del formulario
});

// ===== FUNCIONES CORREGIDAS =====

function initThemeToggle() {
    // Configurar tema inicial CORREGIDO
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    if (isDark) {
        document.documentElement.classList.add('dark');
    }
    
    // ACTUALIZAR ÍCONOS INICIALES
    updateThemeIcons(isDark);
    
    // Evento para todos los botones de tema
    document.querySelectorAll('[id*="theme-toggle"]').forEach(button => {
        button.addEventListener('click', function() {
            const isDarkNow = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDarkNow ? 'dark' : 'light');
            
            // Actualizar íconos
            updateThemeIcons(isDarkNow);
            
            // Anunciar cambio para accesibilidad
            announceToScreenReader(`Modo ${isDarkNow ? 'oscuro' : 'claro'} activado`);
        });
    });
}

function updateThemeIcons(isDark) {
    // Actualizar todos los íconos de luna/sol
    document.querySelectorAll('.icon-moon').forEach(icon => {
        icon.classList.toggle('hidden', isDark);
    });
    document.querySelectorAll('.icon-sun').forEach(icon => {
        icon.classList.toggle('hidden', !isDark);
    });
    
    // Actualizar estado ARIA de botones
    document.querySelectorAll('[id*="theme-toggle"]').forEach(button => {
        button.setAttribute('aria-pressed', isDark.toString());
    });
}

function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('mobile-menu');
    
    if (!toggleBtn || !menu) return;
    
    toggleBtn.addEventListener('click', function() {
        const isOpen = menu.classList.toggle('open');
        
        // Actualizar atributos ARIA
        toggleBtn.setAttribute('aria-expanded', isOpen);
        
        // Cambiar ícono
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.className = isOpen ? 'icon-cancel text-xl' : 'icon-menu text-xl';
        }
        
        // Prevenir scroll cuando el menú está abierto
        document.body.style.overflow = isOpen ? 'hidden' : '';
        
        // Enfocar primer enlace si se abre
        if (isOpen) {
            setTimeout(() => {
                const firstLink = menu.querySelector('a');
                if (firstLink) firstLink.focus();
            }, 100);
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
                if (icon) icon.className = 'icon-menu text-xl';
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
            if (icon) icon.className = 'icon-menu text-xl';
        }
    });
}

function initSmoothScroll() {
    // Navegación suave para anclas
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const targetId = href.substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                e.preventDefault();
                
                // Cerrar menú móvil si está abierto
                const menu = document.getElementById('mobile-menu');
                if (menu && menu.classList.contains('open')) {
                    menu.classList.remove('open');
                    document.body.style.overflow = '';
                }
                
                // Scroll suave
                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Enfocar objetivo para accesibilidad
                setTimeout(() => {
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                    setTimeout(() => target.removeAttribute('tabindex'), 1000);
                }, 500);
            }
        });
    });
}

function initTypewriter() {
    const textEl = document.getElementById('typewriter-text');
    const cursorEl = document.getElementById('typewriter-cursor');
    
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
    
    function type() {
        if (isPaused) return;
        
        const currentPhrase = phrases[phraseIndex];
        
        if (!isDeleting && charIndex <= currentPhrase.length) {
            // Escribiendo
            textEl.textContent = currentPhrase.substring(0, charIndex);
            charIndex++;
            setTimeout(type, 100);
        } else if (isDeleting && charIndex >= 0) {
            // Borrando
            textEl.textContent = currentPhrase.substring(0, charIndex);
            charIndex--;
            setTimeout(type, 50);
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
                type();
            }, 1500);
        }
    }
    
    // Iniciar con retraso
    setTimeout(type, 1000);
}

function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    // Observar cuando las barras son visibles
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = bar.style.width;
                    
                    // Animar la barra
                    bar.style.width = '0%';
                    bar.style.transition = 'width 1.5s ease-out';
                    
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                    
                    observer.unobserve(bar);
                }
            });
        }, { threshold: 0.5 });
        
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
    const downloadBtn = document.getElementById('download-cv');
    const downloadText = document.getElementById('download-cv-text');
    
    if (!downloadBtn || !downloadText) return;
    
    downloadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Si ya está descargando, prevenir doble clic
        if (this.classList.contains('downloading')) {
            return;
        }
        
        // Guardar estado original
        const originalText = downloadText.textContent;
        const icon = this.querySelector('i');
        const originalIconClass = icon?.className || '';
        
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
}

// En main.js, reemplaza la función showToast con esta versión mejorada:
let activeToasts = new Set(); // Para rastrear toasts activos

function showToast(message, type = 'info') {
    // Verificar si ya hay un toast idéntico activo
    const toastKey = `${message}-${type}`;
    if (activeToasts.has(toastKey)) {
        return; // No mostrar toast duplicado
    }
    
    // Crear toast simple con estilo
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} toast-visible`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.dataset.key = toastKey; // Guardar clave única
    
    // Botón para cerrar
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '<i class="icon-cancel" aria-hidden="true"></i>';
    closeBtn.setAttribute('aria-label', 'Cerrar notificación');
    
    closeBtn.addEventListener('click', () => {
        activeToasts.delete(toastKey);
        toast.classList.remove('toast-visible');
        toast.classList.add('toast-exiting');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
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
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            activeToasts.delete(toastKey);
            toast.classList.remove('toast-visible');
            toast.classList.add('toast-exiting');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }, 4000);
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
    setTimeout(() => {
        region.textContent = '';
    }, 1000);
}

// Hacer funciones disponibles globalmente
window.showToast = showToast;
window.announceToScreenReader = announceToScreenReader;