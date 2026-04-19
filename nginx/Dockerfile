FROM nginx:alpine

# Provide a reliable health check client in the runtime image
RUN apk add --no-cache curl

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy frontend static files into image
COPY frontend/ /usr/share/nginx/html/

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -fsS http://localhost/healthz || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# ghcr.io/richfield-eduhub/eduhub-backend:l