const express = require('express');
const cors = require('cors');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const initializeAuth = require('./authSetup');
const openapi = require('./openapi');
const { authenticateToken, requireRole } = require('./middleware/auth');
const configuredPort = process.env.PORT ? Number(process.env.PORT) : 4000;
if (!Number.isInteger(configuredPort) || configuredPort < 1 || configuredPort > 65535) {
    throw new Error('PORT debe ser un número entero entre 1 y 65535.');
}

// Importar rutas
const pacientesRoutes = require('./routes/pacientes');
const medicosRoutes = require('./routes/medicos');
const clinicaRoutes = require('./routes/clinica');
const authRoutes = require('./routes/auth');
const portalRoutes = require('./routes/portal');

const app = express();
const PORT = configuredPort;
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('El origen no está permitido por la política CORS.'));
    },
}));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.use('/api/auth', authRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/pacientes', authenticateToken, requireRole('ADMIN'), pacientesRoutes);
app.use('/api/medicos', authenticateToken, requireRole('ADMIN'), medicosRoutes);
app.use('/api', authenticateToken, requireRole('ADMIN'), clinicaRoutes);

app.get('/', (req, res) => {
    res.json({ mensaje: 'El backend del Sistema de Citas Médicas está funcionando.', documentacion: '/api-docs' });
});

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada en la API' });
});

// Middleware de manejo de errores globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Ocurrió un error interno en el servidor.' });
});

initializeAuth()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('No se pudo inicializar la autenticación:', err.message);
        process.exitCode = 1;
    });