# PDF Generator

Industry-standard Markdown to PDF conversion using Pandoc + LaTeX.

## Features

- **Three Professional Templates**
  - **Minimal**: Clean, serif typography for general documents
  - **Academic**: Traditional style with numbered code listings for papers
  - **Modern**: GitHub-inspired sans-serif design for documentation

- **Full Markdown Support**
  - GitHub Flavored Markdown (GFM)
  - YAML frontmatter
  - Tables, lists, blockquotes
  - Code syntax highlighting
  - Mathematical formulas (LaTeX/KaTeX)

- **Flexible Layout Options**
  - Paper sizes: A4, Letter
  - Margins: Standard (2.5cm), Narrow (1.5cm)
  - Optional table of contents
  - Headers and footers with page numbers

## API Endpoints

### Generate PDF
```
POST /api/pdf/generate
```

Request body:
```json
{
  "markdown": "# Title\n\nContent here...",
  "filename": "document.pdf",
  "options": {
    "template": "modern",
    "papersize": "a4",
    "margin": "standard",
    "toc": true,
    "title": "Document Title",
    "author": ["Author Name"],
    "abstract": "Abstract text"
  }
}
```

### Preview PDF (metadata only)
```
POST /api/pdf/preview
```

### List Templates
```
GET /api/pdf/templates
```

### Health Check
```
GET /api/pdf/health
```

## Docker Setup

The PDF generator uses a dedicated Pandoc service with TinyTeX:

```bash
docker-compose up pandoc
docker-compose up backend
```

## Local Development

### Requirements
- Node.js 20+
- Pandoc 3.1+
- LaTeX (TeX Live or TinyTeX)

### Install LaTeX Packages
```bash
tlmgr install microtype setspace geometry fancyhdr titlesec booktabs longtable enumitem xcolor listings
```

## Testing

```bash
# Run all tests
npm test

# Test PDF generation only
npx jest pdfGenerator.test.ts

# Manual Docker test
./test-pdf.sh
```

## Templates

Templates are located in `backend/templates/latex/`:

- `minimal/template.tex` - Clean, professional design
- `academic/template.tex` - Traditional academic paper style
- `modern/template.tex` - Bold, GitHub-inspired look

## Configuration

Environment variables:
- `PANDOC_USE_DOCKER=true` - Use Docker instead of local pandoc
- `PANDOC_CONTAINER=dashboard-pandoc` - Docker container name
