class SimpleContactForm {
    constructor() {
        // Evitar inicialización duplicada
        if (window.__CONTACT_FORM_INITIALIZED__) {
            return window.contactForm;
        }
        
        this.form = document.getElementById('contact-form');
        if (!this.form) {
            console.warn('Formulario de contacto no encontrado');
            return;
        }
        
        this.submitBtn = document.getElementById('submit-btn');
        this.submitText = document.getElementById('submit-text');
        this.submitSpinner = document.getElementById('submit-spinner');
        
        this.isSubmitting = false;
        this.showedToast = false; 
        
        this.init();
        
        // Marcar como inicializado
        window.__CONTACT_FORM_INITIALIZED__ = true;
        window.contactForm = this;
    }
    
    init() {
        // Guardar texto original del botón
        if (this.submitText) {
            this.originalText = this.submitText.textContent;
        }
        
        // Configurar validación en tiempo real
        this.setupRealTimeValidation();
        
        // Configurar evento de envío
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Configurar eventos de entrada
        this.setupInputEvents();
    }
    
    setupRealTimeValidation() {
        const fields = this.form.querySelectorAll('input, textarea');
        
        fields.forEach(field => {
            // Validar al perder el foco
            field.addEventListener('blur', () => {
                this.validateField(field, true);
            });
            
            // Limpiar errores al escribir
            field.addEventListener('input', () => {
                this.clearFieldError(field);
                field.classList.remove('border-red-500', 'border-green-500');
            });
        });
    }
    
    setupInputEvents() {
        // Validación especial para email
        const emailField = this.form.querySelector('#email');
        if (emailField) {
            emailField.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (value && this.isValidEmail(value)) {
                    e.target.classList.remove('border-red-500');
                    e.target.classList.add('border-green-500');
                } else if (value) {
                    e.target.classList.remove('border-green-500');
                    e.target.classList.add('border-red-500');
                }
            });
        }
        
        // Contador de caracteres para mensaje
        const messageField = this.form.querySelector('#mensaje');
        if (messageField) {
            messageField.addEventListener('input', (e) => {
                const length = e.target.value.length;
                const counter = document.getElementById('message-counter') || 
                               this.createMessageCounter();
                
                counter.textContent = `${length}/500`;
                counter.className = `text-sm ${length > 500 ? 'text-red-600' : 'text-gray-500'}`;
                
                // Validar en tiempo real
                if (length < 10 && length > 0) {
                    this.showFieldError(messageField, 'El mensaje debe tener al menos 10 caracteres', false);
                } else if (length > 500) {
                    this.showFieldError(messageField, 'El mensaje no puede exceder 500 caracteres', false);
                } else {
                    this.clearFieldError(messageField);
                    if (length >= 10) {
                        messageField.classList.add('border-green-500');
                    }
                }
            });
        }
    }
    
    createMessageCounter() {
        const counter = document.createElement('div');
        counter.id = 'message-counter';
        counter.className = 'text-sm text-gray-500 mt-1';
        counter.textContent = '0/500';
        
        const messageField = this.form.querySelector('#mensaje');
        if (messageField) {
            messageField.parentNode.appendChild(counter);
        }
        
        return counter;
    }
    
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    validateField(field, showError = false) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Validaciones específicas
        if (field.required && !value) {
            isValid = false;
            errorMessage = 'Este campo es obligatorio';
        } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Por favor, ingresa un email válido';
        } else if (field.id === 'nombre' && value.length < 2) {
            isValid = false;
            errorMessage = 'El nombre debe tener al menos 2 caracteres';
        } else if (field.id === 'mensaje' && value.length < 10) {
            isValid = false;
            errorMessage = 'El mensaje debe tener al menos 10 caracteres';
        } else if (field.id === 'mensaje' && value.length > 500) {
            isValid = false;
            errorMessage = 'El mensaje no puede exceder 500 caracteres';
        }
        
        // Mostrar/ocultar error
        if (!isValid && showError) {
            this.showFieldError(field, errorMessage);
        } else if (isValid && value) {
            field.classList.remove('border-red-500');
            field.classList.add('border-green-500');
            this.clearFieldError(field);
        }
        
        return isValid;
    }
    
    showFieldError(field, message, focusField = true) {
        this.clearFieldError(field);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error text-red-600 text-sm mt-1';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        
        field.parentNode.insertBefore(errorElement, field.nextSibling);
        field.classList.add('border-red-500');
        field.classList.remove('border-green-500');
        
        if (focusField) {
            field.focus();
        }
    }
    
    clearFieldError(field) {
        const errorElement = field.nextElementSibling;
        if (errorElement && errorElement.classList.contains('field-error')) {
            errorElement.remove();
        }
    }
    
    validateAllFields() {
        let isValid = true;
        let firstInvalidField = null;
        
        const fields = this.form.querySelectorAll('input, textarea');
        
        fields.forEach(field => {
            if (!this.validateField(field, true)) {
                isValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            }
        });
        
        // Enfocar el primer campo inválido
        if (firstInvalidField) {
            firstInvalidField.focus();
        }
        
        return isValid;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) {
            return;
        }
        
        // Validar todos los campos
        if (!this.validateAllFields()) {
            // No mostrar toast aquí - solo errores de campo
            return;
        }
        
        // Cambiar estado a "enviando"
        this.isSubmitting = true;
        this.showedToast = false;
        this.setSubmittingState(true);
        
        try {
            // Verificar conexión a internet
            if (!navigator.onLine) {
                throw new Error('Sin conexión a internet');
            }
            
            const formData = new FormData(this.form);
            
            // Enviar a Formspree
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Éxito
                this.showSuccess();
                this.form.reset();
                
                // Limpiar contador
                const counter = document.getElementById('message-counter');
                if (counter) counter.textContent = '0/500';
                
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Error en el servidor');
            }
        } catch (error) {
            console.error('Error enviando formulario:', error);
            
            // Solo mostrar toast si no se ha mostrado ya
            if (!this.showedToast) {
                // Mostrar mensaje de error específico
                if (error.message === 'Sin conexión a internet') {
                    this.showError('Sin conexión a internet. No se pudo enviar el mensaje.');
                } else {
                    this.showError('Error al enviar el mensaje. Intenta nuevamente.');
                }
                this.showedToast = true;
            }
        } finally {
            // Restaurar estado después de 2 segundos
            setTimeout(() => {
                this.setSubmittingState(false);
                this.isSubmitting = false;
                this.showedToast = false;
            }, 2000);
        }
    }
    
    setSubmittingState(isSubmitting) {
        if (this.submitBtn) {
            this.submitBtn.disabled = isSubmitting;
            this.submitBtn.classList.toggle('opacity-75', isSubmitting);
        }
        
        if (this.submitText) {
            this.submitText.textContent = isSubmitting ? 'Enviando...' : this.originalText;
        }
        
        if (this.submitSpinner) {
            if (isSubmitting) {
                this.submitSpinner.classList.remove('hidden');
            } else {
                this.submitSpinner.classList.add('hidden');
            }
        }
    }
    
    showSuccess() {
        // Marcar que ya mostramos un toast
        this.showedToast = true;
        
        this.setSubmittingState(true);
        if (this.submitText) {
            this.submitText.textContent = '¡Enviado!';
        }
        
        // Mostrar toast de éxito (con verificación segura)
        if (typeof window.showToast === 'function') {
            window.showToast('Mensaje enviado con éxito. ¡Gracias!', 'success');
        }
        
        // Anunciar para accesibilidad (con verificación segura)
        if (typeof window.announceToScreenReader === 'function') {
            window.announceToScreenReader('Mensaje enviado con éxito');
        }
    }
    
    showError(message = 'Error al enviar el mensaje. Intenta nuevamente.') {
        // Marcar que ya mostramos un toast
        this.showedToast = true;
        
        this.setSubmittingState(true);
        if (this.submitText) {
            this.submitText.textContent = 'Error';
        }
        
        // Mostrar toast de error - ÚNICA LUGAR donde se muestra toast de error
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'error');
        }
        
        // Anunciar para accesibilidad (con verificación segura)
        if (typeof window.announceToScreenReader === 'function') {
            window.announceToScreenReader(message);
        }
    }
}

// Inicializar automáticamente CON RETRASO para asegurar que main.js se cargue primero
setTimeout(() => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.__CONTACT_FORM_INITIALIZED__) {
                window.contactForm = new SimpleContactForm();
            }
        });
    } else {
        if (!window.__CONTACT_FORM_INITIALIZED__) {
            window.contactForm = new SimpleContactForm();
        }
    }
}, 100);