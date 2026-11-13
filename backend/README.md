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

`CORS_ORIGINS` limita CORS a los orígenes permitidos. Para permitir más de uno, sepáralos con comas. `FRONTEND_ORIGIN` sigue aceptándose por compatibilidad.
