import React, { useState } from 'react';
import { Download, Upload, Trash2, HardDrive, AlertTriangle } from 'lucide-react';
import { LocalStorageService } from '../utils/localStorage';

interface DataManagementProps {
  onDataChanged?: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ onDataChanged }) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExportData = () => {
    const data = LocalStorageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `folder-sync-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = LocalStorageService.importData(content);
        
        if (success) {
          setImportSuccess(true);
          onDataChanged?.();
          setTimeout(() => setImportSuccess(false), 3000);
        } else {
          setImportError('Failed to import data. Please check the file format.');
        }
      } catch (error) {
        setImportError('Invalid JSON file. Please select a valid backup file.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const handleClearAllData = () => {
    LocalStorageService.clearAllData();
    setShowConfirmClear(false);
    onDataChanged?.();
  };

  const storageUsage = LocalStorageService.getStorageUsage();

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 overflow-hidden shadow-2xl">
      <div className="px-8 py-6 border-b border-gray-700/50 bg-gray-800/30">
        <h3 className="text-xl font-semibold text-white flex items-center gap-3">
          <HardDrive size={24} className="text-blue-400" />
          Data Management
        </h3>
        <p className="text-gray-400 mt-1">Export, import, or clear your sync data</p>
      </div>

      <div className="p-8 space-y-6">
        {/* Storage Usage */}
        <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Storage Usage</h4>
              <p className="text-2xl font-bold text-white mt-1">
                {(storageUsage.used / 1024).toFixed(1)} KB
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {storageUsage.percentage.toFixed(2)}% of available storage
              </p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center">
                <HardDrive size={24} className="text-blue-400" />
              </div>
            </div>
          </div>
          <div className="mt-4 bg-gray-700/50 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Import/Export Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export */}
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl hover:bg-emerald-500/30 transition-all duration-200 font-medium"
          >
            <Download size={20} />
            Export Data
          </button>

          {/* Import */}
          <label className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-2xl hover:bg-blue-500/30 transition-all duration-200 font-medium cursor-pointer">
            <Upload size={20} />
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>

        {/* Import Status Messages */}
        {importError && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl">
            <AlertTriangle size={20} />
            {importError}
          </div>
        )}

        {importSuccess && (
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl">
            <Download size={20} />
            Data imported successfully!
          </div>
        )}

        {/* Clear Data */}
        <div className="border-t border-gray-700/50 pt-6">
          {!showConfirmClear ? (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl hover:bg-red-500/30 transition-all duration-200 font-medium w-full"
            >
              <Trash2 size={20} />
              Clear All Data
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl">
                <AlertTriangle size={20} />
                <div>
                  <p className="font-medium">Are you sure?</p>
                  <p className="text-sm text-red-300">This will delete all your sync relationships, settings, and logs.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClearAllData}
                  className="flex-1 px-4 py-3 bg-red-500/30 text-red-400 border border-red-500/50 rounded-xl hover:bg-red-500/40 transition-all duration-200 font-medium"
                >
                  Yes, Clear All
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="flex-1 px-4 py-3 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-xl hover:bg-gray-500/30 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-700/50">
          Data is stored locally in your browser and is not sent to any servers.
        </div>
      </div>
    </div>
  );
}; 