# --- Stage 1: Build the React/Vite application ---
FROM node:18 AS build

WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Remove existing node_modules & lockfile for clean install
RUN rm -rf node_modules package-lock.json

# Install all deps (including dev) because build needs them
RUN npm install --legacy-peer-deps

# Copy rest of source
COPY . .

# If Rollup native binary fails, skip it
ENV ROLLUP_SKIP_NATIVE=1

# Run build
RUN npm run build

# --- Stage 2: Serve with nginx ---
FROM nginx:stable-alpine

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Add the nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]