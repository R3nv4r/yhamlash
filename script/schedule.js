// Lista de códigos de descuento válidos
const validDiscountCodes = {
    'DESCUENTO10': { discount: 10, expires: '2025-12-31' },
    'PROMO2025': { discount: 15, expires: '2025-07-31' }
};

// Precios de los servicios
const servicePrices = {
    'tecnica-clasica': 400,
    'efecto-rimel': 400,
    'volumen-y': 350,
    'hibridas': 350
};

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
    const serviceSelect = document.getElementById('service');
    const discountCodeInput = document.getElementById('discountCode');
    const priceInfo = document.getElementById('priceInfo');
    const basePriceSpan = document.getElementById('basePrice');
    const discountInfo = document.getElementById('discountInfo');
    const discountAmountSpan = document.getElementById('discountAmount');
    const discountPercentageSpan = document.getElementById('discountPercentage');
    const finalPriceSpan = document.getElementById('finalPrice');
    const discountError = document.getElementById('discountError');

    if (appointmentForm) {
        // Actualizar precio cuando se selecciona un servicio
        serviceSelect.addEventListener('change', updatePrice);
        // Actualizar precio cuando se ingresa un código de descuento
        discountCodeInput.addEventListener('input', updatePrice);

        function updatePrice() {
            const service = serviceSelect.value;
            const discountCode = discountCodeInput.value.trim();
            let basePrice = servicePrices[service] || 0;
            let discountPercentage = 0;
            let discountAmount = 0;
            let finalPrice = basePrice;

            // Validar código de descuento
            if (discountCode) {
                const codeInfo = validDiscountCodes[discountCode];
                if (codeInfo) {
                    const expirationDate = new Date(codeInfo.expires);
                    const today = new Date();
                    if (expirationDate >= today) {
                        discountPercentage = codeInfo.discount;
                        discountAmount = (basePrice * discountPercentage) / 100;
                        finalPrice = basePrice - discountAmount;
                        discountError.style.display = 'none';
                    } else {
                        discountError.textContent = 'Código de descuento caducado.';
                        discountError.style.display = 'block';
                        basePrice = 0; // Ocultar precios si el código es inválido
                    }
                } else {
                    discountError.textContent = 'Código de descuento inválido.';
                    discountError.style.display = 'block';
                    basePrice = 0; // Ocultar precios si el código es inválido
                }
            } else {
                discountError.style.display = 'none';
            }

            // Actualizar visualización de precios
            if (basePrice > 0) {
                priceInfo.style.display = 'block';
                basePriceSpan.textContent = basePrice.toFixed(2);
                if (discountPercentage > 0) {
                    discountInfo.style.display = 'block';
                    discountAmountSpan.textContent = discountAmount.toFixed(2);
                    discountPercentageSpan.textContent = discountPercentage;
                } else {
                    discountInfo.style.display = 'none';
                }
                finalPriceSpan.textContent = finalPrice.toFixed(2);
            } else {
                priceInfo.style.display = 'none';
            }
        }

        appointmentForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = document.getElementById('name').value.trim();
            const service = serviceSelect.value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const description = document.getElementById('description').value.trim();
            const discountCode = discountCodeInput.value.trim();

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

            // Validate discount code
            let discountPercentage = 0;
            let basePrice = servicePrices[service] || 0;
            let discountAmount = 0;
            let finalPrice = basePrice;

            if (discountCode) {
                const codeInfo = validDiscountCodes[discountCode];
                if (!codeInfo) {
                    discountError.textContent = 'Código de descuento inválido.';
                    discountError.style.display = 'block';
                    return;
                }
                const expirationDate = new Date(codeInfo.expires);
                const today = new Date();
                if (expirationDate < today) {
                    discountError.textContent = 'Código de descuento caducado.';
                    discountError.style.display = 'block';
                    return;
                }
                discountPercentage = codeInfo.discount;
                discountAmount = (basePrice * discountPercentage) / 100;
                finalPrice = basePrice - discountAmount;
                discountError.style.display = 'none';
            } else {
                discountError.style.display = 'none';
            }

            const appointment = {
                id: Date.now(), // Usar timestamp como ID único
                name: name,
                service: service,
                date: date,
                time: time,
                description: description || 'Ninguna',
                discountCode: discountCode || null,
                discount: discountPercentage || 0,
                basePrice: basePrice,
                discountAmount: discountAmount,
                finalPrice: finalPrice
            };

            // Guardar la cita en localStorage
            saveAppointment(appointment);

            // Limpiar el formulario
            appointmentForm.reset();
            discountError.style.display = 'none';
            priceInfo.style.display = 'none'; // Ocultar información de precios

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
        const now = new Date(); // Fecha actual dinámica
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
                <br>Precio base: $${appointment.basePrice.toFixed(2)}
                ${appointment.discountCode ? `<br>Código de descuento: ${appointment.discountCode} ($${appointment.discountAmount.toFixed(2)} - ${appointment.discount}% aplicado)` : ''}
                <br>Precio final: $${appointment.finalPrice.toFixed(2)}
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