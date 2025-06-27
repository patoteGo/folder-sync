import React, { useState, useEffect } from 'react';
import { FolderSync, Settings } from 'lucide-react';
import { FolderRelationship, SyncStats } from './types';
import { AddRelationshipForm } from './components/AddRelationshipForm';
import { RelationshipTable } from './components/RelationshipTable';
import { StatsCards } from './components/StatsCards';
import { CronScheduler } from './components/CronScheduler';
import { useCronScheduler } from './hooks/useCronScheduler';
import { syncService } from './services/syncService';
import { LocalStorageService, getSampleRelationships } from './utils/localStorage';
import { DataManagement } from './components/DataManagement';
import { StorageIndicator } from './components/StorageIndicator';

function App() {
  const [relationships, setRelationships] = useState<FolderRelationship[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Load data from localStorage on app start
  useEffect(() => {
    const savedRelationships = LocalStorageService.loadRelationships();
    
    if (savedRelationships.length > 0) {
      // Load existing relationships from localStorage
      setRelationships(savedRelationships);
    } else {
      // First time user - show sample data and save it
      const sampleData = getSampleRelationships();
      setRelationships(sampleData);
      LocalStorageService.saveRelationships(sampleData);
    }
  }, []);

  // Save relationships to localStorage whenever they change
  useEffect(() => {
    if (relationships.length > 0) {
      LocalStorageService.saveRelationships(relationships);
    }
  }, [relationships]);

  const handleAddRelationship = (newRelationship: Omit<FolderRelationship, 'id'>) => {
    const relationship: FolderRelationship = {
      ...newRelationship,
      id: Date.now().toString(),
      autoSync: true // Enable auto-sync by default for new relationships
    };
    setRelationships(prev => {
      const updatedRelationships = [...prev, relationship];
      LocalStorageService.saveRelationships(updatedRelationships);
      return updatedRelationships;
    });
  };

  const handleDeleteRelationship = (id: string) => {
    setRelationships(prev => {
      const updatedRelationships = prev.filter(rel => rel.id !== id);
      LocalStorageService.saveRelationships(updatedRelationships);
      return updatedRelationships;
    });
  };

  const handleEditRelationship = (id: string, updates: Partial<FolderRelationship>) => {
    setRelationships(prev => {
      const updatedRelationships = prev.map(rel =>
        rel.id === id ? { ...rel, ...updates } : rel
      );
      LocalStorageService.saveRelationships(updatedRelationships);
      return updatedRelationships;
    });
  };

  const handleSyncRelationship = async (id: string): Promise<void> => {
    const relationship = relationships.find(rel => rel.id === id);
    if (!relationship) return;

    // Update status to show sync in progress
    setRelationships(prev =>
      prev.map(rel =>
        rel.id === id
          ? { ...rel, status: 'syncing' as const }
          : rel
      )
    );

    try {
      const result = await syncService.syncRelationship(relationship);
      
      // Update relationship with sync results
      setRelationships(prev =>
        prev.map(rel =>
          rel.id === id
            ? {
                ...rel,
                status: result.success ? 'synced' as const : 'error' as const,
                lastSync: new Date(),
                filesCount: result.filesCount || rel.filesCount,
                size: result.size || rel.size
              }
            : rel
        )
      );

      // Show success/error message (you can add a toast notification here)
      console.log(result.message);
    } catch (error) {
      setRelationships(prev =>
        prev.map(rel =>
          rel.id === id
            ? { ...rel, status: 'error' as const }
            : rel
        )
      );
      console.error('Sync failed:', error);
    }
  };

  const handleToggleAutoSync = (id: string, enabled: boolean) => {
    setRelationships(prev => {
      const updatedRelationships = prev.map(rel =>
        rel.id === id ? { ...rel, autoSync: enabled } : rel
      );
      LocalStorageService.saveRelationships(updatedRelationships);
      return updatedRelationships;
    });
  };

  const {
    cronSettings,
    syncLogs,
    startCron,
    stopCron,
    updateInterval,
    manualSyncAll,
    isRunning
  } = useCronScheduler(relationships, handleSyncRelationship);

  const stats: SyncStats = {
    total: relationships.length,
    synced: relationships.filter(r => r.status === 'synced').length,
    outOfSync: relationships.filter(r => r.status === 'out-of-sync').length,
    errors: relationships.filter(r => r.status === 'error').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      
      {/* Header */}
      <header className="relative bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
        <div className="max-w-[75%] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <FolderSync className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Directory Sync Manager</h1>
                <p className="text-gray-400 mt-0.5">Manage your folder synchronization relationships</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-2xl transition-all duration-200 border border-transparent hover:border-gray-700/50 ${showSettings ? 'bg-gray-800/50 text-white border-gray-700/50' : ''}`}
            >
              <Settings size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-[75%] mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Stats */}
          <StatsCards stats={stats} />

          {/* Settings Panel */}
          {showSettings && (
            <DataManagement 
              onDataChanged={() => {
                // Reload data after import/clear
                const savedRelationships = LocalStorageService.loadRelationships();
                if (savedRelationships.length > 0) {
                  setRelationships(savedRelationships);
                } else {
                  setRelationships([]);
                }
              }}
            />
          )}

          {/* Cron Scheduler */}
          <CronScheduler
            cronSettings={cronSettings}
            syncLogs={syncLogs}
            onStart={startCron}
            onStop={stopCron}
            onUpdateInterval={updateInterval}
            onManualSyncAll={manualSyncAll}
            isRunning={isRunning}
          />

          {/* Add New Relationship */}
          <div>
            <AddRelationshipForm onAdd={handleAddRelationship} />
          </div>

          {/* Relationships Table */}
          <div>
            <RelationshipTable
              relationships={relationships}
              onDelete={handleDeleteRelationship}
              onEdit={handleEditRelationship}
              onSync={handleSyncRelationship}
              onToggleAutoSync={handleToggleAutoSync}
            />
          </div>
        </div>
      </main>

      {/* Storage Indicator */}
      <StorageIndicator />
    </div>
  );
}

export default App;