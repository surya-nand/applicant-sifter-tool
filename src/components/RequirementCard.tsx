
import { Card, CardContent } from "@/components/ui/card";
import { JobRequirement } from "@/types/applicant";
import { Badge } from "@/components/ui/badge";

interface RequirementCardProps {
  requirement: JobRequirement;
  count?: number;
}

export const RequirementCard = ({ requirement, count }: RequirementCardProps) => {
  // Determine the badge color based on requirement type
  const getBadgeClass = () => {
    switch (requirement.type) {
      case 'skill':
        return 'border-blue-300 bg-blue-50';
      case 'education':
        return 'border-green-300 bg-green-50';
      case 'experience':
        return 'border-amber-300 bg-amber-50';
      default:
        return '';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <Badge 
            variant="outline" 
            className={`mb-2 ${getBadgeClass()}`}
          >
            {requirement.type}
          </Badge>
          <p className="font-medium">{requirement.value}</p>
          <div className="flex items-center mt-2 gap-2">
            <span className="text-sm text-muted-foreground">Importance:</span>
            <div className="w-full max-w-24 bg-secondary h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full" 
                style={{ width: `${Math.min(100, (requirement.importance / 10) * 100)}%` }}
              />
            </div>
            <span className="text-sm font-semibold">{requirement.importance}/10</span>
          </div>
          {count !== undefined && (
            <p className="text-sm mt-2 text-muted-foreground">
              {count} matching applicant{count !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
