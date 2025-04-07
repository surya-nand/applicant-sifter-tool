
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Applicant } from "@/types/applicant";
import { format } from "date-fns";
import { Mail, MapPin, Phone } from "lucide-react";

interface ApplicantDetailProps {
  applicant: Applicant;
  scoreBreakdown?: {
    education: number;
    experience: number;
    skills: number;
  };
}

export const ApplicantDetail = ({ applicant, scoreBreakdown }: ApplicantDetailProps) => {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch (error) {
      return dateString || "N/A";
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{applicant.name}</h2>
        
        <div className="mt-2 space-y-2">
          <div className="flex items-center text-muted-foreground">
            <Mail className="h-4 w-4 mr-2" />
            <span>{applicant.email}</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <Phone className="h-4 w-4 mr-2" />
            <span>{applicant.phone}</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{applicant.location}</span>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {scoreBreakdown && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Match Score Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Education</span>
                <span className="font-medium">{Math.round(scoreBreakdown.education)}</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full" 
                  style={{ width: `${Math.min(100, (scoreBreakdown.education / 40) * 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between">
                <span>Experience</span>
                <span className="font-medium">{Math.round(scoreBreakdown.experience)}</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full" 
                  style={{ width: `${Math.min(100, (scoreBreakdown.experience / 40) * 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between">
                <span>Skills</span>
                <span className="font-medium">{Math.round(scoreBreakdown.skills)}</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full" 
                  style={{ width: `${Math.min(100, (scoreBreakdown.skills / 40) * 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Education</h3>
        <div className="space-y-4">
          {applicant.education.degrees.map((degree, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <div className="flex justify-between">
                    <div className="font-medium">{degree.degree}</div>
                    <div className="text-sm text-muted-foreground">
                      {degree.startDate && `${degree.startDate} - `}{degree.endDate || "Present"}
                    </div>
                  </div>
                  <div className="text-muted-foreground mt-1">{degree.subject}</div>
                  <div className="text-sm mt-1">{degree.originalSchool}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{degree.gpa}</Badge>
                    {degree.isTop50 && <Badge className="text-xs">Top 50 School</Badge>}
                    {degree.isTop25 && <Badge className="text-xs">Top 25 School</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Work Experience</h3>
        <div className="space-y-4">
          {applicant.work_experiences.map((experience, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="font-medium">{experience.roleName}</div>
                <div className="text-muted-foreground mt-1">{experience.company}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Skills</h3>
        {applicant.skills && applicant.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {applicant.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No skills listed</p>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Availability & Compensation</h3>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {applicant.work_availability.map((availability) => (
              <Badge key={availability} variant="outline">
                {availability.charAt(0).toUpperCase() + availability.slice(1)}
              </Badge>
            ))}
          </div>
          
          {applicant.annual_salary_expectation && (
            <div className="mt-2">
              <p className="text-muted-foreground">Salary expectation:</p>
              <div className="mt-1">
                {applicant.annual_salary_expectation["full-time"] && (
                  <Badge variant="secondary">Full-time: {applicant.annual_salary_expectation["full-time"]}</Badge>
                )}
                {applicant.annual_salary_expectation["part-time"] && (
                  <Badge variant="secondary" className="ml-2">
                    Part-time: {applicant.annual_salary_expectation["part-time"]}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-2">
            <p className="text-muted-foreground">Application submitted:</p>
            <p>{formatDate(applicant.submitted_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
