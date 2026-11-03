const express = require('express');
const router = express.Router();
const db = require('../db');

// OBTENER todos los pacientes
router.get('/', (req, res) => {
    const query = 'SELECT * FROM pacientes';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al listar pacientes:', err);
            return res.status(500).json({ error: 'Error interno en el servidor.' });
        }
        res.json(results);
    });
});

// CREAR un nuevo paciente
router.post('/', (req, res) => {
    const { nombres, apellidos, dni, fecha_nacimiento, telefono } = req.body;
    
    // Validación de datos obligatorios
    if (!nombres || !apellidos || !dni) {
        return res.status(400).json({ error: 'Los campos nombres, apellidos y DNI son obligatorios.' });
    }

    const query = 'INSERT INTO pacientes (nombres, apellidos, dni, fecha_nacimiento, telefono) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [nombres, apellidos, dni, fecha_nacimiento, telefono], (err, results) => {
        if (err) {
            console.error('Error al registrar paciente:', err);
            return res.status(500).json({ error: 'No se pudo registrar el paciente (verifique si el DNI ya existe).' });
        }
        res.status(201).json({ 
            mensaje: '¡Paciente registrado con éxito!', 
            id_paciente: results.insertId 
        });
    });
});

module.exports = router;