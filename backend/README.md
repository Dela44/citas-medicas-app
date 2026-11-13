# Backend de citas médicas

## Inicio local

1. Copia `.env.example` a `.env` y completa la conexión MySQL.
2. Reemplaza `JWT_SECRET` por un valor aleatorio propio de al menos 32 caracteres.
3. Configura `ADMIN_EMAIL` y `ADMIN_PASSWORD` (mínimo 12 caracteres). Al iniciar, la API crea esa cuenta con rol `ADMIN` si aún no existe.
4. Desde `backend`, ejecuta `npm install` y `npm start`.
5. Inicia el frontend en `frontend` con `npm run dev` y abre `http://localhost:5173`.

No subas `.env` al repositorio. La tabla `usuarios` se crea automáticamente al iniciar la API. Las contraseñas se almacenan con bcrypt y los tokens expiran después de ocho horas.

## Swagger

Con el backend activo, abre `http://localhost:4000/api-docs`. Para probar operaciones protegidas, inicia sesión en `/api/auth/login`, copia el token y usa **Authorize** con `Bearer <token>`.

## Roles

- `ADMIN`: accede a las pantallas de administración y a sus rutas de API.
- `PACIENTE`: se registra desde el frontend, consulta médicos y solo puede reservar, ver o cancelar sus propias citas programadas.

Las reservas en línea requieren al menos un médico y un recepcionista registrados en la base de datos. El sistema asigna la reserva al primer recepcionista disponible; el horario debe estar libre.

`CORS_ORIGINS` añade orígenes permitidos para CORS; sepáralos con comas. El origen público `https://citas-medicas-ugco.onrender.com` y los dos orígenes locales de Vite se permiten por defecto. `FRONTEND_ORIGIN` sigue aceptándose por compatibilidad.

## Despliegue en Render

Configura en el servicio del backend las variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `JWT_SECRET` (aleatorio, mínimo 32 caracteres). Render proporciona `PORT` automáticamente; no lo confundas con `DB_PORT`. Añade `ADMIN_EMAIL` y `ADMIN_PASSWORD` si necesitas crear la cuenta administradora.

El backend abre el puerto antes de inicializar MySQL para que Render detecte el servicio. `GET /health` devuelve `503` mientras inicializa o si falla; revisa los logs y las variables del servicio. Si el frontend está desplegado por separado, configura allí `VITE_API_URL` con la URL base del backend; el frontend agrega `/api` si falta. Asegúrate de que el origen del frontend esté permitido por CORS.
