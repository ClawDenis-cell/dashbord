# Pandoc + TinyTeX Docker Image
# Industry-standard document conversion stack

FROM pandoc/latex:3.1-ubuntu

# Install additional LaTeX packages commonly needed
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
    luatextra \
    colortbl \
    array \
    multirow \
    makecell \
    threeparttable \
    threeparttablex \
    environ \
    trimspaces \
    ulem \
    soul \
    lettrine \
    textcase \
    footmisc \
    zref \
    needspace \
    koma-script \
    marginnote \
    sidenotes \
    changepage \
    picinpar \
    wrapfig \
    float \
    placeins \
    algorithm2e \
    ifoddpage \
    relsize \
    underscore \
    upquote \
    xstring \
    framed \
    floatrow \
    cleveref \
    hyperxmp \
    pdfx \
    bookmark \
    currfile \
    filehook \
    svn-prov \
    ltxcmds \
    infwarerr \
    kvoptions \
    kvsetkeys \
    etexcmds \
    iftex \
    pdftexcmds \
    catchfile \
    luacolor \
    luaotfload \
    lualibs \
    lua-uni-algos \
    luatexbase \
    luatex \
    luatex85

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
