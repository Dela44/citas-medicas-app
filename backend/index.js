const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

// Importar rutas
const pacientesRoutes = require('./routes/pacientes');
const medicosRoutes = require('./routes/medicos');
const clinicaRoutes = require('./routes/clinica');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Usar las rutas de la API REST
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/medicos', medicosRoutes);
app.use('/api', clinicaRoutes);

app.get('/', (req, res) => {
    res.json({ mensaje: '¡El backend del Sistema de Citas Médicas está funcionando!' });
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

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});