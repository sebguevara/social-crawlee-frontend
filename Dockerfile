FROM node:20.17.0 AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN mkdir -p public

ARG NEXT_PUBLIC_API_URL=http://localhost:5678
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

FROM node:20.17.0
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3700
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3700

CMD ["npx", "next", "start", "-p", "3700"]
