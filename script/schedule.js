// Cargar citas desde localStorage al iniciar
document.addEventListener('DOMContentLoaded', function() {
    // Determinar si estamos en schedule.html o next-appointment.html
    const isSchedulePage = window.location.pathname.includes('/pages/schedule.html');
    const isNextAppointmentPage = window.location.pathname.includes('/pages/next-appointment.html');
    const timeSelect = document.getElementById('time');
    if (timeSelect && timeSelect.tagName === 'SELECT') {
        for (let hour = 10; hour <= 18; hour++) {
            timeSelect.add(new Option(`${hour}:00`, `${hour}:00`));
            timeSelect.add(new Option(`${hour}:30`, `${hour}:30`));
        }
    }
    if (isSchedulePage) {
        loadAppointments('all'); // Mostrar todas las citas en schedule.html
    } else if (isNextAppointmentPage) {
        loadAppointments('future'); // Mostrar solo citas futuras en next-appointment.html
    }

    // Manejar el formulario de agendar cita (solo en schedule.html)
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = document.getElementById('name').value.trim();
            const service = document.getElementById('service').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const description = document.getElementById('description').value.trim();

            // Validation
            if (!name || !service || !date || !time) {
                alert('Por favor, completa todos los campos obligatorios.');
                return;
            }

            // Validate time range (10:00 to 18:00)
            const [hours, minutes] = time.split(':').map(Number);
            if (hours < 10 || hours > 18 || (hours === 18 && minutes > 0)) {
                alert('Las citas solo pueden registrarse de 10:00 a 18:00.');
                return;
            }

            // Validate 30-minute intervals
            if (minutes % 30 !== 0) {
                alert('Las citas solo pueden registrarse en intervalos de 30 minutos (ej. 10:00, 10:30).');
                return;
            }

            // Check for duplicate booking
            let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
            const isDuplicate = appointments.some(appointment => 
                appointment.date === date && appointment.time === time
            );
            if (isDuplicate) {
                alert('Ya existe una cita programada para esta fecha y hora. Por favor, elige otro horario.');
                return;
            }

            const appointment = {
                id: Date.now(), // Usar timestamp como ID único
                name: name,
                service: service,
                date: date,
                time: time,
                description: description || 'Ninguna'
            };

            // Guardar la cita en localStorage
            saveAppointment(appointment);

            // Limpiar el formulario
            appointmentForm.reset();

            // Recargar la lista de citas
            loadAppointments('all');
        });
    }
});

// Guardar una cita en localStorage
function saveAppointment(appointment) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

// Cargar y mostrar las citas desde localStorage
function loadAppointments(filter = 'all') {
    const appointmentList = document.getElementById('appointmentList');
    if (appointmentList) {
        appointmentList.innerHTML = ''; // Limpiar la lista
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

        // Filtrar citas según el parámetro
        const now = new Date(); // Fecha actual dinámica (09:18 PM CST, June 09, 2025)
        if (filter === 'future') {
            appointments = appointments.filter(appointment => {
                const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
                return appointmentDateTime > now;
            });
        }

        // Ordenar citas por fecha y hora
        appointments.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

        // Mostrar citas
        appointments.forEach(appointment => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${appointment.name} - ${appointment.service} - ${appointment.date} a las ${appointment.time} 
                ${appointment.description ? `<br>Descripción: ${appointment.description}` : ''}
                <button onclick="deleteAppointment(${appointment.id})">Eliminar</button>
            `;
            appointmentList.appendChild(li);
        });

        // Mostrar un mensaje si no hay citas
        if (appointments.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No hay citas.';
            li.style.backgroundColor = '#F3EBEF';
            li.style.padding = '15px';
            li.style.borderRadius = '4px';
            li.style.textAlign = 'center';
            appointmentList.appendChild(li);
        }
    }
}

// Eliminar una cita
function deleteAppointment(id) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    appointments = appointments.filter(appointment => appointment.id !== id);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    // Determinar qué tipo de citas recargar según la página
    const isNextAppointmentPage = window.location.pathname.includes('/pages/next-appointment.html');
    loadAppointments(isNextAppointmentPage ? 'future' : 'all');
}