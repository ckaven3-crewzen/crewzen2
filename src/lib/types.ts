import { z } from 'zod';

export type Helper = {
  firstName: string;
  lastName: string;
  rate: number;
  phone?: string;
  photoUrl?: string;
  idCopyUrl?: string;
  idNumber?: string;
};

export type UserRole = 'admin' | 'supervisor' | 'employee' | 'company' | 'worker' | 'supplier' | 'none';

export type Employee = {
  id: string;
  companyNumber: string;
  firstName: string;
  lastName: string;
  phone?: string;
  authUid: string | null;
  rate: number;
  email?: string;
  idNumber?: string;
  photoUrl?: string;
  idCopyUrl?: string;
  hasHelper?: boolean;
  helper?: Helper;
  role: 'supervisor' | 'employee';
  isDriver?: boolean;
  medicalCertificateUrl?: string;
  registeredEstateIds?: string[];
  // ConnectZen specific fields
  companyId?: string;
  hiredBy?: string;
  hiredAt?: number;
};

// ConnectZen Worker Profile Types
export type WorkerAvailability = 'available' | 'working' | 'busy' | 'not_looking';

export type WorkerRating = {
  id: string;
  employerId: string;
  employerName: string;
  projectId: string;
  projectName: string;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: number;
  isAnonymous: boolean;
};

export type WorkerSkill = {
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
  yearsExperience: number;
  verified: boolean;
};

export type WorkerPortfolio = {
  id: string;
  title: string;
  description: string;
  photoUrl: string;
  projectType: string;
  completedAt: number;
  location?: string;
};

export type WorkerProfile = {
  id: string;
  // Basic Info (extends Employee data)
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  idNumber?: string;
  idCopyUrl?: string;
  medicalCertificateUrl?: string;
  
  // Marketplace Specific
  availability: WorkerAvailability;
  currentEmployerId?: string;
  currentProjectId?: string;
  companyId?: string;
  
  // Skills & Experience
  skills: WorkerSkill[];
  tradeTags: string[];
  yearsExperience: number;
  preferredRate: number;
  bio?: string; // Personal bio/description
  
  // Location & Travel
  location: {
    city: string;
    province: string;
    coordinates?: { lat: number; lng: number };
  };
  willingToTravel: boolean;
  maxTravelDistance?: number; // in km
  
  // Reputation & History
  ratings: WorkerRating[];
  averageRating: number;
  totalRatings: number;
  workHistory: {
    projectId: string;
    projectName: string;
    employerName: string;
    startDate: number;
    endDate?: number;
    role: string;
    status: 'completed' | 'ongoing' | 'terminated';
  }[];
  
  // Portfolio
  portfolio: WorkerPortfolio[];
  
  // Verification
  isVerified: boolean;
  verificationDocuments: {
    idCopy: boolean;
    medicalCertificate: boolean;
    tradeCertification?: boolean;
  };
  
  // Settings
  isPublic: boolean;
  allowDirectContact: boolean;
  autoAcceptJobs: boolean;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
  lastActive: number;
};

export interface AppUser {
  // From Firebase Auth
  uid: string;
  phoneNumber: string | null;
  email: string | null;
  
  // From Firestore 'employees' collection
  employeeId: string;
  companyNumber: string;
  role: UserRole;
  firstName: string;
  lastName:string;
  photoUrl?: string;
  companyId?: string;
}

export type Location = {
  latitude: number;
  longitude: number;
};

export type Task = {
  id: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  trade: string;
  photoUrl?: string;
  createdAt: number; // Timestamp
  location?: string;
};


const AITaskSchema = z.object({
  description: z
    .string()
    .describe('The full, detailed description of a single, actionable task.'),
  trade: z
    .string()
    .describe(
      "The trade skill required for this task (e.g., Painting, Tiling, Plumbing, Electrical, Carpentry, General Labor)."
    ),
});
export type AITask = z.infer<typeof AITaskSchema>;


export type ProjectTeamMember = {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  trade: string;
  phone: string;
  type: 'professional' | 'subcontractor';
  customTrade?: string;
};

export type PrincipalContractor = {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
};

export type Project = {
  id: string;
  name: string;
  status: 'In Progress' | 'Completed' | 'On Hold';
  address?: string;
  tasks: Task[];
  location?: Location;
  photoUrls?: string[];
  projectTeam?: ProjectTeamMember[];
  estateId?: string;
  employeeIds?: string[];
  principalContractor?: PrincipalContractor;
  companyId: string;
};

export type EmployeeAttendance = Employee & {
  isAbsent: boolean;
  isHelperAbsent?: boolean;
  projectId?: string;
};

export type DailyAttendanceRecord = {
  employeeId: string;
  isAbsent: boolean;
  isHelperAbsent?: boolean;
  projectId?: string | null;
};

export type CompanyInfo = {
  name: string;
  email: string;
  phone: string;
  logoUrl: string;
  address?: string;
  ownerName?: string;
};

export type ConnectZenCompany = {
  id: string;
  // Basic Info
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  password: string; // Hashed password
  logoUrl?: string;
  // Company Details
  industry: string;
  companySize: 'small' | 'medium' | 'large';
  description?: string | null;
  website?: string | null;
  
  // Location
  location: {
    city: string;
    province: string;
    address?: string | null;
  };
  
  // Verification
  isVerified: boolean;
  verificationDocuments: {
    businessRegistration: boolean;
    taxClearance: boolean;
    insuranceCertificate?: boolean;
  };
  
  // Settings
  isPublic: boolean;
  allowDirectContact: boolean;
  autoPostJobs: boolean;
  
  // Job Posting History
  jobPostings: {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    location: string;
    rate: number;
    duration: string;
    status: 'active' | 'filled' | 'expired';
    createdAt: number;
    applications: number;
  }[];
  
  // Worker Interactions
  savedWorkers: string[]; // Worker IDs
  hiredWorkers: {
    workerId: string;
    workerName: string;
    projectName: string;
    hireDate: number;
    status: 'active' | 'completed' | 'terminated';
    rating?: number;
    review?: string;
  }[];
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
  lastActive: number;
};

export type Estate = {
  id: string;
  name: string;
  email: string;
  formTemplateUrl?: string | null;
  formMaxEmployees?: number;
  /**
   * A map where the key is the internal application field name (e.g., 'employeeFullName_1')
   * and the value is the name of the field in the PDF form (e.g., 'Text Field 1').
   */
  formFieldMappings?: { [key: string]: string; };
  requiredDocuments?: string[];
};

export type CompanyProfile = {
  id: string; // companyId, could be Firebase Auth UID or generated
  name: string;
  logoUrl?: string;
  contactEmail: string;
  industry?: string;
  address?: string;
  ownerUid: string; // Firebase Auth UID of the company owner
  isPublic: boolean;
  phone?: string;
  website?: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
};

// Unified profile type for employees, workers, etc.
export interface UnifiedProfile {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password?: string;
  companyNumber?: string;
  companyId?: string;
  role?: 'supervisor' | 'employee' | 'worker';
  rate?: number;
  idNumber: string;
  photoUrl?: string;
  idCopyUrl?: string;
  location?: { city: string; province: string };
  yearsExperience?: number;
  skills?: string[];
  bio?: string;
  medicalCertificateUrl?: string;
  isDriver?: boolean;
  registeredEstateIds?: string[];
  isInactive?: boolean;
}
