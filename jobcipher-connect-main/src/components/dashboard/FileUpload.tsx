import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Link,
  Chip,
  Grid,
  Divider,
  styled,
  IconButton,
  Tooltip
} from '@mui/material';
import { extractResumeInfo, logMessage, parseCSV } from '@/utils/resumeParser';

interface JobCardProps {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  url?: string;
  source: string;
}

const JobCard: React.FC<JobCardProps> = ({ title, company, location, description, url, source }) => (
  <StyledCard>
    <CardContent>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <JobDetail><BusinessIcon /> {company}</JobDetail>
      {location && <JobDetail><LocationIcon /> {location}</JobDetail>}
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      )}
    </CardContent>
    <CardActions>
      <Link href={url} target="_blank" rel="noopener noreferrer">
        <Button size="small" endIcon={<OpenInNewIcon />}>View Job</Button>
      </Link>
      <Chip label={source} size="small" sx={{ ml: 'auto' }} />
    </CardActions>
  </StyledCard>
);



import {
  CloudUpload as CloudUploadIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  OpenInNew as OpenInNewIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { JobData, JobResults, JobSource } from '../../types/JobTypes';

interface FileUploadProps {
  onResumeUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingResume: boolean;
  resumeUrl: string;
  jobResults: JobResults;
  onJobResultsUpdate: (results: JobResults) => void;
  sources: Array<"LinkedIn Jobs" | "Naukri Jobs" | "CareerJet Jobs">;
}


// Enhanced interface for job data
interface JobItem {
  // LinkedIn specific fields
  Title?: string;
  Company?: string;
  CompanyLink?: string;
  Location?: string;
  TimePosted?: string;
  JobLink?: string;

  // Naukri specific fields
  JobTitle?: string;
  CompanyName?: string;
  Rating?: string;
  Experience?: string;
  TechStack?: string;
  JobPostingLink?: string;

  [key: string]: string | undefined;
}

// Styled components
const Input = styled('input')({
  display: 'none',
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  borderRadius: theme.spacing(1),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const JobDetail = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const FileUpload: React.FC<FileUploadProps> = ({
  onResumeUpload,
  uploadingResume,
  resumeUrl,
  jobResults,
  onJobResultsUpdate,
  sources
}) => {
  // State declarations
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<JobSource>("LinkedIn Jobs");
  const [fileName, setFileName] = useState<string>('');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // Utility functions
  const cleanText = (text: string): string => {
    // Remove numeric prefixes like "4.", "5.", etc., and trim whitespace
    return text.replace(/^\d+\.\s*/, '').trim();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: JobSource) => {
    setActiveTab(newValue);
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const newSaved = new Set(prev);
      if (newSaved.has(jobId)) {
        newSaved.delete(jobId);
      } else {
        newSaved.add(jobId);
      }
      return newSaved;
    });
  };

  // Add this function before the handleFileUpload
const scrapeCareerJetJobs = async (keyword: string, location: string): Promise<JobItem[]> => {
  try {
    const cleanedKeyword = keyword.replace(/^\d+\.\s*/, '').trim();
    const cleanedLocation = location.replace(/^\d+\.\s*/, '').trim();

    const response = await fetch(
      `http://localhost:3001/api/careerjet?keyword=${encodeURIComponent(cleanedKeyword)}&location=${encodeURIComponent(cleanedLocation)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch CareerJet jobs: ${response.status}`);
    }

    const jobs = await response.json();
    
    if (!Array.isArray(jobs)) {
      throw new Error('Invalid response format from CareerJet API');
    }

    return jobs.map((job: any) => ({
      Title: job.Title,
      Company: job.Company,
      Location: job.Location,
      Description: job.Description,
      JobLink: job.JobLink,
      TimePosted: job.TimePosted
    }));
  } catch (error) {
    console.error('Error fetching CareerJet jobs:', error);
    return [];
  }
};

  // File upload handler
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setError('');
    setStatus('Uploading and Extracting Information...');
     // Reset previous results

    const formData = new FormData();
    formData.append('file', file);

    try {
      const extractResponse = await fetch('http://13.127.205.237:5001/extract', {
        method: 'POST',
        mode: 'cors',
        body: formData,
      });

      if (!extractResponse.ok) {
        throw new Error(`Resume extraction failed! Status: ${extractResponse.status}`);
      }

      const parsedData = await extractResponse.json();
      logMessage("Extracted Data: " + JSON.stringify(parsedData, null, 2));

      if (!parsedData.extracted_info) {
        throw new Error('No information could be extracted from the resume');
      }

      // Use the new extractResumeInfo function
      const resumeInfo = extractResumeInfo(parsedData.extracted_info);
      logMessage("Parsed Resume Info: " + JSON.stringify(resumeInfo, null, 2));

      const jobData: JobData = {
        name: resumeInfo.name,
        branch: resumeInfo.branch,
        college: resumeInfo.college,
        keyword: resumeInfo.keyword,
        location: resumeInfo.location,
        experience: parsedData.experience || 0,
        job_type: parsedData.job_type || 'fulltime',
        remote: parsedData.remote || 'on-site',
        date_posted: parsedData.date_posted || 'week',
        company: parsedData.company || '',
        industry: parsedData.industry || '',
        ctc_filters: parsedData.ctc_filters || '',
        radius: parsedData.radius || '10'
      };

      setStatus('Searching for Jobs...');

      // Update this section in handleFileUpload
      const [mainJobsResponse, careerjetResults] = await Promise.all([
        fetch('http://13.127.205.237:5000/job-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData),
        }).then(res => res.json()),
        scrapeCareerJetJobs(jobData.keyword, jobData.location)
      ]);

      // Combine all results
      const combinedResults: JobResults = {
        "LinkedIn Jobs": parseJobsToJson(mainJobsResponse["LinkedIn Jobs"] || ''),
        "Naukri Jobs": parseJobsToJson(mainJobsResponse["Naukri Jobs"] || ''),
        "CareerJet Jobs": careerjetResults
      };

      console.log("Combined results:", {
        LinkedIn: combinedResults["LinkedIn Jobs"].length,
        Naukri: combinedResults["Naukri Jobs"].length,
        CareerJet: combinedResults["CareerJet Jobs"].length
      });

      onJobResultsUpdate(combinedResults);
      setStatus('Job Search Successful!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      logMessage('Error: ' + errorMessage);
    } finally {
      setLoading(false);
      // Reset file input
      const fileInput = document.getElementById('contained-button-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }, [onJobResultsUpdate]);

  // Parse CSV to JSON with platform-specific handling
  const parseJobsToJson = (csvString: string): JobItem[] => {
    try {
      const rows = parseCSV(csvString);
      if (rows.length < 2) return [];

      const headers = rows[0];
      return rows.slice(1).map(values => {
        const jobItem: JobItem = {};
        headers.forEach((header, index) => {
          if (values[index]) {
            // Map CSV headers to our JobItem interface
            const value = values[index];
            switch (header.toLowerCase()) {
              case 'job title':
              case 'title':
                jobItem.Title = value;
                jobItem.JobTitle = value;
                break;
              case 'company':
              case 'company name':
                jobItem.Company = value;
                jobItem.CompanyName = value;
                break;
              case 'company link':
                jobItem.CompanyLink = value;
                break;
              case 'location':
                jobItem.Location = value;
                break;
              case 'time posted':
              case 'posted':
                jobItem.TimePosted = value;
                break;
              case 'job link':
              case 'job posting link':
                jobItem.JobLink = value;
                jobItem.JobPostingLink = value;
                break;
              case 'rating':
                jobItem.Rating = value;
                break;
              case 'experience':
                jobItem.Experience = value;
                break;
              case 'tech stack':
              case 'skills':
                jobItem.TechStack = value;
                break;
              default:
                jobItem[header] = value;
            }
          }
        });
        return jobItem;
      });
    } catch (error) {
      logMessage('Error parsing CSV: ' + (error instanceof Error ? error.message : String(error)));
      return [];
    }
  };

  // Render job card based on platform
  const renderJobCard = (job: JobItem, source: string) => {
    const title = job.Title || job.JobTitle || '';
    const company = job.Company || job.CompanyName || '';
    const location = job.Location || '';
    const url = job.JobLink || job.JobPostingLink || '';
    
    return (
      <JobCard
        title={title}
        company={company}
        location={location}
        url={url}
        source={source}
      />
    );
  };

  // Transform job data to JobItem format
 

  

  const handleJobSearch = async (jobData: JobData) => {
    try {
      const mainResults = await fetch('http://13.127.205.237:5000/job-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      }).then(res => res.json());

      const combinedResults: JobResults = {
        "LinkedIn Jobs": mainResults["LinkedIn Jobs"] || [],
        "Naukri Jobs": mainResults["Naukri Jobs"] || [],
        'CareerJet Jobs': []
      };

      console.log('Combined results:', combinedResults);
      onJobResultsUpdate(combinedResults);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  // Component render
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Resume Upload and Job Search
        </Typography>

        <StyledPaper elevation={3}>
          <Box sx={{ textAlign: 'center' }}>
            <label htmlFor="contained-button-file">
              <Input
                accept="application/pdf"
                id="contained-button-file"
                type="file"
                onChange={handleFileUpload}
              />
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                component="span"
                disabled={loading}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  backgroundColor: (theme) => theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.primary.dark,
                  }
                }}
              >
                Upload Resume
              </Button>
            </label>
            {fileName && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {fileName}
              </Typography>
            )}
            {loading && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            )}
            {status && !error && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {status}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </StyledPaper>

        {(jobResults["LinkedIn Jobs"].length > 0 || 
          jobResults["Naukri Jobs"].length > 0 || 
          jobResults["CareerJet Jobs"].length > 0) && (
          <StyledPaper elevation={3}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                centered
                variant="fullWidth"
              >
                <Tab 
                  label={`LinkedIn Jobs (${jobResults["LinkedIn Jobs"].length})`} 
                  value="LinkedIn Jobs" 
                />
                <Tab 
                  label={`Naukri Jobs (${jobResults["Naukri Jobs"].length})`} 
                  value="Naukri Jobs" 
                />
                <Tab 
                  label={`CareerJet Jobs (${jobResults["CareerJet Jobs"].length})`} 
                  value="CareerJet Jobs" 
                />
              </Tabs>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              {jobResults[activeTab]?.length > 0 ? (
                jobResults[activeTab].map((job, index) => (
                  <React.Fragment key={index}>
                    {renderJobCard(job, activeTab)}
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body1" align="center" sx={{ py: 4 }}>
                  No jobs found
                </Typography>
              )}
            </Box>
          </StyledPaper>
        )}
      </Box>
    </Container>
  );
};

export default FileUpload;