import { useState } from "react";
import TopNavigation from "@/components/layout/top-navigation";
import Sidebar from "@/components/layout/sidebar";
import HeroSection from "@/components/dashboard/hero-section";
import MetricsOverview from "@/components/dashboard/metrics-overview";
import PlatformDistribution from "@/components/dashboard/platform-distribution";
import RecentActivity from "@/components/dashboard/recent-activity";
import ConnectedApps from "@/components/dashboard/connected-apps";
import OnboardingModal from "@/components/onboarding/onboarding-modal";
import QuickSetupModal from "@/components/onboarding/quick-setup-modal";

export default function Dashboard() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showQuickSetup, setShowQuickSetup] = useState(false);

  return (
    <div className="bg-chitty-dark text-white min-h-screen">
      <TopNavigation />
      
      <div className="flex">
        <Sidebar onQuickSetup={() => setShowQuickSetup(true)} />
        
        <main className="flex-1" data-testid="main-dashboard">
          <HeroSection />
          
          <div className="p-6">
            <MetricsOverview />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <PlatformDistribution />
              </div>
              <div>
                <RecentActivity />
              </div>
            </div>

            <ConnectedApps />
          </div>
        </main>
      </div>

      <OnboardingModal 
        open={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
      
      <QuickSetupModal 
        open={showQuickSetup} 
        onClose={() => setShowQuickSetup(false)} 
      />
    </div>
  );
}
