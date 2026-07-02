import { calculateFootprintKgPerYear } from '../services/footprint.service.js';
import { computeRiskLevel, GLOBAL_BENCHMARK_KG_CO2E_PER_YEAR } from '../config/carbonRisk.js';
import axios from 'axios';
import Report from '../models/report.model.js';


function buildAiPrompt({ footprintKgPerYear, breakdownKgPerYear, riskLevel, benchmarkKgPerYear }) {
  const topKeys = Object.entries(breakdownKgPerYear)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  return `You are a sustainability advisor. Generate a personalized, concrete CO2 reduction plan.

Rules:
- Do NOT compute the footprint or risk. Use the provided numbers only.
- Only reference categories present in breakdown.
- Prioritize the top categories by emissions.
- Output STRICT JSON only (no markdown, no commentary) matching the provided schema.
- Tone: encouraging, not alarmist.

User data (annual):
- Footprint: ${footprintKgPerYear} kg CO2e/year
- Benchmark: ${benchmarkKgPerYear} kg CO2e/year
- Risk level: ${riskLevel}
- Breakdown (kg CO2e/year): ${JSON.stringify(breakdownKgPerYear)}
- Prioritized categories: ${topKeys.join(', ')}

Schema:
{
  "summary": "string",
  "risk_explanation": "string",
  "top_actions": [
    {
      "action": "string",
      "category": "string",
      "estimated_impact_kg_per_year": 0,
      "difficulty": "Easy|Medium|Hard"
    }
  ],
  "checklist": [
    { "item": "string", "estimated_impact_kg_per_year": 0 }
  ],
  "disclaimer": "string"
}
`;
}

function safeParseJson(text) {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract the first JSON object
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const slice = text.slice(start, end + 1);
      return JSON.parse(slice);
    }
    throw new Error('Invalid JSON');
  }
}

function fallbackPlan({ footprintKgPerYear, riskLevel }) {
  // Minimal deterministic fallback if AI fails
  return {
    summary: `Based on your estimated footprint (${footprintKgPerYear} kg CO2e/year), your risk level is ${riskLevel}.`,
    risk_explanation: `This plan focuses on high-impact changes you can make right away.`,
    top_actions: [
      {
        action: 'Switch to lower-carbon energy habits (e.g., reduce electricity usage and improve efficiency).',
        category: 'electricity_kg',
        estimated_impact_kg_per_year: Math.max(50, Math.round(0.08 * footprintKgPerYear)),
        difficulty: 'Easy',
      },
      {
        action: 'Choose lower-emission transport when possible (public transport, cycling, shorter trips).',
        category: 'travel_kg',
        estimated_impact_kg_per_year: Math.max(50, Math.round(0.1 * footprintKgPerYear)),
        difficulty: 'Medium',
      },
      {
        action: 'Adjust diet toward lower-impact options (e.g., reduce meat frequency).',
        category: 'diet_kg',
        estimated_impact_kg_per_year: Math.max(50, Math.round(0.07 * footprintKgPerYear)),
        difficulty: 'Medium',
      },
    ],
    checklist: [
      { item: 'Pick one action from the list and schedule it for this week.', estimated_impact_kg_per_year: 100 },
      { item: 'Track your next inputs and compare your new annual footprint.', estimated_impact_kg_per_year: 0 },
    ],
    disclaimer: 'Estimates are approximate and for guidance only. Real-world outcomes vary by region and behavior.',
  };
}

export async function generateReport(req, res) {
  try {
    const { userInputs } = req.body || {};

    const { footprintKgPerYear, breakdownKgPerYear } = calculateFootprintKgPerYear(
      userInputs || req.body || {}
    );

    const { benchmarkKgPerYear, riskLevel } = computeRiskLevel({ footprintKgPerYear });

    // LLM call (structured)
    const prompt = buildAiPrompt({
      footprintKgPerYear,
      breakdownKgPerYear,
      riskLevel,
      benchmarkKgPerYear,
    });

    const geminiUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';

    const response = await axios.post(
      geminiUrl,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': process.env.GEMINI_API_KEY,
        },
        timeout: 20000,
      }
    );

    const modelText =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      '';

    let aiPlan;
    try {
      aiPlan = safeParseJson(modelText);
    } catch {
      aiPlan = fallbackPlan({ footprintKgPerYear, riskLevel });
    }

    const userId = req.body.userId || req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing userId' });
    }

    const saved = await Report.create({
      userId,
      userInputs: userInputs || req.body || {},
      footprint_kg_per_year: footprintKgPerYear,
      breakdown: breakdownKgPerYear,
      risk_level: riskLevel,
      benchmark_value_kg_per_year: GLOBAL_BENCHMARK_KG_CO2E_PER_YEAR,
      ai_plan: aiPlan,
    });

    res.json({
      reportId: saved._id,
      footprint_kg_per_year: footprintKgPerYear,
      breakdown: breakdownKgPerYear,
      risk_level: riskLevel,
      benchmark_value_kg_per_year: GLOBAL_BENCHMARK_KG_CO2E_PER_YEAR,
      ai_plan: aiPlan,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
}

export async function getMyReports(req, res) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const reports = await Report.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.json({ success: true, reports });
  } catch (err) {
    console.error('getMyReports error:', err);
    return res.status(500).json({ error: 'Failed to load reports' });
  }
}

export async function downloadReportPdf(req, res) {
  try {
    const { id } = req.params;

    // ensure latest doc is available even if model/connection is still warming up
    const report = await Report.findById(id).lean().maxTimeMS(20000);


    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const { renderReportPdf } = await import('../services/pdf.service.js');

    const pdfBuffer = await renderReportPdf({ report });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="EcoSphere-Report-${id}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('downloadReportPdf error:', err);
    return res.status(500).json({ error: 'Failed to generate PDF', details: String(err?.message || err) });
  }
}


