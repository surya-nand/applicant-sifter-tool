
export interface WorkExperience {
  company: string;
  roleName: string;
}

export interface Degree {
  degree: string;
  subject: string;
  school: string;
  gpa: string;
  startDate: string;
  endDate: string;
  originalSchool: string;
  isTop50: boolean;
  isTop25?: boolean;
}

export interface Education {
  highest_level: string;
  degrees: Degree[];
}

export interface Applicant {
  name: string;
  email: string;
  phone: string;
  location: string;
  submitted_at: string;
  work_availability: string[];
  annual_salary_expectation: {
    "full-time"?: string;
    "part-time"?: string;
  };
  work_experiences: WorkExperience[];
  education: Education;
  skills: string[];
}

export interface JobRequirement {
  type: 'skill' | 'experience' | 'education';
  value: string;
  importance: number; // 1-10 scale
}

