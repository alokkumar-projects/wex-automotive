# Stage 1: Use an official Node.js runtime as a parent image
FROM node:18-alpine AS base

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Stage 2: Install production dependencies
FROM base AS production
ENV NODE_ENV=production
# Install only production dependencies
RUN npm ci --only=production

# Stage 3: Setup the final production image
FROM base
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copy the production dependencies from the 'production' stage
COPY --from=production /usr/src/app/node_modules ./node_modules

# Copy the rest of the application code
COPY . .

# The application listens on port 5175, so we expose it
EXPOSE 5175

# Define the command to run the app
CMD [ "node", "server.js" ]