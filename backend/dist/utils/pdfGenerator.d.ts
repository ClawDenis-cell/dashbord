import * as fsSync from 'fs';
export interface PDFOptions {
    /** Template style: minimal, academic, modern */
    template?: 'minimal' | 'academic' | 'modern';
    /** Paper size: a4 or letter */
    papersize?: 'a4' | 'letter';
    /** Margin size: standard (2.5cm) or narrow (1.5cm) */
    margin?: 'standard' | 'narrow' | string;
    /** Include table of contents */
    toc?: boolean;
    /** Document title */
    title?: string;
    /** Document author(s) */
    author?: string | string[];
    /** Document date */
    date?: string;
    /** Document abstract */
    abstract?: string;
    /** Keywords (for academic template) */
    keywords?: string;
    /** Enable syntax highlighting */
    highlight?: boolean;
    /** Additional pandoc arguments */
    extraArgs?: string[];
}
export interface PDFResult {
    /** Path to generated PDF file */
    pdfPath: string;
    /** Original markdown content */
    markdown: string;
    /** Generation metadata */
    metadata: {
        template: string;
        papersize: string;
        margin: string;
        toc: boolean;
        generatedAt: string;
    };
}
/**
 * PDF Generator using Pandoc + LaTeX
 * Industry-standard document conversion with professional templates
 *
 * Supports both local pandoc and Docker-based pandoc service
 */
export declare class PDFGenerator {
    private templatesDir;
    private tempDir;
    private useDocker;
    private dockerContainer;
    constructor(templatesDir?: string, tempDir?: string, useDocker?: boolean, dockerContainer?: string);
    /**
     * Generate PDF from Markdown string
     */
    generateFromString(markdown: string, options?: PDFOptions): Promise<PDFResult>;
    /**
     * Generate PDF from Markdown file
     */
    generateFromFile(inputPath: string, outputPath: string, options?: PDFOptions): Promise<PDFResult>;
    /**
     * Run pandoc locally
     */
    private runLocalPandoc;
    /**
     * Run pandoc via Docker
     */
    private runDockerPandoc;
    /**
     * Generate PDF and return as buffer
     */
    generateBuffer(markdown: string, options?: PDFOptions): Promise<Buffer>;
    /**
     * Generate PDF to output file
     */
    generateToFile(markdown: string, outputPath: string, options?: PDFOptions): Promise<PDFResult>;
    /**
     * Stream PDF generation (for HTTP responses)
     */
    generateStream(markdown: string, options?: PDFOptions): Promise<{
        stream: fsSync.ReadStream;
        cleanup: () => Promise<void>;
    }>;
    /**
     * Get available templates
     */
    getAvailableTemplates(): string[];
    /**
     * Validate if pandoc is available (local or docker)
     */
    validateEnvironment(): Promise<{
        valid: boolean;
        errors: string[];
        mode: 'local' | 'docker' | 'none';
    }>;
    /**
     * Resolve and normalize options
     */
    private resolveOptions;
    /**
     * Get template file path
     */
    private getTemplatePath;
    /**
     * Build pandoc command arguments
     */
    private buildPandocArgs;
    /**
     * Resolve margin option to LaTeX dimension
     */
    private resolveMargin;
    /**
     * Enhance error message with context
     */
    private enhanceError;
}
export declare const pdfGenerator: PDFGenerator;
export declare function generatePDF(markdown: string, options?: PDFOptions): Promise<Buffer>;
export declare function generatePDFFromFile(inputPath: string, outputPath: string, options?: PDFOptions): Promise<PDFResult>;
export default PDFGenerator;
//# sourceMappingURL=pdfGenerator.d.ts.map