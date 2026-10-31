FROM nginx:1.27-alpine

# Remove default config and use project-specific one.
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Static novel assets.
COPY index.html /usr/share/nginx/html/index.html
COPY favicon* /usr/share/nginx/html/
COPY apple-touch-icon.png /usr/share/nginx/html/apple-touch-icon.png
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY data /usr/share/nginx/html/data
COPY optimized /usr/share/nginx/html/optimized

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
