"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pdfController_1 = require("../controllers/pdfController");
const router = (0, express_1.Router)();
// Generate PDF from markdown
router.post('/generate', pdfController_1.pdfController.generatePDF.bind(pdfController_1.pdfController));
// Preview PDF (returns metadata without file)
router.post('/preview', pdfController_1.pdfController.previewPDF.bind(pdfController_1.pdfController));
// Get available templates
router.get('/templates', pdfController_1.pdfController.getTemplates.bind(pdfController_1.pdfController));
// Get generation options
router.get('/options', pdfController_1.pdfController.getOptions.bind(pdfController_1.pdfController));
// Health check
router.get('/health', pdfController_1.pdfController.healthCheck.bind(pdfController_1.pdfController));
exports.default = router;
//# sourceMappingURL=pdf.js.map