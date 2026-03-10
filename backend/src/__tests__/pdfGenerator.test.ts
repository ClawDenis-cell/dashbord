import { PDFGenerator, generatePDF } from '../utils/pdfGenerator';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('PDFGenerator', () => {
  let generator: PDFGenerator;
  let tempDir: string;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-test-'));
    generator = new PDFGenerator(
      path.join(process.cwd(), 'templates', 'latex'),
      tempDir
    );
  });

  afterAll(async () => {
    // Cleanup temp directory
    const files = await fs.readdir(tempDir);
    await Promise.all(
      files.map(file => fs.unlink(path.join(tempDir, file)))
    );
    await fs.rmdir(tempDir);
  });

  describe('Configuration', () => {
    it('should have three available templates', () => {
      const templates = generator.getAvailableTemplates();
      expect(templates).toHaveLength(3);
      expect(templates).toContain('minimal');
      expect(templates).toContain('academic');
      expect(templates).toContain('modern');
    });

    it('should validate environment', async () => {
      const validation = await generator.validateEnvironment();
      // Should return either valid or with specific errors
      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('mode');
      expect(['local', 'docker', 'none']).toContain(validation.mode);
    });
  });

  describe('PDF Generation', () => {
    const testMarkdown = `# Test Document

This is a test paragraph with **bold** and *italic* text.

## Code Example

\`\`\`javascript
const x = 1;
console.log(x);
\`\`\`

## Math

The equation $E = mc^2$ is famous.

$$x = {-b \\pm \\sqrt{b^2 - 4ac} \\over 2a}$$

| Col1 | Col2 |
|------|------|
| A    | B    |
| C    | D    |
`;

    it('should generate PDF from string with minimal template', async () => {
      const validation = await generator.validateEnvironment();
      if (!validation.valid) {
        console.log('Skipping PDF test - environment not available:', validation.errors);
        return;
      }

      const result = await generator.generateFromString(testMarkdown, {
        template: 'minimal',
        papersize: 'a4',
        title: 'Test Document',
        author: 'Test Author',
      });

      expect(result.pdfPath).toBeTruthy();
      expect(result.metadata.template).toBe('minimal');
      expect(result.metadata.papersize).toBe('a4');
      expect(result.metadata.generatedAt).toBeTruthy();

      // Verify PDF file was created
      const stats = await fs.stat(result.pdfPath);
      expect(stats.size).toBeGreaterThan(0);

      // Cleanup
      await fs.unlink(result.pdfPath);
    });

    it('should generate PDF from string with academic template', async () => {
      const validation = await generator.validateEnvironment();
      if (!validation.valid) {
        return;
      }

      const result = await generator.generateFromString(testMarkdown, {
        template: 'academic',
        papersize: 'letter',
        toc: true,
        title: 'Academic Test',
        author: ['Author One', 'Author Two'],
        abstract: 'This is the abstract.',
        keywords: 'test, pdf, academic',
      });

      expect(result.metadata.template).toBe('academic');
      expect(result.metadata.papersize).toBe('letter');
      expect(result.metadata.toc).toBe(true);

      const stats = await fs.stat(result.pdfPath);
      expect(stats.size).toBeGreaterThan(0);

      await fs.unlink(result.pdfPath);
    });

    it('should generate PDF from string with modern template', async () => {
      const validation = await generator.validateEnvironment();
      if (!validation.valid) {
        return;
      }

      const result = await generator.generateFromString(testMarkdown, {
        template: 'modern',
        margin: 'narrow',
        title: 'Modern Test',
      });

      expect(result.metadata.template).toBe('modern');
      expect(result.metadata.margin).toBe('narrow');

      const stats = await fs.stat(result.pdfPath);
      expect(stats.size).toBeGreaterThan(0);

      await fs.unlink(result.pdfPath);
    });

    it('should generate PDF as buffer', async () => {
      const validation = await generator.validateEnvironment();
      if (!validation.valid) {
        return;
      }

      const buffer = await generator.generateBuffer(testMarkdown, {
        template: 'minimal',
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.toString('ascii', 0, 4)).toBe('%PDF');
    });

    it('should handle empty markdown gracefully', async () => {
      const validation = await generator.validateEnvironment();
      if (!validation.valid) {
        return;
      }

      const result = await generator.generateFromString('', {
        template: 'minimal',
      });

      const stats = await fs.stat(result.pdfPath);
      expect(stats.size).toBeGreaterThan(0);

      await fs.unlink(result.pdfPath);
    });

    it('should handle markdown with special characters', async () => {
      const validation = await generator.validateEnvironment();
      if (!validation.valid) {
        return;
      }

      const specialMarkdown = `# Special Characters

Unicode: äöü ÄÖÜ ß éèê àáâ

Math: α β γ δ ε θ λ μ π σ φ ψ ω

Symbols: © ® ™ § ¶ † ‡ • · … — –

Arrows: ← → ↑ ↓ ↔ ↕ ⇒ ⇐ ⇔

Currency: € £ ¥ ₹ ₽
`;

      const result = await generator.generateFromString(specialMarkdown, {
        template: 'minimal',
      });

      const stats = await fs.stat(result.pdfPath);
      expect(stats.size).toBeGreaterThan(0);

      await fs.unlink(result.pdfPath);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid template', async () => {
      const validation = await generator.validateEnvironment();
      if (!validation.valid) {
        return;
      }

      await expect(
        generator.generateFromString('# Test', { template: 'nonexistent' as any })
      ).rejects.toThrow();
    });

    it('should throw error with helpful message on pandoc failure', async () => {
      const validation = await generator.validateEnvironment();
      if (!validation.valid) {
        return;
      }

      // Malformed markdown that might cause issues
      const badMarkdown = '\\begin{invalid-latex}unclosed';

      await expect(
        generator.generateFromString(badMarkdown, { template: 'minimal' })
      ).rejects.toThrow('PDF generation failed');
    });
  });

  describe('Options', () => {
    it('should use default options when none provided', async () => {
      const validation = await generator.validateEnvironment();
      if (!validation.valid) {
        return;
      }

      const result = await generator.generateFromString('# Test');

      expect(result.metadata.template).toBe('minimal');
      expect(result.metadata.papersize).toBe('a4');
      expect(result.metadata.margin).toBe('standard');
      expect(result.metadata.toc).toBe(false);

      await fs.unlink(result.pdfPath);
    });

    it('should accept custom margin values', async () => {
      const validation = await generator.validateEnvironment();
      if (!validation.valid) {
        return;
      }

      const result = await generator.generateFromString('# Test', {
        margin: '3cm',
      });

      expect(result.metadata.margin).toBe('3cm');

      await fs.unlink(result.pdfPath);
    });
  });

  describe('Convenience Functions', () => {
    it('should export generatePDF function', async () => {
      expect(typeof generatePDF).toBe('function');
    });
  });
});

describe('Full Feature Test', () => {
  it('should generate PDF with all features from test file', async () => {
    const generator = new PDFGenerator();
    const validation = await generator.validateEnvironment();
    
    if (!validation.valid) {
      console.log('Skipping full feature test - environment not available');
      return;
    }

    const testFilePath = path.join(__dirname, '..', '..', '__tests__', 'test-markdown.md');
    let markdown: string;
    
    try {
      markdown = await fs.readFile(testFilePath, 'utf-8');
    } catch {
      console.log('Test markdown file not found, skipping');
      return;
    }

    // Test all three templates
    for (const template of ['minimal', 'academic', 'modern']) {
      const result = await generator.generateFromString(markdown, {
        template: template as any,
        papersize: 'a4',
        toc: true,
        title: `${template.charAt(0).toUpperCase() + template.slice(1)} Template Test`,
        author: ['PDF Generator Test'],
      });

      const stats = await fs.stat(result.pdfPath);
      expect(stats.size).toBeGreaterThan(1000); // Should be a substantial PDF

      // Verify PDF header
      const buffer = await fs.readFile(result.pdfPath);
      expect(buffer.toString('ascii', 0, 4)).toBe('%PDF');

      console.log(`${template} template: ${stats.size} bytes`);

      await fs.unlink(result.pdfPath);
    }
  });
});
