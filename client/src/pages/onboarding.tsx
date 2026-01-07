import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, Rocket, Settings } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Connect ChittyID",
    description: "Sign in with your ChittyID to automatically discover and sync your apps.",
    icon: Shield,
  },
  {
    id: 2,
    title: "Add Your First App",
    description: "Install the beacon package and start tracking your application.",
    icon: Rocket,
  },
  {
    id: 3,
    title: "Configure Settings",
    description: "Customize your dashboard and notification preferences.",
    icon: Settings,
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();

  const currentStepData = steps.find(step => step.id === currentStep);
  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setLocation("/");
    }
  };

  const handleSkip = () => {
    setLocation("/");
  };

  return (
    <div className="bg-chitty-dark text-white min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-chitty-dark-secondary border-chitty-border">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-chitty-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {currentStepData && (
                <currentStepData.icon className="text-chitty-green text-2xl" />
              )}
            </div>
            <h1 className="text-2xl font-bold mb-2" data-testid="text-onboarding-title">
              Welcome to ChittyBeacon
            </h1>
            <p className="text-chitty-text-secondary" data-testid="text-onboarding-description">
              Let's get your first app connected in just a few steps.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-chitty-text-secondary">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm text-chitty-text-secondary">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="mb-4" />
            
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.id <= currentStep 
                        ? 'bg-chitty-green text-chitty-dark' 
                        : 'bg-chitty-border text-chitty-text-secondary'
                    }`}>
                      <span className="text-sm font-semibold">{step.id}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-1 ${
                        step.id < currentStep ? 'bg-chitty-green' : 'bg-chitty-border'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {currentStepData && (
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold" data-testid="text-current-step-title">
                {currentStepData.title}
              </h3>
              <p className="text-sm text-chitty-text-secondary" data-testid="text-current-step-description">
                {currentStepData.description}
              </p>
              
              {currentStep === 1 && (
                <Button 
                  className="w-full bg-chitty-green hover:bg-chitty-green-dark text-chitty-dark font-semibold"
                  onClick={handleNext}
                  data-testid="button-connect-chittyid"
                >
                  <Shield className="mr-2" />
                  Connect with ChittyID
                </Button>
              )}

              {currentStep === 2 && (
                <div className="bg-chitty-dark p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Installation Instructions</h4>
                  <p className="text-sm text-chitty-text-secondary mb-3">
                    Add this to your app's entry point:
                  </p>
                  <div className="bg-black/30 rounded p-3 font-mono text-sm">
                    <code>npm install @chittycorp/app-beacon</code>
                    <br />
                    <code>require('@chittycorp/app-beacon');</code>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-chitty-dark rounded-lg">
                    <span className="text-sm">Email notifications</span>
                    <div className="w-2 h-2 bg-chitty-green rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-chitty-dark rounded-lg">
                    <span className="text-sm">Auto-sync ChittyID apps</span>
                    <div className="w-2 h-2 bg-chitty-green rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              className="flex-1 border-chitty-border hover:bg-chitty-dark text-white"
              onClick={handleSkip}
              data-testid="button-skip"
            >
              Skip for now
            </Button>
            <Button 
              className="flex-1 bg-chitty-green hover:bg-chitty-green-dark text-chitty-dark font-semibold"
              onClick={handleNext}
              data-testid="button-next"
            >
              {currentStep === steps.length ? 'Finish' : 'Next'}
            </Button>
          </div>

          <div className="text-center mt-4">
            <Button 
              variant="ghost" 
              className="text-chitty-text-secondary hover:text-white text-sm"
              onClick={handleSkip}
              data-testid="button-setup-later"
            >
              I'll set up later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
