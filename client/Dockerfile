# --- Stage 1: Build the React application ---
FROM node:18 AS build

WORKDIR /usr/src/app

# Copy ONLY package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Clean up and fresh install to fix Rollup native binary issue
RUN rm -rf node_modules package-lock.json && npm install --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Build the production-ready static files
ENV ROLLUP_SKIP_NATIVE=1
RUN npm run build

# --- Stage 2: Serve the static files with Nginx ---
FROM nginx:stable-alpine

# Copy the built static files from the 'build' stage
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
