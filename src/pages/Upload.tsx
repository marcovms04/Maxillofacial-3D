import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [anatomicalStructure, setAnatomicalStructure] = useState('');
  const [printMaterial, setPrintMaterial] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files).filter(file => file.name.endsWith('.dcm'));
      setSelectedFiles(files);
    }
  };

  const handleAnatomicalStructureChange = (event: SelectChangeEvent) => {
    setAnatomicalStructure(event.target.value);
  };

  const handlePrintMaterialChange = (event: SelectChangeEvent) => {
    setPrintMaterial(event.target.value);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !anatomicalStructure || !printMaterial) {
      setUploadMessage({ type: 'error', message: 'Please select DICOM files and fill in all fields.' });
      return;
    }

    setLoading(true);
    setUploadMessage(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('dicomFiles', file);
    });
    formData.append('anatomicalStructure', anatomicalStructure);
    formData.append('printMaterial', printMaterial);

    try {
      const response = await fetch('/api/upload-dicom-folder', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadMessage({ type: 'success', message: 'Files uploaded successfully!' });
        navigate(`/processing/${result.process_id}`);
      } else {
        const errorData = await response.json();
        setUploadMessage({ type: 'error', message: `Upload failed: ${errorData.message || 'Unknown error'}` });
      }
    } catch (error) {
      setUploadMessage({ type: 'error', message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setLoading(false);
    }
  };

  // Obtener nombre de carpeta raíz para mostrar
  const folderName = selectedFiles.length > 0 ? selectedFiles[0].webkitRelativePath.split('/')[0] : '';

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Upload DICOM Folder
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 150,
              }}
            >
              <input
                type="file"
                webkitdirectory="true"
                directory="true"
                multiple
                accept=".dcm"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <CloudUploadIcon sx={{ fontSize: 60, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {selectedFiles.length > 0 ? `${selectedFiles.length} DICOM files selected` : 'Click or drag a DICOM folder here'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported format: .dcm files within a folder
              </Typography>
              {selectedFiles.length > 0 && (
                <Typography variant="body2" color="inherit" sx={{ mt: 1 }}>
                  Selected folder: {folderName} with {selectedFiles.length} files.
                </Typography>
              )}
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Anatomical Structure</InputLabel>
              <Select
                value={anatomicalStructure}
                label="Anatomical Structure"
                onChange={handleAnatomicalStructureChange}
              >
                <MenuItem value="bone">Bone</MenuItem>
                <MenuItem value="tumor">Tumor</MenuItem>
                <MenuItem value="organ">Organ</MenuItem>
                <MenuItem value="vessel">Blood Vessel</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Print Material</InputLabel>
              <Select
                value={printMaterial}
                label="Print Material"
                onChange={handlePrintMaterialChange}
              >
                <MenuItem value="pla">PLA</MenuItem>
                <MenuItem value="abs">ABS</MenuItem>
                <MenuItem value="tpu">TPU</MenuItem>
                <MenuItem value="resin">Resin</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {uploadMessage && (
            <Grid item xs={12}>
              <Alert severity={uploadMessage.type}>
                {uploadMessage.message}
              </Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || !anatomicalStructure || !printMaterial || loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Upload and Process'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Upload;
