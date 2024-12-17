# MCMaker Frontend - Editor de Skin Minecraft

## Requisitos Previos

### Windows
1. **Node.js**
    - Descarga Node.js desde [nodejs.org](https://nodejs.org/)
    - Versión recomendada: 18.x o superior
    - Verifica la instalación:
      ```bash
      node --version
      npm --version
      ```

2. **Git**
    - Descarga Git desde [git-scm.com](https://git-scm.com/download/win)
    - Verifica la instalación:
      ```bash
      git --version
      ```

## Instalación del Proyecto

1. **Clonar el Repositorio**
   ```bash
   git clone https://github.com/LuisGonzalo2/SkinMaket
   cd SkinMaket
   ```

2. **Instalar Dependencias**
   ```bash
   npm install
   ```

3. **Configurar el Entorno**

   Crea o edita el archivo `src/config.js`:
   ```javascript
   // Para desarrollo local
   export const API_URL = 'http://localhost:8000/api';
   
   export const APP_CONFIG = {
       apiUrl: API_URL,
   };
   ```

4. **Iniciar el Servidor de Desarrollo**
   ```bash
   npm start
   ```
   El frontend estará disponible en `http://localhost:3000`

5. **Construir para Producción** (opcional)
   ```bash
   npm run build
   ```
   Esto creará una carpeta `build` con los archivos optimizados

## Estructura del Proyecto

```
skin-editor-react/
│
├── src/                    # Código fuente
│   ├── components/        # Componentes React
│   ├── context/          # Contextos (AuthContext, etc.)
│   ├── pages/            # Páginas principales
│   ├── services/         # Servicios API
│   └── config.js         # Configuración global
│
├── public/               # Archivos estáticos
└── package.json         # Dependencias y scripts
```

## Desarrollo

1. **Conexión con el Backend**
    - Asegúrate de que el backend esté corriendo en `http://localhost:8000`
    - Verifica que las rutas API en `config.js` coincidan con el backend

2. **Hot Reload**
    - El servidor de desarrollo incluye recarga en caliente
    - Los cambios se reflejarán automáticamente en el navegador

## Scripts Disponibles

- `npm start`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm test`: Ejecuta las pruebas
- `npm run eject`: Expone la configuración de webpack (¡usar con precaución!)

## Notas Importantes

1. **CORS**
    - El backend debe permitir peticiones desde `http://localhost:3000`
    - Verifica la configuración CORS en el backend si hay problemas de conexión

2. **Dependencias Principales**
    - React
    - React Router DOM
    - Axios (para peticiones HTTP)
    - Tailwind CSS

3. **Requisitos del Sistema**
    - Node.js 18.x o superior
    - NPM 6.x o superior
    - Navegador moderno (Chrome, Firefox, Edge)

## Solución de Problemas

1. **Error de CORS**
    - Verifica que el backend permita peticiones desde localhost:3000
    - Asegúrate de que la URL en config.js sea correcta

2. **Error de Módulos**
   ```bash
   # Borra node_modules y reinstala
   rm -rf node_modules
   npm install
   ```

3. **Error de Compilación**
    - Verifica la versión de Node.js
    - Limpia la caché de npm:
      ```bash
      npm cache clean --force
      ```

4. **Problemas de Conexión API**
    - Verifica que el backend esté corriendo
    - Comprueba la URL en config.js
    - Verifica las rutas API en los servicios

## Configuración de IDE Recomendada

### VSCode
Extensiones recomendadas:
- ESLint
- Prettier
- ES7 React/Redux/GraphQL/React-Native snippets
- Tailwind CSS IntelliSense

## Contribuir

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

