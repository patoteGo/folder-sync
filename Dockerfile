FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose ports for both frontend (3000) and backend (3001)
EXPOSE 3000 3001

# Start both backend and frontend
CMD ["npm", "run", "dev:full"]