const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Directorios para archivos
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const STL_DIR = path.join(__dirname, 'stl');

// Asegurar que los directorios existan
fs.ensureDirSync(UPLOADS_DIR);
fs.ensureDirSync(STL_DIR);

// Estado de los procesos
const processes = {};

// Configuración de Multer para múltiples archivos DICOM
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const processId = req.processId;
    const dir = path.join(UPLOADS_DIR, processId);
    fs.ensureDirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Mantener el nombre original del archivo
    cb(null, file.originalname);
  }
});

// Límite de archivos: 100
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Solo aceptar archivos .dcm
    if (file.originalname.toLowerCase().endsWith('.dcm')) {
      cb(null, true);
    } else {
      cb(new Error('Only .dcm files are allowed'));
    }
  }
}).array('dicomFiles', 350);

// Middleware para generar processId
function assignProcessId(req, res, next) {
  req.processId = uuidv4();
  next();
}

// Función para ejecutar el procesamiento Python
async function runPythonProcessor(processId, anatomicalStructure) {
  const process = processes[processId];
  if (!process) return;

  try {
    const config = {
      input_dir: path.join(UPLOADS_DIR, processId),
      output_dir: path.join(STL_DIR, processId),
      anatomical_structure: anatomicalStructure
    };

    // Asegurar que el directorio de salida existe
    fs.ensureDirSync(config.output_dir);

    // Actualizar estado
    process.status = 'processing';
    process.message = 'Processing DICOM files...';
    process.progress = 20;

    // Ejecutar el script Python
    const pythonProcess = spawn('python', [
      path.join(__dirname, 'processing', 'process.py'),
      JSON.stringify(config)
    ]);

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      // Actualizar progreso basado en los mensajes de log
      if (data.toString().includes('Preprocessing completed')) {
        process.progress = 40;
        process.message = 'Preprocessing completed, starting segmentation...';
      } else if (data.toString().includes('Segmentation completed')) {
        process.progress = 60;
        process.message = 'Segmentation completed, generating STL...';
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        process.status = 'failed';
        process.error = error || 'Processing failed';
        console.error(`Python process exited with code ${code}`);
        return;
      }

      try {
        const result = JSON.parse(output);
        if (result.error) {
          process.status = 'failed';
          process.error = result.error;
        } else {
          process.status = 'completed';
          process.stlPath = result.stl_path;
          process.progress = 100;
          process.message = 'Processing completed successfully';
        }
      } catch (e) {
        process.status = 'failed';
        process.error = 'Failed to parse Python output';
        console.error('Error parsing Python output:', e);
      }
    });

  } catch (error) {
    process.status = 'failed';
    process.error = error.message;
    console.error('Error in Python processing:', error);
  }
}

// Endpoint: Subir archivos DICOM
app.post('/api/upload-dicom-folder', assignProcessId, upload, async (req, res) => {
  try {
    const processId = req.processId;
    const { anatomicalStructure, printMaterial } = req.body;

    // Validar campos requeridos
    if (!anatomicalStructure || !printMaterial) {
      return res.status(400).json({ message: 'Anatomical structure and print material are required' });
    }

    // Verificar que se subieron archivos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }

    // Inicializar el proceso
    processes[processId] = {
      status: 'uploaded',
      progress: 0,
      message: 'Files uploaded successfully',
      anatomicalStructure,
      printMaterial,
      stlPath: null,
      error: null
    };

    // Iniciar el procesamiento en background
    runPythonProcessor(processId, anatomicalStructure);

    res.json({ process_id: processId });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading files' });
  }
});

// Endpoint: Obtener estado del proceso
app.get('/api/status/:processId', (req, res) => {
  const { processId } = req.params;
  const process = processes[processId];

  if (!process) {
    return res.status(404).json({ detail: 'Process ID not found' });
  }

  res.json({
    status: process.status,
    progress: process.progress,
    message: process.message,
    error: process.error
  });
});

// Endpoint: Descargar archivo STL
app.get('/api/download-stl/:processId', (req, res) => {
  const { processId } = req.params;
  const process = processes[processId];

  if (!process) {
    return res.status(404).json({ detail: 'Process ID not found' });
  }

  if (process.status !== 'completed' || !process.stlPath) {
    return res.status(400).json({ 
      detail: 'Processing not completed or STL not available',
      status: process.status,
      error: process.error
    });
  }

  // Verificar que el archivo existe
  if (!fs.existsSync(process.stlPath)) {
    return res.status(404).json({ detail: 'STL file not found' });
  }

  res.download(process.stlPath, `${processId}.stl`);
});

// Función para limpiar archivos temporales
function cleanupProcess(processId) {
  const process = processes[processId];
  if (!process) return;

  try {
    // Eliminar archivos DICOM
    const dicomDir = path.join(UPLOADS_DIR, processId);
    fs.removeSync(dicomDir);

    // Eliminar archivo STL
    if (process.stlPath) {
      fs.removeSync(process.stlPath);
    }

    // Eliminar proceso de la memoria
    delete processes[processId];
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
}); 