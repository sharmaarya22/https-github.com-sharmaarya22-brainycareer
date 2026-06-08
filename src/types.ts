export interface Preferences {
  desiredRole: string;
  industry: string;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'All';
  locationModel: 'Remote' | 'Hybrid' | 'Onsite' | 'All';
  minSalary: number;
  preferredLocation: string;
  skills: string[];
}

export interface ResumeAnalysis {
  score: number; // 0-100
  keyStrengths: string[];
  skillGaps: string[];
  suggestedImprovements: string[];
  parsedSkills: string[];
  executiveSummary: string;
  recommendedRoles?: string[];
  careerPath?: {
    currentState: string;
    transitionRoles: string[];
    strategicPlan: string[];
  };
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  profileCompleted: boolean;
  preferences?: Preferences;
  resumeText?: string;
  resumeFileName?: string;
  analysis?: ResumeAnalysis;
  role?: 'seeker' | 'employer' | 'admin';
}

export interface Job {
  id: string;
  title: string;
  company: string;
  logo: string; // Icon or abbreviation identifier
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  locationModel: 'Remote' | 'Hybrid' | 'Onsite';
  salaryRange: string;
  postedDate: string; // 'YYYY-MM-DD'
  tags: string[];
  originalUrl: string; // Specific job posting page url
  country?: string;
  source?: string;
}

export interface MatchResult {
  jobId: string;
  job: Job;
  score: number; // match score out of 100
  reasons: string[];
  matchingSkills: string[];
  missingSkills: string[];
}

export interface CoverLetterResponse {
  coverLetter: string;
}

export interface SalaryEstimate {
  marketLow: number;
  marketHigh: number;
  marketAverage: number;
  currency: string;
  comparisonStatus: string;
  marketInsights: string;
  confidenceScore: number;
  sources: { title: string; url: string }[];
}
