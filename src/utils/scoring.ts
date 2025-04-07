
import { Applicant } from "../types/applicant";

// Weight constants for scoring
const WEIGHTS = {
  EDUCATION: {
    PHD: 25,
    MASTERS: 20,
    BACHELOR: 15,
    ASSOCIATE: 10,
    HIGH_SCHOOL: 5,
    TOP_SCHOOL: 10,
    TOP_25_SCHOOL: 15,
    HIGH_GPA: 5
  },
  EXPERIENCE: {
    YEARS_FACTOR: 5, // Points per year
    RELEVANT_ROLE_BONUS: 10 // Bonus for relevant roles
  },
  SKILLS: {
    MATCH_FACTOR: 8 // Points per matching skill
  }
};

// Function to parse GPA string to a number range
const parseGPA = (gpaString: string): number => {
  const match = gpaString.match(/(\d\.\d)-(\d\.\d)/);
  if (match) {
    return parseFloat(match[2]); // Use the upper bound of the range
  }
  return 0;
};

// Function to estimate years of experience based on work history
const estimateYearsOfExperience = (experiences: Applicant["work_experiences"]): number => {
  // Simple estimation - count the number of experiences and multiply by average tenure
  // A more sophisticated approach would use actual dates if available
  return experiences.length * 1.5; // Assuming average 1.5 years per position
};

// Check if a role is relevant to the job
const isRelevantRole = (roleName: string, jobType: string): boolean => {
  const techRoles = ["Developer", "Engineer", "Software", "Full Stack", "Front End", "Back End", "DevOps", "System"];
  const legalRoles = ["Legal", "Attorney", "Lawyer", "Counsel", "Partner"];
  
  const lowercaseRole = roleName.toLowerCase();
  
  if (jobType === "tech") {
    return techRoles.some(role => lowercaseRole.includes(role.toLowerCase()));
  } else if (jobType === "legal") {
    return legalRoles.some(role => lowercaseRole.includes(role.toLowerCase()));
  }
  
  return false;
};

// Check if skills match job requirements
const getSkillMatchScore = (skills: string[], requiredSkills: string[]): number => {
  if (!skills || !skills.length) return 0;
  
  let matchCount = 0;
  const lowercaseSkills = skills.map(skill => skill.toLowerCase());
  const lowercaseRequiredSkills = requiredSkills.map(skill => skill.toLowerCase());
  
  lowercaseRequiredSkills.forEach(reqSkill => {
    if (lowercaseSkills.some(skill => skill.includes(reqSkill) || reqSkill.includes(skill))) {
      matchCount++;
    }
  });
  
  return matchCount * WEIGHTS.SKILLS.MATCH_FACTOR;
};

// Score education
const scoreEducation = (education: Applicant["education"]): number => {
  let score = 0;
  
  // Score based on highest level
  switch (education.highest_level) {
    case "Ph.D.":
      score += WEIGHTS.EDUCATION.PHD;
      break;
    case "Master's Degree":
      score += WEIGHTS.EDUCATION.MASTERS;
      break;
    case "Juris Doctor (J.D)":
      score += WEIGHTS.EDUCATION.MASTERS;
      break;
    case "Bachelor's Degree":
      score += WEIGHTS.EDUCATION.BACHELOR;
      break;
    case "Associate's Degree":
      score += WEIGHTS.EDUCATION.ASSOCIATE;
      break;
    case "High School Diploma":
      score += WEIGHTS.EDUCATION.HIGH_SCHOOL;
      break;
    default:
      break;
  }
  
  // Add bonuses for prestigious schools and high GPAs
  education.degrees.forEach(degree => {
    if (degree.isTop50) {
      score += WEIGHTS.EDUCATION.TOP_SCHOOL;
    }
    
    if (degree.isTop25) {
      score += WEIGHTS.EDUCATION.TOP_25_SCHOOL;
    }
    
    const gpa = parseGPA(degree.gpa);
    if (gpa >= 3.5) {
      score += WEIGHTS.EDUCATION.HIGH_GPA;
    }
  });
  
  return score;
};

// Score work experience
const scoreExperience = (experiences: Applicant["work_experiences"], jobType: string): number => {
  const years = estimateYearsOfExperience(experiences);
  let score = years * WEIGHTS.EXPERIENCE.YEARS_FACTOR;
  
  // Bonus for relevant roles
  const relevantRolesCount = experiences.filter(exp => isRelevantRole(exp.roleName, jobType)).length;
  score += relevantRolesCount * WEIGHTS.EXPERIENCE.RELEVANT_ROLE_BONUS;
  
  return score;
};

// Main scoring function
export const scoreApplicant = (
  applicant: Applicant, 
  jobType: string, 
  requiredSkills: string[]
): { total: number; breakdown: { education: number; experience: number; skills: number } } => {
  const educationScore = scoreEducation(applicant.education);
  const experienceScore = scoreExperience(applicant.work_experiences, jobType);
  const skillsScore = getSkillMatchScore(applicant.skills, requiredSkills);
  
  return {
    total: educationScore + experienceScore + skillsScore,
    breakdown: {
      education: educationScore,
      experience: experienceScore,
      skills: skillsScore
    }
  };
};

// Get top applicants
export const getTopApplicants = (
  applicants: Applicant[], 
  jobType: string, 
  requiredSkills: string[], 
  count: number = 3
): { applicant: Applicant; score: number; breakdown: { education: number; experience: number; skills: number } }[] => {
  const scoredApplicants = applicants.map(applicant => {
    const { total, breakdown } = scoreApplicant(applicant, jobType, requiredSkills);
    return { applicant, score: total, breakdown };
  });
  
  // Sort by total score in descending order
  return scoredApplicants.sort((a, b) => b.score - a.score).slice(0, count);
};

// Extract all unique skills from all applicants
export const extractAllSkills = (applicants: Applicant[]): string[] => {
  const skillsSet = new Set<string>();
  
  applicants.forEach(applicant => {
    if (applicant.skills && applicant.skills.length) {
      applicant.skills.forEach(skill => skillsSet.add(skill));
    }
  });
  
  return Array.from(skillsSet).sort();
};

// Extract all unique roles from all applicants
export const extractAllRoles = (applicants: Applicant[]): string[] => {
  const rolesSet = new Set<string>();
  
  applicants.forEach(applicant => {
    if (applicant.work_experiences && applicant.work_experiences.length) {
      applicant.work_experiences.forEach(exp => rolesSet.add(exp.roleName));
    }
  });
  
  return Array.from(rolesSet).sort();
};
