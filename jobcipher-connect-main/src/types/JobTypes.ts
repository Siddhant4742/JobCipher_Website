export type JobSource = "LinkedIn Jobs" | "Naukri Jobs" ;

export interface JobResults {
  "LinkedIn Jobs": JobItem[];
  "Naukri Jobs": JobItem[];
  "CareerJet Jobs": JobItem[];
}

export interface JobItem {
  Title?: string;
  Company?: string;
  CompanyLink?: string;
  Location?: string;
  TimePosted?: string;
  JobLink?: string;
  JobTitle?: string;
  CompanyName?: string;
  Rating?: string;
  Experience?: string;
  TechStack?: string;
  JobPostingLink?: string;
  [key: string]: string | undefined;
}

export interface JobData {
  name: string;
  branch: string;
  college: string;
  keyword: string;
  location: string;
  experience: number;
  job_type: string;
  remote: string;
  date_posted: string;
  company: string;
  industry: string;
  ctc_filters: string;
  radius: string;
}

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

