import React, { useState, useEffect } from 'react';
import { Database, Check } from 'lucide-react';
import { LocalStorageService } from '../utils/localStorage';

export const StorageIndicator: React.FC = () => {
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 0, percentage: 0 });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const updateUsage = () => {
      const usage = LocalStorageService.getStorageUsage();
      setStorageUsage(usage);
      setLastSaved(new Date());
    };

    // Update initially
    updateUsage();

    // Update every 2 seconds to show real-time changes
    const interval = setInterval(updateUsage, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 px-4 py-3 shadow-2xl">
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-blue-400" />
          <span className="text-gray-300">Storage:</span>
          <span className="text-white font-mono">
            {(storageUsage.used / 1024).toFixed(1)} KB
          </span>
        </div>

        {lastSaved && (
          <div className="flex items-center gap-2 text-gray-400 border-l border-gray-700 pl-3">
            <Check size={14} className="text-emerald-400" />
            <span>Saved {formatTime(lastSaved)}</span>
          </div>
        )}
      </div>
    </div>
  );
}; 