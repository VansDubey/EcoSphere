import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../contexts/ShopContext';

const API_FALLBACK = 'http://localhost:4000';

function formatKg(n) {
  const num = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(num)) return String(n ?? '');
  return num.toFixed(0);
}

function ProfileReports() {
  const { token, backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reports, setReports] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  const apiBase = useMemo(() => {
    // backendUrl comes from ShopContext; keep a safe fallback for local testing.
    return backendUrl || API_FALLBACK;
  }, [backendUrl]);

  const loadReports = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const res = await axios.get(`${apiBase}/api/report/me`, {
        headers: { token },
      });

      // Expected: { success: true, reports: [...] }
      setReports(res.data?.reports || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const downloadPdf = async (reportId) => {
    if (!reportId) return;
    setDownloadingId(reportId);
    try {
      const res = await axios.get(`${apiBase}/api/report/${reportId}/pdf`, {
        headers: token ? { token } : undefined,
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `EcoSphere-Report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e?.response?.data?.error || e.message || 'PDF download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div>
      {/* Header & Filters */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-green-800">Your Reports</h3>
      </div>

      {loading && <p className="text-sm text-green-800">Loading...</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {!loading && reports.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-10 text-center">
          <p className="text-sm text-green-800 mb-4">No reports yet. Calculate your footprint to generate your first report.</p>
          <button
            onClick={() => navigate('/eco-calculator')}
            className="bg-[#BFFF00] text-green-900 font-semibold px-6 py-3 rounded-full hover:opacity-90 transition shadow-md"
          >
            Generate Report
          </button>
        </div>
      )}

      <div className="space-y-4">
        {reports.map((r) => {
          const ai = r.ai_plan || {};
          const topActions = ai.top_actions || [];

          return (
            <div
              key={r._id}
              className="bg-green-50 text-[#012E1C] rounded-xl p-4 shadow-md border border-green-100"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-green-700">Generated: {new Date(r.createdAt).toLocaleString()}</p>
                  <h4 className="text-lg font-bold mt-1">
                    Footprint: {formatKg(r.footprint_kg_per_year)} kg CO₂e/year
                  </h4>
                  <p className="text-sm mt-1">
                    Risk level: <span className="font-semibold">{r.risk_level}</span>
                  </p>
                  <p className="text-sm">
                    Benchmark: {formatKg(r.benchmark_value_kg_per_year)} kg CO₂e/year
                  </p>
                </div>

                <button
                  onClick={() => downloadPdf(r._id)}
                  disabled={downloadingId === r._id}
                  className="shrink-0 bg-[#BFFF00] text-green-900 font-semibold px-4 py-2 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingId === r._id ? 'Downloading...' : 'Download PDF'}
                </button>
              </div>

              <div className="mt-4">
                <h5 className="text-sm font-semibold text-green-800 mb-2">Personalized plan</h5>

                {ai.summary && <p className="text-sm text-green-900 mb-3">{ai.summary}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {topActions.slice(0, 3).map((a, idx) => (
                    <div
                      key={idx}
                      className="bg-white/60 rounded-lg border border-green-100 p-3"
                    >
                      <p className="text-xs text-green-700">{a.difficulty || 'Medium'}</p>
                      <p className="font-semibold text-sm mt-1">{a.action}</p>
                      <p className="text-xs mt-2 text-green-800">
                        Impact: {formatKg(a.estimated_impact_kg_per_year)} kg CO₂e/year
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProfileReports;

