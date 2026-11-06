/**
 * Datos base del Centro Médico SENATI.
 * Estructuras pensadas para mapear luego a tablas MySQL / API REST.
 */
export const MOCK_DATA = {
  especialidades: [
    { id: 1, nombre: 'Medicina General', codigo: 'MED-GEN', tarifa: 50.0, icono: '🩺', estado: 'Activo' },
    { id: 2, nombre: 'Cardiología', codigo: 'MED-CARD', tarifa: 90.0, icono: '❤️', estado: 'Activo' },
    { id: 3, nombre: 'Pediatría', codigo: 'MED-PED', tarifa: 70.0, icono: '👶', estado: 'Activo' },
    { id: 4, nombre: 'Ginecología', codigo: 'MED-GIN', tarifa: 80.0, icono: '🌸', estado: 'Activo' },
    { id: 5, nombre: 'Oftalmología', codigo: 'MED-OFT', tarifa: 75.0, icono: '👁️', estado: 'Activo' },
    { id: 6, nombre: 'Odontología', codigo: 'MED-ODO', tarifa: 60.0, icono: '🦷', estado: 'Activo' },
    { id: 7, nombre: 'Traumatología', codigo: 'MED-TRA', tarifa: 85.0, icono: '🦴', estado: 'Activo' },
  ],
  sedes: [
    { id: 1, nombre: 'Sede Principal - Lima Norte (Independencia)', direccion: 'Av. Alfredo Mendiola 3520', telefono: '01-5149300', estado: 'Activo' },
    { id: 2, nombre: 'Sede Sur - San Juan de Miraflores', direccion: 'Av. Los Héroes 820', telefono: '01-5149310', estado: 'Activo' },
    { id: 3, nombre: 'Sede Este - Santa Anita', direccion: 'Carretera Central Km 3.5', telefono: '01-5149320', estado: 'Activo' },
  ],
  consultorios: [
    { id: 101, numero: '101', sedeId: 1, tipo: 'Consulta General', piso: 'Piso 1', estado: 'Disponible' },
    { id: 102, numero: '102', sedeId: 1, tipo: 'Cardiología y EKG', piso: 'Piso 1', estado: 'Disponible' },
    { id: 201, numero: '201', sedeId: 1, tipo: 'Pediatría', piso: 'Piso 2', estado: 'Disponible' },
    { id: 202, numero: '202', sedeId: 1, tipo: 'Tópico y Procedimientos', piso: 'Piso 2', estado: 'Disponible' },
    { id: 301, numero: '301', sedeId: 2, tipo: 'Odontología Clínica', piso: 'Piso 1', estado: 'Disponible' },
  ],
  medicos: [],
  pacientes: [],
  citas: [],
  historiasClinicas: [],
  pagos: [],
}

export const USUARIO_ACTUAL = {
  nombre: 'Lic. Andrea Torres',
  cargo: 'Administrador / Admisión',
  rol: 'ADMIN',
  sede: 'Sede Principal - Lima Norte',
  avatar: 'AT',
}

// Catálogo de iconos para el selector de especialidades
export const ICONOS_MEDICOS = [
  { icon: '🩺', tag: 'estetoscopio medicina general consulta medico' },
  { icon: '❤️', tag: 'cardiologia corazon cardiovascular presion' },
  { icon: '🧠', tag: 'neurologia cerebro mente cabeza psiquiatria' },
  { icon: '👶', tag: 'pediatria ninos bebe infantil neonatologia' },
  { icon: '🌸', tag: 'ginecologia mujer obstetricia prenatal' },
  { icon: '👁️', tag: 'oftalmologia ojos vista ocular optometria' },
  { icon: '🦷', tag: 'odontologia dientes muelas bucal ortodoncia' },
  { icon: '🦴', tag: 'traumatologia huesos esqueleto articulaciones ortopedia' },
  { icon: '🫁', tag: 'neumologia pulmones respiratorio bronquios' },
  { icon: '👂', tag: 'otorrinolaringologia oido garganta nariz' },
  { icon: '💉', tag: 'inyeccion vacuna jeringa inmunizacion analisis' },
  { icon: '🔬', tag: 'laboratorio patologia analisis microscopio cultivo' },
  { icon: '💊', tag: 'farmacia medicamentos pastillas capsulas receta' },
  { icon: '🩸', tag: 'hematologia sangre transfusiones donacion' },
  { icon: '🩹', tag: 'topico curaciones vendajes heridas primeros auxilios' },
  { icon: '🚑', tag: 'urgencias ambulancia emergencias trauma shock' },
  { icon: '🧪', tag: 'bioquimica reactivos tubos examen de orina' },
  { icon: '🧬', tag: 'genetica adn biologia molecular' },
  { icon: '🏥', tag: 'clinica hospital policlinico centro medico' },
  { icon: '👨‍⚕️', tag: 'medico doctor especialista varon' },
  { icon: '👩‍⚕️', tag: 'medica doctora especialista mujer' },
  { icon: '🍏', tag: 'nutricion dieta endocrinologia metabolismo' },
  { icon: '💆', tag: 'dermatologia piel estetica terapia facial' },
  { icon: '🩻', tag: 'radiografia rayos x imagenes tomografia resonancia' },
  { icon: '🌡️', tag: 'termometro fiebre temperatura triaje' },
]
