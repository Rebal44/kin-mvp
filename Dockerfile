FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
COPY packages/db/package*.json ./packages/db/
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY workers/package*.json ./workers/

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN cd packages/db && npx prisma generate

# Build all services
RUN cd apps/api && npx tsc
RUN cd workers && npx tsc
RUN cd apps/web && npx next build

# Install serve for static files
RUN npm install -g serve concurrently

EXPOSE 3000 3001

# Start all services
CMD concurrently \
  "node apps/api/dist/index.js" \
  "serve apps/web/dist -l 3000" \
  "node workers/dist/index.js"
