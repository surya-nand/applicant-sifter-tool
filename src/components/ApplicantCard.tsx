
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Applicant } from "@/types/applicant";
import { format } from "date-fns";

interface ApplicantCardProps {
  applicant: Applicant;
  score?: number;
  scoreBreakdown?: {
    education: number;
    experience: number;
    skills: number;
  };
  rank?: number;
  onClick?: () => void;
  isSelected?: boolean;
}

export const ApplicantCard = ({ 
  applicant, 
  score, 
  scoreBreakdown,
  rank,
  onClick,
  isSelected = false
}: ApplicantCardProps) => {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Format salary without cents
  const formatSalary = (salaryString: string) => {
    if (!salaryString) return "";
    return salaryString.replace(/\.\d+/, "");
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? "border-2 border-primary shadow-lg" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium">{applicant.name}</CardTitle>
            <CardDescription className="text-sm">{applicant.location}</CardDescription>
          </div>
          {rank !== undefined && (
            <Badge variant={rank <= 3 ? "default" : "outline"} className="text-xs">
              #{rank}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Applied: {formatDate(applicant.submitted_at)}
          </p>
          
          <div>
            <p className="font-medium">Education</p>
            <p className="text-muted-foreground">
              {applicant.education.highest_level} · {applicant.education.degrees[0]?.subject || ""}
            </p>
          </div>
          
          <div>
            <p className="font-medium">Experience</p>
            <p className="text-muted-foreground">
              {applicant.work_experiences[0]?.roleName} at {applicant.work_experiences[0]?.company}
            </p>
          </div>
          
          {applicant.skills && applicant.skills.length > 0 && (
            <div>
              <p className="font-medium">Skills</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {applicant.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {applicant.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{applicant.skills.length - 3}</Badge>
                )}
              </div>
            </div>
          )}
          
          {applicant.annual_salary_expectation && (
            <div>
              <p className="font-medium">Salary Expectation</p>
              <p className="text-muted-foreground">
                {formatSalary(applicant.annual_salary_expectation["full-time"] || "")}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      {score !== undefined && scoreBreakdown && (
        <CardFooter className="pt-2">
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Match Score</p>
              <p className="text-sm font-bold">{Math.round(score)}</p>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full" 
                style={{ width: `${Math.min(100, (score / 100) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Edu: {Math.round(scoreBreakdown.education)}</span>
              <span>Exp: {Math.round(scoreBreakdown.experience)}</span>
              <span>Skills: {Math.round(scoreBreakdown.skills)}</span>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
