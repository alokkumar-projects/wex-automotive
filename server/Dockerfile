# Use a standard Node image
FROM node:18

WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Remove lockfile & node_modules if any (ensures clean slate)
RUN rm -rf node_modules package-lock.json

# Install only production deps
RUN npm install --omit=dev --legacy-peer-deps

# Copy the rest of application code
COPY . .

EXPOSE 5175

CMD ["node", "server.js"]
