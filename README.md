# Folder Sync App

A React-based directory synchronization application with cron scheduling capabilities and real file operations, built with TypeScript, Vite, and Express.js.

## Features

- Modern React UI with TypeScript
- **Real file synchronization** - actually copies files from source to destination
- Express.js backend API for file operations on the host system
- Cron job scheduling for automated folder synchronization
- File system access through Docker volumes
- Real-time statistics and status monitoring
- Relationship management for sync operations
- **Persistent data storage** using browser localStorage
- **Data export/import** functionality for backup and sharing
- **Storage usage monitoring** and management tools

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for using docker-compose method)

## Running with Docker

### Method 1: Using Docker Compose (Recommended)

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd folder-sync
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Access the application at:
   - **Frontend**: http://localhost:3095
   - **Backend API**: http://localhost:3001

4. To stop the application:
   ```bash
   docker-compose down
   ```

### Method 2: Using the Docker Run Script

1. Make the script executable:
   ```bash
   chmod +x docker-run.sh
   ```

2. Run the script:
   ```bash
   ./docker-run.sh
   ```

3. Access the application at:
   - **Frontend**: http://localhost:3095
   - **Backend API**: http://localhost:3001

### Method 3: Manual Docker Commands

1. Build the Docker image:
   ```bash
   docker build -t folder-sync .
   ```

2. Run the container:
   ```bash
   docker run -d \
     --name folder-sync-container \
     -p 3095:3000 \
     -p 3001:3001 \
     -v /Users:/host-users:rw \
     -v /Volumes:/host-volumes:rw \
     -e NODE_ENV=development \
     --restart unless-stopped \
     folder-sync
   ```

3. Access the application at:
   - **Frontend**: http://localhost:3095
   - **Backend API**: http://localhost:3001

## Volume Mounts

The application mounts system directories to provide access to your file system:

### macOS Volume Mounts:
- `/Users:/host-users:rw` - User directories
- `/Volumes:/host-volumes:rw` - Mounted drives and external storage

### Custom Volume Mounts:
You can add specific directories by modifying the `docker-compose.yml` file:
```yaml
volumes:
  - /path/to/your/source:/host-source:rw
  - /path/to/your/destination:/host-destination:rw
```

⚠️ **Security Notice**: This application has file system access to mounted directories. Only run it in trusted environments.

## Managing the Container

### View running containers:
```bash
docker ps
```

### View container logs:
```bash
docker logs folder-sync-container
```

### Stop the container:
```bash
docker stop folder-sync-container
```

### Remove the container:
```bash
docker rm folder-sync-container
```

### Remove the image:
```bash
docker rmi folder-sync
```

## Development

### Local Development (without Docker)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the application at: http://localhost:5173

### Build for Production

```bash
npm run build
```

### Lint the Code

```bash
npm run lint
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **File Operations**: Node.js fs module
- **Containerization**: Docker

## Port Configuration

- **Frontend (Docker)**: Port 3095 (external) → 3000 (internal)
- **Backend API (Docker)**: Port 3001
- **Local Development**: Port 5173 (default Vite port)

## Data Persistence

Your sync relationships, settings, and logs are automatically saved to your browser's localStorage and will persist between sessions. The app includes:

- **Automatic saving**: All changes are instantly saved to localStorage
- **Data export**: Backup your data as a JSON file
- **Data import**: Restore from a backup file
- **Storage monitoring**: Track localStorage usage
- **Clear data**: Reset all stored data when needed

### Managing Your Data

1. **Access Settings**: Click the settings icon (⚙️) in the top-right corner
2. **Export Data**: Download a backup of all your sync relationships and settings
3. **Import Data**: Upload a previously exported backup file
4. **Storage Usage**: Monitor how much browser storage you're using
5. **Clear All**: Remove all stored data (with confirmation)

### Data Storage Details

- Data is stored locally in your browser using localStorage
- No data is sent to external servers
- Storage limit: ~5-10MB (varies by browser)
- Data persists until manually cleared or browser data is wiped

## Troubleshooting

1. **Port already in use**: If ports 3095 or 3001 are already in use, modify the port mapping in `docker-compose.yml` or the run command.

2. **macOS Volume Mount Errors**: If you get errors like "mounts denied" or "path is not shared", this means you're trying to mount paths that don't exist on macOS or aren't shared by Docker Desktop:
   - Remove Linux-specific mounts like `/mnt`, `/media`, `/home`
   - Use macOS-specific paths like `/Users` and `/Volumes`
   - Configure shared paths in Docker Desktop: Docker → Preferences → Resources → File Sharing

3. **Permission issues**: Ensure Docker has the necessary permissions to access the file system.

4. **Container won't start**: Check Docker logs using `docker logs folder-sync-container`.

5. **Backend API not responding**: If sync operations fail with "Backend server not available", ensure both ports 3095 and 3001 are accessible and the backend service is running inside the container.

5. **File access issues**: Verify that the volume mounts are correct for your operating system.

6. **Docker Desktop File Sharing**: On macOS, ensure the paths you want to mount are shared in Docker Desktop settings.

7. **Lost data**: If your sync relationships disappear, check if your browser data was cleared. You can restore from an exported backup file.

8. **Storage full**: If you hit localStorage limits, export your data, clear it, and re-import only what you need.

## License

This project is private and not licensed for distribution. 

docker-compose down && docker-compose build && docker-compose up -d
