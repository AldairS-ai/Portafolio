'use strict';

// App para navegadores sin soporte de módulos ES6
(function() {
    // Evitar múltiples ejecuciones
    if (window.__LEGACY_APP_INITIALIZED__) {
        return;
    }
    window.__LEGACY_APP_INITIALIZED__ = true;
    
    // Esperar a que el DOM esté completamente cargado
    function init() {
        console.log('Inicializando aplicación legacy...');
        
        // 1. Año actual
        try {
            const yearEl = document.getElementById('current-year');
            if (yearEl) {
                yearEl.textContent = new Date().getFullYear();
            }
        } catch (e) {
            console.error('Error setting year:', e);
        }
        
        // 2. Tema básico
        try {
            const theme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (theme === 'dark' || (!theme && prefersDark)) {
                document.documentElement.classList.add('dark');
            }
        } catch (e) {
            console.error('Error setting theme:', e);
        }
        
        // 3. Navegación básica por anclas
        try {
            document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
                anchor.addEventListener('click', function(e) {
                    var href = this.getAttribute('href');
                    
                    if (href === '#') return;
                    
                    var targetId = href.substring(1);
                    var target = document.getElementById(targetId);
                    
                    if (target) {
                        e.preventDefault();
                        
                        // Cerrar menú móvil si está abierto
                        var mobileMenu = document.getElementById('mobile-menu');
                        if (mobileMenu && mobileMenu.classList.contains('open')) {
                            mobileMenu.classList.remove('open');
                        }
                        
                        // Scroll suave básico
                        var header = document.querySelector('header');
                        var headerHeight = header ? header.offsetHeight : 80;
                        var targetPosition = target.offsetTop - headerHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                        
                        // Actualizar URL
                        if (history.pushState) {
                            history.pushState(null, null, href);
                        }
                    }
                });
            });
        } catch (e) {
            console.error('Error setting up navigation:', e);
        }
        
        // 4. Formulario básico
        try {
            var contactForm = document.getElementById('contact-form');
            if (contactForm) {
                contactForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    var submitBtn = document.getElementById('submit-btn');
                    var submitText = document.getElementById('submit-text');
                    var submitSpinner = document.getElementById('submit-spinner');
                    
                    if (submitBtn && submitText && submitSpinner) {
                        // Mostrar estado de carga
                        submitBtn.disabled = true;
                        var originalText = submitText.textContent;
                        submitText.textContent = 'Enviando...';
                        submitSpinner.classList.remove('hidden');
                        
                        // Simular envío
                        setTimeout(function() {
                            // Restaurar estado
                            submitBtn.disabled = false;
                            submitText.textContent = originalText;
                            submitSpinner.classList.add('hidden');
                            
                            // Mostrar mensaje de éxito
                            alert('¡Mensaje enviado con éxito! (Simulación en modo legacy)');
                            contactForm.reset();
                        }, 1500);
                    }
                });
            }
        } catch (e) {
            console.error('Error setting up form:', e);
        }
        
        // 5. Carrusel básico
        try {
            var projectsTrack = document.getElementById('projects-track');
            var carouselPrev = document.getElementById('carousel-prev');
            var carouselNext = document.getElementById('carousel-next');
            
            if (projectsTrack && carouselPrev && carouselNext) {
                var slides = projectsTrack.querySelectorAll('.carousel-slide');
                var totalSlides = slides.length;
                var currentSlide = 0;
                
                function goToSlide(index) {
                    if (index < 0) index = totalSlides - 1;
                    if (index >= totalSlides) index = 0;
                    
                    currentSlide = index;
                    var slideWidth = slides[0].offsetWidth;
                    var offset = -currentSlide * slideWidth;
                    
                    projectsTrack.style.transform = 'translateX(' + offset + 'px)';
                    
                    // Actualizar indicadores
                    var indicators = document.querySelectorAll('.carousel-indicator');
                    indicators.forEach(function(indicator, i) {
                        indicator.classList.toggle('active', i === currentSlide);
                        indicator.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
                    });
                }
                
                carouselPrev.addEventListener('click', function() {
                    goToSlide(currentSlide - 1);
                });
                
                carouselNext.addEventListener('click', function() {
                    goToSlide(currentSlide + 1);
                });
                
                // Crear indicadores
                var indicatorsContainer = document.getElementById('carousel-indicators');
                if (indicatorsContainer && totalSlides > 0) {
                    indicatorsContainer.innerHTML = '';
                    
                    for (var i = 0; i < totalSlides; i++) {
                        var indicator = document.createElement('button');
                        indicator.className = 'carousel-indicator' + (i === 0 ? ' active' : '');
                        indicator.setAttribute('aria-label', 'Ver proyecto ' + (i + 1));
                        indicator.setAttribute('data-index', i);
                        
                        indicator.addEventListener('click', function() {
                            var index = parseInt(this.getAttribute('data-index'));
                            goToSlide(index);
                        });
                        
                        indicatorsContainer.appendChild(indicator);
                    }
                }
                
                // Inicializar
                goToSlide(0);
            }
        } catch (e) {
            console.error('Error setting up carousel:', e);
        }
        
        // 6. Menú móvil básico
        try {
            var mobileMenuToggle = document.getElementById('mobile-menu-toggle');
            var mobileMenu = document.getElementById('mobile-menu');
            
            if (mobileMenuToggle && mobileMenu) {
                mobileMenuToggle.addEventListener('click', function() {
                    var isOpen = mobileMenu.classList.toggle('open');
                    this.setAttribute('aria-expanded', isOpen.toString());
                    
                    var icon = this.querySelector('i');
                    if (icon) {
                        icon.className = isOpen ? 'icon-cancel text-xl' : 'icon-menu text-xl';
                    }
                });
            }
        } catch (e) {
            console.error('Error setting up mobile menu:', e);
        }
        
        // 7. Cambio de tema básico
        try {
            var themeButtons = document.querySelectorAll('#theme-toggle-lg, #theme-toggle-mobile');
            
            themeButtons.forEach(function(button) {
                button.addEventListener('click', function() {
                    var html = document.documentElement;
                    var isDark = html.classList.toggle('dark');
                    
                    localStorage.setItem('theme', isDark ? 'dark' : 'light');
                    
                    // Actualizar íconos
                    var moonIcons = document.querySelectorAll('.icon-moon');
                    var sunIcons = document.querySelectorAll('.icon-sun');
                    
                    moonIcons.forEach(function(icon) {
                        icon.classList.toggle('hidden', isDark);
                    });
                    
                    sunIcons.forEach(function(icon) {
                        icon.classList.toggle('hidden', !isDark);
                    });
                });
            });
        } catch (e) {
            console.error('Error setting up theme toggle:', e);
        }
        
        console.log('Aplicación legacy inicializada correctamente');
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
