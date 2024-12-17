# MCMaker - Editor de Skin Minecraft

## Requisitos Previos

### Windows
1. **PHP 8.2**
    - Descarga PHP 8.2 desde [windows.php.net](https://windows.php.net/download/)
    - Extrae el archivo ZIP en `C:\php`
    - Añade `C:\php` al PATH del sistema
    - Habilita las siguientes extensiones en php.ini:
      ```ini
      extension=pdo_pgsql
      extension=pgsql
      extension=fileinfo
      extension=openssl
      extension=mbstring
      extension=curl
      extension=zip
      ```

2. **Composer**
    - Descarga el instalador desde [getcomposer.org](https://getcomposer.org/download/)
    - Ejecuta el instalador

3. **PostgreSQL**
    - Descarga PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/windows/)
    - Durante la instalación:
        - Anota la contraseña del usuario postgres
        - Puerto por defecto: 5432
        - Instalar pgAdmin (opcional pero recomendado)

## Instalación del Proyecto

1. **Clonar el Repositorio**
   ```bash
   git clone https://github.com/LuisGonzalo2/SkinMaket
   cd SkinMaket
   ```

2. **Instalar Dependencias**
   ```bash
   composer install
   ```

3. **Configurar el Entorno**
   ```bash
   # Copiar el archivo de ejemplo
   copy .env.example .env
   
   # Generar clave de aplicación
   php artisan key:generate
   ```

4. **Configurar Base de Datos**

   Edita el archivo `.env`:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=mcmaker2
   DB_USERNAME=postgres
   DB_PASSWORD=tu_contraseña
   ```

5. **Crear Base de Datos**
    - Abre pgAdmin
    - Crea una nueva base de datos llamada `mcmaker2`

6. **Ejecutar Migraciones**
   ```bash
   php artisan migrate
   ```

7. **Insertar Datos Iniciales**

   Ejecuta estas consultas en orden usando pgAdmin o `php artisan tinker`:

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

   -- Permisos
   INSERT INTO permissions (name, description, created_at, updated_at) 
   VALUES 
   ('manage_roles', 'Gestionar roles y permisos', NOW(), NOW()),
   ('manage_tags', 'Gestionar etiquetas', NOW(), NOW()),
   ('manage_categories', 'Gestionar categorías', NOW(), NOW()),
   ('manage_comments', 'Gestionar comentarios', NOW(), NOW()),
   ('manage_skins', 'Gestionar skins', NOW(), NOW()),
   ('manage_users', 'Gestionar usuarios', NOW(), NOW());

   -- Rol Administrador
   INSERT INTO roles (name, description, is_admin, is_active, created_at, updated_at) 
   VALUES ('Administrador', 'Rol con todos los permisos del sistema', true, true, NOW(), NOW());

   -- Asignar permisos al rol administrador
   INSERT INTO role_permission (role_id, permission_id, created_at, updated_at) 
   SELECT 1, id, NOW(), NOW() FROM permissions;
   ```

8. **Asignar Rol de Administrador**

   Después de registrar tu primer usuario, ejecuta:
   ```sql
   -- Reemplaza {ID_DEL_USUARIO} con el ID de tu usuario
   UPDATE users SET role_id = 1 WHERE id = {ID_DEL_USUARIO};
   ```

9. **Iniciar el Servidor**
   ```bash
   php artisan serve
   ```

El backend estará disponible en `http://localhost:8000`

## Notas Adicionales

- Asegúrate de que todas las extensiones de PHP requeridas estén habilitadas
- El proyecto usa PostgreSQL, asegúrate de tener los drivers correctos instalados
- Para desarrollo, se recomienda instalar pgAdmin para gestionar la base de datos
- Los errores comunes suelen estar relacionados con permisos o extensiones faltantes de PHP

## Solución de Problemas

1. **Error de extensiones**
    - Verifica que todas las extensiones requeridas estén descomentadas en php.ini
    - Reinicia el servidor después de modificar php.ini

2. **Error de conexión a la base de datos**
    - Verifica las credenciales en el archivo .env
    - Asegúrate de que PostgreSQL esté corriendo
    - Verifica el puerto en uso (por defecto 5432)

3. **Error de permisos**
    - Asegúrate de que el usuario de PostgreSQL tiene los permisos necesarios
    - Verifica que puedes conectarte a la base de datos usando pgAdmin
