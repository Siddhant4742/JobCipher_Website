import { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress
} from '@mui/material';

interface CompanyReviews {
  reviews: {
    [key: string]: string;
  };
  links: {
    [key: string]: string;
  };
}

const CompanyReviews = () => {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetReviews = async () => {
    if (!companyName.trim()) {
      setError('Please enter a company name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://13.127.205.237:5002/get_reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      if (!data.review) {
        throw new Error('No review data found');
      }

      // Open in new window with formatted content
      const reviewWindow = window.open('', '_blank');
      if (reviewWindow) {
        let htmlContent = `
          <html>
            <head>
              <title>Reviews for ${companyName}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { color: #1976d2; }
                h3 { color: #333; }
                a { color: #1976d2; text-decoration: none; }
                a:hover { text-decoration: underline; }
              </style>
            </head>
            <body>
              <h2>Reviews for ${companyName}</h2>
        `;

        Object.entries(data.review.reviews || {}).forEach(([platform, review]) => {
          htmlContent += `
            <h3>${platform}</h3>
            <p>${review}</p>
            <a href="${data.review.links[platform]}" target="_blank">Read more on ${platform}</a>
            <br><br>
          `;
        });

        htmlContent += '</body></html>';
        reviewWindow.document.write(htmlContent);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Company Reviews
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          label="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g., Amazon"
          error={!!error}
          helperText={error}
        />
        <Button
          variant="contained"
          onClick={handleGetReviews}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Get Reviews'}
        </Button>
      </Box>
    </Paper>
  );
};

export default CompanyReviews;