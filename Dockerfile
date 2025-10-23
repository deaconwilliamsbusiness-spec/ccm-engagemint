# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev

# Copy backend source code
COPY backend/ ./

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "src/server.js"]
