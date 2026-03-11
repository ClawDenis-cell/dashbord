# Pandoc + TinyTeX Docker Image
# Industry-standard document conversion stack

FROM pandoc/latex:3.1-ubuntu

# Installiere nur die wichtigsten zusaetzlichen LaTeX-Pakete
# (Das Basis-Image hat bereits die meisten Standardpakete)
RUN tlmgr install \
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
    biblatex \
    csquotes \
    caption \
    subcaption \
    grffile \
    etoolbox \
    amsmath \
    amssymb \
    amsthm \
    fontspec \
    colortbl \
    array \
    multirow \
    makecell \
    threeparttable \
    environ \
    ulem \
    footmisc \
    zref \
    needspace \
    marginnote \
    changepage \
    wrapfig \
    float \
    placeins \
    algorithm2e \
    relsize \
    underscore \
    upquote \
    framed \
    cleveref \
    bookmark \
    hyperxmp \
    pdfx

# Install additional fonts
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
