import sys
import json
from dicom_processor import DicomProcessor

def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            "error": "Invalid arguments. Usage: python process.py <config_json>"
        }))
        sys.exit(1)

    try:
        # Cargar configuración desde JSON
        config = json.loads(sys.argv[1])
        
        # Crear procesador
        processor = DicomProcessor(
            input_dir=config['input_dir'],
            output_dir=config['output_dir'],
            anatomical_structure=config['anatomical_structure']
        )
        
        # Ejecutar procesamiento
        stl_path = processor.process()
        
        # Devolver resultado
        print(json.dumps({
            "success": True,
            "stl_path": stl_path
        }))
        
    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main() 