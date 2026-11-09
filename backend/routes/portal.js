const express = require('express');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken, requireRole('PACIENTE'));

const citaSelect = `
    SELECT c.id_cita AS id, c.id_paciente AS pacienteId,
        c.id_medico AS medicoId,
        DATE_FORMAT(c.fecha_hora, '%Y-%m-%d') AS fecha,
        DATE_FORMAT(c.fecha_hora, '%H:%i') AS hora,
        c.estado_cita AS estado,
        CONCAT('CIT-', c.id_cita) AS codigoCita,
        CONCAT(m.nombres, ' ', m.apellidos) AS medicoNombre,
        e.nombre_especialidad AS especialidad
    FROM citas c
    JOIN medicos m ON m.id_medico = c.id_medico
    JOIN especialidades e ON e.id_especialidad = m.id_especialidad`;

router.get('/doctors', async (req, res, next) => {
    try {
        const [rows] = await db.promise().query(
            `SELECT m.id_medico AS id, m.nombres, m.apellidos,
                e.nombre_especialidad AS especialidad
             FROM medicos m
             JOIN especialidades e ON e.id_especialidad = m.id_especialidad
             ORDER BY m.apellidos, m.nombres`
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

router.get('/appointments', async (req, res, next) => {
    try {
        const [rows] = await db.promise().query(
            `${citaSelect} WHERE c.id_paciente = ? ORDER BY c.fecha_hora DESC`,
            [req.user.pacienteId]
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

router.post('/appointments', async (req, res, next) => {
    const medicoId = Number(req.body.medicoId);
    const fecha = String(req.body.fecha || '');
    const hora = String(req.body.hora || '');
    const requestedDate = new Date(`${fecha}T${hora}:00`);
    const dateIsExact = !Number.isNaN(requestedDate.getTime()) &&
        requestedDate.getFullYear() === Number(fecha.slice(0, 4)) &&
        requestedDate.getMonth() + 1 === Number(fecha.slice(5, 7)) &&
        requestedDate.getDate() === Number(fecha.slice(8, 10)) &&
        requestedDate.getHours() === Number(hora.slice(0, 2)) &&
        requestedDate.getMinutes() === Number(hora.slice(3, 5));

    if (!Number.isInteger(medicoId) || medicoId <= 0 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora) ||
        !dateIsExact || requestedDate <= new Date()) {
        return res.status(400).json({ error: 'Selecciona un médico y una fecha y hora futuras válidas.' });
    }

    try {
        const [doctors] = await db.promise().query(
            'SELECT id_medico FROM medicos WHERE id_medico = ?',
            [medicoId]
        );
        if (!doctors.length) return res.status(404).json({ error: 'El médico seleccionado no existe.' });

        const [receptionists] = await db.promise().query(
            'SELECT id_recepcionista FROM recepcionistas ORDER BY id_recepcionista LIMIT 1'
        );
        if (!receptionists.length) {
            return res.status(409).json({ error: 'La clínica debe registrar al menos un recepcionista antes de habilitar reservas.' });
        }

        const [conflicts] = await db.promise().query(
            `SELECT id_cita FROM citas
             WHERE id_medico = ? AND fecha_hora = CONCAT(?, ' ', ?)
                AND estado_cita <> 'Cancelado'
             LIMIT 1`,
            [medicoId, fecha, hora]
        );
        if (conflicts.length) {
            return res.status(409).json({ error: 'Ese horario ya está reservado. Elige otra fecha u hora.' });
        }

        const [result] = await db.promise().query(
            `INSERT INTO citas (fecha_hora, estado_cita, id_paciente, id_medico, id_recepcionista)
             VALUES (CONCAT(?, ' ', ?), 'Programada', ?, ?, ?)`,
            [fecha, hora, req.user.pacienteId, medicoId, receptionists[0].id_recepcionista]
        );
        const [appointments] = await db.promise().query(`${citaSelect} WHERE c.id_cita = ?`, [result.insertId]);
        res.status(201).json(appointments[0]);
    } catch (err) {
        next(err);
    }
});

router.patch('/appointments/:id/cancel', async (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'El identificador de la cita no es válido.' });
    }
    try {
        const [result] = await db.promise().query(
            `UPDATE citas SET estado_cita = 'Cancelado'
             WHERE id_cita = ? AND id_paciente = ? AND estado_cita = 'Programada'`,
            [id, req.user.pacienteId]
        );
        if (!result.affectedRows) {
            return res.status(409).json({ error: 'La cita no existe, no te pertenece o ya no se puede cancelar.' });
        }
        const [appointments] = await db.promise().query(`${citaSelect} WHERE c.id_cita = ?`, [id]);
        res.json(appointments[0]);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
