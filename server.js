import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Pool } = pg;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Configuración de conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'clinica_dental',
  password: 'Pro0292147',
  port: 5432,
});

// ----------------------------------------------------------------------
// --- RUTAS DE PACIENTES ---
// ----------------------------------------------------------------------

// Obtener todos los pacientes
app.get('/api/patients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un nuevo paciente
app.post('/api/patients', async (req, res) => {
  const { name, phone, email, dob, blood_type, allergies, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO patients (name, phone, email, dob, blood_type, allergies, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, phone, email, dob, blood_type, allergies, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar/Actualizar un paciente
app.put('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, dob, blood_type, allergies, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE patients 
       SET name = $1, phone = $2, email = $3, dob = $4, blood_type = $5, allergies = $6, notes = $7 
       WHERE id = $8 RETURNING *`,
      [name, phone, email, dob, blood_type, allergies, notes, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar un paciente
app.delete('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING *', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    res.status(200).json({ message: 'Paciente eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------
// --- RUTAS DE ODONTOGRAMAS ---
// ----------------------------------------------------------------------

// Obtener odontograma por ID de paciente
app.get('/api/odontograms/:patientId', async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query('SELECT dental_data FROM odontograms WHERE patient_id = $1', [patientId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0].dental_data);
    } else {
      res.json(null);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Guardar o actualizar odontograma
app.post('/api/odontograms/:patientId', async (req, res) => {
  const { patientId } = req.params;
  const dentalData = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO odontograms (patient_id, dental_data) 
       VALUES ($1, $2) 
       ON CONFLICT (patient_id) 
       DO UPDATE SET dental_data = $2, updated_at = CURRENT_TIMESTAMP RETURNING *`,
      [patientId, dentalData]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------
// --- RUTAS DE USUARIOS Y LOGIN ---
// ----------------------------------------------------------------------

// Login (Verificar NIP de 5 dígitos)
app.post('/api/login', async (req, res) => {
  const { nip } = req.body;
  try {
    const result = await pool.query('SELECT id, nombre, rol, permisos FROM usuarios WHERE nip = $1', [nip]);
    if (result.rows.length > 0) {
      res.json({ usuario: result.rows[0] });
    } else {
      res.status(401).json({ message: 'NIP incorrecto. Intenta de nuevo.' });
    }
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, rol, permisos FROM usuarios ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear nuevo usuario
app.post('/api/usuarios', async (req, res) => {
  const { nombre, nip, rol = 'doctor', permisos } = req.body;
  try {
    const nipExistente = await pool.query('SELECT id FROM usuarios WHERE nip = $1', [nip]);
    if (nipExistente.rows.length > 0) {
      return res.status(400).json({ message: 'Este NIP ya está asignado a otro usuario.' });
    }
    
    const defaultPermisos = { recepcion: true, clinica: true, analitica: false, ajustes: false, escritura: false };
    
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, nip, rol, permisos) VALUES ($1, $2, $3, $4) RETURNING id, nombre, rol, permisos',
      [nombre, nip, rol, permisos || defaultPermisos]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear usuario.' });
  }
});

// Actualizar un usuario existente
app.put('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, nip, rol, permisos } = req.body;
  try {
    // Verificar si el nuevo NIP ya lo tiene otra persona (que no sea este mismo usuario)
    const nipExistente = await pool.query('SELECT id FROM usuarios WHERE nip = $1 AND id != $2', [nip, id]);
    if (nipExistente.rows.length > 0) {
      return res.status(400).json({ message: 'Este NIP ya está en uso por otro usuario.' });
    }

    const result = await pool.query(
      'UPDATE usuarios SET nombre = $1, nip = $2, rol = $3, permisos = $4 WHERE id = $5 RETURNING id, nombre, rol, permisos',
      [nombre, nip, rol, permisos, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un usuario
app.delete('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// --- RUTAS DE CONFIGURACIÓN (MARCA COMERCIAL) ---
// ----------------------------------------------------------------------

// Obtener configuración del negocio
app.get('/api/config', async (req, res) => {
  try {
    const result = await pool.query('SELECT nombre_negocio, subtitulo_negocio, logo FROM configuracion LIMIT 1');
    res.json(result.rows[0] || { nombre_negocio: 'NexusFlow', subtitulo_negocio: 'DENTAL CORE', logo: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar configuración del negocio
app.put('/api/config', async (req, res) => {
  const { nombre_negocio, subtitulo_negocio, logo } = req.body;
  try {
    await pool.query('UPDATE configuracion SET nombre_negocio = $1, subtitulo_negocio = $2, logo = $3', [nombre_negocio, subtitulo_negocio, logo]);
    res.json({ message: 'Configuración actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// --- INICIO DEL SERVIDOR ---
// ----------------------------------------------------------------------
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});