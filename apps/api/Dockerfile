FROM node:20-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies at root level (handles workspaces)
RUN npm install

# Generate Prisma client
RUN cd packages/db && npx prisma generate

# Build the API
RUN cd apps/api && npx tsc

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
