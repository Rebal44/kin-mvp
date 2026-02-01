FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/db/package*.json ./packages/db/
COPY workers/package*.json ./workers/

# Install dependencies
RUN npm install

# Copy source
COPY packages/db ./packages/db
COPY workers ./workers

# Generate Prisma client
RUN cd packages/db && npx prisma generate

# Build
RUN cd workers && npm run build

CMD ["node", "workers/dist/index.js"]