import React, { useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './components/Home';
import Styles from './components/Styles';
import History from './components/History';
import Onboarding from './components/Onboarding';
import Guidance from './components/Guidance';
import Profile from './components/Profile';
import { Tab, UserProfile, BeardStyle, ScanResult, HistoryItem } from './types';

// Mock User Data
const currentUser: UserProfile = {
  name: 'Ryan',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhRYYVA7xytkd9BAt5e0xW-lWJHJTxWMBHGgTp0NhBgvw7twAELQNsPs90IEUx-JWTeLtDsoUqyCR9QB2qXrwgBJ87iYQkI4-46-kMCARo-0zwHk8NHVANwmU-1BytKm9y5936AnQCImUTg9vgHSOMy7PnykUPv1Zd7GxKcy1R4hrAe6Ifx47gC_xbrPOcSS0qiuyrMisN8MWclEPBbyMczH89aZdqtQCdpxY96ALqmdtHL29M66RmXCcDMiIadOjxbc4S0Zp1_A',
};

const App: React.FC = () => {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
  const [activeGuidanceStyle, setActiveGuidanceStyle] = useState<BeardStyle | null>(null);
  
  // New Scan State
  const [scanResult, setScanResult] = useState<ScanResult | undefined>(undefined);
  const [scanImage, setScanImage] = useState<string | undefined>(undefined);

  // History State
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
      { id: '1', styleName: 'Clean Stubble', date: '4 days ago', mode: 'Beginner' },
  ]);

  // Handler for when a scan is completed successfully
  const handleScanComplete = (result: ScanResult, imageSrc: string) => {
    setScanResult(result);
    setScanImage(imageSrc);
    // Auto-navigate to Styles to show recommendations
    setActiveTab(Tab.Styles);
  };

  const startGuidance = (style: BeardStyle) => {
    setActiveGuidanceStyle(style);
  };

  const closeGuidance = () => {
    setActiveGuidanceStyle(null);
  };

  const handleGuidanceComplete = (style: BeardStyle) => {
    const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        styleName: style.name,
        date: 'Just now',
        mode: style.difficulty
    };
    setHistoryItems(prev => [newItem, ...prev]);
    setActiveTab(Tab.History);
  };

  if (!hasOnboarded) {
    return <Onboarding onComplete={() => setHasOnboarded(true)} />;
  }

  if (activeGuidanceStyle) {
    return (
      <Guidance 
        style={activeGuidanceStyle} 
        scanResult={scanResult}
        scanImage={scanImage}
        onClose={closeGuidance} 
        onComplete={handleGuidanceComplete}
      />
    );
  }

  // Helper to render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case Tab.Home:
        return <Home onScanComplete={handleScanComplete} />;
      case Tab.Styles:
        return (
          <Styles 
            onSelectStyle={startGuidance} 
            userFaceShape={scanResult?.faceShape} 
          />
        );
      case Tab.History:
        return <History items={historyItems} />;
      case Tab.Profile:
        return <Profile user={currentUser} />;
      default:
        return <Home onScanComplete={handleScanComplete} />;
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden selection:bg-primary selection:text-background-dark font-display">
      
      {/* Header */}
      <Header user={currentUser} />

      {/* Main Content Area */}
      <main className="flex-1 px-4 max-w-lg mx-auto w-full">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;