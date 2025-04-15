import React, { useState } from 'react';
import { 
  Paper,
  Typography,
  Button,
  Alert,
  Snackbar,
  Box,
  CircularProgress,
  TextField,
  Autocomplete,
  Stack
} from '@mui/material';
import { NotificationsActive as AlertIcon } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

// Add these constant arrays for dropdown options
const LOCATIONS = [
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Noida',
  'Gurgaon',
  'Kolkata',
  'India',
  // Add more locations as needed
];

const JOB_KEYWORDS = [
  'Software Developer',
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Machine Learning Engineer',
  'Product Manager',
  'UI/UX Designer',
  // Add more keywords as needed
];

interface JobAlertProps {
  keyword?: string;
  location?: string;
}

const JobAlert: React.FC<JobAlertProps> = ({ keyword: initialKeyword, location: initialLocation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedKeyword, setSelectedKeyword] = useState<string>(initialKeyword || 'Software Developer');
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation || 'India');

  const handleCreateAlert = async () => {
    if (!user?.email) {
      setError('Please login to create job alerts');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://43.204.145.184:5004/subscribe-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: selectedKeyword,
          location: selectedLocation,
          email: user.email,
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create job alert');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        opacity: 0.1,
        transform: 'translate(20%, -20%)'
      }}>
        <AlertIcon sx={{ fontSize: 100 }} />
      </Box>

      <Typography variant="h6" component="h2">
        Job Alerts
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Get daily notifications for new jobs matching your profile at 12:00 PM
      </Typography>

      <Stack spacing={2}>
        <Autocomplete
          value={selectedKeyword}
          onChange={(_, newValue) => setSelectedKeyword(newValue || 'Software Developer')}
          options={JOB_KEYWORDS}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Job Role" 
              variant="outlined"
              size="small"
            />
          )}
          freeSolo
          fullWidth
        />

        <Autocomplete
          value={selectedLocation}
          onChange={(_, newValue) => setSelectedLocation(newValue || 'India')}
          options={LOCATIONS}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Location" 
              variant="outlined"
              size="small"
            />
          )}
          freeSolo
          fullWidth
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateAlert}
          disabled={loading || !user?.email}
          startIcon={loading ? <CircularProgress size={20} /> : <AlertIcon />}
          fullWidth
        >
          {loading ? 'Creating Alert...' : 'Create Job Alert'}
        </Button>
      </Stack>

      {!user?.email && (
        <Typography variant="caption" color="error">
          Please login to create job alerts
        </Typography>
      )}

      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success">
          Job alert created successfully! You will receive daily updates for {selectedKeyword} jobs in {selectedLocation}.
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default JobAlert;