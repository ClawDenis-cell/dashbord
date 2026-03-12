FROM pandoc/latex:3.1-ubuntu

# Install Node.js 20 und Chromium-Dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
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
    && rm -rf /var/lib/apt/lists/*

# Node.js 20 installieren
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Umgebungsvariablen
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PATH="/usr/local/bin:$PATH"
ENV NODE_ENV=production

WORKDIR /app

# Dependencies installieren (inkl. devDependencies für Build)
COPY package.json ./
RUN npm install

# TypeScript global installieren (für den Fall dass es nicht in dependencies ist)
RUN npm install -g typescript

# Source Code kopieren
COPY . .

# TypeScript kompilieren
RUN npx tsc || (echo "=== TSC ERROR ===" && cat tsconfig.json && exit 1)

# devDependencies aufräumen (optional - spart Platz)
# RUN npm prune --production

EXPOSE 3001

# ENTRYPOINT vom Base-Image (pandoc/latex) zuruecksetzen
ENTRYPOINT []

CMD ["node", "dist/index.js"]
