const bearer = [{ bearerAuth: [] }];

module.exports = {
    openapi: '3.0.3',
    info: {
        title: 'API de Citas Médicas',
        version: '1.0.0',
        description: 'API para administración de la clínica y reservas del portal de pacientes.',
    },
    servers: [{ url: '/' }],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
        schemas: {
            Credentials: {
                type: 'object',
                required: ['correo', 'password'],
                properties: {
                    correo: { type: 'string', format: 'email', example: 'paciente@correo.com' },
                    password: { type: 'string', format: 'password', minLength: 8 },
                },
            },
            Registration: {
                allOf: [{
                    type: 'object',
                    required: ['nombres', 'apellidos', 'dni'],
                    properties: {
                        nombres: { type: 'string' },
                        apellidos: { type: 'string' },
                        dni: { type: 'string', pattern: '^\\d{8}$' },
                        fechaNacimiento: { type: 'string', format: 'date', nullable: true },
                        telefono: { type: 'string', nullable: true },
                    },
                }, { $ref: '#/components/schemas/Credentials' }],
            },
            TokenResponse: {
                type: 'object',
                properties: {
                    token: { type: 'string' },
                    user: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            correo: { type: 'string' },
                            rol: { type: 'string', enum: ['ADMIN', 'PACIENTE'] },
                            pacienteId: { type: 'integer', nullable: true },
                        },
                    },
                },
            },
        },
    },
    paths: {
        '/api/auth/register': {
            post: {
                tags: ['Autenticación'],
                summary: 'Crear una cuenta de paciente',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Registration' } } },
                },
                responses: { 201: { description: 'Cuenta creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/TokenResponse' } } } }, 409: { description: 'Correo o DNI ya registrado' } },
            },
        },
        '/api/auth/login': {
            post: {
                tags: ['Autenticación'],
                summary: 'Iniciar sesión',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Credentials' } } },
                },
                responses: { 200: { description: 'Sesión iniciada', content: { 'application/json': { schema: { $ref: '#/components/schemas/TokenResponse' } } } }, 401: { description: 'Credenciales incorrectas' } },
            },
        },
        '/api/auth/me': {
            get: {
                tags: ['Autenticación'],
                summary: 'Consultar la sesión actual',
                security: bearer,
                responses: { 200: { description: 'Usuario autenticado' }, 401: { description: 'Sesión no válida' } },
            },
        },
        '/api/portal/doctors': {
            get: {
                tags: ['Portal del paciente'],
                summary: 'Listar médicos disponibles para reservar',
                security: bearer,
                responses: { 200: { description: 'Lista de médicos' } },
            },
        },
        '/api/portal/appointments': {
            get: {
                tags: ['Portal del paciente'],
                summary: 'Consultar únicamente las citas propias',
                security: bearer,
                responses: { 200: { description: 'Citas del paciente autenticado' } },
            },
            post: {
                tags: ['Portal del paciente'],
                summary: 'Reservar una cita',
                security: bearer,
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['medicoId', 'fecha', 'hora'],
                                properties: {
                                    medicoId: { type: 'integer' },
                                    fecha: { type: 'string', format: 'date' },
                                    hora: { type: 'string', example: '10:30' },
                                },
                            },
                        },
                    },
                },
                responses: { 201: { description: 'Cita reservada' }, 409: { description: 'Horario ocupado o reserva no disponible' } },
            },
        },
        '/api/portal/appointments/{id}/cancel': {
            patch: {
                tags: ['Portal del paciente'],
                summary: 'Cancelar una cita propia programada',
                security: bearer,
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { 200: { description: 'Cita cancelada' }, 409: { description: 'No se puede cancelar esa cita' } },
            },
        },
        '/api/pacientes': {
            get: { tags: ['Administración'], summary: 'Listar pacientes', security: bearer, responses: { 200: { description: 'Lista de pacientes' }, 403: { description: 'Requiere rol ADMIN' } } },
            post: { tags: ['Administración'], summary: 'Registrar paciente', security: bearer, responses: { 201: { description: 'Paciente creado' }, 403: { description: 'Requiere rol ADMIN' } } },
        },
        '/api/pacientes/{id}': {
            patch: { tags: ['Administración'], summary: 'Actualizar paciente', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Paciente actualizado' }, 403: { description: 'Requiere rol ADMIN' } } },
            delete: { tags: ['Administración'], summary: 'Eliminar paciente', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Paciente eliminado' }, 403: { description: 'Requiere rol ADMIN' } } },
        },
        '/api/medicos': {
            get: { tags: ['Administración'], summary: 'Listar médicos', security: bearer, responses: { 200: { description: 'Lista de médicos' }, 403: { description: 'Requiere rol ADMIN' } } },
            post: { tags: ['Administración'], summary: 'Registrar médico', security: bearer, responses: { 201: { description: 'Médico creado' }, 403: { description: 'Requiere rol ADMIN' } } },
        },
        '/api/medicos/{id}': {
            patch: { tags: ['Administración'], summary: 'Actualizar médico', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Médico actualizado' }, 403: { description: 'Requiere rol ADMIN' } } },
            delete: { tags: ['Administración'], summary: 'Eliminar médico', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Médico eliminado' }, 403: { description: 'Requiere rol ADMIN' } } },
        },
        '/api/especialidades': {
            get: { tags: ['Administración'], summary: 'Listar especialidades', security: bearer, responses: { 200: { description: 'Lista de especialidades' } } },
            post: { tags: ['Administración'], summary: 'Crear especialidad', security: bearer, responses: { 201: { description: 'Especialidad creada' } } },
        },
        '/api/especialidades/{id}': {
            delete: { tags: ['Administración'], summary: 'Eliminar especialidad', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Especialidad eliminada' } } },
        },
        '/api/citas': {
            get: { tags: ['Administración'], summary: 'Listar todas las citas', security: bearer, responses: { 200: { description: 'Lista de citas' }, 403: { description: 'Requiere rol ADMIN' } } },
            post: { tags: ['Administración'], summary: 'Agendar cita', security: bearer, responses: { 201: { description: 'Cita creada' } } },
        },
        '/api/citas/{id}': {
            patch: { tags: ['Administración'], summary: 'Actualizar estado de cita', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Cita actualizada' } } },
            delete: { tags: ['Administración'], summary: 'Eliminar cita', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Cita eliminada' } } },
        },
        '/api/historias-clinicas': {
            get: { tags: ['Administración'], summary: 'Consultar historias clínicas', security: bearer, responses: { 200: { description: 'Lista de historias' }, 403: { description: 'Requiere rol ADMIN' } } },
            post: { tags: ['Administración'], summary: 'Registrar historia clínica', security: bearer, responses: { 201: { description: 'Historia creada' } } },
        },
        '/api/historias-clinicas/{id}': {
            delete: { tags: ['Administración'], summary: 'Eliminar historia clínica', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Historia eliminada' } } },
        },
        '/api/laboratorio': {
            get: { tags: ['Administración'], summary: 'Consultar resultados de laboratorio', security: bearer, responses: { 200: { description: 'Lista de resultados' } } },
            post: { tags: ['Administración'], summary: 'Registrar resultado de laboratorio', security: bearer, responses: { 201: { description: 'Resultado creado' } } },
        },
        '/api/pagos': {
            get: { tags: ['Administración'], summary: 'Consultar pagos', security: bearer, responses: { 200: { description: 'Lista de pagos' }, 403: { description: 'Requiere rol ADMIN' } } },
            post: { tags: ['Administración'], summary: 'Registrar pago', security: bearer, responses: { 201: { description: 'Pago creado' } } },
        },
        '/api/triajes': {
            get: { tags: ['Administración'], summary: 'Consultar triajes', security: bearer, responses: { 200: { description: 'Lista de triajes' } } },
        },
        '/api/recepcionistas': {
            get: { tags: ['Administración'], summary: 'Listar recepcionistas', security: bearer, responses: { 200: { description: 'Lista de recepcionistas' } } },
            post: { tags: ['Administración'], summary: 'Registrar recepcionista', security: bearer, responses: { 201: { description: 'Recepcionista creado' } } },
        },
        '/api/enfermeros': {
            get: { tags: ['Administración'], summary: 'Listar enfermeros', security: bearer, responses: { 200: { description: 'Lista de enfermeros' } } },
            post: { tags: ['Administración'], summary: 'Registrar enfermero', security: bearer, responses: { 201: { description: 'Enfermero creado' } } },
        },
        '/api/cajeros': {
            get: { tags: ['Administración'], summary: 'Listar cajeros', security: bearer, responses: { 200: { description: 'Lista de cajeros' } } },
            post: { tags: ['Administración'], summary: 'Registrar cajero', security: bearer, responses: { 201: { description: 'Cajero creado' } } },
        },
    },
};
