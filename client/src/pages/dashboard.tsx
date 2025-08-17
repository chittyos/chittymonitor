import { useState } from "react";
import TopNavigation from "@/components/layout/top-navigation";
import Sidebar from "@/components/layout/sidebar";
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
        
        <main className="flex-1 p-6" data-testid="main-dashboard">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2" data-testid="text-dashboard-title">Dashboard</h1>
            <p className="text-chitty-text-secondary" data-testid="text-dashboard-subtitle">
              Monitor your connected applications and track their performance in real-time.
            </p>
          </div>

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
