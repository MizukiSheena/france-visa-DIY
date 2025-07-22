import { useState } from "react";
import PasswordGate from "@/components/PasswordGate";
import VisaChecklist from "@/components/VisaChecklist";
import CoverLetterGenerator from "@/components/CoverLetterGenerator";

interface ItemStatus {
  completed: boolean;
  hasIssue: boolean;
  issueDescription: string;
  aiSuggestion: string;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'checklist' | 'cover-letter'>('checklist');
  const [checklistData, setChecklistData] = useState<Record<number, ItemStatus>>({});

  const handleAccessGranted = () => {
    setIsAuthenticated(true);
  };

  const handleGenerateCoverLetter = (data: Record<number, ItemStatus>) => {
    setChecklistData(data);
    setCurrentView('cover-letter');
  };

  const handleBackToChecklist = () => {
    setCurrentView('checklist');
  };

  if (!isAuthenticated) {
    return <PasswordGate onAccessGranted={handleAccessGranted} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {currentView === 'checklist' ? (
        <VisaChecklist onGenerateCoverLetter={handleGenerateCoverLetter} />
      ) : (
        <CoverLetterGenerator 
          itemStatuses={checklistData} 
          onBack={handleBackToChecklist} 
        />
      )}
    </div>
  );
};

export default Index;
