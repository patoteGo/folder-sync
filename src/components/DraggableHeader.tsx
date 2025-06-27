import React from 'react';
import { FolderSync, Settings } from 'lucide-react';

interface DraggableHeaderProps {
  showSettings: boolean;
  onToggleSettings: () => void;
}

export const DraggableHeader: React.FC<DraggableHeaderProps> = ({
  showSettings,
  onToggleSettings
}) => {
  return (
    <header 
      className="relative bg-gray-900/90 backdrop-blur-xl border-b border-gray-700/50 shadow-lg select-none"
      style={{ WebkitAppRegion: 'drag', paddingTop: '8px' } as React.CSSProperties}
    >
      <div className="max-w-[85%] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
              <FolderSync className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white tracking-tight">Directory Sync Manager</h1>
              <p className="text-gray-400 text-xs mt-0.5">Manage your folder synchronization</p>
            </div>
          </div>
          <button 
            onClick={onToggleSettings}
            className={`p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-700/50 ${showSettings ? 'bg-gray-800/50 text-white border-gray-700/50' : ''}`}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}; 