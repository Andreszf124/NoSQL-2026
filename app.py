from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from bson import ObjectId
from config import Database
import json

app = Flask(__name__, static_folder='static')
CORS(app)
db = Database().db

# =============================================
# HELPERS
# =============================================
def convertir_id(doc):
    if doc:
        doc['_id'] = str(doc['_id'])
    return doc

def es_admin(usuario):
    # Verificar si el usuario es administrador
    if not usuario:
        return False
    return usuario.get('rol') == 'admin'

# =============================================
# LOGIN
# =============================================
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    usuario = db.clientes.find_one({'email': email, 'password': password})
    if usuario:
        return jsonify({
            'success': True,
            'user': {
                '_id': str(usuario['_id']),
                'nombre': usuario['nombre'],
                'email': usuario['email'],
                'rol': usuario.get('rol', 'cliente')
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Credenciales incorrectas'}), 401

# =============================================
# CLIENTES (CRUD)
# =============================================
@app.route('/api/clientes', methods=['GET'])
def get_clientes():
    clientes = list(db.clientes.find())
    for c in clientes:
        c['_id'] = str(c['_id'])
    return jsonify(clientes)

@app.route('/api/clientes/<id>', methods=['GET'])
def get_cliente(id):
    cliente = db.clientes.find_one({'_id': ObjectId(id)})
    return jsonify(convertir_id(cliente))

@app.route('/api/clientes', methods=['POST'])
def create_cliente():
    data = request.json
    data['fecha_registro'] = '2026-07-20'
    data['password'] = 'cliente123'
    data['rol'] = 'cliente'
    result = db.clientes.insert_one(data)
    return jsonify({'_id': str(result.inserted_id)}), 201

@app.route('/api/clientes/<id>', methods=['PUT'])
def update_cliente(id):
    data = request.json
    db.clientes.update_one({'_id': ObjectId(id)}, {'$set': data})
    return jsonify({'message': 'Actualizado'})

@app.route('/api/clientes/<id>', methods=['DELETE'])
def delete_cliente(id):
    db.clientes.delete_one({'_id': ObjectId(id)})
    return jsonify({'message': 'Eliminado'})

# =============================================
# PAQUETES (CRUD)
# =============================================
@app.route('/api/paquetes', methods=['GET'])
def get_paquetes():
    paquetes = list(db.paquetes.find())
    for p in paquetes:
        p['_id'] = str(p['_id'])
    return jsonify(paquetes)

@app.route('/api/paquetes/<id>', methods=['GET'])
def get_paquete(id):
    paquete = db.paquetes.find_one({'_id': ObjectId(id)})
    return jsonify(convertir_id(paquete))

@app.route('/api/paquetes', methods=['POST'])
def create_paquete():
    data = request.json
    result = db.paquetes.insert_one(data)
    return jsonify({'_id': str(result.inserted_id)}), 201

@app.route('/api/paquetes/<id>', methods=['PUT'])
def update_paquete(id):
    data = request.json
    db.paquetes.update_one({'_id': ObjectId(id)}, {'$set': data})
    return jsonify({'message': 'Actualizado'})

@app.route('/api/paquetes/<id>', methods=['DELETE'])
def delete_paquete(id):
    db.paquetes.delete_one({'_id': ObjectId(id)})
    return jsonify({'message': 'Eliminado'})
# =============================================
# RESERVACIONES (CRUD)
# =============================================
@app.route('/api/reservaciones', methods=['GET'])
def get_reservaciones():
    # Obtener el cliente_id desde los parámetros de la URL
    cliente_id = request.args.get('cliente_id')
    
    if cliente_id:
        # Filtrar reservaciones de un cliente específico
        reservaciones = list(db.reservaciones.find({'cliente_id': cliente_id}))
    else:
        # Todas las reservaciones (solo admin)
        reservaciones = list(db.reservaciones.find())
    
    for r in reservaciones:
        r['_id'] = str(r['_id'])
        if 'cliente_id' in r and r['cliente_id']:
            r['cliente_id'] = str(r['cliente_id'])
        if 'paquete_id' in r and r['paquete_id']:
            r['paquete_id'] = str(r['paquete_id'])
    return jsonify(reservaciones)

@app.route('/api/reservaciones', methods=['POST'])
def create_reservacion():
    data = request.json
    
    # Verificar si el cliente ya tiene una reservación
    existente = db.reservaciones.find_one({'cliente_id': data.get('cliente_id')})
    if existente:
        return jsonify({'error': 'El cliente ya tiene una reservación'}), 400
    
    result = db.reservaciones.insert_one(data)
    return jsonify({'_id': str(result.inserted_id)}), 201

# =============================================
# GUIAS (CRUD)
# =============================================
@app.route('/api/guias', methods=['GET'])
def get_guias():
    guias = list(db.guias.find())
    for g in guias:
        g['_id'] = str(g['_id'])
    return jsonify(guias)

@app.route('/api/guias/<id>', methods=['GET'])
def get_guia(id):
    guia = db.guias.find_one({'_id': ObjectId(id)})
    return jsonify(convertir_id(guia))

@app.route('/api/guias', methods=['POST'])
def create_guia():
    data = request.json
    result = db.guias.insert_one(data)
    return jsonify({'_id': str(result.inserted_id)}), 201

@app.route('/api/guias/<id>', methods=['PUT'])
def update_guia(id):
    data = request.json
    db.guias.update_one({'_id': ObjectId(id)}, {'$set': data})
    return jsonify({'message': 'Actualizado'})

@app.route('/api/guias/<id>', methods=['DELETE'])
def delete_guia(id):
    db.guias.delete_one({'_id': ObjectId(id)})
    return jsonify({'message': 'Eliminado'})

# =============================================
# DESTINOS (CRUD)
# =============================================
@app.route('/api/destinos', methods=['GET'])
def get_destinos():
    destinos = list(db.destinos.find())
    for d in destinos:
        d['_id'] = str(d['_id'])
    return jsonify(destinos)

@app.route('/api/destinos/<id>', methods=['GET'])
def get_destino(id):
    destino = db.destinos.find_one({'_id': ObjectId(id)})
    return jsonify(convertir_id(destino))

@app.route('/api/destinos', methods=['POST'])
def create_destino():
    data = request.json
    result = db.destinos.insert_one(data)
    return jsonify({'_id': str(result.inserted_id)}), 201

@app.route('/api/destinos/<id>', methods=['PUT'])
def update_destino(id):
    data = request.json
    db.destinos.update_one({'_id': ObjectId(id)}, {'$set': data})
    return jsonify({'message': 'Actualizado'})

@app.route('/api/destinos/<id>', methods=['DELETE'])
def delete_destino(id):
    db.destinos.delete_one({'_id': ObjectId(id)})
    return jsonify({'message': 'Eliminado'})

# =============================================
# FRONTEND
# =============================================
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)