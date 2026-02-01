FROM node:20-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN npm install

# Generate Prisma client
RUN cd packages/db && npx prisma generate

# Build the worker
RUN cd workers && npx tsc

CMD ["node", "workers/dist/index.js"]
