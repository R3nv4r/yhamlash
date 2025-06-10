document.addEventListener('DOMContentLoaded', function() {
    const adminAuth = document.getElementById('adminAuth');
    const adminTable = document.querySelector('.admin-table');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const appointmentsTable = document.getElementById('appointmentsTable');
    const adminPassword = document.getElementById('adminPassword');
    const addAdminBtn = document.getElementById('addAdminBtn');
    const newAdminUsername = document.getElementById('newAdminUsername');
    const newAdminPassword = document.getElementById('newAdminPassword');

    // Initialize or load admin credentials from localStorage
    let admins = JSON.parse(localStorage.getItem('admins')) || [{ username: 'admin', password: 'admin123' }];

    // Simple admin authentication
    adminLoginBtn.addEventListener('click', function() {
        const admin = admins.find(a => a.username === 'admin' && a.password === adminPassword.value);
        if (admin) {
            adminAuth.style.display = 'none';
            adminTable.style.display = 'block';
            loadAppointments();
        } else {
            alert('Contraseña incorrecta. Intenta de nuevo.');
        }
    });

    // Add new admin
    addAdminBtn.addEventListener('click', function() {
        const username = newAdminUsername.value.trim();
        const password = newAdminPassword.value.trim();

        if (!username || !password) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        if (admins.some(a => a.username === username)) {
            alert('Este nombre de usuario ya está en uso.');
            return;
        }

        admins.push({ username, password });
        localStorage.setItem('admins', JSON.stringify(admins));
        alert(`Administrador ${username} añadido exitosamente.`);
        newAdminUsername.value = '';
        newAdminPassword.value = '';
    });

    function loadAppointments() {
        const tbody = appointmentsTable.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing rows
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

        appointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.id}</td>
                <td>${appointment.name}</td>
                <td>${getServiceName(appointment.service)}</td>
                <td>${appointment.date}</td>
                <td>${appointment.time}</td>
                <td>${appointment.description || 'Ninguna'}</td>
            `;
            tbody.appendChild(row);
        });

        if (appointments.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="6" style="text-align: center;">No hay citas registradas.</td>';
            tbody.appendChild(row);
        }
    }

    function getServiceName(serviceValue) {
        const serviceMap = {
            'tecnica-clasica': 'Técnica clásica - $400.00',
            'efecto-rimel': 'Efecto Rímel - $400.00',
            'volumen-y': 'Volumen Y (Hawaiano) - $350.00',
            'hibridas': 'Híbridas - $350.00'
        };
        return serviceMap[serviceValue] || serviceValue;
    }

    downloadPdfBtn.addEventListener('click', function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const table = document.getElementById('appointmentsTable');

        doc.autoTable({
            html: '#appointmentsTable',
            startY: 20,
            theme: 'striped',
            headStyles: { fillColor: [170, 66, 139] },
            bodyStyles: { textColor: [170, 66, 139] },
            alternateRowStyles: { fillColor: [223, 204, 234] }
        });

        doc.save('citas_admin.pdf');
    });

    // Ensure user is logged in
    if (typeof updateUIBasedOnLogin === 'function') {
        updateUIBasedOnLogin();
        if (!localStorage.getItem('isLoggedIn') === 'true') {
            window.location.href = '/pages/login.html';
        }
    }
});