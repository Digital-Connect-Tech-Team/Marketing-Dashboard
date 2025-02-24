# Use official Node.js LTS image as the base image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install PNPM
RUN npm install -g pnpm@latest

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate && pnpm build

# Production Image
FROM base AS runner
WORKDIR /app

# Set production mode
ENV NODE_ENV=production

# Copy dependencies and build output
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
