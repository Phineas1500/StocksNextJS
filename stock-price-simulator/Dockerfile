FROM node:18-slim

WORKDIR /app

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl

# Copy package files
COPY package*.json ./

# Copy prisma files first
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy source code and config
COPY src ./src/
COPY tsconfig.json ./

# Debug environment variables
CMD echo "DATABASE_URL: $DATABASE_URL" && npm start