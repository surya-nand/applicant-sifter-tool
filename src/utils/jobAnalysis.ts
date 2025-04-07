
import { JobRequirement } from "@/types/applicant";

// Common skill keywords that might appear in job descriptions
const skillKeywords = [
  "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node", "Express", 
  "Python", "Java", "C#", ".NET", "PHP", "Ruby", "SQL", "MongoDB", "PostgreSQL", 
  "AWS", "Azure", "DevOps", "Docker", "Kubernetes", "CI/CD", "Git", "Redux",
  "REST", "API", "GraphQL", "HTML", "CSS", "Sass", "LESS", "Webpack", "Babel",
  "Jest", "Testing", "Agile", "Scrum", "Project Management", "UI/UX", "Design",
  "Responsive", "Mobile", "Analytics", "SEO", "Performance", "Security",
  "Microservices", "Architecture", "Cloud", "Serverless", "Next.js", "Laravel",
  "Django", "Flask", "Spring", "Bootstrap", "Tailwind", "Material UI",
  "Communication", "Leadership", "Problem Solving", "Critical Thinking",
  "Data Analysis", "Machine Learning", "AI", "Big Data", "Blockchain", "Cryptocurrency"
];

// Education levels to detect
const educationLevels = [
  { term: "bachelor", level: "Bachelor's Degree", importance: 6 },
  { term: "master", level: "Master's Degree", importance: 8 },
  { term: "phd", level: "Ph.D.", importance: 10 },
  { term: "associate", level: "Associate's Degree", importance: 4 },
  { term: "juris doctor", level: "Juris Doctor (J.D)", importance: 9 },
  { term: "j.d.", level: "Juris Doctor (J.D)", importance: 9 },
  { term: "law degree", level: "Juris Doctor (J.D)", importance: 9 },
  { term: "mba", level: "Master's Degree", importance: 8 },
  { term: "high school", level: "High School Diploma", importance: 2 }
];

// Experience level terms
const experienceLevels = [
  { term: "entry level", years: 0, importance: 3 },
  { term: "junior", years: 1, importance: 4 },
  { term: "mid level", years: 3, importance: 6 },
  { term: "senior", years: 5, importance: 8 },
  { term: "lead", years: 7, importance: 9 },
  { term: "manager", years: 5, importance: 7 },
  { term: "director", years: 8, importance: 9 },
  { term: "executive", years: 10, importance: 10 }
];

// Job roles to detect
const jobRoles = [
  { term: "developer", importance: 7 },
  { term: "engineer", importance: 7 },
  { term: "designer", importance: 7 },
  { term: "manager", importance: 7 },
  { term: "analyst", importance: 6 },
  { term: "consultant", importance: 6 },
  { term: "specialist", importance: 5 },
  { term: "administrator", importance: 5 },
  { term: "architect", importance: 8 },
  { term: "scientist", importance: 8 },
  { term: "attorney", importance: 9 },
  { term: "lawyer", importance: 9 },
  { term: "legal", importance: 8 }
];

/**
 * Extract requirements from job description text
 * @param jobDescription The job description text
 * @returns Array of extracted requirements
 */
export const extractRequirements = (jobDescription: string): JobRequirement[] => {
  const requirements: JobRequirement[] = [];
  const text = jobDescription.toLowerCase();
  
  // Extract skills
  skillKeywords.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (text.includes(skillLower)) {
      // Determine importance based on repetition and context
      const occurrences = (text.match(new RegExp(skillLower, "gi")) || []).length;
      const hasRequired = /required|must have|essential/i.test(
        text.substring(Math.max(0, text.indexOf(skillLower) - 50), 
                      text.indexOf(skillLower))
      );
      
      const importance = Math.min(10, (occurrences * 2) + (hasRequired ? 2 : 0));
      
      requirements.push({
        type: "skill",
        value: skill,
        importance: importance > 0 ? importance : 5
      });
    }
  });
  
  // Extract education requirements
  educationLevels.forEach(edu => {
    if (text.includes(edu.term)) {
      requirements.push({
        type: "education",
        value: edu.level,
        importance: edu.importance
      });
    }
  });
  
  // Extract experience requirements
  experienceLevels.forEach(exp => {
    if (text.includes(exp.term)) {
      requirements.push({
        type: "experience",
        value: exp.term,
        importance: exp.importance
      });
    }
  });
  
  // Find years of experience mentions
  const yearsExp = text.match(/(\d+)[\+]?\s*(?:years|yrs|yr)(?:\s+of\s+|\s+)experience/g);
  if (yearsExp) {
    yearsExp.forEach(match => {
      const years = parseInt(match.match(/\d+/)?.[0] || "0", 10);
      requirements.push({
        type: "experience",
        value: `${years}+ years of experience`,
        importance: Math.min(10, years + 2)
      });
    });
  }
  
  // Extract job roles
  jobRoles.forEach(role => {
    if (text.includes(role.term)) {
      requirements.push({
        type: "experience",
        value: role.term,
        importance: role.importance
      });
    }
  });
  
  return requirements;
};

/**
 * Score an applicant based on extracted job requirements
 * @param applicant The applicant to score
 * @param requirements Extracted job requirements
 * @returns A score from 0-100
 */
export const scoreApplicantByRequirements = (
  applicant: any,
  requirements: JobRequirement[]
): { score: number; matchedRequirements: JobRequirement[] } => {
  let totalScore = 0;
  let totalWeight = 0;
  const matchedRequirements: JobRequirement[] = [];
  
  requirements.forEach(req => {
    let matched = false;
    const weight = req.importance;
    totalWeight += weight;
    
    switch (req.type) {
      case "skill":
        // Check if applicant has this skill
        if (applicant.skills && applicant.skills.some(
          (s: string) => s.toLowerCase().includes(req.value.toLowerCase()) || 
                       req.value.toLowerCase().includes(s.toLowerCase())
        )) {
          matched = true;
          totalScore += weight;
          matchedRequirements.push(req);
        }
        break;
        
      case "education":
        // Check education level
        if (applicant.education && applicant.education.highest_level === req.value) {
          matched = true;
          totalScore += weight;
          matchedRequirements.push(req);
        } else if (req.value === "Bachelor's Degree" && 
                  ["Master's Degree", "Ph.D.", "Juris Doctor (J.D)"].includes(
                    applicant.education?.highest_level)) {
          // Higher education than required
          matched = true;
          totalScore += weight;
          matchedRequirements.push(req);
        } else if (req.value === "Master's Degree" && 
                  ["Ph.D.", "Juris Doctor (J.D)"].includes(
                    applicant.education?.highest_level)) {
          matched = true;
          totalScore += weight;
          matchedRequirements.push(req);
        }
        break;
        
      case "experience":
        // Check for experience match based on role names or years
        if (req.value.includes("years")) {
          const yearsRequired = parseInt(req.value, 10);
          const estimatedYears = applicant.work_experiences.length * 1.5; // Simple estimation
          if (estimatedYears >= yearsRequired) {
            matched = true;
            totalScore += weight;
            matchedRequirements.push(req);
          }
        } else {
          // Check if any role matches the required experience
          if (applicant.work_experiences.some((exp: any) => 
              exp.roleName.toLowerCase().includes(req.value.toLowerCase()))) {
            matched = true;
            totalScore += weight;
            matchedRequirements.push(req);
          }
        }
        break;
    }
  });
  
  // Normalize score to 0-100
  const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
  
  return {
    score: parseFloat(normalizedScore.toFixed(1)),
    matchedRequirements
  };
};

/**
 * Get the top applicants based on job description
 * @param applicants List of all applicants
 * @param jobDescription The job description text
 * @returns Array of applicants sorted by score
 */
export const getTopApplicantsByJobDescription = (
  applicants: any[],
  jobDescription: string
): { applicant: any; score: number; matchedRequirements: JobRequirement[] }[] => {
  const requirements = extractRequirements(jobDescription);
  
  const scoredApplicants = applicants.map(applicant => {
    const { score, matchedRequirements } = scoreApplicantByRequirements(applicant, requirements);
    return { applicant, score, matchedRequirements };
  });
  
  // Sort by score descending
  return scoredApplicants.sort((a, b) => b.score - a.score);
};

