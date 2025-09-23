# Use the standard node:18 image
FROM node:18

WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Remove possible cached lockfile and node_modules (safety step)
RUN rm -rf node_modules package-lock.json

# Install only production dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Copy the rest of the application code
COPY . .

EXPOSE 5175

CMD [ "node", "server.js" ]
