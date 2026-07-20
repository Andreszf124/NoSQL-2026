from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

uri = os.getenv('MONGO_URI')
print(f"Conectando a: {uri.replace('App123!', '****')}")

try:
    client = MongoClient(uri)
    db = client['agencia_turismo_db']
    
    # Probar conexión
    client.admin.command('ping')
    print("✅ Conexión exitosa")
    
    # Verificar colecciones
    print("📊 Colecciones:", db.list_collection_names())
    print("📊 Clientes:", db.clientes.count_documents({}))
    
except Exception as e:
    print(f"❌ Error: {e}")