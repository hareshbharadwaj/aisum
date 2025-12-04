# Stage 1: Build the frontend
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the frontend
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine
WORKDIR /app

# Copy only production dependencies from the builder stage
COPY package*.json ./
RUN npm install --omit=dev

# Copy the backend and the built frontend from the builder stage
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 4000

# Command to start the server
CMD ["node", "backend/src/server.js"]