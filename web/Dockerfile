# Web Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Next.js build needs this environment variable to know where the API is during build time (if using getStaticProps)
# or just for public env vars.
# However, for client-side fetches, the browser needs to access the API.
# If running in Docker Compose, "http://localhost:3001" might work if accessed from host browser,
# but if SSR, it needs internal container name "http://server:3001".
# For simplicity, we assume client-side access mainly.
ENV NEXT_PUBLIC_API_URL=http://localhost:3001
RUN npm run build

# Production image
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

# Next.js standalone output (optional, but good for Docker)
# For now, standard build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
