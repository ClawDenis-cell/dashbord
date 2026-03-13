FROM pandoc/latex:3.1-ubuntu

# Install Node.js 20 und Chromium
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    wget \
    gnupg \
    # Chromium installation
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2t64 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    # Zusätzliche Fonts für PDF-Generierung
    fonts-noto-color-emoji \
    fonts-noto-cjk \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20 installieren
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Chromium Symlink erstellen (für Puppeteer)
RUN ln -sf /usr/bin/chromium /usr/bin/chromium-browser || true

# Umgebungsvariablen
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PATH="/usr/local/bin:$PATH"
ENV NODE_ENV=production

WORKDIR /app

# Dependencies installieren
COPY package.json ./
RUN npm install --production

# Vorgebautes dist/ kopieren
COPY dist/ ./dist/

# Health-Check hinzufügen
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3001

# ENTRYPOINT vom Base-Image (pandoc/latex) zuruecksetzen
ENTRYPOINT []

CMD ["node", "dist/index.js"]
