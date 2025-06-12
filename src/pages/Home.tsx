import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Button,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
  },
}));

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography variant="h1" component="h1" gutterBottom>
            Maxillofacial 3D Bioprinting
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Transforming Head and Facial Healthcare Through Advanced 3D Printing
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/upload')}
          >
            Upload DICOM Images
          </Button>
        </Box>
                <Typography variant="h4" align = "center" component="h2" gutterBottom sx={{ mb: 4 }}>
          Overview of Medical 3D Printing
        </Typography>

        {/* Market Overview */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Market Growth
                </Typography>
                <Typography variant="body1" paragraph>
                  The medical 3D printing market is projected to reach $6.08 billion by 2027, 
                  growing at a CAGR of 17.7% from 2020 to 2027. This growth is driven by:
                </Typography>
                <ul>
                  <li>Increasing demand for personalized medical devices</li>
                  <li>Advancements in 3D printing technology</li>
                  <li>Growing adoption in surgical planning</li>
                  <li>Rising healthcare expenditure</li>
                </ul>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Key Applications
                </Typography>
                <Typography variant="body1" paragraph>
                  Medical 3D printing is revolutionizing healthcare through:
                </Typography>
                <ul>
                  <li>Surgical planning and training</li>
                  <li>Custom prosthetics and implants</li>
                  <li>Anatomical models for education</li>
                  <li>Bioprinting for tissue engineering</li>
                </ul>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Benefits Section */}
        <Typography variant="h4" align = "center" component="h2" gutterBottom sx={{ mb: 4 }}>
          Benefits of Medical 3D Printing
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personalized Care
                </Typography>
                <Typography variant="body2">
                  Customized medical devices and implants tailored to individual patient anatomy
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cost Efficiency
                </Typography>
                <Typography variant="body2">
                  Reduced production costs and improved resource utilization
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Improved Outcomes
                </Typography>
                <Typography variant="body2">
                  Better surgical planning and more accurate medical interventions
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 