import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const handleConnectChittyID = () => {
    // TODO: Implement ChittyID OAuth flow
    console.log("Connecting to ChittyID...");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-chitty-dark-secondary border-chitty-border max-w-md" data-testid="modal-onboarding">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-chitty-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-chitty-green text-2xl" />
          </div>
          <h2 className="text-2xl font-bold mb-2" data-testid="text-onboarding-modal-title">Welcome to ChittyBeacon</h2>
          <p className="text-chitty-text-secondary" data-testid="text-onboarding-modal-description">
            Let's get your first app connected in just a few steps.
          </p>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-chitty-green rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-chitty-dark">1</span>
            </div>
            <div className="w-8 h-1 bg-chitty-border"></div>
            <div className="w-8 h-8 bg-chitty-border rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-chitty-text-secondary">2</span>
            </div>
            <div className="w-8 h-1 bg-chitty-border"></div>
            <div className="w-8 h-8 bg-chitty-border rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-chitty-text-secondary">3</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h3 className="font-semibold" data-testid="text-step-title">Step 1: Connect ChittyID</h3>
          <p className="text-sm text-chitty-text-secondary" data-testid="text-step-description">
            Sign in with your ChittyID to automatically discover and sync your apps across the ChittyOS ecosystem.
          </p>
          
          <Button 
            className="w-full bg-chitty-green hover:bg-chitty-green-dark text-chitty-dark font-semibold py-3"
            onClick={handleConnectChittyID}
            data-testid="button-connect-chittyid-modal"
          >
            <Shield className="mr-2 h-4 w-4" />
            Connect with ChittyID
          </Button>
          
          <Button 
            variant="outline"
            className="w-full border-chitty-border hover:bg-chitty-dark text-white"
            onClick={onClose}
            data-testid="button-skip-chittyid"
          >
            Skip for now
          </Button>
        </div>

        <div className="text-center">
          <Button 
            variant="ghost"
            className="text-chitty-text-secondary hover:text-white text-sm"
            onClick={onClose}
            data-testid="button-setup-later-modal"
          >
            I'll set up later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
