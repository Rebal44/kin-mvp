FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/db/package*.json ./packages/db/
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm install --production

# Copy source (including pre-compiled dist)
COPY packages/db ./packages/db
COPY apps/api ./apps/api

# Generate Prisma client
RUN cd packages/db && npx prisma generate

EXPOSE 3001

# Run pre-compiled JavaScript
CMD ["node", "apps/api/dist/index.js"]
