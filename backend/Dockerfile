FROM node:20-alpine

WORKDIR /app

# Create non-root user early (before COPY so ownership is set correctly)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy only package files first — Docker caches this layer
# Only re-runs npm ci when package*.json actually changes
COPY --chown=nodejs:nodejs package*.json ./

# Install production dependencies only (skips nodemon etc.) — faster + smaller
RUN npm ci --omit=dev

# Copy application source after install (cache hit on deps if src-only change)
COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health',(r)=>{process.exit(r.statusCode===200?0:1)})"

CMD ["node", "src/app.js"]
