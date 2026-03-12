"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfController = exports.PDFController = void 0;
const pdfGenerator_1 = require("../utils/pdfGenerator");
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs/promises"));
const pdfGenerator = new pdfGenerator_1.PDFGenerator(path.join(process.cwd(), 'templates', 'latex'), os.tmpdir());
class PDFController {
    /**
     * Generate PDF from markdown content
     * POST /api/pdf/generate
     */
    async generatePDF(req, res) {
        try {
            const { markdown, options, filename } = req.body;
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
            res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
            res.setHeader('Content-Length', buffer.length);
            res.send(buffer);
        }
        catch (error) {
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
    async previewPDF(req, res) {
        try {
            const { markdown, options } = req.body;
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
            const result = await pdfGenerator.generateFromFile(tempInputPath, tempOutputPath, options);
            // Get file stats
            const stats = await fs.stat(tempOutputPath);
            // Cleanup temp files
            await fs.unlink(tempOutputPath).catch(() => { });
            await fs.unlink(tempInputPath).catch(() => { });
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
        }
        catch (error) {
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
    async getTemplates(_req, res) {
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
    async getOptions(_req, res) {
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
    async healthCheck(_req, res) {
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
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    /**
     * Count words in markdown
     */
    countWords(markdown) {
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
exports.PDFController = PDFController;
exports.pdfController = new PDFController();
//# sourceMappingURL=pdfController.js.map