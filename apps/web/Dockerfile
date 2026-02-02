FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN cd apps/web && npm install

# Copy web app source
COPY apps/web ./apps/web

# Build Next.js app
RUN cd apps/web && npm run build

# Install serve
RUN npm install -g serve

EXPOSE 3000

# Serve static files
CMD ["serve", "apps/web/dist", "-l", "3000"]
