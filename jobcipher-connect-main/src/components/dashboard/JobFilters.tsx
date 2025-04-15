import React from 'react';
import { 
  Paper, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Button, 
  Box,
  SelectChangeEvent 
} from '@mui/material';

export interface JobFilterValues {
  experience: number;
  job_type: string;
  remote: string;
  date_posted: string;
  company: string;
  industry: string;
  ctc_filters: string;
  radius: string;
  keyword: string;
  location: string;
}

interface JobFiltersProps {
  filters: JobFilterValues;
  onFilterChange: (filters: JobFilterValues) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  isLoading?: boolean;
  totalResults?: number;
  filteredResults?: number;
}

const keywordOptions = [
  "Software Engineer",
  "Network Administrator",
  "Web Developer",
  "Computer Programmer",
  "Information Security Analyst",
  "Data Architect",
  "Business Systems Analyst",
  "UX Designer",
  "UI Designer",
  "Computer Scientist",
  "Chief Information Officer (CIO)",
  "AI Engineer",
  "Machine Learning Specialist",
  "Data Scientist",
  "Cloud Solutions Architect",
  "DevOps Engineer",
  "Full Stack Developer",
  "Systems Analyst",
  "Database Administrator",
  "IT Support Specialist",
  "Cybersecurity Analyst",
  "Mobile Application Developer",
  "IT Project Manager",
  "Blockchain Developer",
  "Network Engineer",
  "QA Engineer",
  "Technical Support Engineer",
  "IT Consultant",
  "Front-End Developer",
  "Back-End Developer",
  "Embedded Systems Engineer",
  "Systems Administrator",
  "IT Infrastructure Manager",
  "Enterprise Architect",
  "Big Data Engineer",
  "Program Manager",
  "Cloud Architect",
  "Engineering Manager",
  "Security Operations Center (SOC) Manager",
  "Cybersecurity Manager",
  "AI Specialist",
  "Machine Learning Engineer",
  "Data Analyst",
  "Software Developer",
  "IT Manager",
  "Technical Lead",
  "Product Manager",
  "Scrum Master",
  "Agile Coach",
  "IT Director"
];

const locationOptions = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Kolkata",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Surat",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Visakhapatnam",
  "Bhopal",
  "Patna",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Vadodara",
  "Indore",
  "Coimbatore",
  "Kochi",
  "Mysore",
  "Thiruvananthapuram",
  "Guwahati",
  "Chandigarh",
  "Amritsar",
  "Ranchi",
  "Raipur",
  "Bhubaneswar",
  "Dehradun",
  "Jodhpur",
  "Madurai",
  "Varanasi",
  "Aurangabad",
  "Gwalior",
  "Vijayawada",
  "Jabalpur",
  "Rajkot",
  "Meerut",
  "Dhanbad",
  "Allahabad",
  "Faridabad",
  "Ghaziabad",
  "Noida",
  "Gurgaon",
  "Shimla",
  "Srinagar",
  "Puducherry"
];

// Add these utility functions at the top of the file, after the imports
const createSearchRegex = (searchTerm: string): RegExp => {
  // Escape special regex characters and create a case-insensitive regex
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escapedTerm, 'i');
};

// Enhanced filtering utility function
const matchesFilter = (text: string | undefined, filter: string): boolean => {
  if (!filter || !text) return true;
  const regex = createSearchRegex(filter);
  return regex.test(text);
};

const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onFilterChange,
  onApplyFilters,
  isLoading = false,
  totalResults = 0,
  filteredResults = 0
}) => {
  // Update the handleInputChange function to include input validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validation rules for specific fields
    let sanitizedValue = value;
    
    switch (name) {
      case 'experience':
        sanitizedValue = value.replace(/[^0-9]/g, '');
        break;
      case 'ctc_filters':
        sanitizedValue = value.replace(/[^0-9.]/g, '');
        break;
      case 'radius':
        sanitizedValue = value.replace(/[^0-9]/g, '');
        break;
      case 'keyword':
      case 'location':
      case 'company':
      case 'industry':
        // Allow letters, numbers, spaces, and basic punctuation
        sanitizedValue = value.replace(/[^a-zA-Z0-9\s.,&-]/g, '');
        break;
    }
  
    onFilterChange({
      ...filters,
      [name]: sanitizedValue,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
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
  };

  // Enhanced filter validation function
  const validateFilters = (filters: JobFilterValues): boolean => {
    // Check if any filter has invalid values
    if (
      (filters.experience && isNaN(Number(filters.experience))) ||
      (filters.ctc_filters && isNaN(Number(filters.ctc_filters))) ||
      (filters.radius && isNaN(Number(filters.radius)))
    ) {
      return false;
    }
    return true;
  };

  // Update the filter application logic
  const handleApplyFilters = () => {
    if (!validateFilters(filters)) {
      // Show error message or handle invalid filters
      console.error('Invalid filter values');
      return;
    }
    onApplyFilters();
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filters
        {filteredResults > 0 && (
          <Typography variant="body2" color="text.secondary">
            Showing {filteredResults} of {totalResults} jobs
          </Typography>
        )}
      </Typography>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Experience (years)"
          type="number"
          name="experience"
          value={filters.experience}
          onChange={handleInputChange}
          InputProps={{ inputProps: { min: 0 } }}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Job Type</InputLabel>
          <Select
            name="job_type"
            value={filters.job_type}
            onChange={handleSelectChange}
            label="Job Type"
          >
            <MenuItem value="Full-time">Full Time</MenuItem>
            <MenuItem value="Part-time">Part Time</MenuItem>
            <MenuItem value="Contract">Contract</MenuItem>
            <MenuItem value="Internship">Internship</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Work Mode</InputLabel>
          <Select
            name="remote"
            value={filters.remote}
            onChange={handleSelectChange}
            label="Work Mode"
          >
            <MenuItem value="on-site">On-Site</MenuItem>
            <MenuItem value="remote">Remote</MenuItem>
            <MenuItem value="hybrid">Hybrid</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Date Posted</InputLabel>
          <Select
            name="date_posted"
            value={filters.date_posted}
            onChange={handleSelectChange}
            label="Date Posted"
          >
            <MenuItem value="hours">Last 24 Hours</MenuItem>
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Company Name"
          name="company"
          value={filters.company}
          onChange={handleInputChange}
          placeholder="e.g., Google"
          fullWidth
        />

        <TextField
          label="Industry"
          name="industry"
          value={filters.industry}
          onChange={handleInputChange}
          placeholder="e.g., IT"
          fullWidth
        />

        <TextField
          label="CTC Filter (in LPA)"
          type="number"
          name="ctc_filters"
          value={filters.ctc_filters}
          onChange={handleInputChange}
          InputProps={{ inputProps: { min: 0, step: 0.1 } }}
          placeholder="e.g., 6"
          fullWidth
        />

        <TextField
          label="Radius (km)"
          type="number"
          name="radius"
          value={filters.radius}
          onChange={handleInputChange}
          InputProps={{ inputProps: { min: 0 } }}
          fullWidth
        />

        <TextField
          label="Keyword"
          name="keyword"
          value={filters.keyword}
          onChange={handleInputChange}
          placeholder="e.g., Software Engineer"
          fullWidth
          select
          SelectProps={{
            native: false,
            MenuProps: {
              PaperProps: {
                style: {
                  maxHeight: 300
                }
              }
            }
          }}
        >
          {keywordOptions.map((keyword, index) => (
            <MenuItem key={index} value={keyword}>
              {keyword}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Location"
          name="location"
          value={filters.location}
          onChange={handleInputChange}
          placeholder="e.g., Mumbai"
          fullWidth
          select
          SelectProps={{
            native: false,
            MenuProps: {
              PaperProps: {
                style: {
                  maxHeight: 300
                }
              }
            }
          }}
        >
          {locationOptions.map((location, index) => (
            <MenuItem key={index} value={location}>
              {location}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleApplyFilters}
            disabled={isLoading}
            color="primary"
          >
            {isLoading ? 'Applying...' : 'Apply Filters'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleClearFilters}
            disabled={isLoading}
          >
            Clear Filters
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default JobFilters;