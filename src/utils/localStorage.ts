import { FolderRelationship } from '../types';

// Utility function to remove quotes from paths
export const removeQuotesFromPath = (path: string): string => {
  if (!path) return path;
  
  // Remove leading and trailing single or double quotes
  return path.replace(/^['"]|['"]$/g, '');
};

const STORAGE_KEYS = {
  RELATIONSHIPS: 'folder-sync-relationships',
  CRON_SETTINGS: 'folder-sync-cron-settings',
  SYNC_LOGS: 'folder-sync-logs'
};

export class LocalStorageService {
  // Relationships
  static saveRelationships(relationships: FolderRelationship[]): void {
    try {
      // Convert dates to ISO strings for JSON serialization
      const serializedRelationships = relationships.map(rel => ({
        ...rel,
        lastSync: rel.lastSync ? rel.lastSync.toISOString() : null
      }));
      
      localStorage.setItem(STORAGE_KEYS.RELATIONSHIPS, JSON.stringify(serializedRelationships));
    } catch (error) {
      console.error('Failed to save relationships to localStorage:', error);
    }
  }

  static loadRelationships(): FolderRelationship[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RELATIONSHIPS);
      if (!stored) return [];

      const relationships = JSON.parse(stored);
      
      // Convert ISO strings back to Date objects
      return relationships.map((rel: any) => ({
        ...rel,
        lastSync: rel.lastSync ? new Date(rel.lastSync) : null
      }));
    } catch (error) {
      console.error('Failed to load relationships from localStorage:', error);
      return [];
    }
  }

  static clearRelationships(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.RELATIONSHIPS);
    } catch (error) {
      console.error('Failed to clear relationships from localStorage:', error);
    }
  }

  // Cron Settings
  static saveCronSettings(settings: any): void {
    try {
      const serializedSettings = {
        ...settings,
        lastRun: settings.lastRun ? settings.lastRun.toISOString() : null,
        nextRun: settings.nextRun ? settings.nextRun.toISOString() : null
      };
      
      localStorage.setItem(STORAGE_KEYS.CRON_SETTINGS, JSON.stringify(serializedSettings));
    } catch (error) {
      console.error('Failed to save cron settings to localStorage:', error);
    }
  }

  static loadCronSettings(): any | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CRON_SETTINGS);
      if (!stored) return null;

      const settings = JSON.parse(stored);
      
      return {
        ...settings,
        lastRun: settings.lastRun ? new Date(settings.lastRun) : null,
        nextRun: settings.nextRun ? new Date(settings.nextRun) : null
      };
    } catch (error) {
      console.error('Failed to load cron settings from localStorage:', error);
      return null;
    }
  }

  // Sync Logs
  static saveSyncLogs(logs: any[]): void {
    try {
      const serializedLogs = logs.map(log => ({
        ...log,
        timestamp: log.timestamp ? log.timestamp.toISOString() : null
      }));
      
      localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(serializedLogs));
    } catch (error) {
      console.error('Failed to save sync logs to localStorage:', error);
    }
  }

  static loadSyncLogs(): any[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
      if (!stored) return [];

      const logs = JSON.parse(stored);
      
      return logs.map((log: any) => ({
        ...log,
        timestamp: log.timestamp ? new Date(log.timestamp) : null
      }));
    } catch (error) {
      console.error('Failed to load sync logs from localStorage:', error);
      return [];
    }
  }

  // Utility methods
  static exportData(): string {
    try {
      const data = {
        relationships: this.loadRelationships(),
        cronSettings: this.loadCronSettings(),
        syncLogs: this.loadSyncLogs(),
        exportDate: new Date().toISOString()
      };
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '';
    }
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.relationships) {
        this.saveRelationships(data.relationships);
      }
      
      if (data.cronSettings) {
        this.saveCronSettings(data.cronSettings);
      }
      
      if (data.syncLogs) {
        this.saveSyncLogs(data.syncLogs);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  static clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.RELATIONSHIPS);
      localStorage.removeItem(STORAGE_KEYS.CRON_SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.SYNC_LOGS);
    } catch (error) {
      console.error('Failed to clear all data from localStorage:', error);
    }
  }

  static getStorageUsage(): { used: number; total: number; percentage: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      }
      
      // Approximate localStorage limit (usually 5-10MB, we'll use 5MB as conservative estimate)
      const total = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (used / total) * 100;
      
      return { used, total, percentage };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }
}

// Helper function to get sample data for first-time users
export const getSampleRelationships = (): FolderRelationship[] => [
  {
    id: '1',
    sourcePath: '/Users/patote/Documents/Projects',
    destinationPath: '/Volumes/Backup/Projects',
    originalName: 'Projects',
    customName: 'Projects-Backup',
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'synced',
    filesCount: 1247,
    size: '156.3 MB',
    autoSync: true
  },
  {
    id: '2',
    sourcePath: '/Users/patote/Documents/Photos',
    destinationPath: '/Volumes/External/Photos-Backup',
    originalName: 'Photos',
    customName: 'Family-Photos-Backup',
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    status: 'out-of-sync',
    filesCount: 3891,
    size: '2.1 GB',
    autoSync: true
  }
]; 