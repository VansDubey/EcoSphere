import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}

export async function renderReportPdf({ report }) {
  const templatePath = path.join(process.cwd(), 'views', 'report.template.html');

  const template = await fs.readFile(templatePath, 'utf-8');

  const breakdownEntries = Object.entries(report.breakdown || {}).sort((a, b) => b[1] - a[1]);
  const breakdownRows = breakdownEntries
    .map(([k, v]) => {
      const label = k.replaceAll('_', ' ');
      return `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(Number(v).toFixed(2))}</td></tr>`;
    })
    .join('');

  const topActions = (report.ai_plan?.top_actions || [])
    .slice(0, 5)
    .map((a) => {
      return `
        <div class="action">
          <div style="font-weight:800; margin-bottom:6px;">${escapeHtml(a.action || '')}</div>
          <div class="muted">Category: ${escapeHtml(a.category || '')}</div>
          <div class="muted">Impact: ~${escapeHtml(Number(a.estimated_impact_kg_per_year || 0).toFixed(0))} kg CO2e/year</div>
          <div class="muted">Difficulty: ${escapeHtml(a.difficulty || '')}</div>
        </div>
      `;
    })
    .join('');

  const checklistItems = (report.ai_plan?.checklist || [])
    .map((c) => {
      return `<li>${escapeHtml(c.item || '')} ${c.estimated_impact_kg_per_year != null ? `(Impact: ~${escapeHtml(Number(c.estimated_impact_kg_per_year).toFixed(0))} kg)` : ''}</li>`;
    })
    .join('');

  const riskExplanation = report.ai_plan?.risk_explanation || '';
  const disclaimer = report.ai_plan?.disclaimer || '';

  const html = template
    .replaceAll('{{footprintKgPerYear}}', escapeHtml(Number(report.footprint_kg_per_year).toFixed(2)))
    .replaceAll('{{benchmarkKgPerYear}}', escapeHtml(Number(report.benchmark_value_kg_per_year).toFixed(2)))
    .replaceAll('{{riskLevel}}', escapeHtml(report.risk_level || ''))
    .replaceAll('{{riskExplanation}}', escapeHtml(riskExplanation))
    .replaceAll('{{breakdownRows}}', breakdownRows)
    .replaceAll('{{topActions}}', topActions)
    .replaceAll('{{checklistItems}}', checklistItems)
    .replaceAll('{{disclaimer}}', escapeHtml(disclaimer));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '12mm', bottom: '20mm', left: '12mm' },
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

