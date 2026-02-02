FROM node:20-alpine

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY api/package*.json ./api/
COPY bot/package*.json ./bot/
COPY web/package*.json ./web/
COPY shared/package*.json ./shared/
COPY shared/prisma ./shared/prisma/

# Install all dependencies
RUN npm install
RUN cd api && npm install
RUN cd bot && npm install
RUN cd web && npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN cd shared && npx prisma generate

# Build web app
RUN cd web && npm run build

# Install global tools
RUN npm install -g concurrently

# Expose ports
EXPOSE 3000 3001

# Start all services
CMD ["sh", "-c", "npx concurrently 'cd api && npm start' 'npx serve web/dist -l 3000' 'cd bot && npm start'"]
