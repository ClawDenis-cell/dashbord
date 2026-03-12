import { Request, Response } from 'express';
export declare class PDFController {
    /**
     * Generate PDF from markdown content
     * POST /api/pdf/generate
     */
    generatePDF(req: Request, res: Response): Promise<void>;
    /**
     * Generate PDF and return metadata (preview mode)
     * POST /api/pdf/preview
     */
    previewPDF(req: Request, res: Response): Promise<void>;
    /**
     * Get available templates
     * GET /api/pdf/templates
     */
    getTemplates(_req: Request, res: Response): Promise<void>;
    /**
     * Get PDF generation options/info
     * GET /api/pdf/options
     */
    getOptions(_req: Request, res: Response): Promise<void>;
    /**
     * Validate PDF generation environment
     * GET /api/pdf/health
     */
    healthCheck(_req: Request, res: Response): Promise<void>;
    /**
     * Format bytes to human readable string
     */
    private formatBytes;
    /**
     * Count words in markdown
     */
    private countWords;
}
export declare const pdfController: PDFController;
//# sourceMappingURL=pdfController.d.ts.map