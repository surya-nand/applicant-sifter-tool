
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, FileText, Search, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { applicantsData } from "@/data/applicants";
import { 
  extractAllSkills, 
  extractAllRoles, 
  getTopApplicants 
} from "@/utils/scoring";
import { getTopApplicantsByJobDescription, extractRequirements } from "@/utils/jobAnalysis";
import { Applicant, JobRequirement } from "@/types/applicant";
import { ApplicantCard } from "@/components/ApplicantCard";
import { ApplicantDetail } from "@/components/ApplicantDetail";

const Index = () => {
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState("Software Engineer");
  const [jobType, setJobType] = useState("tech");
  const [requiredSkills, setRequiredSkills] = useState<string[]>(["React", "JavaScript"]);
  const [skillInput, setSkillInput] = useState("");
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [allRoles, setAllRoles] = useState<string[]>([]);
  
  const [jobDescription, setJobDescription] = useState("");
  const [extractedRequirements, setExtractedRequirements] = useState<JobRequirement[]>([]);
  const [usingJobDescription, setUsingJobDescription] = useState(false);
  
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [scoredApplicants, setScoredApplicants] = useState<{
    applicant: Applicant;
    score: number;
    breakdown?: { education: number; experience: number; skills: number };
    matchedRequirements?: JobRequirement[];
  }[]>([]);
  
  // Extract skills and roles on component mount
  useEffect(() => {
    setAllSkills(extractAllSkills(applicantsData));
    setAllRoles(extractAllRoles(applicantsData));
    
    // Score applicants with default settings
    updateApplicantScores("tech", ["React", "JavaScript"]);
  }, []);
  
  // Update applicant scores
  const updateApplicantScores = (jobTypeValue: string, skillsValue: string[]) => {
    const topApplicants = getTopApplicants(applicantsData, jobTypeValue, skillsValue);
    setScoredApplicants(topApplicants);
    
    // Select the top applicant by default if none selected
    if (!selectedApplicant) {
      setSelectedApplicant(topApplicants[0]?.applicant || null);
    }
    
    setUsingJobDescription(false);
  };
  
  // Process job description to find best applicants
  const processJobDescription = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Empty job description",
        description: "Please enter a job description to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    const requirements = extractRequirements(jobDescription);
    setExtractedRequirements(requirements);
    
    const topApplicants = getTopApplicantsByJobDescription(applicantsData, jobDescription);
    setScoredApplicants(topApplicants);
    
    // Select the top applicant by default if none selected
    if (topApplicants.length > 0) {
      setSelectedApplicant(topApplicants[0].applicant);
    }
    
    setUsingJobDescription(true);
    
    toast({
      title: "Job Description Analyzed",
      description: `Found ${requirements.length} requirements and ranked applicants.`,
    });
  };
  
  // Add a new required skill
  const addSkill = (skill: string) => {
    if (!skill.trim()) return;
    if (requiredSkills.includes(skill)) {
      toast({
        title: "Skill already added",
        description: `"${skill}" is already in the required skills list.`,
      });
      return;
    }
    
    setRequiredSkills([...requiredSkills, skill]);
    setSkillInput("");
    
    toast({
      title: "Skill added",
      description: `Added "${skill}" to required skills.`,
    });
  };
  
  // Remove a skill from required skills
  const removeSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };
  
  // Reset filters to default
  const resetFilters = () => {
    setJobTitle("Software Engineer");
    setJobType("tech");
    setRequiredSkills(["React", "JavaScript"]);
    setJobDescription("");
    setExtractedRequirements([]);
    setSelectedApplicant(null);
    setUsingJobDescription(false);
    
    // Score applicants with default settings
    updateApplicantScores("tech", ["React", "JavaScript"]);
    
    toast({
      title: "Filters reset",
      description: "All filters have been reset to default values.",
    });
  };
  
  // Find the rank of the selected applicant
  const getApplicantRank = (applicant: Applicant) => {
    return scoredApplicants.findIndex(item => item.applicant.email === applicant.email) + 1;
  };
  
  // Find the score breakdown for a specific applicant
  const getScoreBreakdown = (applicant: Applicant) => {
    const found = scoredApplicants.find(item => item.applicant.email === applicant.email);
    return found?.breakdown;
  };
  
  // Filter skills in dropdown based on input
  const filteredSkills = allSkills.filter(skill => 
    skill.toLowerCase().includes(skillInput.toLowerCase()) && 
    !requiredSkills.includes(skill)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Applicant Sifter Tool</h1>
          <p className="text-muted-foreground">Find the best candidates for your job opening</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Panel - Filters & Configuration */}
          <div className="md:col-span-1 space-y-6">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="w-full mb-2">
                <TabsTrigger value="manual" className="flex-1">Manual Filters</TabsTrigger>
                <TabsTrigger value="jd" className="flex-1">Job Description</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual">
                <Card className="p-4">
                  <h2 className="font-semibold mb-4">Job Configuration</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="job-title" className="block text-sm font-medium mb-1">Job Title</label>
                      <Input 
                        id="job-title"
                        value={jobTitle} 
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="job-type" className="block text-sm font-medium mb-1">Job Category</label>
                      <Select value={jobType} onValueChange={(value) => {
                        setJobType(value);
                        updateApplicantScores(value, requiredSkills);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tech">Tech / Engineering</SelectItem>
                          <SelectItem value="legal">Legal / Compliance</SelectItem>
                          <SelectItem value="business">Business / Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label htmlFor="required-skills" className="block text-sm font-medium mb-1">Required Skills</label>
                      <div className="flex gap-2">
                        <Input
                          id="required-skills"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          placeholder="Add a skill..."
                          className="flex-1"
                          list="skill-datalist"
                        />
                        <datalist id="skill-datalist">
                          {filteredSkills.map(skill => (
                            <option key={skill} value={skill} />
                          ))}
                        </datalist>
                        <Button onClick={() => {
                          addSkill(skillInput);
                          updateApplicantScores(jobType, [...requiredSkills, skillInput]);
                        }}>Add</Button>
                      </div>
                      
                      {requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {requiredSkills.map(skill => (
                            <Badge key={skill} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                              {skill}
                              <button 
                                onClick={() => {
                                  removeSkill(skill);
                                  updateApplicantScores(jobType, requiredSkills.filter(s => s !== skill));
                                }}
                                className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-muted"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button onClick={() => updateApplicantScores(jobType, requiredSkills)} className="w-full">
                      Update Results
                    </Button>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="jd">
                <Card className="p-4">
                  <h2 className="font-semibold mb-4">Job Description Analysis</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="job-description" className="block text-sm font-medium mb-1">
                        Enter Job Description
                      </label>
                      <Textarea
                        id="job-description"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste your job description here to automatically extract requirements and find the best matching candidates..."
                        className="min-h-[200px]"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={processJobDescription} className="flex-1">
                        <FileText className="mr-2 h-4 w-4" /> Analyze JD
                      </Button>
                      <Button variant="outline" onClick={resetFilters}>
                        Reset
                      </Button>
                    </div>
                    
                    {extractedRequirements.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">Extracted Requirements:</h3>
                        <div className="flex flex-wrap gap-2">
                          {extractedRequirements.map((req, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className={`${
                                req.type === 'skill' ? 'border-blue-300 bg-blue-50' :
                                req.type === 'education' ? 'border-green-300 bg-green-50' :
                                'border-amber-300 bg-amber-50'
                              }`}
                            >
                              {req.value} ({req.importance}/10)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
            
            <Card className="p-4">
              <h2 className="font-semibold mb-4">Top Candidates</h2>
              <div className="space-y-3">
                {scoredApplicants.slice(0, 3).map((item, index) => (
                  <div 
                    key={item.applicant.email} 
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => setSelectedApplicant(item.applicant)}
                  >
                    <div className={`h-6 w-6 rounded-full ${
                      index === 0 ? "bg-yellow-500" : 
                      index === 1 ? "bg-gray-300" : 
                      index === 2 ? "bg-amber-700" : "bg-slate-200"
                    } flex items-center justify-center text-white font-medium text-sm`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.applicant.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Match Score: {usingJobDescription ? item.score : Math.round(item.score)}%
                      </div>
                    </div>
                    {selectedApplicant?.email === item.applicant.email && (
                      <CheckIcon className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
                
                {scoredApplicants.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No candidates found with the current filters.
                  </div>
                )}
              </div>
            </Card>
            
            <Button variant="outline" onClick={resetFilters} className="w-full">Reset All</Button>
          </div>
          
          {/* Center & Right Panel - Applicants List & Details */}
          <div className="md:col-span-2">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="list">All Applicants</TabsTrigger>
                <TabsTrigger value="details">Applicant Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="m-0">
                <div className="space-y-4">
                  {scoredApplicants.map((item, index) => (
                    <ApplicantCard
                      key={item.applicant.email}
                      applicant={item.applicant}
                      score={usingJobDescription ? item.score : item.score}
                      scoreBreakdown={item.breakdown}
                      matchedRequirements={item.matchedRequirements}
                      rank={index + 1}
                      onClick={() => setSelectedApplicant(item.applicant)}
                      isSelected={selectedApplicant?.email === item.applicant.email}
                    />
                  ))}
                  
                  {scoredApplicants.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border">
                      <Search className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium">No matching applicants</h3>
                      <p className="text-muted-foreground mt-1">
                        Try changing your job type or required skills.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="m-0">
                {selectedApplicant ? (
                  <div className="bg-white p-6 rounded-lg border">
                    <ApplicantDetail
                      applicant={selectedApplicant}
                      scoreBreakdown={getScoreBreakdown(selectedApplicant)}
                      rank={getApplicantRank(selectedApplicant)}
                      matchedRequirements={
                        usingJobDescription ? 
                        scoredApplicants.find(
                          item => item.applicant.email === selectedApplicant.email
                        )?.matchedRequirements : undefined
                      }
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <h3 className="text-lg font-medium">No applicant selected</h3>
                    <p className="text-muted-foreground mt-1">
                      Select an applicant to view their details.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
