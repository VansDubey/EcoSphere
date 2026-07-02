import express from 'express';
import authUser from '../middlewares/auth.js';
import { generateReport, downloadReportPdf, getMyReports } from '../controllers/report.controller.js';

const router = express.Router();

// POST /api/report -> generate + persist (authenticated)
router.post('/', authUser, generateReport);

// GET /api/report/me -> reports for logged-in user (authenticated)
router.get('/me', authUser, getMyReports);


// GET /api/report/:id -> retrieve persisted report
router.get('/:id', async (req, res) => {
  // optional route; not required for PDF
});

// GET /api/report/:id/pdf -> generate PDF from persisted report
router.get('/:id/pdf', downloadReportPdf);

export default router;

