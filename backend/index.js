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
let backendReady = false;
let startupFailed = false;
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://localhost:4173')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        const error = new Error('El origen no está permitido por la política CORS.');
        error.status = 403;
        return callback(error);
    },
}));
app.use(express.json());

app.get('/health', (req, res) => {
    if (!backendReady) {
        return res.status(503).json({
            status: startupFailed ? 'error' : 'starting',
            error: startupFailed
                ? 'El backend no pudo inicializarse. Revisa la configuración y los logs.'
                : 'El backend está inicializando.',
        });
    }

    res.json({ status: 'ok' });
});

app.use((req, res, next) => {
    if (!backendReady) {
        return res.status(503).json({
            error: startupFailed
                ? 'El backend no está disponible. Revisa la configuración y los logs.'
                : 'El backend se está inicializando.',
        });
    }

    next();
});

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
    const status = err.status === 403 ? 403 : 500;
    res.status(status).json({
        error: status === 403 ? err.message : 'Ocurrió un error interno en el servidor.',
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);

    initializeAuth()
        .then(() => {
            backendReady = true;
            console.log('Backend inicializado y listo.');
        })
        .catch((err) => {
            startupFailed = true;
            console.error('No se pudo inicializar la autenticación:', err.message);
        });
});