from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    DB_NAME = os.getenv('DB_NAME', 'agencia_turismo_db')

class Database:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            
            # Usar autenticación explícita
            uri = os.getenv('MONGO_URI')
            print(f"🔗 Conectando a: {uri.replace('App123!', '****')}")
            
            cls._instance.client = MongoClient(uri)
            cls._instance.db = cls._instance.client[os.getenv('DB_NAME')]
            
            # Probar conexión
            try:
                cls._instance.client.admin.command('ping')
                print("✅ Conexión a MongoDB exitosa")
            except Exception as e:
                print(f"❌ Error de conexión: {e}")
                
        return cls._instance

    def get_collection(self, name):
        return self.db[name]