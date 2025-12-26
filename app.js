"use strict";

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener("DOMContentLoaded", () => {
    initPortfolio();
});

function initPortfolio() {
    initThemeToggle();
    createToastContainer();
    initMobileMenu();
    initTypewriter();
    initCarousel();
    initFormSubmission();
    initDownloadButtons();
    initIntersectionObserver();
    
    // Inicializar después de carga completa
    window.addEventListener('load', () => {
        lazyLoadImages();
        updateMetaTags();
        initPWAInstall();
        registerServiceWorker();
        updateCurrentYear();
        optimizeImages();
        initBackToTop();
    });
}

// ===== MODO OSCURO CORREGIDO =====
function initThemeToggle() {
    const toggle = document.getElementById("theme-toggle");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    
    // Función para aplicar el tema
    function applyTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", isDark ? "dark" : "light");
        toggle?.setAttribute("aria-pressed", isDark ? "true" : "false");
    }
    
    // Detectar tema inicial
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        applyTheme(true);
    } else if (savedTheme === "light") {
        applyTheme(false);
    } else if (prefersDark.matches) {
        applyTheme(true);
    } else {
        applyTheme(false);
    }
    
    // Configurar evento del botón
    toggle?.addEventListener("click", () => {
        const isDark = !document.documentElement.classList.contains("dark");
        applyTheme(isDark);
        showToast(isDark ? "🌙 Modo oscuro activado" : "☀️ Modo claro activado", "info", 2000);
    });
    
    // Escuchar cambios en las preferencias del sistema
    prefersDark.addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
            applyTheme(e.matches);
        }
    });
}

// ===== SISTEMA DE NOTIFICACIONES =====
function createToastContainer() {
    if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

function showToast(message, type = 'info', duration = 3000) {
    const container = document.querySelector('.toast-container') || createToastContainer();
    
    // Limitar a 3 notificaciones simultáneas
    const toasts = container.querySelectorAll('.toast');
    if (toasts.length >= 3) {
        toasts[0].remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="${icons[type] || 'fas fa-info-circle'}" aria-hidden="true"></i>
        <span>${message}</span>
        <button class="toast-close" aria-label="Cerrar notificación">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Botón para cerrar
    toast.querySelector('.toast-close').addEventListener('click', () => {
        hideToast(toast);
    });
    
    // Auto-remover después de la duración
    const timeout = setTimeout(() => {
        hideToast(toast);
    }, duration);
    
    // Pausar timeout al hacer hover
    toast.addEventListener('mouseenter', () => {
        clearTimeout(timeout);
    });
    
    toast.addEventListener('mouseleave', () => {
        setTimeout(() => hideToast(toast), 1000);
    });
    
    return toast;
}

function hideToast(toast) {
    toast.classList.add('hide');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 300);
}

// ===== MENÚ MÓVIL MEJORADO =====
function initMobileMenu() {
    const menuToggle = document.getElementById("mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    
    if (!menuToggle || !mobileMenu) return;
    
    function openMenu() {
        mobileMenu.classList.remove("hidden");
        requestAnimationFrame(() => {
            mobileMenu.style.opacity = "1";
            mobileMenu.style.transform = "translateY(0)";
            menuToggle.setAttribute("aria-expanded", "true");
            menuToggle.innerHTML = '<i class="fas fa-times text-xl" aria-hidden="true"></i>';
            document.body.style.overflow = "hidden";
        });
    }
    
    function closeMenu() {
        mobileMenu.style.opacity = "0";
        mobileMenu.style.transform = "translateY(-10px)";
        setTimeout(() => {
            mobileMenu.classList.add("hidden");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.innerHTML = '<i class="fas fa-bars text-xl" aria-hidden="true"></i>';
            document.body.style.overflow = "";
        }, 300);
    }
    
    menuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        if (isExpanded) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    
    // Cerrar al hacer clic en enlaces
    mobileMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });
    
    // Cerrar al hacer clic fuera
    document.addEventListener("click", (e) => {
        if (!mobileMenu.classList.contains("hidden") && 
            !mobileMenu.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            closeMenu();
        }
    });
    
    // Cerrar con Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !mobileMenu.classList.contains("hidden")) {
            closeMenu();
        }
    });
}

// ===== TYPEWRITER EFFECT =====
function initTypewriter() {
    const textElement = document.getElementById("typewriter-text");
    const cursorElement = document.getElementById("typewriter-cursor");
    
    if (!textElement || !cursorElement) return;
    
    const texts = [
        "Desarrollador Frontend",
        "Creador de Experiencias Digitales",
        "Especialista en React",
        "Diseñador de Interfaces"
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    
    // Animación del cursor
    let cursorVisible = true;
    setInterval(() => {
        cursorElement.style.opacity = cursorVisible ? "1" : "0";
        cursorVisible = !cursorVisible;
    }, 500);
    
    function typeWriter() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            // Eliminar caracter
            textElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            // Escribir caracter
            textElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            // Pausa al completar texto
            isPaused = true;
            setTimeout(() => {
                isPaused = false;
                isDeleting = true;
                setTimeout(typeWriter, 100);
            }, 2000);
            return;
        }
        
        if (isDeleting && charIndex === 0) {
            // Cambiar al siguiente texto
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
        }
        
        // Velocidad de escritura
        const speed = isDeleting ? 50 : isPaused ? 1000 : 100;
        setTimeout(typeWriter, speed);
    }
    
    // Iniciar después de 1 segundo
    setTimeout(typeWriter, 1000);
}

// ===== CARRUSEL MEJORADO =====
function initCarousel() {
    const track = document.getElementById("projects-track");
    const prevBtn = document.getElementById("carousel-prev");
    const nextBtn = document.getElementById("carousel-next");
    const indicatorsContainer = document.getElementById("carousel-indicators");
    
    if (!track || !prevBtn || !nextBtn) return;
    
    const slides = document.querySelectorAll(".carousel-slide");
    const totalSlides = slides.length;
    let currentIndex = 0;
    let slideWidth = 100; // Porcentaje
    let autoplayInterval;
    
    // Calcular ancho según breakpoints
    function calculateSlideWidth() {
        if (window.innerWidth >= 1024) {
            slideWidth = 33.333; // 3 slides visibles
        } else if (window.innerWidth >= 768) {
            slideWidth = 50; // 2 slides visibles
        } else {
            slideWidth = 100; // 1 slide visible
        }
        updatePosition();
    }
    
    // Actualizar posición
    function updatePosition() {
        const translateX = -currentIndex * slideWidth;
        track.style.transform = `translateX(${translateX}%)`;
        updateIndicators();
        updateAriaLabels();
    }
    
    // Actualizar indicadores
    function updateIndicators() {
        if (!indicatorsContainer) return;
        
        const indicators = indicatorsContainer.querySelectorAll("button");
        indicators.forEach((indicator, index) => {
            const isSelected = index === currentIndex;
            indicator.className = `w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[12px] min-w-[12px] ${isSelected ? 'bg-primary-600 scale-125' : 'bg-gray-300 dark:bg-gray-600 hover:scale-110'}`;
            indicator.setAttribute("aria-selected", isSelected);
        });
    }
    
    // Actualizar etiquetas ARIA
    function updateAriaLabels() {
        prevBtn.setAttribute("aria-label", currentIndex === 0 ? 
            "Primer proyecto (actual)" : "Proyecto anterior");
        nextBtn.setAttribute("aria-label", currentIndex === totalSlides - 1 ? 
            "Último proyecto (actual)" : "Siguiente proyecto");
    }
    
    // Ir a slide específico
    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
        updatePosition();
        resetAutoplay();
    }
    
    // Siguiente slide
    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updatePosition();
        resetAutoplay();
    }
    
    // Slide anterior
    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updatePosition();
        resetAutoplay();
    }
    
    // Autoplay
    function startAutoplay() {
        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(nextSlide, 5000);
    }
    
    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }
    
    // Configurar controles
    prevBtn.addEventListener("click", prevSlide);
    nextBtn.addEventListener("click", nextSlide);
    
    // Swipe en móviles
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(autoplayInterval);
    });
    
    track.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const threshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        startAutoplay();
    });
    
    // Crear indicadores
    function createIndicators() {
        if (!indicatorsContainer) return;
        
        indicatorsContainer.innerHTML = '';
        
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement("button");
            indicator.className = `w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[12px] min-w-[12px] ${i === 0 ? 'bg-primary-600 scale-125' : 'bg-gray-300 dark:bg-gray-600'}`;
            indicator.setAttribute("aria-label", `Ir al proyecto ${i + 1}`);
            indicator.setAttribute("role", "tab");
            indicator.setAttribute("aria-selected", i === 0 ? "true" : "false");
            indicator.addEventListener("click", () => goToSlide(i));
            indicatorsContainer.appendChild(indicator);
        }
    }
    
    // Pausar autoplay al hover
    track.addEventListener("mouseenter", () => clearInterval(autoplayInterval));
    track.addEventListener("mouseleave", startAutoplay);
    
    // Inicializar
    calculateSlideWidth();
    createIndicators();
    startAutoplay();
    
    // Actualizar en resize
    window.addEventListener("resize", calculateSlideWidth);
}

// ===== FORMULARIO MEJORADO =====
function initFormSubmission() {
    const form = document.getElementById("contact-form");
    const submitBtn = document.getElementById("submit-btn");
    const submitText = document.getElementById("submit-text");
    const submitSpinner = document.getElementById("submit-spinner");

    if (!form || !submitBtn || !submitText || !submitSpinner) return;

    // Validación en tiempo real
    form.querySelectorAll("input, textarea").forEach(input => {
        input.addEventListener("blur", () => {
            if (input.hasAttribute("required") && !input.value.trim()) {
                input.classList.add("border-red-500");
                input.classList.remove("border-green-500");
            } else if (input.value.trim()) {
                input.classList.remove("border-red-500");
                input.classList.add("border-green-500");
            }
        });

        input.addEventListener("input", () => {
            input.classList.remove("border-red-500", "border-green-500");
        });
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validar todos los campos requeridos
        let isValid = true;
        const requiredFields = form.querySelectorAll("[required]");
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add("border-red-500");
                isValid = false;
            }
        });

        if (!isValid) {
            showToast("⚠️ Por favor, completa todos los campos requeridos", "warning", 3000);
            
            // Enfocar el primer campo inválido
            const firstInvalid = form.querySelector(".border-red-500");
            if (firstInvalid) {
                firstInvalid.focus();
            }
            
            return;
        }

        // Deshabilitar botón y mostrar spinner
        submitBtn.disabled = true;
        submitText.textContent = "Enviando...";
        submitSpinner.classList.remove("hidden");
        submitBtn.setAttribute("aria-busy", "true");

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            console.log("Enviando datos:", data);
            
            // Mostrar mensaje de envío
            showToast("📤 Enviando tu mensaje...", "info", 2000);

            const response = await fetch(form.action, {
                method: "POST",
                body: formData,
                headers: {
                    "Accept": "application/json"
                }
            });

            if (response.ok) {
                // Éxito
                showToast("✅ ¡Mensaje enviado con éxito! Te responderé pronto.", "success", 5000);
                submitText.textContent = "¡Enviado!";
                submitSpinner.classList.add("hidden");
                
                // Resetear formulario
                form.reset();
                
                // Restaurar estilos de validación
                form.querySelectorAll("input, textarea").forEach(field => {
                    field.classList.remove("border-red-500", "border-green-500");
                });
                
                // Restaurar botón después de 3 segundos
                setTimeout(() => {
                    submitText.textContent = "Enviar Mensaje";
                    submitBtn.disabled = false;
                    submitBtn.setAttribute("aria-busy", "false");
                }, 3000);
                
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error al enviar:", error);
            
            // Mostrar error específico
            let errorMessage = "❌ Error al enviar el mensaje. Intenta nuevamente.";
            if (error.message.includes("Failed to fetch")) {
                errorMessage = "🌐 Error de conexión. Verifica tu internet.";
            }
            
            showToast(errorMessage, "error", 5000);
            submitText.textContent = "Error";
            submitSpinner.classList.add("hidden");
            
            setTimeout(() => {
                submitText.textContent = "Enviar Mensaje";
                submitBtn.disabled = false;
                submitBtn.setAttribute("aria-busy", "false");
            }, 3000);
        }
    });
}

// ===== DESCARGAS CON FEEDBACK =====
function initDownloadButtons() {
    document.querySelectorAll('[download], a[href$=".pdf"]').forEach(button => {
        button.addEventListener('click', function(e) {
            // Solo para CV
            if (this.href.includes('cv.pdf') || this.getAttribute('href') === 'cv.pdf') {
                e.preventDefault();
                
                // Mostrar confirmación
                showToast("📥 Preparando tu CV para descarga...", "info", 1500);
                
                // Simular descarga
                setTimeout(() => {
                    showToast("✅ CV descargado correctamente", "success", 3000);
                    
                    // Crear enlace temporal para descarga real
                    const link = document.createElement('a');
                    link.href = 'cv.pdf';
                    link.download = 'CV_Aldair_Sarmiento.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }, 1500);
            }
        });
    });
}

// ===== OBSERVER PARA ANIMACIONES =====
function initIntersectionObserver() {
    // Configuración para animaciones
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    // Configuración para lazy loading de secciones
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-transition', 'visible');
            }
        });
    }, {
        threshold: 0.1
    });

    // Observar elementos para animaciones
    document.querySelectorAll(".card-hover, .profile-image, .skill-item").forEach(el => {
        animationObserver.observe(el);
    });

    // Observar secciones
    document.querySelectorAll("section").forEach(section => {
        section.classList.add('section-transition');
        sectionObserver.observe(section);
    });

    // Animación de barras de progreso
    const progressBars = document.querySelectorAll(".progress-bar");
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = "0";
        setTimeout(() => {
            bar.style.width = width;
        }, 300);
    });
}

// ===== LAZY LOADING DE IMÁGENES =====
function lazyLoadImages() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Cargar imagen
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    
                    // Remover lazy class después de cargar
                    img.onload = () => {
                        img.style.opacity = '1';
                        img.classList.remove('lazy');
                    };
                    
                    img.onerror = () => {
                        console.warn('Error cargando imagen:', img.src);
                        // Mostrar placeholder
                        if (!img.hasAttribute('alt')) {
                            img.alt = 'Imagen no disponible';
                        }
                    };
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observar imágenes lazy
        document.querySelectorAll('img[loading="lazy"], img[data-src]').forEach(img => {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease';
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    } else {
        // Fallback para navegadores sin IntersectionObserver
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// ===== PWA INSTALL =====
function initPWAInstall() {
    let deferredPrompt = null;
    const modal = document.getElementById("pwa-install-modal");
    const modalShown = sessionStorage.getItem("pwaModalShown");

    if (!modal) return;

    function showModal() {
        document.body.classList.add("modal-open");
        modal.classList.remove("hidden");
        setTimeout(() => {
            const modalContent = modal.querySelector('div[class*="rounded-2xl"]');
            if (modalContent) {
                modalContent.classList.remove("scale-95", "opacity-0");
            }
        }, 10);
        sessionStorage.setItem("pwaModalShown", "true");
    }

    function hideModal() {
        const modalContent = modal.querySelector('div[class*="rounded-2xl"]');
        if (modalContent) {
            modalContent.classList.add("scale-95", "opacity-0");
        }
        setTimeout(() => {
            modal.classList.add("hidden");
            document.body.classList.remove("modal-open");
        }, 200);
    }

    // Mostrar modal después de 5 segundos si no se ha mostrado
    if (!modalShown) {
        setTimeout(() => {
            if (deferredPrompt) {
                showModal();
            }
        }, 5000);
    }

    // Capturar evento beforeinstallprompt
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        if (!modalShown) {
            setTimeout(showModal, 3000);
        }
        
        // Mostrar badge de instalación
        showToast("📱 Esta app se puede instalar", "info", 3000);
    });

    // Botón de instalar
    document.getElementById("pwa-modal-install")?.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === "accepted") {
                showToast("✅ App instalada correctamente", "success", 3000);
            } else {
                showToast("ℹ️ Instalación cancelada", "info", 2000);
            }
            
            hideModal();
            deferredPrompt = null;
        } catch (error) {
            console.error("Error al instalar:", error);
            showToast("❌ Error al instalar la app", "error", 3000);
            hideModal();
        }
    });

    // Botones de cancelar
    document.getElementById("pwa-modal-cancel")?.addEventListener("click", hideModal);
    document.getElementById("pwa-modal-close")?.addEventListener("click", hideModal);

    // Cerrar modal al hacer clic fuera
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    // Cerrar con Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) {
            hideModal();
        }
    });

    // Detectar cuando la app se instala
    window.addEventListener("appinstalled", () => {
        console.log("App instalada");
        showToast("🎉 ¡App instalada correctamente!", "success", 3000);
    });
}

// ===== SERVICE WORKER =====
function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("/Portafolio/sw.js")
                .then(registration => {
                    console.log("✅ Service Worker registrado:", registration.scope);
                    
                    // Verificar actualizaciones
                    registration.addEventListener("updatefound", () => {
                        const newWorker = registration.installing;
                        console.log("🔄 Nuevo Service Worker encontrado");
                        
                        newWorker.addEventListener("statechange", () => {
                            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                showToast("🔄 Nueva versión disponible. Recarga para actualizar.", "info", 5000);
                            }
                        });
                    });
                })
                .catch(error => {
                    console.error("❌ Error SW:", error);
                });
        });
    }
}

// ===== ACTUALIZAR AÑO ACTUAL =====
function updateCurrentYear() {
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ===== OPTIMIZACIÓN DE IMÁGENES =====
function optimizeImages() {
    document.querySelectorAll("img:not([data-src])").forEach(img => {
        // Agregar loading lazy si no tiene
        if (!img.hasAttribute("loading")) {
            img.setAttribute("loading", "lazy");
        }
        
        // Agregar dimensiones si no las tiene
        if (!img.hasAttribute("width") || !img.hasAttribute("height")) {
            img.setAttribute("width", img.naturalWidth || 300);
            img.setAttribute("height", img.naturalHeight || 300);
        }
        
        // Agregar alt si no tiene
        if (!img.hasAttribute("alt")) {
            img.setAttribute("alt", "Imagen del portafolio");
        }
    });
}

// ===== SCROLL SMOOTH =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            
            if (href === "#" || href === "#!") return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                // Cerrar menú móvil si está abierto
                const mobileMenu = document.getElementById("mobile-menu");
                if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
                    mobileMenu.style.opacity = "0";
                    mobileMenu.style.transform = "translateY(-10px)";
                    setTimeout(() => {
                        mobileMenu.classList.add("hidden");
                    }, 300);
                }
                
                // Scroll suave
                const headerHeight = 80;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });
                
                // Actualizar URL
                history.pushState(null, null, href);
                
                // Enfocar el elemento para accesibilidad
                setTimeout(() => {
                    targetElement.setAttribute("tabindex", "-1");
                    targetElement.focus();
                }, 500);
            }
        });
    });
}

// ===== BOTÓN "VOLVER ARRIBA" =====
function initBackToTop() {
    const backToTop = document.createElement('button');
    backToTop.id = 'back-to-top';
    backToTop.className = 'fixed bottom-6 right-6 w-12 h-12 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-all duration-300 hover:scale-110 z-40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-transparent hidden opacity-0';
    backToTop.innerHTML = '<i class="fas fa-chevron-up" aria-hidden="true"></i>';
    backToTop.setAttribute('aria-label', 'Volver arriba');
    document.body.appendChild(backToTop);
    
    // Mostrar/ocultar botón
    function toggleBackToTop() {
        if (window.scrollY > 300) {
            backToTop.classList.remove('hidden', 'opacity-0');
            backToTop.classList.add('opacity-100');
        } else {
            backToTop.classList.remove('opacity-100');
            setTimeout(() => {
                if (window.scrollY <= 300) {
                    backToTop.classList.add('hidden', 'opacity-0');
                }
            }, 300);
        }
    }
    
    // Evento click
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Enfocar el header para accesibilidad
        setTimeout(() => {
            document.querySelector('header').focus();
        }, 500);
    });
    
    // Escroll event
    window.addEventListener('scroll', toggleBackToTop);
    toggleBackToTop(); // Estado inicial
}

// ===== MEJORAS DE SEO Y METADATOS =====
function updateMetaTags() {
    // Actualizar título dinámico según scroll
    const sections = document.querySelectorAll('section[id]');
    
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateTitle() {
        let currentSection = null;
        let minDistance = Infinity;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const distance = Math.abs(rect.top);
            
            if (distance < minDistance && rect.top <= 150) {
                minDistance = distance;
                currentSection = section;
            }
        });
        
        if (currentSection) {
            const title = currentSection.querySelector('h2, h1')?.textContent || '';
            if (title && title !== document.title.split(' - ')[0]) {
                document.title = `${title} | Aldair Dev - Portafolio`;
            }
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateTitle();
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener("error", function(e) {
    console.error("Error global:", e.error);
    showToast("⚠️ Ocurrió un error inesperado. Recarga la página.", "error", 5000);
});

window.addEventListener("unhandledrejection", function(e) {
    console.error("Promesa rechazada no manejada:", e.reason);
    showToast("⚠️ Error en una operación. Intenta nuevamente.", "warning", 4000);
});

// ===== OFFLINE DETECTION =====
window.addEventListener('online', () => {
    showToast("✅ Conexión restablecida", "success", 3000);
});

window.addEventListener('offline', () => {
    showToast("🌐 Estás sin conexión. Algunas funciones pueden no estar disponibles.", "warning", 5000);
});

// ===== PERFORMANCE MONITORING =====
function measurePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('🔄 Performance Metrics:', {
                        'Tiempo de carga': `${Math.round(perfData.loadEventEnd)}ms`,
                        'DOM cargado': `${Math.round(perfData.domContentLoadedEventEnd)}ms`,
                        'Tiempo de respuesta': `${Math.round(perfData.responseEnd - perfData.requestStart)}ms`
                    });
                }
            }, 0);
        });
    }
}

// Iniciar medición de performance
measurePerformance();

// ===== INIT SMOOTH SCROLL =====
// Asegurar que se llame después de DOMContentLoaded
document.addEventListener("DOMContentLoaded", initSmoothScroll);