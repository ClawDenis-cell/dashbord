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
exports.pdfGenerator = exports.PDFGenerator = void 0;
exports.generatePDF = generatePDF;
exports.generatePDFFromFile = generatePDFFromFile;
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs/promises"));
const fsSync = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * PDF Generator using Pandoc + LaTeX
 * Industry-standard document conversion with professional templates
 *
 * Supports both local pandoc and Docker-based pandoc service
 */
class PDFGenerator {
    constructor(templatesDir, tempDir, useDocker, dockerContainer) {
        this.templatesDir = templatesDir || path.join(process.cwd(), 'templates', 'latex');
        this.tempDir = tempDir || os.tmpdir();
        this.useDocker = useDocker ?? process.env.PANDOC_USE_DOCKER === 'true';
        this.dockerContainer = dockerContainer || process.env.PANDOC_CONTAINER || 'dashboard-pandoc';
    }
    /**
     * Generate PDF from Markdown string
     */
    async generateFromString(markdown, options = {}) {
        const tempMarkdownPath = path.join(this.tempDir, `input-${Date.now()}.md`);
        const outputPath = path.join(this.tempDir, `output-${Date.now()}.pdf`);
        try {
            // Write markdown to temp file
            await fs.writeFile(tempMarkdownPath, markdown, 'utf-8');
            // Generate PDF
            const result = await this.generateFromFile(tempMarkdownPath, outputPath, options);
            return result;
        }
        finally {
            // Cleanup temp markdown file
            try {
                await fs.unlink(tempMarkdownPath);
            }
            catch {
                // Ignore cleanup errors
            }
        }
    }
    /**
     * Generate PDF from Markdown file
     */
    async generateFromFile(inputPath, outputPath, options = {}) {
        const resolvedOptions = this.resolveOptions(options);
        const templatePath = this.getTemplatePath(resolvedOptions.template);
        // Verify template exists
        try {
            await fs.access(templatePath);
        }
        catch {
            throw new Error(`Template '${resolvedOptions.template}' not found at ${templatePath}`);
        }
        // Build pandoc arguments
        const args = this.buildPandocArgs(inputPath, outputPath, templatePath, resolvedOptions);
        try {
            if (this.useDocker) {
                await this.runDockerPandoc(args, inputPath, outputPath);
            }
            else {
                await this.runLocalPandoc(args);
            }
            // Verify output was created
            const stats = await fs.stat(outputPath);
            if (stats.size === 0) {
                throw new Error('PDF generation produced empty file');
            }
            return {
                pdfPath: outputPath,
                markdown: await fs.readFile(inputPath, 'utf-8'),
                metadata: {
                    template: resolvedOptions.template,
                    papersize: resolvedOptions.papersize,
                    margin: resolvedOptions.margin,
                    toc: resolvedOptions.toc,
                    generatedAt: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            throw this.enhanceError(error, args);
        }
    }
    /**
     * Run pandoc locally
     */
    async runLocalPandoc(args) {
        await execFileAsync('pandoc', args, {
            timeout: 120000,
            maxBuffer: 10 * 1024 * 1024,
        });
    }
    /**
     * Run pandoc via Docker
     */
    async runDockerPandoc(args, inputPath, outputPath) {
        const inputDir = path.dirname(inputPath);
        const outputDir = path.dirname(outputPath);
        const inputFile = path.basename(inputPath);
        const outputFile = path.basename(outputPath);
        // Build docker command with volume mounts
        const dockerArgs = [
            'run',
            '--rm',
            '-v', `${inputDir}:/input:ro`,
            '-v', `${outputDir}:/output`,
            '-v', `${this.templatesDir}:/templates:ro`,
            '-w', '/input',
            this.dockerContainer,
            ...args.map(arg => {
                // Adjust paths for Docker container
                if (arg.startsWith(inputPath)) {
                    return arg.replace(inputPath, `/input/${inputFile}`);
                }
                if (arg.startsWith(outputPath)) {
                    return arg.replace(outputPath, `/output/${outputFile}`);
                }
                if (arg.includes(this.templatesDir)) {
                    return arg.replace(this.templatesDir, '/templates');
                }
                return arg;
            }),
        ];
        await execFileAsync('docker', dockerArgs, {
            timeout: 180000,
            maxBuffer: 10 * 1024 * 1024,
        });
    }
    /**
     * Generate PDF and return as buffer
     */
    async generateBuffer(markdown, options = {}) {
        const result = await this.generateFromString(markdown, options);
        return fs.readFile(result.pdfPath);
    }
    /**
     * Generate PDF to output file
     */
    async generateToFile(markdown, outputPath, options = {}) {
        const tempOutputPath = path.join(this.tempDir, `output-${Date.now()}.pdf`);
        const tempInputPath = path.join(this.tempDir, `input-${Date.now()}.md`);
        try {
            await fs.writeFile(tempInputPath, markdown, 'utf-8');
            const result = await this.generateFromFile(tempInputPath, tempOutputPath, options);
            // Copy to final destination
            await fs.copyFile(tempOutputPath, outputPath);
            return {
                ...result,
                pdfPath: outputPath,
            };
        }
        finally {
            // Cleanup
            await fs.unlink(tempInputPath).catch(() => { });
            await fs.unlink(tempOutputPath).catch(() => { });
        }
    }
    /**
     * Stream PDF generation (for HTTP responses)
     */
    async generateStream(markdown, options = {}) {
        const outputPath = path.join(this.tempDir, `output-${Date.now()}.pdf`);
        await this.generateToFile(markdown, outputPath, options);
        const stream = fsSync.createReadStream(outputPath);
        const cleanup = async () => {
            try {
                await fs.unlink(outputPath);
            }
            catch {
                // Ignore cleanup errors
            }
        };
        return { stream, cleanup };
    }
    /**
     * Get available templates
     */
    getAvailableTemplates() {
        return ['minimal', 'academic', 'modern'];
    }
    /**
     * Validate if pandoc is available (local or docker)
     */
    async validateEnvironment() {
        const errors = [];
        // Check local pandoc first
        try {
            const { stdout } = await execFileAsync('pandoc', ['--version']);
            if (stdout.includes('pandoc')) {
                // Check pdflatex
                try {
                    const { stdout: latexStdout } = await execFileAsync('pdflatex', ['--version']);
                    if (latexStdout.includes('TeX') || latexStdout.includes('MiKTeX')) {
                        return { valid: true, errors: [], mode: 'local' };
                    }
                }
                catch {
                    errors.push('LaTeX (pdflatex) is not installed');
                }
            }
        }
        catch {
            errors.push('Pandoc is not installed locally');
        }
        // Check docker
        try {
            const { stdout } = await execFileAsync('docker', ['ps']);
            if (stdout.includes(this.dockerContainer) || stdout.includes('CONTAINER')) {
                // Try to run pandoc in docker
                try {
                    await execFileAsync('docker', ['run', '--rm', this.dockerContainer, 'pandoc', '--version']);
                    return { valid: true, errors: [], mode: 'docker' };
                }
                catch {
                    errors.push(`Docker container '${this.dockerContainer}' not available`);
                }
            }
        }
        catch {
            errors.push('Docker is not available');
        }
        // Check templates exist
        for (const template of this.getAvailableTemplates()) {
            const templatePath = this.getTemplatePath(template);
            try {
                await fs.access(templatePath);
            }
            catch {
                errors.push(`Template '${template}' not found at ${templatePath}`);
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            mode: 'none',
        };
    }
    /**
     * Resolve and normalize options
     */
    resolveOptions(options) {
        return {
            template: options.template || 'minimal',
            papersize: options.papersize || 'a4',
            margin: options.margin || 'standard',
            toc: options.toc ?? false,
            title: options.title || '',
            author: options.author || [],
            date: options.date || new Date().toISOString().split('T')[0],
            abstract: options.abstract || '',
            keywords: options.keywords || '',
            highlight: options.highlight ?? true,
            extraArgs: options.extraArgs || [],
        };
    }
    /**
     * Get template file path
     */
    getTemplatePath(template) {
        return path.join(this.templatesDir, template, 'template.tex');
    }
    /**
     * Build pandoc command arguments
     */
    buildPandocArgs(inputPath, outputPath, templatePath, options) {
        const args = [
            inputPath,
            '-o', outputPath,
            '--template=' + templatePath,
            '--pdf-engine=pdflatex',
            '--from=markdown+yaml_metadata_block+tex_math_dollars+raw_tex+fenced_code_attributes+backtick_code_blocks+auto_identifiers+implicit_header_references+footnotes+inline_notes+citations',
        ];
        // Paper size
        const paperSize = options.papersize === 'letter' ? 'letter' : 'a4';
        args.push('-V', `papersize=${paperSize}`);
        // Margin
        const marginValue = this.resolveMargin(options.margin);
        args.push('-V', `margin=${marginValue}`);
        // Table of contents
        if (options.toc) {
            args.push('--toc');
            args.push('--toc-depth=3');
        }
        // Metadata
        if (options.title) {
            args.push('-M', `title=${options.title}`);
        }
        if (options.author) {
            const authors = Array.isArray(options.author) ? options.author : [options.author];
            for (const author of authors) {
                args.push('-M', `author=${author}`);
            }
        }
        if (options.date) {
            args.push('-M', `date=${options.date}`);
        }
        if (options.abstract) {
            args.push('-M', `abstract=${options.abstract}`);
        }
        if (options.keywords) {
            args.push('-M', `keywords=${options.keywords}`);
        }
        // Syntax highlighting
        if (options.highlight) {
            args.push('--highlight-style=tango');
        }
        // Listings package for better code formatting
        args.push('--listings');
        // Extra arguments
        if (options.extraArgs.length > 0) {
            args.push(...options.extraArgs);
        }
        return args;
    }
    /**
     * Resolve margin option to LaTeX dimension
     */
    resolveMargin(margin) {
        switch (margin) {
            case 'standard':
                return '2.5cm';
            case 'narrow':
                return '1.5cm';
            default:
                // Assume it's already a valid LaTeX dimension
                return margin;
        }
    }
    /**
     * Enhance error message with context
     */
    enhanceError(error, args) {
        const baseMessage = error instanceof Error ? error.message : String(error);
        return new Error(`PDF generation failed: ${baseMessage}\n` +
            `Command: pandoc ${args.join(' ')}`);
    }
}
exports.PDFGenerator = PDFGenerator;
// Singleton instance for convenience
exports.pdfGenerator = new PDFGenerator();
// Convenience functions
async function generatePDF(markdown, options) {
    return exports.pdfGenerator.generateBuffer(markdown, options);
}
async function generatePDFFromFile(inputPath, outputPath, options) {
    return exports.pdfGenerator.generateFromFile(inputPath, outputPath, options);
}
exports.default = PDFGenerator;
//# sourceMappingURL=pdfGenerator.js.map