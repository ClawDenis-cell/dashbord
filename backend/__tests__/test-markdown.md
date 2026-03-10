# Test Markdown Document
# Complete Feature Testing for PDF Generator

---
title: "PDF Generator Test Document"
author: 
  - "Test Author"
  - "Second Author"
date: "2024-03-10"
abstract: "This document tests all PDF generation features including typography, code highlighting, math formulas, tables, and various Markdown elements."
keywords: "PDF, Markdown, Testing, LaTeX, Pandoc"
---

## Typography Features

### Serif vs Sans-Serif

This document tests the typography settings. Depending on the template:
- **Minimal** and **Academic** use serif fonts (Latin Modern)
- **Modern** uses sans-serif fonts (Helvetica)

### Text Formatting

Regular text, *italic text*, **bold text**, and ***bold italic text***.

~~Strikethrough text~~ for showing deletions.

Superscript: x^2^, Subscript: H~2~O

### Special Characters

Ligatures: ffi, ffl, fi, fl

Em-dash: This is an em-dash—used for breaks

En-dash: Pages 12–15 use an en-dash

## Code Highlighting

### JavaScript Example

```javascript
// Modern JavaScript with syntax highlighting
async function generatePDF(markdown, options = {}) {
  const {
    template = 'minimal',
    papersize = 'a4',
    toc = false
  } = options;

  console.log(`Generating PDF with ${template} template`);
  
  const result = await processDocument(markdown, {
    template,
    papersize,
    includeToc: toc
  });

  return result.buffer;
}

// Class definition
class PDFGenerator {
  constructor(config) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async generate(input) {
    return this.process(input);
  }
}
```

### Python Example

```python
import asyncio
from dataclasses import dataclass
from typing import Optional, List

@dataclass
class PDFOptions:
    """Configuration options for PDF generation."""
    template: str = 'minimal'
    papersize: str = 'a4'
    margin: str = '2.5cm'
    toc: bool = False

class PDFGenerator:
    def __init__(self, templates_dir: str):
        self.templates_dir = templates_dir
        self._cache = {}
    
    async def generate(self, markdown: str, options: PDFOptions) -> bytes:
        """Generate PDF from markdown content."""
        # Process markdown
        processed = self._preprocess(markdown)
        
        # Render with template
        return await self._render(processed, options)
```

### SQL Example

```sql
-- Complex query with syntax highlighting
SELECT 
    u.id,
    u.username,
    COUNT(p.id) as post_count,
    MAX(p.created_at) as last_post_date
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.active = TRUE
    AND u.created_at >= '2024-01-01'
GROUP BY u.id, u.username
HAVING COUNT(p.id) > 5
ORDER BY post_count DESC
LIMIT 100;
```

### Inline Code

Use the `generatePDF()` function to create documents. The `--toc` flag includes a table of contents. Set `papersize: 'letter'` for US Letter format.

## Mathematical Formulas

### Inline Math

Einstein's famous equation $E = mc^2$ shows the equivalence of mass and energy.

The quadratic formula: $x = {-b \pm \sqrt{b^2 - 4ac} \over 2a}$

### Block Math

The Pythagorean theorem:

$$a^2 + b^2 = c^2$$

A more complex equation—Maxwell's equations:

$$\begin{aligned}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\
\nabla \cdot \mathbf{B} &= 0 \\
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
\nabla \times \mathbf{B} &= \mu_0\mathbf{J} + \mu_0\varepsilon_0\frac{\partial \mathbf{E}}{\partial t}
\end{aligned}$$

### Statistical Formula

The normal distribution probability density function:

$$f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}$$

## Tables

### Simple Table

| Feature | Minimal | Academic | Modern |
|---------|---------|----------|--------|
| Typography | Serif | Serif | Sans-Serif |
| Code Style | Clean | Numbered | GitHub-style |
| Best For | General | Papers | Documentation |

### Wide Table

| Language | Paradigm | Typing | Memory Management | Use Case |
|----------|----------|--------|-------------------|----------|
| Python | Multi-paradigm | Dynamic | Garbage Collection | Data Science |
| Rust | Multi-paradigm | Static | Ownership/Borrowing | Systems |
| TypeScript | Multi-paradigm | Static | Garbage Collection | Web |
| Go | Procedural | Static | Garbage Collection | Backend |
| C++ | Multi-paradigm | Static | Manual/Smart Pointers | Systems |

## Lists

### Unordered Lists

- First level item
  - Second level item
    - Third level item
  - Another second level
- Another first level
  - With nested content

### Ordered Lists

1. First step
   1. Sub-step one
   2. Sub-step two
2. Second step
   - Mixed unordered
   - Inside ordered
3. Third step

### Task Lists

- [x] Implement PDF generation
- [x] Add syntax highlighting
- [x] Support math formulas
- [ ] Add more templates
- [ ] Optimize performance

## Blockquotes

> "The best way to predict the future is to implement it."
> — David Heinemeier Hansson

> **Note:** This is a callout-style blockquote with **formatting** inside.
> 
> It can contain multiple paragraphs and even lists:
> - Important point one
> - Important point two

## Images

While actual images require file paths, here's how they're referenced:

```markdown
![Alt text](path/to/image.png)
```

## Horizontal Rules

---

## Links

- [Pandoc Documentation](https://pandoc.org)
- [LaTeX Project](https://www.latex-project.org)
- Internal links: [Go to Code section](#code-highlighting)

## Footnotes

Here's a sentence with a footnote reference.[^1]

[^1]: This is the footnote content explaining the reference above.

## Definition Lists

Term 1
:   Definition of term 1

Term 2
:   Definition of term 2
:   Another definition for term 2

## Abbreviations

The HTML specification is maintained by the W3C.

*[HTML]: HyperText Markup Language
*[W3C]: World Wide Web Consortium

---

## Conclusion

This document demonstrates all major features of the PDF generator:

1. **Typography** — Multiple font options and text formatting
2. **Code** — Syntax highlighting for various languages
3. **Math** — LaTeX formula rendering
4. **Tables** — Structured data presentation
5. **Lists** — Ordered, unordered, and task lists
6. **Layout** — Headers, footers, and page settings

Each template (Minimal, Academic, Modern) renders these elements with its own distinctive style.
