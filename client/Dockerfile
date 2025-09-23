# --- Stage 1: Build the React application ---
FROM node:18-alpine AS build

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the production-ready static files
RUN npm run build

# --- Stage 2: Serve the static files with Nginx ---
FROM nginx:stable-alpine

# Copy the built static files from the 'build' stage to the Nginx public directory
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expose port 80 for the Nginx server
EXPOSE 80

# The default Nginx command will start the server
CMD ["nginx", "-g", "daemon off;"]