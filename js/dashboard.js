document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Por favor, inicia sesión primero');
        window.location.href = '../index.html';
        return;
    }

    async function loadEvents() {
        try {
            const response = await fetch('http://localhost:3000/api/events', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('No se pudo obtener la lista de eventos');
            }

            const events = await response.json();
            const eventsContainer = document.getElementById('eventsContainer');
            eventsContainer.innerHTML = '';

            events.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event';
                eventElement.innerHTML = `
                    <h3>Evento: ${event.name}</h3>
                    <p>Fecha: ${event.date}</p>
                    <p>Hora: ${event.time}</p>
                    <p>Descripción: ${event.description}</p>
                    <p>Invitados Especiales: ${event.special_guests}</p>
                    <p>Costo: ${event.cost}</p>
                    <p>Ubicación: ${event.location}</p>
                    <p>Estado: ${event.status}</p>
                    <button class="registerBtn" data-event-id="${event.id}">Registrarse</button>
                    <p>Registrados: <span class="registrationCount" data-event-id="${event.id}">0</span></p>
                `;
                eventsContainer.appendChild(eventElement);
            });

            await loadRegistrationCounts();
        } catch (error) {
            console.error('Error cargando eventos:', error);
            alert('Hubo un error al cargar los eventos');
        }
    }

    async function loadRegistrationCounts() {
        try {
            const response = await fetch('http://localhost:3000/api/event_registrations/count', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('No se pudo obtener el conteo de registros');
            }

            const registrationCounts = await response.json();
            registrationCounts.forEach(count => {
                const countSpan = document.querySelector(`.registrationCount[data-event-id="${count.event_id}"]`);
                if (countSpan) {
                    countSpan.textContent = count.count;
                }
            });
        } catch (error) {
            console.error('Error cargando conteo de registros:', error);
        }
    }

    await loadEvents();

    const modal = document.getElementById('addEventModal');
    const btn = document.getElementById('addEventBtn');
    const span = document.getElementsByClassName('close')[0];
    const form = document.getElementById('addEventForm');

    btn.onclick = function() {
        modal.style.display = 'block';
    }

    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    form.onsubmit = async function(event) {
        event.preventDefault();

        const eventData = {
            name: document.getElementById('name').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            description: document.getElementById('description').value,
            special_guests: document.getElementById('special_guests').value,
            cost: document.getElementById('cost').value,
            location: document.getElementById('location').value,
            status: document.getElementById('status').value
        };

        try {
            const response = await fetch('http://localhost:3000/api/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                alert('Evento agregado exitosamente');
                await loadEvents();
                modal.style.display = 'none';
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Error al agregar evento:', error);
        }
    }

    const registerEventModal = document.getElementById('registerEventModal');
    const registerEventForm = document.getElementById('registerEventForm');

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('registerBtn')) {
            const eventId = e.target.getAttribute('data-event-id');
            document.getElementById('registerEventId').value = eventId;
            registerEventModal.style.display = 'block';
        }
    });

    document.getElementsByClassName('close')[1].onclick = function() {
        registerEventModal.style.display = 'none';
    }

    registerEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = 7; 
        const eventId = document.getElementById('registerEventId').value;

        const response = await fetch('http://localhost:3000/api/event_registrations/register', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userId, event_id: eventId })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Registrado exitosamente');
            registerEventModal.style.display = 'none';
            const countSpan = document.querySelector(`.registrationCount[data-event-id="${eventId}"]`);
            countSpan.textContent = parseInt(countSpan.textContent) + 1;
        } else {
            alert(result.message);
        }
    });

    let map;
    let marker;

    const openMapBtn = document.getElementById('openMapBtn');
    const mapContainer = document.getElementById('map');
    const locationInput = document.getElementById('location');

    openMapBtn.onclick = function() {

        mapContainer.style.display = 'block';

        if (!map) {

            const loader = new google.maps.plugins.loader.Loader({
                apiKey: 'AIzaSyCOZe6Pc_SVA2ZHWX2RfEcOqVzZpHtWNBE',
                version: 'weekly',
            });

            loader.load().then(() => {
                map = new google.maps.Map(mapContainer, {
                    center: { lat: -34.397, lng: 150.644 },
                    zoom: 8,
                });

                map.addListener('click', (event) => {
                    const latLng = event.latLng;
                    if (marker) {
                        marker.setPosition(latLng);
                    } else {
                        marker = new google.maps.Marker({
                            position: latLng,
                            map: map,
                        });
                    }

                    locationInput.value = `${latLng.lat()}, ${latLng.lng()}`;
                });
            });
        }
    }

});
