const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
    const query = `
        SELECT m.id_medico AS id, m.id_especialidad AS especialidadId,
            m.nombres, m.apellidos, e.nombre_especialidad AS especialidad,
            'Disponible' AS estado
        FROM medicos m
        JOIN especialidades e ON m.id_especialidad = e.id_especialidad
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener médicos:', err);
            return res.status(500).json({ error: 'No se pudieron cargar los médicos.' });
        }
        res.json(results);
    });
});

// CREAR un nuevo médico
router.post('/', (req, res) => {
    const { nombres, apellidos, especialidadId, id_especialidad } = req.body;
    if (!nombres || !apellidos || !(especialidadId || id_especialidad)) {
        return res.status(400).json({ error: 'Nombres, apellidos y especialidad son obligatorios.' });
    }
    const query = 'INSERT INTO medicos (nombres, apellidos, id_especialidad) VALUES (?, ?, ?)';
    
    db.query(query, [nombres, apellidos, especialidadId || id_especialidad], (err, results) => {
        if (err) {
            console.error('Error al registrar médico:', err);
            return res.status(500).json({ error: 'No se pudo registrar el médico. Verifica la especialidad seleccionada.' });
        }
        db.query(
            `SELECT m.id_medico AS id, m.id_especialidad AS especialidadId,
                m.nombres, m.apellidos, e.nombre_especialidad AS especialidad,
                'Disponible' AS estado
             FROM medicos m JOIN especialidades e ON m.id_especialidad = e.id_especialidad
             WHERE m.id_medico = ?`,
            [results.insertId],
            (selectErr, rows) => selectErr
                ? res.status(500).json({ error: 'El médico se guardó, pero no se pudo recuperar.' })
                : res.status(201).json(rows[0])
        );
    });
});

router.patch('/:id', (req, res) => {
    const { nombres, apellidos, especialidadId } = req.body;
    if (!nombres || !apellidos || !especialidadId) {
        return res.status(400).json({ error: 'Nombres, apellidos y especialidad son obligatorios.' });
    }
    db.query(
        'UPDATE medicos SET nombres = ?, apellidos = ?, id_especialidad = ? WHERE id_medico = ?',
        [nombres, apellidos, especialidadId, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'No se pudo actualizar el médico.' });
            if (!result.affectedRows) return res.status(404).json({ error: 'Médico no encontrado.' });
            db.query(
                `SELECT m.id_medico AS id, m.id_especialidad AS especialidadId,
                    m.nombres, m.apellidos, e.nombre_especialidad AS especialidad,
                    'Disponible' AS estado
                 FROM medicos m JOIN especialidades e ON m.id_especialidad = e.id_especialidad
                 WHERE m.id_medico = ?`,
                [req.params.id],
                (selectErr, rows) => selectErr
                    ? res.status(500).json({ error: 'No se pudo recuperar el médico actualizado.' })
                    : res.json(rows[0])
            );
        }
    );
});

router.delete('/:id', (req, res) => {
    db.query('DELETE FROM medicos WHERE id_medico = ?', [req.params.id], (err, result) => {
        if (err) return res.status(409).json({ error: 'No se puede eliminar: el médico tiene citas o historias relacionadas.' });
        if (!result.affectedRows) return res.status(404).json({ error: 'Médico no encontrado.' });
        res.status(204).end();
    });
});

module.exports = router;