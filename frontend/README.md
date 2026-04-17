# 🐾 Vet Secure - Frontend

Frontend estático para la clínica veterinaria segura. Sin necesidad de compilación, funciona en cualquier navegador.

## ✨ Características

✅ Autenticación segura con Supabase  
✅ **Login con GitHub OAuth**
✅ Gestión de productos con descuentos por adopción  
✅ Catálogo de mascotas para adopción  
✅ Sistema de citas veterinarias  
✅ Historial de órdenes/compras  
✅ Control de roles (Admin, Vet, Client)  
✅ Interfaz responsiva y moderna  
✅ 100% estático (HTML, CSS, JavaScript vanilla)  

## 📋 Requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (para Supabase y backend)
- URL del backend configurada correctamente

## ⚙️ Configuración

### 1. Actualizar URLs de Supabase

Edita `js/auth.js` (líneas 2-3) con tus credenciales:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

Obtén estos valores en tu panel de Supabase → Settings → API

### 2. Configurar GitHub OAuth en Supabase

Para habilitar login con GitHub:

1. Ve a tu proyecto en Supabase
2. Authentication → Providers → GitHub
3. Activa GitHub
4. Necesitarás crear una OAuth App en GitHub:
   - Ve a GitHub Settings → Developer settings → OAuth Apps → New OAuth App
   - **Application name:** Vet Secure
   - **Homepage URL:** `https://tu-app.onrender.com` (o tu URL local)
   - **Authorization callback URL:** `https://tu-proyecto.supabase.co/auth/v1/callback`
   - Copia el **Client ID** y **Client Secret**
5. Pega Client ID y Secret en el provider de GitHub en Supabase
6. Click Save

**En desarrollo local:**
- Homepage URL: `http://localhost:8000`
- Necesitarás una GitHub OAuth App separada para desarrollo

### 3. Actualizar URL del Backend

Edita `js/api.js` (línea 2):

**Local:**
```javascript
const API_URL = 'http://localhost:3001';
```

**Producción (Render):**
```javascript
const API_URL = 'https://tu-backend-en-render.onrender.com';
```

## 🚀 Desplegar en Render

### Opción 1: Como Static Site (Recomendado)

1. Crea un repositorio Git con todo el código
2. En Render: Nuevo → Static Site
3. Conecta tu repositorio
4. **Build Command:** (dejar vacío)
5. **Publish Directory:** `backend/frontend`
6. Click en Deploy

### Opción 2: Servir localmente

```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx http-server

# Con Live Server (VS Code)
Instala extensión Live Server y haz click derecho → Open with Live Server
```

Luego accede a `http://localhost:8000` (o el puerto que uses)

## 📂 Estructura del Proyecto

```
backend/frontend/
├── index.html           # HTML principal
├── css/
│   └── style.css       # Estilos (responsive)
├── js/
│   ├── auth.js         # Autenticación Supabase + GitHub
│   ├── api.js          # Cliente API
│   ├── router.js       # Navegación SPA
│   └── main.js         # Lógica de aplicación
└── README.md           # Este archivo
```

## 👥 Funcionalidades por Rol

### 👤 Cliente
- Ver catálogo de productos
- Obtener descuento 20% al adoptar una mascota
- Adoptar mascotas disponibles
- Comprar productos
- Agendar citas veterinarias
- Ver historial de órdenes y citas

### 🩺 Veterinario
- Ver todos los productos
- Ver todas las mascotas
- Crear nuevas mascotas
- Ver todas las citas agendadas

### 👨‍💼 Admin/Sales
- Crear y gestionar productos
- Crear y gestionar mascotas
- Ver todas las órdenes
- Ver todas las citas

## 🔐 Seguridad

- Tokens JWT almacenados en localStorage
- CORS configurado en el backend
- Autenticación requerida para acceder a la API
- Control de acceso basado en roles
- OAuth con GitHub para mayor seguridad

## 🐛 Solución de Problemas

**"No puedo iniciar sesión"**
- Verifica que las credenciales de Supabase sean correctas
- Revisa que Supabase esté disponible
- Abre la consola (F12) y busca errores

**"GitHub login no funciona"**
- Verifica que el OAuth App esté configurado en GitHub
- Comprueba que el Client ID y Secret estén en Supabase
- Asegúrate que el callback URL sea correcto: `https://tu-proyecto.supabase.co/auth/v1/callback`

**"La API retorna 401"**
- El token puede estar expirado
- Verifica que el backend esté corriendo
- Revisa que CORS esté habilitado en el backend

**"Los productos no cargan"**
- Verifica la URL del backend en `js/api.js`
- Asegúrate que el backend esté corriendo en esa URL
- Abre la consola para ver errores específicos

**"Las mascotas no se adoptan"**
- Verifica que hayas iniciado sesión como usuario
- Comprueba que el backend tenga la tabla `pets`
- Revisa los logs del backend

## 💻 Desarrollo Local

### Cambiar API URL dinámicamente

Para desarrollo local:
```javascript
// En js/api.js
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001'
    : 'https://tu-backend-en-render.onrender.com';
```

### Debugging

Abre Developer Tools (F12) y usa la consola para:
```javascript
// Ver estado actual
console.log(appState);

// Hacer llamadas de API manualmente
api.getProducts().then(p => console.log(p));

// Ver token
console.log(localStorage.getItem('token'));
```

## 📱 Características Responsive

- Diseño mobile-first
- Se adapta a pantallas de 320px a 1920px
- Touch-friendly en dispositivos móviles
- Menú adaptativo

## 🎨 Personalización

### Cambiar colores

Edita las variables CSS en `css/style.css`:

```css
:root {
    --primary: #6366f1;      /* Color principal */
    --success: #10b981;       /* Color de éxito */
    --danger: #ef4444;        /* Color de error */
    /* ... más colores ... */
}
```

### Cambiar textos

Busca los strings en `js/main.js` y edita según necesidad.

## 📞 Soporte

Si encuentras problemas:

1. Revisa la consola de navegador (F12 → Console)
2. Verifica las URLs de configuración
3. Asegúrate que el backend está corriendo
4. Comprueba la conexión a internet
5. Intenta en otro navegador o modo incógnito

## 📝 Notas

- Los tokens expiran automáticamente en Supabase
- Las adopciones aplican descuento automático en productos
- Los datos se cargan en tiempo real desde Supabase
- La aplicación no requiere build ni compilación
- GitHub OAuth proporciona autenticación adicional sin necesidad de contraseña

---

¡Disfruta de Vet Secure! 🐾
