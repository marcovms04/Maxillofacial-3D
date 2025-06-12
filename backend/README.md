# Bioprint 3D Backend

Este es el backend para la aplicación Bioprint 3D, que maneja el procesamiento de archivos DICOM y la generación de modelos 3D en formato STL.

## Requisitos

- Node.js (v14 o superior)
- npm (v6 o superior)

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
cd bioprint-3d/backend
npm install
```

## Configuración

El backend se ejecuta por defecto en el puerto 8000. Puedes modificar el puerto en el archivo `app.js`.

## Uso

1. Iniciar el servidor:
```bash
npm start
```

Para desarrollo (con recarga automática):
```bash
npm run dev
```

## Endpoints

### POST /api/upload-dicom-folder
Sube una carpeta con archivos DICOM.

**Body (multipart/form-data):**
- `dicomFiles`: Array de archivos .dcm
- `anatomicalStructure`: Estructura anatómica a segmentar
- `printMaterial`: Material de impresión

**Respuesta:**
```json
{
  "process_id": "uuid"
}
```

### GET /api/status/:processId
Obtiene el estado del procesamiento.

**Respuesta:**
```json
{
  "status": "uploaded|loading|preprocessing|segmenting|generating|completed|failed",
  "progress": 0-100,
  "message": "Mensaje descriptivo",
  "error": "Mensaje de error (si aplica)"
}
```

### GET /api/download-stl/:processId
Descarga el archivo STL generado.

**Respuesta:**
- Archivo STL si el procesamiento está completo
- Error 400 si el procesamiento no está completo
- Error 404 si el proceso no existe

## Estructura de Directorios

```
backend/
  ├─ uploads/           # Archivos DICOM temporales
  ├─ stl/              # Archivos STL generados
  ├─ app.js            # Aplicación principal
  └─ package.json      # Dependencias y scripts
```

## Notas

- Los archivos temporales se eliminan automáticamente después de 5 minutos de completar el procesamiento.
- Solo se aceptan archivos con extensión .dcm.
- El procesamiento se realiza de forma asíncrona. 