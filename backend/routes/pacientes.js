const express = require('express');
const router = express.Router();
const db = require('../db');

const listar = (callback) => db.query(
    `SELECT id_paciente AS id, dni, nombres, apellidos,
        fecha_nacimiento AS fechaNacimiento, telefono,
        CONCAT('HC-', dni) AS historiaClinica,
        TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) AS edad,
        'Activo' AS estado
     FROM pacientes`,
    callback
);

router.get('/', (req, res) => {
    listar((err, results) => {
        if (err) return res.status(500).json({ error: 'No se pudieron cargar los pacientes.' });
        res.json(results);
    });
});

// CREAR un nuevo paciente
router.post('/', (req, res) => {
    const { nombres, apellidos, dni, fechaNacimiento, fecha_nacimiento, telefono } = req.body;
    
    // Validación de datos obligatorios
    if (!nombres || !apellidos || !dni) {
        return res.status(400).json({ error: 'Los campos nombres, apellidos y DNI son obligatorios.' });
    }

    const query = 'INSERT INTO pacientes (nombres, apellidos, dni, fecha_nacimiento, telefono) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [nombres, apellidos, dni, fechaNacimiento || fecha_nacimiento || null, telefono || null], (err, results) => {
        if (err) {
            console.error('Error al registrar paciente:', err);
            return res.status(err.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ error: 'No se pudo registrar el paciente (verifique si el DNI ya existe).' });
        }
        listar((listErr, pacientes) => {
            if (listErr) return res.status(500).json({ error: 'El paciente se guardó, pero no se pudo recuperar.' });
            res.status(201).json(
                pacientes.find((paciente) => paciente.id === results.insertId)
            );
        });
    });
});

router.patch('/:id', (req, res) => {
    const { nombres, apellidos, dni, fechaNacimiento, telefono } = req.body;
    if (!nombres || !apellidos || !dni) {
        return res.status(400).json({ error: 'Nombres, apellidos y DNI son obligatorios.' });
    }
    db.query(
        'UPDATE pacientes SET nombres = ?, apellidos = ?, dni = ?, fecha_nacimiento = ?, telefono = ? WHERE id_paciente = ?',
        [nombres, apellidos, dni, fechaNacimiento || null, telefono || null, req.params.id],
        (err, result) => {
            if (err) return res.status(err.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ error: 'No se pudo actualizar el paciente.' });
            if (!result.affectedRows) return res.status(404).json({ error: 'Paciente no encontrado.' });
            listar((listErr, pacientes) => {
                if (listErr) return res.status(500).json({ error: 'No se pudo recuperar el paciente actualizado.' });
                res.json(pacientes.find((paciente) => paciente.id === Number(req.params.id)));
            });
        }
    );
});

router.delete('/:id', (req, res) => {
    db.query('DELETE FROM pacientes WHERE id_paciente = ?', [req.params.id], (err, result) => {
        if (err) return res.status(409).json({ error: 'No se puede eliminar: el paciente tiene registros relacionados.' });
        if (!result.affectedRows) return res.status(404).json({ error: 'Paciente no encontrado.' });
        res.status(204).end();
    });
});

module.exports = router;