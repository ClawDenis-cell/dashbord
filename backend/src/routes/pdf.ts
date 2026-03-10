import { Router } from 'express';
import { pdfController } from '../controllers/pdfController';

const router = Router();

// Generate PDF from markdown
router.post('/generate', pdfController.generatePDF.bind(pdfController));

// Preview PDF (returns metadata without file)
router.post('/preview', pdfController.previewPDF.bind(pdfController));

// Get available templates
router.get('/templates', pdfController.getTemplates.bind(pdfController));

// Get generation options
router.get('/options', pdfController.getOptions.bind(pdfController));

// Health check
router.get('/health', pdfController.healthCheck.bind(pdfController));

export default router;
