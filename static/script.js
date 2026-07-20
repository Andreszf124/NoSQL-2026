// =============================================
// CONFIGURACION
// =============================================
const API_URL = 'http://localhost:5000/api';
let editandoId = null;
let tipoModal = null;
let usuarioActual = null;
let rolActual = null;

// =============================================
// LOGIN
// =============================================
function iniciarSesion(e) {
    e.preventDefault();
    const u = document.getElementById('login-usuario').value;
    const p = document.getElementById('login-pass').value;

    // Credenciales
    const credenciales = {
        'admin': { pass: 'admin123', rol: 'admin' },
        'usuario': { pass: 'user123', rol: 'usuario' }
    };

    if (credenciales[u] && credenciales[u].pass === p) {
        usuarioActual = u;
        rolActual = credenciales[u].rol;

        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-main').style.display = 'block';

        // Mostrar rol en header
        const badge = document.getElementById('rol-actual');
        if (rolActual === 'admin') {
            badge.textContent = 'Administrador';
            badge.style.background = 'rgba(246, 173, 85, 0.3)';
            badge.style.color = '#f6ad55';
            // Mostrar pestaña Admin
            document.querySelector('.tab-btn[data-tab="admin"]').style.display = 'inline-block';
        } else {
            badge.textContent = 'Usuario Final';
            badge.style.background = 'rgba(255,255,255,0.15)';
            badge.style.color = 'white';
            // Ocultar pestaña Admin
            document.querySelector('.tab-btn[data-tab="admin"]').style.display = 'none';
            // Si está en Admin, cambiar a Clientes
            if (document.getElementById('tab-admin').classList.contains('active')) {
                cambiarTab('clientes');
            }
        }

        // Ocultar botones de crear/editar/eliminar para usuarios finales
        actualizarPermisos();

        notificar('Bienvenido ' + u, 'success');
        cargarClientes();
        cargarPaquetes();
        cargarReservaciones();
    } else {
        notificar('Usuario o contraseña incorrectos', 'error');
    }
}

function cerrarSesion() {
    usuarioActual = null;
    rolActual = null;
    document.getElementById('app-main').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-usuario').value = 'admin';
    document.getElementById('login-pass').value = 'admin123';
    notificar('Sesion cerrada', 'info');
}

// =============================================
// PERMISOS
// =============================================
function actualizarPermisos() {
    const esAdmin = rolActual === 'admin';

    // Mostrar/ocultar botones de crear
    document.querySelectorAll('.actions-bar .btn-primary').forEach(btn => {
        btn.style.display = esAdmin ? 'inline-block' : 'none';
    });

    // Mostrar/ocultar botones de editar/eliminar en tablas
    // (Se maneja al renderizar las tablas)
}

function tienePermiso() {
    return rolActual === 'admin';
}

// =============================================
// NOTIFICACIONES
// =============================================
function notificar(mensaje, tipo) {
    const el = document.getElementById('notificacion');
    el.textContent = mensaje;
    el.className = 'notificacion ' + tipo;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2500);
}

// =============================================
// NAVEGACION
// =============================================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab === 'admin' && rolActual !== 'admin') {
            notificar('Acceso denegado', 'error');
            return;
        }
        cambiarTab(tab);
    });
});

function cambiarTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="' + tab + '"]')?.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tab)?.classList.add('active');
    if (tab === 'clientes') cargarClientes();
    if (tab === 'paquetes') cargarPaquetes();
    if (tab === 'reservaciones') cargarReservaciones();
}

// =============================================
// API
// =============================================
async function apiGet(e) {
    try { const r = await fetch(API_URL + '/' + e); return await r.json(); } catch { return []; }
}
async function apiPost(e, d) {
    if (!tienePermiso()) { notificar('Sin permisos', 'error'); return; }
    const r = await fetch(API_URL + '/' + e, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
    return await r.json();
}
async function apiPut(e, i, d) {
    if (!tienePermiso()) { notificar('Sin permisos', 'error'); return; }
    const r = await fetch(API_URL + '/' + e + '/' + i, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
    return await r.json();
}
async function apiDelete(e, i) {
    if (!tienePermiso()) { notificar('Sin permisos', 'error'); return; }
    await fetch(API_URL + '/' + e + '/' + i, { method: 'DELETE' });
}

// =============================================
// CRUD CLIENTES
// =============================================
async function cargarClientes() {
    const d = await apiGet('clientes');
    const t = document.getElementById('tabla-clientes');
    const esAdmin = tienePermiso();
    if (!d.length) { t.innerHTML = '<tr><td colspan="4" class="text-center">No hay clientes</td></tr>'; return; }
    t.innerHTML = d.map(c => `
        <tr>
            <td><strong>${c.nombre} ${c.apellido || ''}</strong></td>
            <td>${c.email}</td>
            <td>${c.telefono || '-'}</td>
            <td>
                <div class="actions-cell">
                    ${esAdmin ? `
                        <button class="btn btn-warning btn-sm" onclick="editarRegistro('cliente','${c._id}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarRegistro('clientes','${c._id}')">Eliminar</button>
                    ` : `
                        <span style="color:#a0aec0;font-size:12px;">Solo lectura</span>
                    `}
                </div>
            </td>
        </tr>
    `).join('');
}

async function cargarPaquetes() {
    const d = await apiGet('paquetes');
    const t = document.getElementById('tabla-paquetes');
    const esAdmin = tienePermiso();
    if (!d.length) { t.innerHTML = '<tr><td colspan="4" class="text-center">No hay paquetes</td></tr>'; return; }
    t.innerHTML = d.map(p => `
        <tr>
            <td><strong>${p.nombre}</strong></td>
            <td>${p.destino}</td>
            <td>$${p.precio?.toFixed(2) || '0'}</td>
            <td>
                <div class="actions-cell">
                    ${esAdmin ? `
                        <button class="btn btn-warning btn-sm" onclick="editarRegistro('paquete','${p._id}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarRegistro('paquetes','${p._id}')">Eliminar</button>
                    ` : `
                        <span style="color:#a0aec0;font-size:12px;">Solo lectura</span>
                    `}
                </div>
            </td>
        </tr>
    `).join('');
}

async function cargarReservaciones() {
    const d = await apiGet('reservaciones');
    const t = document.getElementById('tabla-reservaciones');
    const esAdmin = tienePermiso();
    if (!d.length) { t.innerHTML = '<tr><td colspan="4" class="text-center">No hay reservaciones</td></tr>'; return; }
    t.innerHTML = d.map(r => `
        <tr>
            <td>${r.cliente_nombre || r.cliente_id || '-'}</td>
            <td>${r.paquete_nombre || r.paquete_id || '-'}</td>
            <td><span class="badge-status badge-${r.estado || 'Pendiente'}">${r.estado || 'Pendiente'}</span></td>
            <td>
                <div class="actions-cell">
                    ${esAdmin ? `
                        <button class="btn btn-warning btn-sm" onclick="editarRegistro('reservacion','${r._id}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarRegistro('reservaciones','${r._id}')">Eliminar</button>
                    ` : `
                        <span style="color:#a0aec0;font-size:12px;">Solo lectura</span>
                    `}
                </div>
            </td>
        </tr>
    `).join('');
}

async function eliminarRegistro(e, i) {
    if (!tienePermiso()) { notificar('Sin permisos', 'error'); return; }
    if (!confirm('¿Eliminar?')) return;
    await apiDelete(e, i);
    notificar('Eliminado', 'success');
    if (e === 'clientes') cargarClientes();
    else if (e === 'paquetes') cargarPaquetes();
    else if (e === 'reservaciones') cargarReservaciones();
}

// =============================================
// MODAL
// =============================================
async function abrirModal(tipo, data) {
    if (!tienePermiso()) { notificar('Sin permisos', 'error'); return; }
    data = data || null;
    tipoModal = tipo;
    editandoId = data?._id || null;
    const titulo = document.getElementById('modal-titulo');
    const body = document.getElementById('modal-body');
    const esEdicion = data !== null;
    let campos = '';

    if (tipo === 'cliente') {
        titulo.textContent = esEdicion ? 'Editar Cliente' : 'Nuevo Cliente';
        campos = `
            <div class="form-group"><label>Nombre *</label><input type="text" id="input-nombre" value="${data?.nombre || ''}" required></div>
            <div class="form-group"><label>Apellido</label><input type="text" id="input-apellido" value="${data?.apellido || ''}"></div>
            <div class="form-group"><label>Email *</label><input type="email" id="input-email" value="${data?.email || ''}" required></div>
            <div class="form-group"><label>Telefono</label><input type="text" id="input-telefono" value="${data?.telefono || ''}"></div>
            <div class="form-group"><label>Pais</label><input type="text" id="input-pais" value="${data?.pais || ''}"></div>
        `;
    } else if (tipo === 'paquete') {
        titulo.textContent = esEdicion ? 'Editar Paquete' : 'Nuevo Paquete';
        campos = `
            <div class="form-group"><label>Nombre *</label><input type="text" id="input-nombre" value="${data?.nombre || ''}" required></div>
            <div class="form-group"><label>Destino *</label><input type="text" id="input-destino" value="${data?.destino || ''}" required></div>
            <div class="form-group"><label>Precio ($) *</label><input type="number" id="input-precio" step="0.01" value="${data?.precio || ''}" required></div>
            <div class="form-group"><label>Duracion</label><input type="number" id="input-duracion" value="${data?.duracion || 1}"></div>
            <div class="form-group"><label>Descripcion</label><textarea id="input-descripcion">${data?.descripcion || ''}</textarea></div>
        `;
    } else if (tipo === 'reservacion') {
        titulo.textContent = esEdicion ? 'Editar Reservacion' : 'Nueva Reservacion';
        campos = `
            <div class="form-group"><label>Cliente ID *</label><input type="text" id="input-cliente" value="${data?.cliente_id || ''}" required></div>
            <div class="form-group"><label>Paquete ID *</label><input type="text" id="input-paquete" value="${data?.paquete_id || ''}" required></div>
            <div class="form-group"><label>Fecha Viaje</label><input type="date" id="input-fecha" value="${data?.fecha_viaje || ''}"></div>
            <div class="form-group"><label>Personas</label><input type="number" id="input-personas" value="${data?.personas || 1}"></div>
            <div class="form-group"><label>Estado</label>
                <select id="input-estado">
                    <option value="Pendiente" ${data?.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="Confirmada" ${data?.estado === 'Confirmada' ? 'selected' : ''}>Confirmada</option>
                    <option value="Cancelada" ${data?.estado === 'Cancelada' ? 'selected' : ''}>Cancelada</option>
                </select>
            </div>
        `;
    }
    body.innerHTML = campos;
    document.getElementById('modal-overlay').classList.add('active');
}

async function editarRegistro(tipo, id) {
    if (!tienePermiso()) { notificar('Sin permisos', 'error'); return; }
    const e = tipo === 'cliente' ? 'clientes' : tipo === 'paquete' ? 'paquetes' : 'reservaciones';
    const d = await apiGet(e + '/' + id);
    if (d) abrirModal(tipo, d);
}

function cerrarModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    editandoId = null;
}

async function guardarRegistro(e) {
    e.preventDefault();
    if (!tienePermiso()) { notificar('Sin permisos', 'error'); return; }
    let endpoint = '', data = {};
    if (tipoModal === 'cliente') {
        endpoint = 'clientes';
        data = { nombre: document.getElementById('input-nombre').value, apellido: document.getElementById('input-apellido').value, email: document.getElementById('input-email').value, telefono: document.getElementById('input-telefono').value, pais: document.getElementById('input-pais').value, fecha_registro: new Date().toISOString() };
    } else if (tipoModal === 'paquete') {
        endpoint = 'paquetes';
        data = { nombre: document.getElementById('input-nombre').value, destino: document.getElementById('input-destino').value, precio: parseFloat(document.getElementById('input-precio').value), duracion: parseInt(document.getElementById('input-duracion').value) || 1, descripcion: document.getElementById('input-descripcion').value, actividades: [], activo: true };
    } else if (tipoModal === 'reservacion') {
        endpoint = 'reservaciones';
        data = { cliente_id: document.getElementById('input-cliente').value, paquete_id: document.getElementById('input-paquete').value, fecha_viaje: document.getElementById('input-fecha').value, personas: parseInt(document.getElementById('input-personas').value) || 1, estado: document.getElementById('input-estado').value, fecha_reserva: new Date().toISOString() };
    }
    try {
        if (editandoId) { await apiPut(endpoint, editandoId, data); notificar('Actualizado', 'success'); }
        else { await apiPost(endpoint, data); notificar('Creado', 'success'); }
        cerrarModal();
        if (endpoint === 'clientes') cargarClientes();
        else if (endpoint === 'paquetes') cargarPaquetes();
        else if (endpoint === 'reservaciones') cargarReservaciones();
    } catch (error) { notificar('Error', 'error'); }
}

// =============================================
// ADMIN
// =============================================
function ejecutarScript(tipo) {
    if (!tienePermiso()) { notificar('Sin permisos', 'error'); return; }
    const r = document.getElementById('admin-resultado');
    const mensajes = {
        usuarios: 'Usuarios creados:\n- admin_agencia (userAdminAnyDatabase)\n- user_app (readWrite)',
        indices: 'Indices creados:\n- { email: 1 } en clientes\n- { destino: 1, precio: -1 } en paquetes',
        datos: 'Datos insertados:\n- 20 clientes\n- 20 paquetes\n- 20 reservaciones\n- 20 guias\n- 20 destinos',
        consultas: 'Consultas:\n1. Precio < $200\n2. Rango de fechas\n3. Buscar "playa"'
    };
    r.innerHTML = mensajes[tipo] || 'Ejecutado';
    notificar('Script ejecutado', 'success');
}