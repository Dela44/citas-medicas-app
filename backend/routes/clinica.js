const express = require('express');
const db = require('../db');

const router = express.Router();
const query = (sql, values, callback) => db.query(sql, values, callback);

const citaSelect = `
    SELECT c.id_cita AS id, c.id_paciente AS pacienteId,
        c.id_medico AS medicoId, c.id_recepcionista AS recepcionistaId,
        DATE_FORMAT(c.fecha_hora, '%Y-%m-%d') AS fecha,
        DATE_FORMAT(c.fecha_hora, '%H:%i') AS hora,
        c.estado_cita AS estado,
        CONCAT('CIT-', c.id_cita) AS codigoCita,
        CONCAT(p.nombres, ' ', p.apellidos) AS pacienteNombre,
        p.dni AS pacienteDni,
        CONCAT(m.nombres, ' ', m.apellidos) AS medicoNombre,
        e.nombre_especialidad AS especialidad
    FROM citas c
    JOIN pacientes p ON p.id_paciente = c.id_paciente
    JOIN medicos m ON m.id_medico = c.id_medico
    JOIN especialidades e ON e.id_especialidad = m.id_especialidad`;

const historiaSelect = `
    SELECT h.id_historial AS id, h.id_paciente AS pacienteId,
        h.id_medico AS medicoId, DATE_FORMAT(h.fecha_registro, '%Y-%m-%d %H:%i:%s') AS fechaConsulta,
        h.diagnostico, h.tratamiento_recetado AS tratamiento,
        CONCAT(m.nombres, ' ', m.apellidos) AS medico,
        e.nombre_especialidad AS especialidad
    FROM historial_clinico h
    JOIN medicos m ON m.id_medico = h.id_medico
    JOIN especialidades e ON e.id_especialidad = m.id_especialidad`;

router.get('/especialidades', (req, res) => {
    query('SELECT id_especialidad AS id, nombre_especialidad AS nombre FROM especialidades ORDER BY nombre_especialidad', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'No se pudieron cargar las especialidades.' });
        res.json(rows);
    });
});

router.post('/especialidades', (req, res) => {
    const nombre = String(req.body.nombre || '').trim();
    if (!nombre) return res.status(400).json({ error: 'El nombre de la especialidad es obligatorio.' });
    query('INSERT INTO especialidades (nombre_especialidad) VALUES (?)', [nombre], (err, result) => {
        if (err) return res.status(err.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ error: 'No se pudo guardar la especialidad.' });
        res.status(201).json({ id: result.insertId, nombre });
    });
});

router.delete('/especialidades/:id', (req, res) => {
    query('DELETE FROM especialidades WHERE id_especialidad = ?', [req.params.id], (err, result) => {
        if (err) return res.status(409).json({ error: 'No se puede eliminar una especialidad asignada a médicos.' });
        if (!result.affectedRows) return res.status(404).json({ error: 'Especialidad no encontrada.' });
        res.status(204).end();
    });
});

router.get('/citas', (req, res) => {
    query(`${citaSelect} ORDER BY c.fecha_hora DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'No se pudieron cargar las citas.' });
        res.json(rows);
    });
});

router.post('/citas', (req, res) => {
    const { pacienteId, medicoId, recepcionistaId, fecha, hora } = req.body;
    if (!pacienteId || !medicoId || !recepcionistaId || !fecha || !hora) {
        return res.status(400).json({ error: 'Paciente, médico, recepcionista, fecha y hora son obligatorios.' });
    }
    query(
        'INSERT INTO citas (fecha_hora, estado_cita, id_paciente, id_medico, id_recepcionista) VALUES (CONCAT(?, ?, ?), ?, ?, ?, ?)',
        [fecha, ' ', hora, req.body.estado || 'Programada', pacienteId, medicoId, recepcionistaId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'No se pudo agendar la cita. Verifica las relaciones seleccionadas.' });
            query(`${citaSelect} WHERE c.id_cita = ?`, [result.insertId], (selectErr, rows) => {
                if (selectErr) return res.status(500).json({ error: 'La cita se guardó, pero no se pudo recuperar.' });
                res.status(201).json(rows[0]);
            });
        }
    );
});

router.patch('/citas/:id', (req, res) => {
    const estados = ['Programada', 'En Espera', 'En Consulta', 'Atendido', 'Cancelado'];
    if (!estados.includes(req.body.estado)) return res.status(400).json({ error: 'Estado de cita no válido.' });
    query('UPDATE citas SET estado_cita = ? WHERE id_cita = ?', [req.body.estado, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: 'No se pudo actualizar la cita.' });
        if (!result.affectedRows) return res.status(404).json({ error: 'Cita no encontrada.' });
        query(`${citaSelect} WHERE c.id_cita = ?`, [req.params.id], (selectErr, rows) => {
            if (selectErr) return res.status(500).json({ error: 'No se pudo recuperar la cita actualizada.' });
            res.json(rows[0]);
        });
    });
});

router.delete('/citas/:id', (req, res) => {
    query('DELETE FROM citas WHERE id_cita = ?', [req.params.id], (err, result) => {
        if (err) return res.status(409).json({ error: 'No se puede eliminar una cita que ya tiene pagos relacionados.' });
        if (!result.affectedRows) return res.status(404).json({ error: 'Cita no encontrada.' });
        res.status(204).end();
    });
});

router.get('/historias-clinicas', (req, res) => {
    query(`${historiaSelect} ORDER BY h.fecha_registro DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'No se pudieron cargar las historias clínicas.' });
        res.json(rows);
    });
});

router.post('/historias-clinicas', (req, res) => {
    const { pacienteId, medicoId, diagnostico, tratamiento, fechaConsulta } = req.body;
    if (!pacienteId || !medicoId || !diagnostico || !tratamiento) {
        return res.status(400).json({ error: 'Paciente, médico, diagnóstico y tratamiento son obligatorios.' });
    }
    const fecha = fechaConsulta || new Date();
    query(
        'INSERT INTO historial_clinico (diagnostico, tratamiento_recetado, fecha_registro, id_paciente, id_medico) VALUES (?, ?, ?, ?, ?)',
        [diagnostico, tratamiento, fecha, pacienteId, medicoId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'No se pudo guardar la historia clínica.' });
            const triaje = req.body.triaje;
            const responder = () => query(`${historiaSelect} WHERE h.id_historial = ?`, [result.insertId], (selectErr, rows) => {
                if (selectErr) return res.status(500).json({ error: 'La historia se guardó, pero no se pudo recuperar.' });
                res.status(201).json({ ...rows[0], triaje: triaje || null });
            });
            if (!triaje?.enfermeroId) return responder();
            query(
                `INSERT INTO triaje (peso, altura, presion_arterial, temperatura, frecuencia_cardiaca, fecha_registro, id_paciente, id_enfermero)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [triaje.peso || null, triaje.altura || null, triaje.presion || null, triaje.temperatura || null,
                    triaje.frecuenciaCardiaca || null, fecha, pacienteId, triaje.enfermeroId],
                (triageErr) => {
                    if (triageErr) return res.status(500).json({ error: 'La historia se guardó, pero falló el registro del triaje.' });
                    responder();
                }
            );
        }
    );
});

router.delete('/historias-clinicas/:id', (req, res) => {
    query('DELETE FROM historial_clinico WHERE id_historial = ?', [req.params.id], (err, result) => {
        if (err) return res.status(409).json({ error: 'No se pudo eliminar la historia clínica.' });
        if (!result.affectedRows) return res.status(404).json({ error: 'Historia clínica no encontrada.' });
        res.status(204).end();
    });
});

router.get('/laboratorio', (req, res) => {
    query(
        `SELECT l.id_laboratorio AS id, l.id_paciente AS pacienteId,
            l.id_medico AS medicoId, l.tipo_examen AS tipoExamen,
            l.resultados, l.observaciones,
            DATE_FORMAT(l.fecha_resultado, '%Y-%m-%d %H:%i') AS fechaResultado,
            CONCAT(p.nombres, ' ', p.apellidos) AS paciente,
            CONCAT(m.nombres, ' ', m.apellidos) AS medico
         FROM laboratorio l
         JOIN pacientes p ON p.id_paciente = l.id_paciente
         JOIN medicos m ON m.id_medico = l.id_medico
         ORDER BY l.fecha_resultado DESC`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'No se pudieron cargar los resultados de laboratorio.' });
            res.json(rows);
        }
    );
});

router.post('/laboratorio', (req, res) => {
    const { pacienteId, medicoId, tipoExamen, resultados, observaciones, fechaResultado } = req.body;
    if (!pacienteId || !medicoId || !tipoExamen || !resultados) {
        return res.status(400).json({ error: 'Paciente, médico, tipo de examen y resultados son obligatorios.' });
    }
    query(
        'INSERT INTO laboratorio (tipo_examen, resultados, observaciones, fecha_resultado, id_paciente, id_medico) VALUES (?, ?, ?, ?, ?, ?)',
        [tipoExamen, resultados, observaciones || null, fechaResultado || new Date(), pacienteId, medicoId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'No se pudo guardar el resultado de laboratorio.' });
            query(
                `SELECT l.id_laboratorio AS id, l.id_paciente AS pacienteId,
                    l.id_medico AS medicoId, l.tipo_examen AS tipoExamen,
                    l.resultados, l.observaciones,
                    DATE_FORMAT(l.fecha_resultado, '%Y-%m-%d %H:%i') AS fechaResultado,
                    CONCAT(p.nombres, ' ', p.apellidos) AS paciente,
                    CONCAT(m.nombres, ' ', m.apellidos) AS medico
                 FROM laboratorio l
                 JOIN pacientes p ON p.id_paciente = l.id_paciente
                 JOIN medicos m ON m.id_medico = l.id_medico
                 WHERE l.id_laboratorio = ?`,
                [result.insertId],
                (selectErr, rows) => {
                    if (selectErr) return res.status(500).json({ error: 'El resultado se guardó, pero no se pudo recuperar.' });
                    res.status(201).json(rows[0]);
                }
            );
        }
    );
});

router.get('/triajes', (req, res) => {
    query(
        `SELECT t.id_triaje AS id, t.id_paciente AS pacienteId, t.peso, t.altura,
            t.presion_arterial AS presion, t.temperatura, t.frecuencia_cardiaca AS frecuenciaCardiaca,
            DATE_FORMAT(t.fecha_registro, '%Y-%m-%d %H:%i:%s') AS fechaRegistro,
            t.id_enfermero AS enfermeroId
         FROM triaje t ORDER BY t.fecha_registro DESC`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'No se pudieron cargar los triajes.' });
            res.json(rows);
        }
    );
});

router.get('/pagos', (req, res) => {
    query(
        `SELECT p.id_pago AS id, p.id_cita AS citaId, p.id_cajero AS cajeroId,
            p.monto, p.metodo_pago AS metodo, p.estado_pago AS estado,
            DATE_FORMAT(p.fecha_pago, '%Y-%m-%d %H:%i') AS fecha,
            CONCAT(pa.nombres, ' ', pa.apellidos) AS paciente
         FROM pagos p JOIN citas c ON c.id_cita = p.id_cita
         JOIN pacientes pa ON pa.id_paciente = c.id_paciente ORDER BY p.fecha_pago DESC`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'No se pudieron cargar los pagos.' });
            res.json(rows);
        }
    );
});

router.post('/pagos', (req, res) => {
    const { citaId, cajeroId, monto, metodo, estado } = req.body;
    if (!citaId || !cajeroId || Number(monto) <= 0 || !metodo) {
        return res.status(400).json({ error: 'Cita, cajero, método y un monto mayor a cero son obligatorios.' });
    }
    query(
        'INSERT INTO pagos (monto, metodo_pago, estado_pago, fecha_pago, id_cita, id_cajero) VALUES (?, ?, ?, NOW(), ?, ?)',
        [monto, metodo, estado || 'Pagado', citaId, cajeroId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'No se pudo registrar el pago.' });
            query(
                `SELECT p.id_pago AS id, p.id_cita AS citaId, p.id_cajero AS cajeroId,
                    p.monto, p.metodo_pago AS metodo, p.estado_pago AS estado,
                    DATE_FORMAT(p.fecha_pago, '%Y-%m-%d %H:%i') AS fecha,
                    CONCAT(pa.nombres, ' ', pa.apellidos) AS paciente
                 FROM pagos p JOIN citas c ON c.id_cita = p.id_cita
                 JOIN pacientes pa ON pa.id_paciente = c.id_paciente WHERE p.id_pago = ?`,
                [result.insertId],
                (selectErr, rows) => {
                    if (selectErr) return res.status(500).json({ error: 'El pago se guardó, pero no se pudo recuperar.' });
                    res.status(201).json(rows[0]);
                }
            );
        }
    );
});

const personal = [
    ['recepcionistas', 'id_recepcionista', ['correo', 'telefono']],
    ['enfermeros', 'id_enfermero', ['telefono']],
    ['cajeros', 'id_cajero', []],
];

for (const [table, idColumn, extraColumns] of personal) {
    router.get(`/${table}`, (req, res) => {
        const extraSelect = extraColumns.map((column) => `, ${column}`).join('');
        query(`SELECT ${idColumn} AS id, nombres, apellidos${extraSelect} FROM ${table} ORDER BY apellidos, nombres`, [], (err, rows) => {
            if (err) return res.status(500).json({ error: `No se pudo cargar ${table}.` });
            res.json(rows);
        });
    });

    router.post(`/${table}`, (req, res) => {
        const nombres = String(req.body.nombres || '').trim();
        const apellidos = String(req.body.apellidos || '').trim();
        if (!nombres || !apellidos) {
            return res.status(400).json({ error: 'Nombres y apellidos son obligatorios.' });
        }
        const columns = ['nombres', 'apellidos', ...extraColumns];
        const values = [nombres, apellidos, ...extraColumns.map((column) => req.body[column] || null)];
        query(
            `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
            values,
            (err, result) => {
                if (err) return res.status(500).json({ error: `No se pudo registrar ${table}.` });
                const record = { id: result.insertId, nombres, apellidos };
                extraColumns.forEach((column) => { record[column] = req.body[column] || null; });
                res.status(201).json(record);
            }
        );
    });
}

module.exports = router;