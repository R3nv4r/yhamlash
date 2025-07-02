// Use localStorage to persist login state
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

// Notification read/unread state
let notificationsRead = localStorage.getItem('notificationsRead') === 'true';

// Track last scroll position for menu hide/show
let lastScrollY = 0; // Initialize to 0 for consistency

// Update UI based on login state
function updateUIBasedOnLogin() {
    const userMenu = document.getElementById('userMenu');
    const uneteSection = document.querySelector('.unete');
    const authToggle = document.getElementById('authToggle');
    const authSubmenu = document.getElementById('authSubmenu');
    const bookBtn = document.getElementById('bookBtn');

    if (isLoggedIn) {
        if (userMenu) userMenu.style.display = 'flex';
        if (uneteSection) uneteSection.style.display = 'none';
        if (authToggle) {
            authToggle.textContent = 'Perfil';
            authToggle.removeEventListener('click', handleAuthToggleClick);
            authToggle.addEventListener('click', handleAuthToggleClick);
        }
        if (authSubmenu) {
            authSubmenu.innerHTML = `
                <a href="/pages/edit-profile.html" class="submenu-item">Editar Perfil</a>
                <a href="#" class="submenu-item" id="logoutBtn">Cerrar Sesión</a>
            `;
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.removeEventListener('click', handleLogout);
                logoutBtn.addEventListener('click', handleLogout);
            }
        }
        checkNotifications();
    } else {
        if (userMenu) userMenu.style.display = 'none';
        if (uneteSection) uneteSection.style.display = 'block';
        if (authToggle) {
            authToggle.textContent = 'Iniciar Sesión';
            authToggle.removeEventListener('click', handleAuthToggleClick);
            authToggle.addEventListener('click', handleAuthToggleClick);
        }
        if (authSubmenu) {
            authSubmenu.innerHTML = `
                <a href="/pages/login.html" class="submenu-item">Iniciar Sesión</a>
                <a href="/pages/register.html" class="submenu-item">Registrarse</a>
            `;
        }
    }

    if (bookBtn && !isLoggedIn) {
        bookBtn.removeEventListener('click', handleBookBtnClick);
        bookBtn.addEventListener('click', handleBookBtnClick);
    }
}

function handleAuthToggleClick(event) {
    toggleSubmenu(event, 'auth-submenu');
}

function handleBookBtnClick(e) {
    e.preventDefault();
    alert('Por favor, inicia sesión o regístrate para agendar una cita.');
    window.location.href = '../pages/login.html';
}

function handleLogout(event) {
    event.preventDefault();
    if (!confirm('¿Estás seguro de que deseas cerrar sesión?')) return;
    isLoggedIn = false;
    localStorage.setItem('isLoggedIn', 'false');
    notificationsRead = false;
    localStorage.setItem('notificationsRead', 'false');
    updateUIBasedOnLogin();
    window.location.href = '../index.html';
}

function toggleSubmenu(event, submenuClass) {
    const submenu = event.target.closest('.submenu-container').querySelector(`.${submenuClass}`);
    const toggle = event.target.closest('.submenu-toggle');
    if (submenu && toggle) {
        const isActive = submenu.classList.contains('active');
        document.querySelectorAll('.submenu').forEach(menu => menu.classList.remove('active'));
        document.querySelectorAll('.submenu-toggle').forEach(t => t.setAttribute('aria-expanded', 'false'));
        if (!isActive) {
            submenu.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
            if (submenuClass === 'notification-submenu') {
                markNotificationsAsRead();
            }
        }
    }
}

document.addEventListener('click', function(event) {
    const submenus = document.querySelectorAll('.submenu');
    const toggles = document.querySelectorAll('.submenu-toggle');
    let shouldClose = true;

    toggles.forEach(toggle => {
        if (toggle.contains(event.target)) {
            shouldClose = false;
        }
    });

    submenus.forEach(submenu => {
        if (submenu.contains(event.target)) {
            shouldClose = false;
        }
    });

    if (shouldClose) {
        submenus.forEach(submenu => submenu.classList.remove('active'));
        document.querySelectorAll('.submenu-toggle').forEach(t => t.setAttribute('aria-expanded', 'false'));
    }
});

function checkNotifications() {
    const notificationMessage = document.getElementById('notificationMessage');
    const notificationDot = document.getElementById('notificationDot');
    if (!notificationMessage || !notificationDot) return;

    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingAppointments = appointments.filter(appointment => {
        const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
        return appointmentDateTime > now && appointmentDateTime <= twentyFourHoursLater;
    });

    upcomingAppointments.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    if (upcomingAppointments.length > 0) {
        const nextAppointment = upcomingAppointments[0];
        notificationMessage.innerHTML = `
            Recordatorio: ${nextAppointment.name} Tienes una cita el ${nextAppointment.date} a las ${nextAppointment.time}
        `;
        if (!notificationsRead) {
            notificationDot.style.display = 'block';
        }
    } else {
        notificationMessage.innerHTML = '';
        notificationDot.style.display = 'none';
    }
}

function markNotificationsAsRead() {
    notificationsRead = true;
    localStorage.setItem('notificationsRead', 'true');
    const notificationDot = document.getElementById('notificationDot');
    if (notificationDot) {
        notificationDot.style.display = 'none';
    }
}

window.addEventListener('scroll', function() {
    const universalMenu = document.querySelector('.universal-menu');
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 0) {
        universalMenu.classList.add('hidden');
    } else {
        universalMenu.classList.remove('hidden');
    }
    lastScrollY = currentScrollY;

    const lemaSection = document.querySelector('.lema');
    if (lemaSection) {
        const windowHeight = window.innerHeight;
        const opacity = 1 - currentScrollY / (windowHeight * 0.5);
        lemaSection.style.opacity = opacity < 0 ? 0 : opacity;
    }
});

document.addEventListener('DOMContentLoaded', function() {
    updateUIBasedOnLogin();
    initializeForms();

    const authToggle = document.getElementById('authToggle');
    if (authToggle) {
        authToggle.setAttribute('aria-haspopup', 'true');
        authToggle.setAttribute('aria-expanded', 'false');
        authToggle.addEventListener('click', handleAuthToggleClick);
    }

    const userToggle = document.querySelector('.submenu-toggle:not(.notification-toggle)');
    if (userToggle) {
        userToggle.setAttribute('aria-haspopup', 'true');
        userToggle.setAttribute('aria-expanded', 'false');
        userToggle.addEventListener('click', (event) => toggleSubmenu(event, 'submenu'));
    }

    const notificationToggle = document.querySelector('.notification-toggle');
    if (notificationToggle) {
        notificationToggle.setAttribute('aria-haspopup', 'true');
        notificationToggle.setAttribute('aria-expanded', 'false');
        notificationToggle.addEventListener('click', (event) => toggleSubmenu(event, 'notification-submenu'));
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});

// Initialize form event listeners
function initializeForms() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!email || !password) {
                alert('Por favor, completa todos los campos.');
                return;
            }
            if (!/^\S+@\S+\.\S+$/.test(email)) {
                alert('Por favor, ingresa un correo válido.');
                return;
            }

            // Check if the user is an admin
            let admins = JSON.parse(localStorage.getItem('admins')) || [];
            const admin = admins.find(a => a.username === email && a.password === password);

            isLoggedIn = true;
            localStorage.setItem('isLoggedIn', 'true');
            notificationsRead = false;
            localStorage.setItem('notificationsRead', 'false');
            alert(`Inicio de sesión exitoso para ${email}`);

            // Redirect based on admin status
            if (admin) {
                window.location.href = '/pages/admin.html';
            } else {
                window.location.href = '/index.html';
            }

            loginForm.reset();
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (!name || !email || !password || !confirmPassword) {
                alert('Por favor, completa todos los campos.');
                return;
            }
            if (!/^\S+@\S+\.\S+$/.test(email)) {
                alert('Por favor, ingresa un correo válido.');
                return;
            }
            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden. Por favor, verifica.');
                return;
            }

            alert(`Registro exitoso para ${name} (${email})`);
            registerForm.reset();
        });
    }
}

const slides = document.querySelectorAll('.carrusel-slides img');
if (slides.length > 0) {
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
    }

    function moveSlide(direction) {
        currentSlide += direction;
        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        } else if (currentSlide >= slides.length) {
            currentSlide = 0;
        }
        showSlide(currentSlide);
    }

    showSlide(currentSlide);
}
document.querySelector('.universal-menu').addEventListener('click', function(event) {
    if (event.target.closest('#authToggle')) {
        toggleSubmenu(event, 'auth-submenu');
    }
});
// Mostrar el modal al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const promoModal = document.getElementById('promoModal');
    const closeBtn = document.querySelector('.close-btn');

    // Mostrar el modal
    if (promoModal) {
        promoModal.style.display = 'flex';
    }

    // Cerrar el modal al hacer clic en el botón (X)
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            promoModal.style.display = 'none';
        });
    }

    // Opcional: Cerrar el modal al hacer clic fuera de la imagen
    promoModal.addEventListener('click', function(event) {
        if (event.target === promoModal) {
            promoModal.style.display = 'none';
        }
    });
});