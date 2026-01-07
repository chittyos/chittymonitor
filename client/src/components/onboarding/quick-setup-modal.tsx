import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickSetupModalProps {
  open: boolean;
  onClose: () => void;
}

export default function QuickSetupModal({ open, onClose }: QuickSetupModalProps) {
  const [appName, setAppName] = useState("");
  const [platform, setPlatform] = useState("");
  const { toast } = useToast();

  const handleCopyInstructions = () => {
    const instructions = `npm install @chittycorp/app-beacon\nrequire('@chittycorp/app-beacon');`;
    navigator.clipboard.writeText(instructions);
    toast({
      title: "Instructions copied!",
      description: "The installation instructions have been copied to your clipboard.",
    });
  };

  const handleFinishSetup = () => {
    if (!appName || !platform) {
      toast({
        title: "Missing information",
        description: "Please fill in both app name and platform.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Setup completed!",
      description: `Your app "${appName}" is ready to start tracking.`,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-chitty-dark-secondary border-chitty-border max-w-lg" data-testid="modal-quick-setup">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold" data-testid="text-quick-setup-title">Quick Setup</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-chitty-text-secondary hover:text-white"
              onClick={onClose}
              data-testid="button-close-quick-setup"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="appName" className="block text-sm font-medium mb-2">
              App Name
            </Label>
            <Input
              id="appName"
              type="text"
              placeholder="my-awesome-app"
              className="w-full bg-chitty-dark border-chitty-border focus:border-chitty-green"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              data-testid="input-app-name"
            />
          </div>

          <div>
            <Label htmlFor="platform" className="block text-sm font-medium mb-2">
              Platform
            </Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-full bg-chitty-dark border-chitty-border focus:border-chitty-green" data-testid="select-platform">
                <SelectValue placeholder="Select platform..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select platform...</SelectItem>
                <SelectItem value="replit">Replit</SelectItem>
                <SelectItem value="github">GitHub Actions</SelectItem>
                <SelectItem value="vercel">Vercel</SelectItem>
                <SelectItem value="netlify">Netlify</SelectItem>
                <SelectItem value="heroku">Heroku</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-chitty-dark p-4 rounded-lg">
            <h4 className="font-medium mb-2" data-testid="text-installation-title">Installation Instructions</h4>
            <p className="text-sm text-chitty-text-secondary mb-3" data-testid="text-installation-description">
              Add this to your app's entry point:
            </p>
            <div className="bg-black/30 rounded p-3 font-mono text-sm" data-testid="code-installation">
              <code>npm install @chittycorp/app-beacon</code>
              <br />
              <code>require('@chittycorp/app-beacon');</code>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button 
              variant="outline"
              className="flex-1 border-chitty-border hover:bg-chitty-dark text-white"
              onClick={handleCopyInstructions}
              data-testid="button-copy-instructions"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Instructions
            </Button>
            <Button 
              className="flex-1 bg-chitty-green hover:bg-chitty-green-dark text-chitty-dark font-semibold"
              onClick={handleFinishSetup}
              data-testid="button-finish-setup"
            >
              Finish Setup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
