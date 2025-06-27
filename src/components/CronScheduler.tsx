import React, { useState } from 'react';
import { Clock, Play, Pause, RefreshCw, Settings, Calendar, Activity } from 'lucide-react';
import { CronSettings, SyncLog } from '../types';

interface CronSchedulerProps {
  cronSettings: CronSettings;
  syncLogs: SyncLog[];
  onStart: () => void;
  onStop: () => void;
  onUpdateInterval: (interval: number) => void;
  onManualSyncAll: () => void;
  isRunning: boolean;
}

export const CronScheduler: React.FC<CronSchedulerProps> = ({
  cronSettings,
  syncLogs,
  onStart,
  onStop,
  onUpdateInterval,
  onManualSyncAll,
  isRunning
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempInterval, setTempInterval] = useState(cronSettings.interval);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getTimeUntilNext = () => {
    if (!cronSettings.nextRun) return null;
    const diff = cronSettings.nextRun.getTime() - Date.now();
    if (diff <= 0) return 'Due now';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const handleIntervalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempInterval > 0) {
      onUpdateInterval(tempInterval);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-700/50 bg-gray-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
              <Clock className="text-purple-400" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Auto-Sync Scheduler</h3>
              <p className="text-gray-400 mt-1">
                {cronSettings.enabled ? (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    Running every {cronSettings.interval} minutes
                  </span>
                ) : (
                  'Automatic synchronization disabled'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-2xl transition-all duration-200 border border-transparent hover:border-gray-700/50"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Quick Controls */}
      <div className="px-8 py-6 bg-gray-800/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={cronSettings.enabled ? onStop : onStart}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-medium transition-all duration-300 ${
                cronSettings.enabled
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
              } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {cronSettings.enabled ? <Pause size={16} /> : <Play size={16} />}
              {cronSettings.enabled ? 'Stop Auto-Sync' : 'Start Auto-Sync'}
            </button>

            <button
              onClick={onManualSyncAll}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-2xl font-medium transition-all duration-300 hover:bg-blue-500/30 ${
                isRunning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw size={16} className={isRunning ? 'animate-spin' : ''} />
              {isRunning ? 'Syncing...' : 'Sync All Now'}
            </button>
          </div>

          {cronSettings.enabled && (
            <div className="text-right">
              <div className="text-sm text-gray-400">Next sync in</div>
              <div className="text-lg font-semibold text-white">
                {getTimeUntilNext() || 'Calculating...'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Settings */}
      {isExpanded && (
        <div className="px-8 py-6 border-t border-gray-700/50 space-y-6">
          {/* Interval Settings */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Sync Interval</h4>
            <form onSubmit={handleIntervalSubmit} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Every</label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={tempInterval}
                  onChange={(e) => setTempInterval(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                />
                <label className="text-sm text-gray-400">minutes</label>
              </div>
              {tempInterval !== cronSettings.interval && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl font-medium hover:bg-purple-500/30 transition-all duration-200"
                >
                  Update
                </button>
              )}
            </form>
            <div className="mt-2 text-xs text-gray-500">
              Recommended: 15-60 minutes depending on your sync requirements
            </div>
          </div>

          {/* Status Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar size={18} />
                Schedule Status
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={cronSettings.enabled ? 'text-emerald-400' : 'text-gray-400'}>
                    {cronSettings.enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Interval:</span>
                  <span className="text-white">{cronSettings.interval} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Run:</span>
                  <span className="text-white">{formatDate(cronSettings.lastRun)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Next Run:</span>
                  <span className="text-white">{formatDate(cronSettings.nextRun)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity size={18} />
                Recent Activity
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {syncLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      log.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-gray-400 text-xs">
                      {formatDate(log.timestamp)}
                    </span>
                    <span className="text-white truncate">
                      {log.relationshipName}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      log.type === 'auto' 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {log.type}
                    </span>
                  </div>
                ))}
                {syncLogs.length === 0 && (
                  <div className="text-gray-500 text-sm">No sync activity yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};