// Grand Hotel Reservation System - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeDateInputs();
    initializeFormValidation();
    initializeTooltips();
    initializeAlerts();
    initializeBookingCalculator();
    initializeSearchForm();
});

// Date Input Initialization
function initializeDateInputs() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Set minimum dates for all date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (input.name === 'check_in') {
            input.min = today;
            if (!input.value) {
                input.value = today;
            }
        } else if (input.name === 'check_out') {
            input.min = tomorrowStr;
            if (!input.value) {
                input.value = tomorrowStr;
            }
        }
    });
    
    // Handle check-in/check-out date relationship
    const checkInInput = document.querySelector('input[name="check_in"]');
    const checkOutInput = document.querySelector('input[name="check_out"]');
    
    if (checkInInput && checkOutInput) {
        checkInInput.addEventListener('change', function() {
            const checkInDate = new Date(this.value);
            checkInDate.setDate(checkInDate.getDate() + 1);
            const minCheckOut = checkInDate.toISOString().split('T')[0];
            
            checkOutInput.min = minCheckOut;
            
            // Update check-out date if it's before the new minimum
            if (checkOutInput.value && new Date(checkOutInput.value) <= new Date(this.value)) {
                checkOutInput.value = minCheckOut;
            }
            
            // Trigger booking calculation
            calculateBookingTotal();
        });
        
        checkOutInput.addEventListener('change', calculateBookingTotal);
    }
}

// Form Validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form[data-validate="true"], .needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        });
    });
    
    // Real-time validation for specific fields
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', validateEmail);
    });
    
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', validatePassword);
    });
}

// Email Validation
function validateEmail(event) {
    const email = event.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    event.target.classList.toggle('is-valid', isValid && email.length > 0);
    event.target.classList.toggle('is-invalid', !isValid && email.length > 0);
}

// Password Validation
function validatePassword(event) {
    const password = event.target.value;
    const isValid = password.length >= 6;
    
    event.target.classList.toggle('is-valid', isValid);
    event.target.classList.toggle('is-invalid', !isValid && password.length > 0);
    
    // Check confirm password if it exists
    const confirmPassword = document.querySelector('input[name="password2"]');
    if (confirmPassword && confirmPassword.value.length > 0) {
        const passwordsMatch = password === confirmPassword.value;
        confirmPassword.classList.toggle('is-valid', passwordsMatch && isValid);
        confirmPassword.classList.toggle('is-invalid', !passwordsMatch || !isValid);
    }
}

// Initialize Bootstrap Tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Auto-hide Alerts
function initializeAlerts() {
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        // Auto-hide success and info alerts after 5 seconds
        if (alert.classList.contains('alert-success') || alert.classList.contains('alert-info')) {
            setTimeout(() => {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }, 5000);
        }
    });
}

// Booking Calculator
function initializeBookingCalculator() {
    calculateBookingTotal();
}

function calculateBookingTotal() {
    const checkInInput = document.querySelector('input[name="check_in"]');
    const checkOutInput = document.querySelector('input[name="check_out"]');
    const bookingSummary = document.getElementById('bookingSummary');
    const nightsElement = document.getElementById('nightsCount');
    const totalElement = document.getElementById('totalAmount');
    
    if (!checkInInput || !checkOutInput || !bookingSummary) return;
    
    const checkIn = new Date(checkInInput.value);
    const checkOut = new Date(checkOutInput.value);
    
    if (checkInInput.value && checkOutInput.value && checkOut > checkIn) {
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const roomPriceElement = document.querySelector('[data-room-price]');
        const roomPrice = roomPriceElement ? parseFloat(roomPriceElement.dataset.roomPrice) : 0;
        const total = nights * roomPrice;
        
        if (nightsElement) nightsElement.textContent = nights;
        if (totalElement) totalElement.textContent = '$' + total.toFixed(0);
        
        bookingSummary.style.display = 'block';
        
        // Add animation
        bookingSummary.classList.add('fade-in');
        setTimeout(() => bookingSummary.classList.remove('fade-in'), 300);
    } else {
        bookingSummary.style.display = 'none';
    }
}

// Search Form Enhancement
function initializeSearchForm() {
    const searchForm = document.querySelector('.search-form, form[action*="rooms"]');
    if (!searchForm) return;
    
    const submitButton = searchForm.querySelector('button[type="submit"]');
    
    searchForm.addEventListener('submit', function() {
        if (submitButton) {
            submitButton.classList.add('loading');
            submitButton.disabled = true;
            
            // Re-enable after 3 seconds (fallback)
            setTimeout(() => {
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
            }, 3000);
        }
    });
}

// Utility Functions
function showLoading(element) {
    element.classList.add('loading');
    element.disabled = true;
}

function hideLoading(element) {
    element.classList.remove('loading');
    element.disabled = false;
}

function showAlert(message, type = 'info') {
    const alertContainer = document.querySelector('.container');
    if (!alertContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.insertBefore(alert, alertContainer.firstChild);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
    }, 5000);
}

// Confirmation Dialogs
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format Date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Smooth Scroll to Element
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Theme Toggle (for future enhancement)
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialize theme from localStorage
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
    }
}

// Call theme initialization
initializeTheme();

// Export functions for global use
window.HotelReservation = {
    showAlert,
    confirmAction,
    formatCurrency,
    formatDate,
    scrollToElement,
    toggleTheme,
    showLoading,
    hideLoading,
    calculateBookingTotal
};

// CSS Animation Classes
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .slide-up {
        animation: slideUp 0.3s ease-out;
    }
    
    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
