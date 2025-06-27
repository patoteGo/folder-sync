import { createServer } from 'http';
import { parse } from 'url';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4100;

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

// Helper function to parse request body
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Helper function to send JSON response
function sendJSON(res, data, statusCode = 200) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

// Handle CORS preflight
function handleCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.statusCode = 200;
  res.end();
}

// Create server
const server = createServer(async (req, res) => {
  const urlParts = parse(req.url, true);
  const pathname = urlParts.pathname;
  const query = urlParts.query;

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCORS(res);
  }

  try {
    // Check if a directory exists and get its info
    if (pathname === '/api/directory/info' && req.method === 'GET') {
      const dirPath = query.path;
      
      if (!dirPath) {
        return sendJSON(res, { error: 'Path parameter is required' }, 400);
      }

      // Use container path directly for file operations
      const containerPath = dirPath;
      // Convert to host path only for display
      const displayPath = convertToHostPath(dirPath);
      
      const info = await getDirectoryStats(containerPath);
      
      return sendJSON(res, {
        path: displayPath,
        ...info
      });
    }

    // Sync directories
    if (pathname === '/api/sync' && req.method === 'POST') {
      const body = await parseBody(req);
      const { sourcePath, destinationPath, options = {} } = body;
      
      if (!sourcePath || !destinationPath) {
        return sendJSON(res, { 
          error: 'sourcePath and destinationPath are required' 
        }, 400);
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

      const results = await copyDirectory(containerSourcePath, containerDestPath, options);
      const duration = Date.now() - startTime;

      console.log(`Sync completed: ${results.copiedFiles}/${results.filesCount} files copied in ${duration}ms`);

      return sendJSON(res, {
        success: true,
        message: `Successfully synced ${results.copiedFiles} of ${results.filesCount} files`,
        duration,
        ...results
      });
    }

    // Default 404 response
    return sendJSON(res, { error: 'Not found' }, 404);

  } catch (error) {
    console.error('Server error:', error);
    return sendJSON(res, { error: error.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`Backend server started on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 