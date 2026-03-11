# Pandoc + LaTeX Docker Image
# Nutzt pandoc/latex Basis-Image - hat bereits alle wichtigen LaTeX-Pakete

FROM pandoc/latex:3.1-ubuntu

# Nur zusaetzliche Fonts installieren (optional)
RUN apt-get update && apt-get install -y \
    fonts-lmodern \
    fonts-dejavu-core \
    fonts-liberation \
    fonts-firacode \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /data

# Default command
CMD ["pandoc", "--version"]
