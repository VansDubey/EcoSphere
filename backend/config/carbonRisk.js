// Global carbon benchmark + risk banding (auditable)
// Benchmark: ~4.5 tonnes CO2e/year average -> 4500 kg CO2e/year

export const GLOBAL_BENCHMARK_KG_CO2E_PER_YEAR = 4500;

export function computeRiskLevel({ footprintKgPerYear, benchmarkKgPerYear = GLOBAL_BENCHMARK_KG_CO2E_PER_YEAR }) {
  const ratio = benchmarkKgPerYear > 0 ? footprintKgPerYear / benchmarkKgPerYear : 0;

  // Banding (deterministic, configurable later if needed)
  // ≤ 50% benchmark  -> Low
  // 50–100% benchmark -> Moderate
  // 100–150% benchmark -> High
  // >150% benchmark -> Severe
  let riskLevel = 'Moderate';
  if (ratio <= 0.5) riskLevel = 'Low';
  else if (ratio <= 1.0) riskLevel = 'Moderate';
  else if (ratio <= 1.5) riskLevel = 'High';
  else riskLevel = 'Severe';

  return {
    benchmarkKgPerYear,
    ratio,
    riskLevel,
  };
}

