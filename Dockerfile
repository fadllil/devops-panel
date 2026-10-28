# ==============================================================================
# Stage 1: Builder
# ==============================================================================
ARG NODE_VERSION=24-alpine
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

# Install dependencies based on package-lock.json for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci

# Build arguments (Vite menyematkan variabel VITE_* ke bundle saat build)
ARG VITE_API_URL=/api
ARG VITE_APP_TITLE="DevOps Panel - OpenVPN Management"
ARG VITE_DEFAULT_THEME=dark

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_TITLE=${VITE_APP_TITLE}
ENV VITE_DEFAULT_THEME=${VITE_DEFAULT_THEME}

# Copy source code
COPY . .

# Build production distribution
RUN npm run build

# ==============================================================================
# Stage 2: Production Runtime (Nginx Alpine)
# ==============================================================================
FROM nginx:1.31-alpine

# Install curl untuk container healthcheck
RUN apk --no-cache add curl

# Salin konfigurasi Nginx kustom (SPA routing fallback, gzip, security headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin aset statis hasil kompilasi dari builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Port HTTP
EXPOSE 80

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/healthz || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
