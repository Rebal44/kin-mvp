FROM node:20-alpine

WORKDIR /app

# Copy all package files
COPY package*.json ./
COPY packages/db/package*.json ./packages/db/
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY workers/package*.json ./workers/

# Install root dependencies
RUN npm install

# Install web dependencies
RUN cd apps/web && npm install

# Copy all source code
COPY . .

# Generate Prisma client
RUN cd packages/db && npx prisma generate

# Build web app
RUN cd apps/web && npm run build

# Install serve and concurrently globally
RUN npm install -g serve concurrently

# Expose ports
EXPOSE 3000 3001

# Start all services
CMD ["sh", "-c", "concurrently 'node apps/api/dist/index.js' 'serve apps/web/dist -l 3000' 'node workers/dist/index.js'"]
