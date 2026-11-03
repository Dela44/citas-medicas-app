const express = require('express');
const router = express.Router();
const db = require('../db');

// OBTENER todos los médicos (con su especialidad usando JOIN)
router.get('/', (req, res) => {
    const query = `
        SELECT m.id_medico, m.nombres, m.apellidos, m.telefono, e.nombre_especialidad 
        FROM medicos m
        JOIN especialidades e ON m.id_especialidad = e.id_especialidad
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener médicos:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        res.json(results);
    });
});

// CREAR un nuevo médico
router.post('/', (req, res) => {
    const { nombres, apellidos, id_especialidad, telefono } = req.body;
    const query = 'INSERT INTO medicos (nombres, apellidos, id_especialidad, telefono) VALUES (?, ?, ?, ?)';
    
    db.query(query, [nombres, apellidos, id_especialidad, telefono], (err, results) => {
        if (err) {
            console.error('Error al registrar médico:', err);
            return res.status(500).json({ error: 'No se pudo registrar el médico' });
        }
        res.json({ mensaje: '¡Médico registrado con éxito!', id_medico: results.insertId });
    });
});

module.exports = router;