import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to convert container paths to host paths
function convertToHostPath(containerPath) {
  if (containerPath.startsWith('/host-users/')) {
    return containerPath.replace('/host-users/', '/Users/');
  }
  if (containerPath.startsWith('/host-volumes/')) {
    return containerPath.replace('/host-volumes/', '/Volumes/');
  }
  return containerPath;
}

// Helper function to get directory stats
async function getDirectoryStats(dirPath) {
  try {
    const stats = await fs.stat(dirPath);
    if (!stats.isDirectory()) {
      return { exists: false, error: 'Path is not a directory' };
    }

    let filesCount = 0;
    let totalSize = 0;

    async function countFiles(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            await countFiles(fullPath);
          } else {
            filesCount++;
            const fileStats = await fs.stat(fullPath);
            totalSize += fileStats.size;
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not read directory ${dir}:`, error.message);
      }
    }

    await countFiles(dirPath);

    return {
      exists: true,
      filesCount,
      size: formatBytes(totalSize)
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Helper function to copy directory recursively
async function copyDirectory(src, dest, options = {}) {
  const results = {
    filesCount: 0,
    copiedFiles: 0,
    skippedFiles: 0,
    errors: [],
    totalSize: 0
  };

  try {
    // Create destination directory if it doesn't exist
    await fs.mkdir(dest, { recursive: true });

    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      try {
        if (entry.isDirectory()) {
          const subResults = await copyDirectory(srcPath, destPath, options);
          results.filesCount += subResults.filesCount;
          results.copiedFiles += subResults.copiedFiles;
          results.skippedFiles += subResults.skippedFiles;
          results.totalSize += subResults.totalSize;
          results.errors.push(...subResults.errors);
        } else {
          results.filesCount++;
          
          // Check if we should copy the file
          let shouldCopy = true;
          
          if (options.onlyNewer) {
            try {
              const srcStats = await fs.stat(srcPath);
              const destStats = await fs.stat(destPath);
              shouldCopy = srcStats.mtime > destStats.mtime;
            } catch (error) {
              // Destination doesn't exist, so we should copy
              shouldCopy = true;
            }
          }

          if (shouldCopy) {
            await fs.copyFile(srcPath, destPath);
            const fileStats = await fs.stat(srcPath);
            results.totalSize += fileStats.size;
            results.copiedFiles++;
          } else {
            results.skippedFiles++;
          }
        }
      } catch (error) {
        results.errors.push({
          path: srcPath,
          error: error.message
        });
      }
    }
  } catch (error) {
    results.errors.push({
      path: src,
      error: error.message
    });
  }

  return results;
}

// API Routes

// Check if a directory exists and get its info
app.get('/api/directory/info', async (req, res) => {
  try {
    const { path: dirPath } = req.query;
    
    if (!dirPath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    // Use container path directly for file operations
    const containerPath = dirPath;
    // Convert to host path only for display
    const displayPath = convertToHostPath(dirPath);
    
    const info = await getDirectoryStats(containerPath);
    
    res.json({
      path: displayPath,
      ...info
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync directories
app.post('/api/sync', async (req, res) => {
  try {
    const { sourcePath, destinationPath, options = {} } = req.body;
    
    if (!sourcePath || !destinationPath) {
      return res.status(400).json({ 
        error: 'sourcePath and destinationPath are required' 
      });
    }

    // Use container paths directly (don't convert them)
    const containerSourcePath = sourcePath;
    const containerDestPath = destinationPath;
    
    // Convert to host paths only for logging/display purposes
    const displaySourcePath = convertToHostPath(sourcePath);
    const displayDestPath = convertToHostPath(destinationPath);

    console.log(`Starting sync from ${displaySourcePath} to ${displayDestPath}`);
    console.log(`Container paths: ${containerSourcePath} to ${containerDestPath}`);
    const startTime = Date.now();

    // Check if source directory exists (using container path)
    const sourceInfo = await getDirectoryStats(containerSourcePath);
    if (!sourceInfo.exists) {
      return res.status(400).json({
        success: false,
        error: `Source directory does not exist: ${displaySourcePath}`
      });
    }

    // Perform the sync (using container paths)
    const syncResults = await copyDirectory(containerSourcePath, containerDestPath, {
      onlyNewer: options.onlyNewer !== false // Default to true
    });

    const duration = Date.now() - startTime;

    console.log(`Sync completed in ${duration}ms:`, syncResults);

    res.json({
      success: true,
      message: `Successfully synced ${syncResults.copiedFiles} files from ${displaySourcePath} to ${displayDestPath}`,
      filesCount: syncResults.filesCount,
      copiedFiles: syncResults.copiedFiles,
      skippedFiles: syncResults.skippedFiles,
      size: formatBytes(syncResults.totalSize),
      duration,
      errors: syncResults.errors,
      sourcePath: displaySourcePath,
      destinationPath: displayDestPath
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Folder sync backend is running'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Folder sync backend running on port ${PORT}`);
  console.log(`📁 Ready to sync directories on the host system`);
}); 