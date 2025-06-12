import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Button,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

const Processing: React.FC = () => {
  const navigate = useNavigate();
  const { processId } = useParams();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    // Simulate processing steps
    const steps = [
      { progress: 20, status: 'Loading DICOM file...' },
      { progress: 40, status: 'Preprocessing image...' },
      { progress: 60, status: 'Segmenting anatomical structures...' },
      { progress: 80, status: 'Generating 3D model...' },
      { progress: 100, status: 'Segmentation Ready!' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].progress);
        setStatus(steps[currentStep].status);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Processing DICOM File
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress
            variant="determinate"
            value={progress}
            size={120}
            thickness={4}
            sx={{ mb: 4 }}
          />
          
          <Typography variant="h6" gutterBottom>
            {status}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            {progress === 100
              ? 'Your 3D model is ready for download'
              : 'Please wait while we process your DICOM file'}
          </Typography>

          {progress === 100 && (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(`/download/${processId}`)}
            >
              Download STL File
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Processing; 