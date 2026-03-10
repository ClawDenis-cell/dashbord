FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    # Pandoc dependencies
    gmp \
    libffi \
    # LaTeX dependencies
    perl \
    wget \
    tar \
    xz

# Install Pandoc
ENV PANDOC_VERSION=3.1.11
RUN wget -q https://github.com/jgm/pandoc/releases/download/${PANDOC_VERSION}/pandoc-${PANDOC_VERSION}-linux-amd64.tar.gz -O /tmp/pandoc.tar.gz && \
    tar xvzf /tmp/pandoc.tar.gz --strip-components 1 -C /usr/local && \
    rm /tmp/pandoc.tar.gz && \
    pandoc --version

# Install TinyTeX (minimal TeX Live distribution)
RUN wget -qO- "https://yihui.org/tinytex/install-bin-unix.sh" | sh && \
    export PATH="$HOME/.TinyTeX/bin/x86_64-linuxmusl:$PATH" && \
    # Install essential LaTeX packages
    tlmgr install \
        microtype \
        setspace \
        geometry \
        fancyhdr \
        titlesec \
        booktabs \
        longtable \
        enumitem \
        xcolor \
        tcolorbox \
        listings \
        parskip \
        tocloft \
        amsmath \
        amssymb \
        etoolbox \
        grffile \
        caption \
        hyperref \
        url \
        graphics \
        tools \
        oberdiek \
        latexconfig && \
    # Create symlinks for pdflatex
    ln -sf ~/.TinyTeX/bin/x86_64-linuxmusl/pdflatex /usr/local/bin/pdflatex && \
    ln -sf ~/.TinyTeX/bin/x86_64-linuxmusl/latex /usr/local/bin/latex && \
    ln -sf ~/.TinyTeX/bin/x86_64-linuxmusl/xelatex /usr/local/bin/xelatex && \
    ln -sf ~/.TinyTeX/bin/x86_64-linuxmusl/lualatex /usr/local/bin/lualatex && \
    ln -sf ~/.TinyTeX/bin/x86_64-linuxmusl/bibtex /usr/local/bin/bibtex && \
    ln -sf ~/.TinyTeX/bin/x86_64-linuxmusl/tlmgr /usr/local/bin/tlmgr

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PATH="/root/.TinyTeX/bin/x86_64-linuxmusl:$PATH"

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
