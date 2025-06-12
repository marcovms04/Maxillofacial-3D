import os
import numpy as np
import SimpleITK as sitk
import vtk
from vtk.util.numpy_support import numpy_to_vtk
import pydicom
from scipy import ndimage
from skimage import filters, morphology, measure
from skimage.filters import gaussian, median
from skimage.morphology import (
    ball, 
    binary_opening, 
    binary_closing, 
    binary_erosion, 
    binary_dilation,
    remove_small_objects
)
from skimage.measure import marching_cubes, label
from scipy.ndimage import binary_fill_holes
import cv2
import logging

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define HU thresholds for different anatomical structures (exactamente como en el código original)
THRESHOLDS = {
    'bone': (600, 3000),    # Original: 'hueso': (600, 3000)
    'tissue': (-400, 100),  # Original: 'tejido': (-400, 100)
    'tumor': (100, 200),    # Original: 'tumor': (100, 200)
    'organ': (-300, 80)     # Original: 'organos': (-300, 80)
}

# Define morphological operation parameters
MORPH_PARAMS = {
    'bone': {
        'opening_radius': 2,
        'closing_radius': 7,
        'min_size': 20000
    },
    'tissue': {
        'opening_radius': 1,
        'closing_radius': 5,
        'min_size': 10000
    },
    'tumor': {
        'opening_radius': 1,
        'closing_radius': 3,
        'min_size': 5000
    },
    'organ': {
        'opening_radius': 2,
        'closing_radius': 5,
        'min_size': 15000
    }
}

class DicomProcessor:
    def __init__(self, input_dir, output_dir, anatomical_structure):
        self.input_dir = input_dir
        self.output_dir = output_dir
        self.anatomical_structure = anatomical_structure
        self.image = None
        self.segmented = None
        self.image_array = None

    def load_dicom_series(self):
        """Carga la serie DICOM y la convierte en un volumen 3D."""
        logger.info("Loading DICOM series...")
        try:
            reader = sitk.ImageSeriesReader()
            dicom_names = reader.GetGDCMSeriesFileNames(self.input_dir)

            if not dicom_names:
                raise FileNotFoundError("No DICOM files found in the input directory.")

            reader.SetFileNames(dicom_names)
            self.image = reader.Execute()
            
            # Obtener el array y convertir a HU
            self.image_array = sitk.GetArrayFromImage(self.image)
            
            # Aplicar RescaleSlope y RescaleIntercept para obtener valores HU
            if hasattr(self.image, 'GetMetaData'):
                slope = float(self.image.GetMetaData('0028|1053')) if self.image.HasMetaDataKey('0028|1053') else 1.0
                intercept = float(self.image.GetMetaData('0028|1052')) if self.image.HasMetaDataKey('0028|1052') else 0.0
                self.image_array = self.image_array * slope + intercept

            logger.info(f"Loaded DICOM series with shape: {self.image_array.shape}")
            logger.info(f"Image range: [{np.min(self.image_array):.2f}, {np.max(self.image_array):.2f}]")
            return self.image_array

        except Exception as e:
            logger.exception("Failed to load DICOM series.")
            raise

    def preprocess_image(self):
        """Preprocesa las imágenes para mejorar la segmentación."""
        logger.info("Preprocessing images...")
        try:
            # Solo aplicar filtro Gaussiano, sin normalización
            self.image_array = gaussian(self.image_array, sigma=1.0)
            
            logger.info("Preprocessing completed")
            return self.image_array

        except Exception as e:
            logger.exception("Error during preprocessing.")
            raise

    def segment_anatomical_structure(self):
        """Segmenta la estructura anatómica especificada usando umbrales HU."""
        logger.info(f"Segmenting {self.anatomical_structure}...")
        try:
            # Get HU thresholds
            if self.anatomical_structure not in THRESHOLDS:
                raise ValueError(f"Unknown anatomical structure: {self.anatomical_structure}")
            
            low, high = THRESHOLDS[self.anatomical_structure]
            logger.info(f"Using HU thresholds: [{low}, {high}]")
            
            # Create binary mask based on HU thresholds
            mask = (self.image_array >= low) & (self.image_array <= high)
            
            # 4.1) Mediana 3D para quitar ruido puntual
            mask = median(mask.astype(np.uint8), footprint=ball(1))
            
            # 4.2) Apertura morfológica para eliminar islas pequeñas
            mask = binary_opening(mask, footprint=ball(2))
            
            # Binary erosion
            mask = binary_erosion(mask, footprint=ball(1))
            
            # 4.3) Cierre morfológico para rellenar huecos
            mask = binary_closing(mask, footprint=ball(7))
            
            # Binary dilation
            mask = binary_dilation(mask, footprint=ball(1))
            
            # 4.4) Rellenar agujeros internos grandes
            mask = binary_fill_holes(mask)
            
            # 4.5) Eliminar objetos muy pequeños
            mask = remove_small_objects(mask.astype(bool), min_size=20000)
            
            # Etiquetar regiones conectadas
            labeled = measure.label(mask)
            
            # Contar píxeles de cada etiqueta
            counts = np.bincount(labeled.ravel())
            if len(counts) > 1:
                largest_label = np.argmax(counts[1:]) + 1  # Omitir el fondo (etiqueta 0)
                mask = (labeled == largest_label)
            
            self.segmented = mask
            logger.info(f"Segmentation completed. Mask size: {np.sum(mask)} voxels")
            return self.segmented

        except Exception as e:
            logger.exception("Segmentation failed.")
            raise

    def generate_stl(self):
        """Genera el archivo STL a partir de la segmentación."""
        logger.info("Generating STL file...")
        try:
            if self.segmented is None:
                raise ValueError("No segmentation found. Please run segmentation first.")

            # Convert to float and check range
            data = self.segmented.astype(np.float32)
            minv, maxv = data.min(), data.max()

            if minv == maxv:
                raise ValueError("La segmentación ha quedado vacía o llena; ajusta los umbrales o filtros.")

            # Nivel óptimo en el punto medio del rango
            level = 0.5 * (minv + maxv)

            # Generate mesh using marching cubes
            verts, faces, _, _ = marching_cubes(data, level=level)

            # Convert to VTK format
            vtk_points = vtk.vtkPoints()
            vtk_points.SetData(numpy_to_vtk(verts))

            vtk_cells = vtk.vtkCellArray()
            for face in faces:
                triangle = vtk.vtkTriangle()
                triangle.GetPointIds().SetId(0, face[0])
                triangle.GetPointIds().SetId(1, face[1])
                triangle.GetPointIds().SetId(2, face[2])
                vtk_cells.InsertNextCell(triangle)

            # Create polydata
            polydata = vtk.vtkPolyData()
            polydata.SetPoints(vtk_points)
            polydata.SetPolys(vtk_cells)

            # Clean the mesh
            cleaner = vtk.vtkCleanPolyData()
            cleaner.SetInputData(polydata)
            cleaner.Update()

            # Remove degenerate faces
            cleaner2 = vtk.vtkCleanPolyData()
            cleaner2.SetInputConnection(cleaner.GetOutputPort())
            cleaner2.Update()

            # Fill holes
            fill = vtk.vtkFillHolesFilter()
            fill.SetInputConnection(cleaner2.GetOutputPort())
            fill.Update()

            # Save STL
            os.makedirs(self.output_dir, exist_ok=True)
            stl_path = os.path.join(self.output_dir, 'model.stl')

            writer = vtk.vtkSTLWriter()
            writer.SetFileName(stl_path)
            writer.SetInputConnection(fill.GetOutputPort())
            writer.SetFileTypeToBinary()
            writer.Write()

            if not os.path.exists(stl_path):
                raise IOError("STL file was not created.")

            logger.info(f"STL file saved at {stl_path}")
            return stl_path

        except Exception as e:
            logger.exception("Failed to generate STL file.")
            raise

    def process(self):
        """Ejecuta todo el pipeline de procesamiento."""
        try:
            self.load_dicom_series()
            self.preprocess_image()
            self.segment_anatomical_structure()
            return self.generate_stl()
        except Exception as e:
            logger.error(f"Processing pipeline failed: {str(e)}")
            raise
