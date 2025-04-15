import { useState, useCallback } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardHero from "@/components/dashboard/DashboardHero";
import { useFileUpload } from "@/hooks/useFileUpload";
import FileUpload from "@/components/dashboard/FileUpload";
import JobFilters, { JobFilterValues } from "@/components/dashboard/JobFilters";
import { createTheme, ThemeProvider } from '@mui/material';

import { 
  Alert, 
  Snackbar, 
  Box, 
  Paper, 
  useTheme,
  IconButton,
  Tooltip,
  Typography 
} from '@mui/material';
import { 
  BusinessCenter as BusinessCenterIcon 
} from '@mui/icons-material';
import { JobItem, JobData,  } from "@/types/JobTypes";
import CompanyReviews from "@/components/dashboard/CompanyReviews";

import JobAlert from '@/components/dashboard/JobAlert';
import * as cheerio from 'cheerio';

// Add these utility functions at the top of the file, after the imports
const createSearchRegex = (searchTerm: string): RegExp => {
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escapedTerm, 'i');
};

// Replace the existing scrapeCareerJetJobs function
const scrapeCareerJetJobs = async (keyword: string, location: string): Promise<JobItem[]> => {
  try {
    const cleanedKeyword = keyword.replace(/^\d+\.\s*/, '').trim();
    const cleanedLocation = location.replace(/^\d+\.\s*/, '').trim();

    const response = await fetch(
      `http://localhost:3000/api/careerjet?keyword=${encodeURIComponent(cleanedKeyword)}&location=${encodeURIComponent(cleanedLocation)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch CareerJet jobs: ${response.status}`);
    }

    const jobs = await response.json();

    if (jobs.length === 0) {
      console.warn('No jobs found for the given keyword and location.');
    }

    return jobs;
  } catch (error) {
    console.error('Error fetching CareerJet jobs:', error);
    return [];
  }
};

// Fetch data from the proxy server
fetch('http://localhost:3000/proxy') // Proxy server address
  .then(response => response.text()) // Parse the response as text (HTML)
  .then(data => {
    console.log(data); // Log the HTML response for debugging
    // You can parse the HTML here if needed
  })
  .catch(error => console.error('Error:', error));

interface JobResults {
  "LinkedIn Jobs": (JobItem )[];
  "Naukri Jobs": (JobItem  )[];
  "CareerJet Jobs": (JobItem )[];
}

// Custom theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#6B46C1', // Purple shade
      light: '#9F7AEA',
      dark: '#553C9A',
    },
    secondary: {
      main: '#ffffff',
      dark: '#f4f4f4',
    },
    background: {
      default: '#F7FAFC',
      paper: '#ffffff',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#2D3748',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

const Dashboard = () => {
  const theme = useTheme();
  const { applications, applicationStats, userSkills } = useDashboardData();
  const { handleFileUpload, uploadingResume } = useFileUpload();
  
  // Add state for company reviews visibility
  const [showReviews, setShowReviews] = useState(false);
  
  // State Management
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  
  // Job Results State - Using a single source of truth with proper typing
  const [jobResults, setJobResults] = useState<JobResults>({
    "LinkedIn Jobs": [],
    "Naukri Jobs": [],
    "CareerJet Jobs": []
  });

  // Separate state for filtered results with proper typing
  const [filteredJobResults, setFilteredJobResults] = useState<JobResults>({
    "LinkedIn Jobs": [],
    "Naukri Jobs": [],
    "CareerJet Jobs": []
  });

  // Filter State
  const [filters, setFilters] = useState<JobFilterValues>({
    experience: 0,
    job_type: "Full-time",
    remote: "on-site",
    date_posted: "week",
    company: "",
    industry: "",
    ctc_filters: "",
    radius: "10",
    keyword: "",
    location: ""
  });

  const handleFilterChange = useCallback((newFilters: JobFilterValues) => {
    setFilters(newFilters);
  }, []);

  // Update the filterJobs function with enhanced regex filtering
  const filterJobs = useCallback((jobs: (JobItem)[], filters: JobFilterValues) => {
    return jobs.filter(job => {
      // Extract job properties with type checking
      const title = 'Title' in job ? job.Title : job.JobTitle;
      const company = 'Company' in job ? job.Company : job.CompanyName;
      const location = job.Location;
      const experience = 'Experience' in job ? job.Experience : '';
      
      // Create regex patterns for each filter
      const keywordRegex = filters.keyword ? createSearchRegex(filters.keyword) : null;
      const locationRegex = filters.location ? createSearchRegex(filters.location) : null;
      const companyRegex = filters.company ? createSearchRegex(filters.company) : null;
      const jobTypeRegex = filters.job_type ? createSearchRegex(filters.job_type) : null;

      // Enhanced matching logic
      const matchesKeyword = !keywordRegex || (
        keywordRegex.test(title || '') || 
        keywordRegex.test(company || '') || 
        keywordRegex.test(job.Description || '')
      );

      const matchesLocation = !locationRegex || 
        locationRegex.test(location || '');

      const matchesCompany = !companyRegex || 
        companyRegex.test(company || '');

      const matchesJobType = !jobTypeRegex || 
        jobTypeRegex.test(title || '');

      // Enhanced experience matching
      const matchesExperience = !filters.experience || 
        (experience && (() => {
          const expYears = parseInt(experience.replace(/[^0-9]/g, ''));
          return !isNaN(expYears) && expYears <= filters.experience;
        })());

      // Add salary/CTC filtering if available
      const matchesCTC = !filters.ctc_filters || 
        (job.Salary && (() => {
          const salary = parseInt(job.Salary.replace(/[^0-9]/g, ''));
          return !isNaN(salary) && salary >= parseInt(filters.ctc_filters);
        })());

      // Remote work filtering
      const matchesRemote = !filters.remote || 
        (job.WorkMode?.toLowerCase().includes(filters.remote.toLowerCase()));

      return matchesKeyword && 
             matchesLocation && 
             matchesCompany && 
             matchesJobType && 
             matchesExperience &&
             matchesCTC &&
             matchesRemote;
    });
  }, []);

  // Update the handleApplyFilters function
  const handleApplyFilters = useCallback(async () => {
    setIsApplyingFilters(true);
    try {
      const filteredResults: JobResults = {
        "LinkedIn Jobs": filterJobs(jobResults["LinkedIn Jobs"], filters),
        "Naukri Jobs": filterJobs(jobResults["Naukri Jobs"], filters),
        "CareerJet Jobs": filterJobs(jobResults["CareerJet Jobs"], filters)
      };
      setFilteredJobResults(filteredResults);
    } catch (error) {
      setError("Error applying filters");
    } finally {
      setIsApplyingFilters(false);
    }
  }, [filters, jobResults, filterJobs]);

  const handleResetFilters = useCallback(() => {
    setFilters({
      experience: 0,
      job_type: "Full-time",
      remote: "on-site",
      date_posted: "week",
      company: "",
      industry: "",
      ctc_filters: "",
      radius: "10",
      keyword: "",
      location: ""
    });
    setFilteredJobResults(jobResults);
  }, [jobResults]);

  const handleJobResultsUpdate = useCallback((newResults: JobResults) => {
    setJobResults(newResults);
    setFilteredJobResults(newResults);
  }, []);

  const handleResumeUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setStatus('Uploading and Extracting Information...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Extract resume data
      const extractResponse = await fetch('http://13.127.205.237:5001/extract', {
        method: 'POST',
        mode: 'cors',
        body: formData,
      });

      if (!extractResponse.ok) {
        throw new Error(`Resume extraction failed! Status: ${extractResponse.status}`);
      }

      const parsedData = await extractResponse.json();

      if (!parsedData.extracted_info) {
        throw new Error('No information could be extracted from the resume');
      }

      setStatus('Searching for Jobs...');

      const jobData: JobData = {
        name: parsedData.name || 'N/A',
        branch: parsedData.branch || 'CSE',
        college: parsedData.college || 'N/A',
        keyword: parsedData.keyword || 'Python',
        location: parsedData.location || 'India',
        experience: parsedData.experience || 0,
        job_type: parsedData.job_type || 'fulltime',
        remote: parsedData.remote || 'on-site',
        date_posted: parsedData.date_posted || 'week',
        company: parsedData.company || '',
        industry: parsedData.industry || '',
        ctc_filters: parsedData.ctc_filters || '',
        radius: parsedData.radius || '10'
      };

      // Clean keyword and location
      const cleanedKeyword = jobData.keyword.replace(/^\d+\.\s*/, '').trim();
      const cleanedLocation = jobData.location.replace(/^\d+\.\s*/, '').trim();

      // Fetch jobs from all sources in parallel
      const [mainJobsResponse, careerjetJobs] = await Promise.all([
        fetch('http://13.127.205.237:5000/job-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData),
        }),
        scrapeCareerJetJobs(cleanedKeyword, cleanedLocation)
      ]);

      if (!mainJobsResponse.ok) {
        throw new Error(`Job search failed! Status: ${mainJobsResponse.status}`);
      }

      const mainResults = await mainJobsResponse.json();

      // Combine all results
      const combinedResults: JobResults = {
        "LinkedIn Jobs": mainResults["LinkedIn Jobs"] || [],
        "Naukri Jobs": mainResults["Naukri Jobs"] || [],
        "CareerJet Jobs": careerjetJobs
      };

      setJobResults(combinedResults);
      setFilteredJobResults(combinedResults);
      setStatus('Job Search Successful!');
      
      // Update resume URL
      handleFileUpload(event, 'resume', (url) => {
        setResumeUrl(url);
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }, [handleFileUpload]);

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <DashboardHero />
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              lg: '300px 1fr',
            }, 
            gap: 4,
            mt: 4,
            position: 'relative'
          }}>
            {/* Left Sidebar */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 3,
              position: { lg: 'sticky' },
              top: { lg: theme.spacing(3) },
              height: { lg: 'calc(100vh - 100px)' },
              overflowY: { lg: 'auto' },
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}>
              <JobFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                isLoading={isApplyingFilters}
              />
              
              <JobAlert 
                keyword={filters.keyword}
                location={filters.location}
              />
            </Box>

            {/* Main Content */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: { xs: 2, md: 3 },
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}>
              <FileUpload 
                onResumeUpload={handleResumeUpload}
                uploadingResume={uploadingResume}
                resumeUrl={resumeUrl}
                jobResults={filteredJobResults}
                onJobResultsUpdate={handleJobResultsUpdate}
                sources={["LinkedIn Jobs", "Naukri Jobs", "CareerJet Jobs"]}
              />
            </Box>

            {/* Company Reviews Button - Fixed Position */}
            <Box
              sx={{
                position: 'fixed',
                right: theme.spacing(4),
                bottom: theme.spacing(4),
                zIndex: 1000,
                transform: 'scale(0.9)',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1)',
                }
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #6B46C1 0%, #805AD5 100%)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(107, 70, 193, 0.2)',
                  }
                }}
                onClick={() => setShowReviews(!showReviews)}
              >
                <Tooltip title={showReviews ? "Hide Reviews" : "Want Company Reviews?"}>
                  <IconButton sx={{ color: 'white' }} size="large">
                    <BusinessCenterIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
                <Typography
                  variant="subtitle2"
                  align="center"
                  sx={{ 
                    mt: 1,
                    color: 'white',
                    fontWeight: 500
                  }}
                >
                  Company Reviews
                </Typography>
              </Paper>
            </Box>

            {/* Company Reviews Panel */}
            {showReviews && (
              <Paper
                elevation={4}
                sx={{
                  position: 'fixed',
                  right: 0,
                  top: 0,
                  width: { xs: '100%', sm: '400px' },
                  height: '100vh',
                  zIndex: 1100,
                  overflowY: 'auto',
                  bgcolor: 'background.paper',
                  boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: showReviews ? 'translateX(0)' : 'translateX(100%)',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CompanyReviews />
              </Paper>
            )}
          </Box>
        </div>

        {/* Error Snackbar */}
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError("")}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setError("")} 
            severity="error"
            sx={{ 
              width: '100%',
              bgcolor: '#FED7D7',
              '& .MuiAlert-icon': {
                color: '#E53E3E'
              }
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;