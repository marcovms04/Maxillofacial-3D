import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, Grid, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Home from './pages/Home';
import Upload from './pages/Upload';
import Processing from './pages/Processing';
import Download from './pages/Download';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff4081',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      marginBottom: '1rem',
    },
    h5: {
      fontWeight: 500,
      marginBottom: '1rem',
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: '2rem',
          textAlign: 'center',
          color: theme.palette.text.secondary,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        }),
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Maxillofacial 3D Bioprinting
              </Typography>
              <Button color="inherit" component={Link} to="/">Home</Button>
              <Button color="inherit" component={Link} to="/upload">Upload Images</Button>
              <Button color="inherit" component={Link} to="/processing">Processing</Button>
              <Button color="inherit" component={Link} to="/download">Download</Button>
            </Toolbar>
          </AppBar>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/processing/:processId" element={<Processing />} />
            <Route path="/download/:processId" element={<Download />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 