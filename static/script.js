// =============================================
// CONFIGURACION
// =============================================
const API = 'http://localhost:5000/api';
let usuario = null;
let rol = null;
let editando = null;

// =============================================
// LOGIN
// =============================================
async function login(e) {
    e.preventDefault();
    const email = document.getElementById('login-user').value;
    const password = document.getElementById('login-pass').value;

    try {
        const res = await fetch(API + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
            usuario = data.user;
            rol = usuario.rol;
            entrar();
        } else {
            notificar('Credenciales incorrectas', 'error');
        }
    } catch (error) {
        notificar('Error al conectar con el servidor', 'error');
    }
}

function entrar() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('rol-label').textContent = '👤 ' + rol.toUpperCase();

    if (rol === 'admin') {
        document.getElementById('tab-admin').style.display = 'inline-block';
        document.querySelectorAll('.btn-admin').forEach(b => b.style.display = 'inline-block');
    } else {
        document.getElementById('tab-admin').style.display = 'none';
        document.querySelectorAll('.btn-admin').forEach(b => b.style.display = 'none');
    }

    notificar('Bienvenido ' + usuario.nombre, 'success');
    cargarClientes();
    cargarPaquetes();
    cargarReservaciones();
    cargarGuias();
    cargarDestinos();
}

function logout() {
    document.getElementById('app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    notificar('Sesión cerrada', 'info');
}

// =============================================
// NOTIFICACIONES
// =============================================
function notificar(msg, tipo) {
    const el = document.getElementById('notificacion');
    el.textContent = msg;
    el.className = 'notificacion ' + tipo + ' show';
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2500);
}

// =============================================
// TABS
// =============================================
function cambiarTab(tab) {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector('.tabs button[onclick*="' + tab + '"]');
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
}

// =============================================
// API
// =============================================
async function apiGet(e) {
    try {
        const r = await fetch(API + '/' + e);
        return await r.json();
    } catch { return []; }
}

async function apiPost(e, d) {
    const r = await fetch(API + '/' + e, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d)
    });
    return await r.json();
}

async function apiPut(e, i, d) {
    const r = await fetch(API + '/' + e + '/' + i, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d)
    });
    return await r.json();
}

async function apiDelete(e, i) {
    await fetch(API + '/' + e + '/' + i, { method: 'DELETE' });
}

// =============================================
// CLIENTES
// =============================================
async function cargarClientes() {
    const data = await apiGet('clientes');
    const t = document.getElementById('tabla-clientes');
    if (!data.length) {
        t.innerHTML = '<tr><td colspan="5" class="text-center">No hay clientes</td></tr>';
        return;
    }
    t.innerHTML = data.map(c => `
        <tr>
            <td>${c.nombre} ${c.apellido || ''}</td>
            <td>${c.email}</td>
            <td>${c.telefono || '-'}</td>
            <td>${c.rol || 'cliente'}</td>
            <td>
                ${rol === 'admin' ? `
                    <button class="btn-edit" onclick="editar('cliente','${c._id}')">Editar</button>
                    <button class="btn-delete" onclick="eliminar('clientes','${c._id}')">Eliminar</button>
                ` : '<span style="color:#999;font-size:12px;">Solo lectura</span>'}
            </td>
        </tr>
    `).join('');
}

// =============================================
// PAQUETES
// =============================================
async function cargarPaquetes() {
    const data = await apiGet('paquetes');
    const t = document.getElementById('tabla-paquetes');
    if (!data.length) {
        t.innerHTML = '<tr><td colspan="4" class="text-center">No hay paquetes</td></tr>';
        return;
    }
    t.innerHTML = data.map(p => `
        <tr>
            <td>${p.nombre}</td>
            <td>${p.destino}</td>
            <td>$${p.precio?.toFixed(2) || '0'}</td>
            <td>
                ${rol === 'admin' ? `
                    <button class="btn-edit" onclick="editar('paquete','${p._id}')">Editar</button>
                    <button class="btn-delete" onclick="eliminar('paquetes','${p._id}')">Eliminar</button>
                ` : '<span style="color:#999;font-size:12px;">Solo lectura</span>'}
            </td>
        </tr>
    `).join('');
}

// =============================================
// RESERVACIONES
// =============================================
async function cargarReservaciones() {
    const data = await apiGet('reservaciones');
    const t = document.getElementById('tabla-reservaciones');
    if (!data.length) {
        t.innerHTML = '<tr><td colspan="4" class="text-center">No hay reservaciones</td></tr>';
        return;
    }
    t.innerHTML = data.map(r => `
        <tr>
            <td>${r.cliente_id || '-'}</td>
            <td>${r.paquete_id || '-'}</td>
            <td>${r.estado || 'Pendiente'}</td>
            <td>
                ${rol === 'admin' ? `
                    <button class="btn-edit" onclick="editar('reservacion','${r._id}')">Editar</button>
                    <button class="btn-delete" onclick="eliminar('reservaciones','${r._id}')">Eliminar</button>
                ` : '<span style="color:#999;font-size:12px;">Solo lectura</span>'}
            </td>
        </tr>
    `).join('');
}

// =============================================
// GUIAS
// =============================================
async function cargarGuias() {
    const data = await apiGet('guias');
    const t = document.getElementById('tabla-guias');
    if (!data.length) {
        t.innerHTML = '<tr><td colspan="4" class="text-center">No hay guías</td></tr>';
        return;
    }
    t.innerHTML = data.map(g => `
        <tr>
            <td>${g.nombre}</td>
            <td>${g.especialidad}</td>
            <td>${(g.idiomas || []).join(', ')}</td>
            <td>
                ${rol === 'admin' ? `
                    <button class="btn-edit" onclick="editar('guia','${g._id}')">Editar</button>
                    <button class="btn-delete" onclick="eliminar('guias','${g._id}')">Eliminar</button>
                ` : '<span style="color:#999;font-size:12px;">Solo lectura</span>'}
            </td>
        </tr>
    `).join('');
}

// =============================================
// DESTINOS
// =============================================
async function cargarDestinos() {
    const data = await apiGet('destinos');
    const t = document.getElementById('tabla-destinos');
    if (!data.length) {
        t.innerHTML = '<tr><td colspan="4" class="text-center">No hay destinos</td></tr>';
        return;
    }
    t.innerHTML = data.map(d => `
        <tr>
            <td>${d.nombre}</td>
            <td>${d.region}</td>
            <td>${d.popularidad || '-'}</td>
            <td>
                ${rol === 'admin' ? `
                    <button class="btn-edit" onclick="editar('destino','${d._id}')">Editar</button>
                    <button class="btn-delete" onclick="eliminar('destinos','${d._id}')">Eliminar</button>
                ` : '<span style="color:#999;font-size:12px;">Solo lectura</span>'}
            </td>
        </tr>
    `).join('');
}

// =============================================
// ELIMINAR
// =============================================
async function eliminar(endpoint, id) {
    if (!confirm('¿Eliminar?')) return;
    await apiDelete(endpoint, id);
    notificar('Eliminado', 'success');
    if (endpoint === 'clientes') cargarClientes();
    else if (endpoint === 'paquetes') cargarPaquetes();
    else if (endpoint === 'reservaciones') cargarReservaciones();
    else if (endpoint === 'guias') cargarGuias();
    else if (endpoint === 'destinos') cargarDestinos();
}

// =============================================
// MODAL
// =============================================
function abrirModal(tipo, data) {
    if (rol !== 'admin') {
        notificar('Solo administradores pueden crear', 'error');
        return;
    }

    editando = data?._id || null;
    const modal = document.getElementById('modal');
    const titulo = document.getElementById('modal-titulo');
    const body = document.getElementById('modal-body');

    let html = '';
    if (tipo === 'cliente') {
        titulo.textContent = data ? 'Editar Cliente' : 'Nuevo Cliente';
        html = `
            <label>Nombre</label><input id="f-nombre" value="${data?.nombre || ''}">
            <label>Apellido</label><input id="f-apellido" value="${data?.apellido || ''}">
            <label>Email</label><input id="f-email" value="${data?.email || ''}">
            <label>Teléfono</label><input id="f-telefono" value="${data?.telefono || ''}">
            <label>Rol</label>
            <select id="f-rol">
                <option value="cliente" ${data?.rol === 'cliente' ? 'selected' : ''}>Cliente</option>
                <option value="admin" ${data?.rol === 'admin' ? 'selected' : ''}>Admin</option>
            </select>
        `;
    } else if (tipo === 'paquete') {
        titulo.textContent = data ? 'Editar Paquete' : 'Nuevo Paquete';
        html = `
            <label>Nombre</label><input id="f-nombre" value="${data?.nombre || ''}">
            <label>Destino</label><input id="f-destino" value="${data?.destino || ''}">
            <label>Precio</label><input id="f-precio" type="number" step="0.01" value="${data?.precio || ''}">
            <label>Duración (días)</label><input id="f-duracion" type="number" value="${data?.duracion || 1}">
        `;
    } else if (tipo === 'reservacion') {
        titulo.textContent = data ? 'Editar Reservación' : 'Nueva Reservación';
        html = `
            <label>ID Cliente</label><input id="f-cliente" value="${data?.cliente_id || ''}">
            <label>ID Paquete</label><input id="f-paquete" value="${data?.paquete_id || ''}">
            <label>Estado</label>
            <select id="f-estado">
                <option value="Pendiente" ${data?.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="Confirmada" ${data?.estado === 'Confirmada' ? 'selected' : ''}>Confirmada</option>
                <option value="Cancelada" ${data?.estado === 'Cancelada' ? 'selected' : ''}>Cancelada</option>
            </select>
        `;
    } else if (tipo === 'guia') {
        titulo.textContent = data ? 'Editar Guía' : 'Nuevo Guía';
        html = `
            <label>Nombre</label><input id="f-nombre" value="${data?.nombre || ''}">
            <label>Especialidad</label><input id="f-especialidad" value="${data?.especialidad || ''}">
            <label>Idiomas (separados por coma)</label><input id="f-idiomas" value="${(data?.idiomas || []).join(', ')}">
            <label>Teléfono</label><input id="f-telefono" value="${data?.telefono || ''}">
        `;
    } else if (tipo === 'destino') {
        titulo.textContent = data ? 'Editar Destino' : 'Nuevo Destino';
        html = `
            <label>Nombre</label><input id="f-nombre" value="${data?.nombre || ''}">
            <label>Región</label><input id="f-region" value="${data?.region || ''}">
            <label>Clima</label><input id="f-clima" value="${data?.clima || ''}">
            <label>Popularidad (1-10)</label><input id="f-popularidad" type="number" value="${data?.popularidad || 5}">
        `;
    }

    body.innerHTML = html;
    modal._tipo = tipo;
    modal.classList.add('show');
}

function cerrarModal() {
    document.getElementById('modal').classList.remove('show');
    editando = null;
}

async function editar(tipo, id) {
    const e = tipo === 'cliente' ? 'clientes' : 
             tipo === 'paquete' ? 'paquetes' : 
             tipo === 'reservacion' ? 'reservaciones' :
             tipo === 'guia' ? 'guias' : 'destinos';
    const data = await apiGet(e + '/' + id);
    if (data) abrirModal(tipo, data);
}

// =============================================
// GUARDAR
// =============================================
async function guardar(e) {
    e.preventDefault();
    const tipo = document.getElementById('modal')._tipo;
    let endpoint = '', data = {};

    if (tipo === 'cliente') {
        endpoint = 'clientes';
        data = {
            nombre: document.getElementById('f-nombre').value,
            apellido: document.getElementById('f-apellido').value,
            email: document.getElementById('f-email').value,
            telefono: document.getElementById('f-telefono').value,
            rol: document.getElementById('f-rol').value
        };
    } else if (tipo === 'paquete') {
        endpoint = 'paquetes';
        data = {
            nombre: document.getElementById('f-nombre').value,
            destino: document.getElementById('f-destino').value,
            precio: parseFloat(document.getElementById('f-precio').value),
            duracion: parseInt(document.getElementById('f-duracion').value) || 1,
            activo: true
        };
    } else if (tipo === 'reservacion') {
        endpoint = 'reservaciones';
        data = {
            cliente_id: document.getElementById('f-cliente').value,
            paquete_id: document.getElementById('f-paquete').value,
            estado: document.getElementById('f-estado').value,
            fecha_reserva: new Date().toISOString()
        };
    } else if (tipo === 'guia') {
        endpoint = 'guias';
        const idiomas = document.getElementById('f-idiomas').value;
        data = {
            nombre: document.getElementById('f-nombre').value,
            especialidad: document.getElementById('f-especialidad').value,
            idiomas: idiomas ? idiomas.split(',').map(s => s.trim()) : [],
            telefono: document.getElementById('f-telefono').value,
            disponible: true
        };
    } else if (tipo === 'destino') {
        endpoint = 'destinos';
        data = {
            nombre: document.getElementById('f-nombre').value,
            region: document.getElementById('f-region').value,
            clima: document.getElementById('f-clima').value,
            popularidad: parseInt(document.getElementById('f-popularidad').value) || 5
        };
    }

    if (editando) {
        await apiPut(endpoint, editando, data);
        notificar('Actualizado', 'success');
    } else {
        await apiPost(endpoint, data);
        notificar('Creado', 'success');
    }

    cerrarModal();
    if (endpoint === 'clientes') cargarClientes();
    else if (endpoint === 'paquetes') cargarPaquetes();
    else if (endpoint === 'reservaciones') cargarReservaciones();
    else if (endpoint === 'guias') cargarGuias();
    else if (endpoint === 'destinos') cargarDestinos();
}

// =============================================
// ADMIN
// =============================================
function ejecutar(tipo) {
    const r = document.getElementById('admin-resultado');
    const msgs = {
        usuarios: '👤 Usuarios creados:\n- admin_agencia (Admin)\n- user_app (App)',
        indices: '📊 Índices creados:\n- { email: 1 } en clientes\n- { destino: 1, precio: -1 } en paquetes',
        datos: '📥 Datos cargados:\n- 21 clientes\n- 20 paquetes\n- 20 reservaciones\n- 20 guías\n- 20 destinos'
    };
    r.textContent = msgs[tipo] || 'Ejecutado';
    notificar('Ejecutado', 'success');
}
