# SkinMarket - MCMaker Project

## 📂 Estructura del Proyecto

Este repositorio contiene tanto el backend como el frontend de SkinMarket:

```
SkinMarket/
├── backend/                # API Laravel
├── frontend/              # Aplicación React
└── README.md             # Este archivo
```

## 🚀 Inicio Rápido

Para ejecutar el proyecto completo, necesitas configurar tanto el backend como el frontend.

### Requisitos Previos

- XAMPP con PHP 8.2
- PostgreSQL 14 o superior
- Composer
- Node.js 18.x o superior
- Git

### Instalación

1. **Clonar el Repositorio**
   ```bash
   git clone https://github.com/LuisGonzalo2/SkinMaket.git
   cd SkinMaket
   ```

2. **Configurar Backend**
   ```bash
   cd backend
   composer install
   copy .env.example .env
   php artisan key:generate
   ```

   Configura tu archivo `.env` con tus credenciales de base de datos:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=mcmaker2
   DB_USERNAME=postgres
   DB_PASSWORD=tu_contraseña
   ```

3. **Configurar Base de Datos**
   - Crea una base de datos llamada `mcmaker2` en PostgreSQL
   - Ejecuta las migraciones:
     ```bash
     php artisan migrate
     ```
   - Inserta los datos iniciales:
     ```sql
     -- Categorías
     INSERT INTO categories (name, created_at, updated_at) 
     VALUES 
     ('General', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     ('PvP', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     ('Roleplay', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     ('Personalizado', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

     -- Tags
     INSERT INTO tags (name, is_active, created_at, updated_at) 
     VALUES 
     ('PvP', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     ('Medieval', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     ('Fantasia', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     ('Moderno', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     ('Anime', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     ('Minimalista', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     ('Historico', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     ('Custom', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     ('HD', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     ('Clasico', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

     -- Permisos y Roles
     INSERT INTO permissions (name, description, created_at, updated_at) 
     VALUES 
     ('manage_roles', 'Gestionar roles y permisos', NOW(), NOW()),
     ('manage_tags', 'Gestionar etiquetas', NOW(), NOW()),
     ('manage_categories', 'Gestionar categorías', NOW(), NOW()),
     ('manage_comments', 'Gestionar comentarios', NOW(), NOW()),
     ('manage_skins', 'Gestionar skins', NOW(), NOW()),
     ('manage_users', 'Gestionar usuarios', NOW(), NOW());

     INSERT INTO roles (name, description, is_admin, is_active, created_at, updated_at) 
     VALUES ('Administrador', 'Rol con todos los permisos del sistema', true, true, NOW(), NOW());

     INSERT INTO role_permission (role_id, permission_id, created_at, updated_at) 
     SELECT 1, id, NOW(), NOW() FROM permissions;
     ```

4. **Configurar Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

   Configura el archivo `src/config.js`:
   ```javascript
   export const API_URL = 'http://localhost:8000/api';
   export const APP_CONFIG = {
       apiUrl: API_URL,
   };
   ```

5. **Iniciar los Servicios**

   Terminal 1 (Backend):
   ```bash
   cd backend
   php artisan serve
   ```

   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm start
   ```

## 🌐 Acceder a la Aplicación

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api

## 📚 Documentación Detallada

- [Documentación del Backend](./backend/README.md)
- [Documentación del Frontend](./frontend/README.md)

## 🛠️ Stack Tecnológico

### Backend
- PHP 8.2
- Laravel
- PostgreSQL
- Sanctum para autenticación

### Frontend
- React
- Tailwind CSS
- Context API
- React Router

## ❗ Solución de Problemas Comunes

1. **Error de CORS**
   - Verifica que ambos servicios estén corriendo
   - Comprueba los puertos (3000 para frontend, 8000 para backend)

2. **Error de Base de Datos**
   - Verifica las credenciales en `.env`
   - Asegúrate de que PostgreSQL esté corriendo

3. **Errores de Instalación**
   - Limpia las cachés:
     ```bash
     cd backend
     php artisan config:clear
     php artisan cache:clear
     
     cd ../frontend
     npm cache clean --force
     ```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la Branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.
