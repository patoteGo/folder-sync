import { FolderRelationship } from '../types';

export interface SyncResult {
  success: boolean;
  message: string;
  filesCount?: number;
  copiedFiles?: number;
  skippedFiles?: number;
  size?: string;
  duration: number;
  errors?: Array<{ path: string; error: string }>;
}

class SyncService {
  private baseUrl = 'http://localhost:3001/api';

  private convertToContainerPath(path: string): string {
    // Convert user paths to container paths for the backend
    if (path.startsWith('/Users/')) {
      return path.replace('/Users/', '/host-users/');
    }
    if (path.startsWith('/Volumes/')) {
      return path.replace('/Volumes/', '/host-volumes/');
    }
    return path;
  }

  async syncRelationship(relationship: FolderRelationship): Promise<SyncResult> {
    const startTime = Date.now();
    
    try {
      const sourcePath = this.convertToContainerPath(relationship.sourcePath);
      const destPath = this.convertToContainerPath(relationship.destinationPath);
      
      console.log(`Syncing from ${sourcePath} to ${destPath}`);
      
      const response = await fetch(`${this.baseUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourcePath,
          destinationPath: destPath,
          options: {
            onlyNewer: true // Only copy newer files
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: result.success,
        message: result.message,
        filesCount: result.filesCount,
        copiedFiles: result.copiedFiles,
        skippedFiles: result.skippedFiles,
        size: result.size,
        duration: result.duration,
        errors: result.errors
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('Sync error:', error);
      
      // Check if it's a network error (backend not running)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Backend server not available. Make sure the sync service is running on port 3001.',
          duration
        };
      }
      
      return {
        success: false,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration
      };
    }
  }

  async checkDirectoryAccess(path: string): Promise<boolean> {
    try {
      const containerPath = this.convertToContainerPath(path);
      
      const response = await fetch(`${this.baseUrl}/directory/info?path=${encodeURIComponent(containerPath)}`);
      
      if (!response.ok) {
        return false;
      }
      
      const result = await response.json();
      return result.exists;
      
    } catch (error) {
      console.error('Directory access check failed:', error);
      return false;
    }
  }

  async getDirectoryInfo(path: string): Promise<{ exists: boolean; filesCount?: number; size?: string; error?: string }> {
    try {
      const containerPath = this.convertToContainerPath(path);
      
      const response = await fetch(`${this.baseUrl}/directory/info?path=${encodeURIComponent(containerPath)}`);
      
      if (!response.ok) {
        return { exists: false, error: `HTTP ${response.status}` };
      }
      
      const result = await response.json();
      
      return {
        exists: result.exists,
        filesCount: result.filesCount,
        size: result.size,
        error: result.error
      };
      
    } catch (error) {
      console.error('Directory info failed:', error);
      return { 
        exists: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const syncService = new SyncService();

// Note: For actual file synchronization in a containerized environment,
// you would need to implement a backend API that can:
// 1. Access the mounted host filesystem
// 2. Use Node.js fs module for file operations
// 3. Implement proper error handling and progress tracking
// 4. Handle permissions and symlinks correctly
// 5. Provide real-time sync progress updates

export const createBackendSyncFunction = () => {
  // This would be implemented in a Node.js backend
  return `
  Example backend implementation:
  
  const fs = require('fs').promises;
  const path = require('path');
  
  async function syncDirectories(sourcePath, destPath) {
    try {
      // Check if source exists
      await fs.access(sourcePath);
      
      // Create destination if it doesn't exist
      await fs.mkdir(destPath, { recursive: true });
      
      // Get directory contents
      const files = await fs.readdir(sourcePath, { withFileTypes: true });
      
      for (const file of files) {
        const srcFile = path.join(sourcePath, file.name);
        const destFile = path.join(destPath, file.name);
        
        if (file.isDirectory()) {
          await syncDirectories(srcFile, destFile);
        } else {
          // Copy file if newer or doesn't exist
          const srcStats = await fs.stat(srcFile);
          let shouldCopy = true;
          
          try {
            const destStats = await fs.stat(destFile);
            shouldCopy = srcStats.mtime > destStats.mtime;
          } catch (e) {
            // Destination doesn't exist
          }
          
          if (shouldCopy) {
            await fs.copyFile(srcFile, destFile);
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  `;
}; 