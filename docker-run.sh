#!/bin/bash

# Build the Docker image
echo "Building folder-sync Docker image..."
docker build -t folder-sync .

# Stop and remove existing container if it exists
echo "Stopping existing container..."
docker stop folder-sync-container 2>/dev/null || true
docker rm folder-sync-container 2>/dev/null || true

# Run the container with macOS-compatible volume mounts
echo "Starting folder-sync container..."
docker run -d \
  --name folder-sync-container \
  -p 3095:3000 \
  -p 3001:3001 \
  -v /Users:/host-users:rw \
  -v /Volumes:/host-volumes:rw \
  -e NODE_ENV=development \
  --restart unless-stopped \
  folder-sync

echo "✅ Folder sync is running!"
echo "🌐 Frontend: http://localhost:3095"
echo "🔧 Backend API: http://localhost:3001"
echo "📁 Ready to sync directories on your macOS system"
echo ""
echo "To stop the container:"
echo "  docker stop folder-sync-container"
echo ""
echo "To view logs:"
echo "  docker logs -f folder-sync-container"