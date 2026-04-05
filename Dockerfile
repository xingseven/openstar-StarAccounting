# Frontend image built from the active Next.js app under /web.
FROM node:22-alpine AS builder

WORKDIR /app/web
COPY web/package*.json ./
RUN npm install
COPY web ./
ENV NEXT_PUBLIC_API_URL=http://localhost:3006
ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:3006
RUN npm run build

FROM node:22-alpine

WORKDIR /app/web
COPY web/package*.json ./
RUN npm install --production
COPY --from=builder /app/web/.next ./.next
COPY --from=builder /app/web/public ./public
COPY --from=builder /app/web/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["npm", "start"]
