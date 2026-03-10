import { Request, Response } from 'express';
import { PDFGenerator, PDFOptions } from '../utils/pdfGenerator';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';

const pdfGenerator = new PDFGenerator(
  path.join(process.cwd(), 'templates', 'latex'),
  os.tmpdir()
);

interface GeneratePDFBody {
  markdown: string;
  options?: PDFOptions;
  filename?: string;
}

export class PDFController {
  /**
   * Generate PDF from markdown content
   * POST /api/pdf/generate
   */
  async generatePDF(req: Request, res: Response): Promise<void> {
    try {
      const { markdown, options, filename } = req.body as GeneratePDFBody;

      if (!markdown || typeof markdown !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Markdown content is required',
        });
        return;
      }

      // Generate PDF
      const buffer = await pdfGenerator.generateBuffer(markdown, options);

      // Set headers for PDF download
      const outputFilename = filename || `document-${Date.now()}.pdf`;
      const sanitizedFilename = outputFilename.replace(/[^a-zA-Z0-9.-]/g, '_');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${sanitizedFilename}"`
      );
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({
        success: false,
        error: 'PDF generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate PDF and return metadata (preview mode)
   * POST /api/pdf/preview
   */
  async previewPDF(req: Request, res: Response): Promise<void> {
    try {
      const { markdown, options } = req.body as GeneratePDFBody;

      if (!markdown || typeof markdown !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Markdown content is required',
        });
        return;
      }

      // Generate to temp file to get metadata
      const tempOutputPath = path.join(os.tmpdir(), `preview-${Date.now()}.pdf`);
      const tempInputPath = path.join(os.tmpdir(), `preview-${Date.now()}.md`);

      await fs.writeFile(tempInputPath, markdown, 'utf-8');

      const result = await pdfGenerator.generateFromFile(
        tempInputPath,
        tempOutputPath,
        options
      );

      // Get file stats
      const stats = await fs.stat(tempOutputPath);

      // Cleanup temp files
      await fs.unlink(tempOutputPath).catch(() => {});
      await fs.unlink(tempInputPath).catch(() => {});

      res.json({
        success: true,
        data: {
          metadata: result.metadata,
          size: {
            bytes: stats.size,
            formatted: this.formatBytes(stats.size),
          },
          wordCount: this.countWords(markdown),
          charCount: markdown.length,
        },
      });
    } catch (error) {
      console.error('PDF preview error:', error);
      res.status(500).json({
        success: false,
        error: 'PDF preview failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get available templates
   * GET /api/pdf/templates
   */
  async getTemplates(_req: Request, res: Response): Promise<void> {
    const templates = [
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Clean, simple design with serif fonts. Perfect for general documents.',
        features: ['Serif typography', 'Clean layout', 'Subtle headers'],
        bestFor: ['Reports', 'Letters', 'General documents'],
      },
      {
        id: 'academic',
        name: 'Academic',
        description: 'Traditional academic paper style with numbered code listings.',
        features: ['Serif fonts', 'Numbered code blocks', 'Theorem environments', 'Bibliography support'],
        bestFor: ['Research papers', 'Theses', 'Academic articles'],
      },
      {
        id: 'modern',
        name: 'Modern',
        description: 'GitHub-inspired design with sans-serif fonts and accent colors.',
        features: ['Sans-serif fonts', 'Bold headers', 'Accent colors', 'Blockquote styling'],
        bestFor: ['READMEs', 'Documentation', 'Technical specs'],
      },
    ];

    res.json({
      success: true,
      data: templates,
    });
  }

  /**
   * Get PDF generation options/info
   * GET /api/pdf/options
   */
  async getOptions(_req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: {
        papersizes: [
          { id: 'a4', name: 'A4', dimensions: '210 × 297 mm' },
          { id: 'letter', name: 'Letter', dimensions: '8.5 × 11 inches' },
        ],
        margins: [
          { id: 'standard', name: 'Standard', value: '2.5cm', description: 'Recommended for most documents' },
          { id: 'narrow', name: 'Narrow', value: '1.5cm', description: 'More content per page' },
        ],
        features: [
          { id: 'toc', name: 'Table of Contents', description: 'Include automatic table of contents' },
          { id: 'highlight', name: 'Syntax Highlighting', description: 'Colorize code blocks' },
        ],
      },
    });
  }

  /**
   * Validate PDF generation environment
   * GET /api/pdf/health
   */
  async healthCheck(_req: Request, res: Response): Promise<void> {
    const validation = await pdfGenerator.validateEnvironment();

    res.json({
      success: validation.valid,
      data: {
        status: validation.valid ? 'healthy' : 'unhealthy',
        errors: validation.errors,
        availableTemplates: pdfGenerator.getAvailableTemplates(),
      },
    });
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Count words in markdown
   */
  private countWords(markdown: string): number {
    // Remove code blocks and markdown syntax
    const text = markdown
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/[#*_\[\]()>|-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return text.split(/\s+/).filter(w => w.length > 0).length;
  }
}

export const pdfController = new PDFController();
