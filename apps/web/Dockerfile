FROM node:20-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN npm install

# Build the web app
RUN cd apps/web && npx next build

EXPOSE 3000

# Use a simple static server for the built files
RUN npm install -g serve

CMD ["serve", "apps/web/dist", "-l", "3000"]
