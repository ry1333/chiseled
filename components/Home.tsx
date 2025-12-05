import React from 'react';
import ScanCard from './ScanCard';
import QuickActions from './QuickActions';
import { ScanResult } from '../types';

interface HomeProps {
  onScanComplete?: (result: ScanResult, imageSrc: string) => void;
}

const Home: React.FC<HomeProps> = ({ onScanComplete }) => {
  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Greeting Section */}
      <div className="pt-6 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
          Good evening, Ryan
        </h1>
        <p className="text-base font-normal text-gray-600 dark:text-gray-400">
          Ready for a clean lineup?
        </p>
      </div>

      {/* Main Feature Card */}
      <ScanCard onScanComplete={onScanComplete} />

      {/* Quick Actions List */}
      <QuickActions />
    </div>
  );
};

export default Home;