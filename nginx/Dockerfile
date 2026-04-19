FROM nginx:alpine

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy frontend static files into image
COPY frontend/ /usr/share/nginx/html/

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
