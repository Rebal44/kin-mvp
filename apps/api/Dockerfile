FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/db/package*.json ./packages/db/
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm install

# Copy source
COPY packages/db ./packages/db
COPY apps/api ./apps/api

# Generate Prisma client
RUN cd packages/db && npx prisma generate

# Build
RUN cd apps/api && npm run build

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]