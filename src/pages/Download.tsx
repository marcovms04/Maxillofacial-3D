import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const Download: React.FC = () => {
  const { processId } = useParams();
  const navigate = useNavigate();

  const handleDownload = () => {
    window.open(`/api/download-stl/${processId}`, '_blank');
  };

  const handleNewUpload = () => {
    navigate('/upload');
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Download 3D Model
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
              <Typography variant="h5" sx={{ mt: 2 }}>
                Your 3D Model is Ready!
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Segmentation Complete"
                  secondary="The anatomical structure has been successfully segmented"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="3D Model Generated"
                  secondary="STL file has been created and is ready for download"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Print Ready"
                  secondary="The model is optimized for 3D printing"
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Download STL
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<PrintIcon />}
                onClick={handleNewUpload}
              >
                Process New File
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Download; 