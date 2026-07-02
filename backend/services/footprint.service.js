// Deterministic footprint computation.
// Matches the EcoCalci emission factors so results are consistent across backend/frontend.

const emissionFactors = {
  transport: {
    car: 0.21,
    bike: 0.1,
    bus: 0.05,
    train: 0.04,
    walk: 0,
    cycle: 0,
  },
  electricity: 0.92, // kg CO2/kWh
  gas: 2.3, // kg CO2/kg
  diet: {
    vegan: 1.5, // tons/year
    vegetarian: 2.0,
    nonVeg: 3.0,
  },
  flights: 250,
  meatMeal: 2.5,
  deviceDaily: 0.4,
  laundry: 0.6,
  bottledWater: 0.5,
};

function toNumberOrZero(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// Input fields are the same as EcoCalci form names.
// We convert to ANNUAL kg CO2e, since risk + AI plans use per-year impacts.
// EcoCalci currently calculates a DAILY footprint and then displays it.
// Here we compute annual by using the same per-unit conversions but keeping them annual.
export function calculateFootprintKgPerYear(form = {}) {
  const dailyKm = toNumberOrZero(form.dailyKm);

  // transportEmission in EcoCalci is daily: kmPerDay * factor
  const transportDaily = dailyKm * emissionFactors.transport[form.transportMode || 'car'];

  // electricityEmission in EcoCalci: (monthly_kWh * factor)/30  => daily
  const monthlyElectricityKwh = toNumberOrZero(form.electricity);
  const electricityDaily = (monthlyElectricityKwh * emissionFactors.electricity) / 30;

  // gasEmission in EcoCalci: (monthly_kg * factor)/30 => daily
  const monthlyGasKg = toNumberOrZero(form.gas);
  const gasDaily = (monthlyGasKg * emissionFactors.gas) / 30;

  // dietEmission in EcoCalci: (tons/year*1000)/365 => daily
  const dietKey = form.diet || 'nonVeg';
  const dietDaily = (emissionFactors.diet[dietKey] * 1000) / 365;

  // flights: in EcoCalci flightEmission = (flights*250)/365 => daily
  const flightsPerYear = toNumberOrZero(form.flights);
  const flightDaily = (flightsPerYear * emissionFactors.flights) / 365;

  // meatMeals: EcoCalci meatEmission = (meatMeals*2.5)/7 => daily
  const meatMealsPerWeek = toNumberOrZero(form.meatMeals);
  const meatDaily = (meatMealsPerWeek * emissionFactors.meatMeal) / 7;

  // devices: devices * daily factor => daily
  const devices = toNumberOrZero(form.devices);
  const deviceDaily = devices * emissionFactors.deviceDaily;

  // laundryLoads: EcoCalci (loads_per_week*0.6)/7 => daily
  const laundryLoadsPerWeek = toNumberOrZero(form.laundryLoads);
  const laundryDaily = (laundryLoadsPerWeek * emissionFactors.laundry) / 7;

  // bottled water: EcoCalci waterEmission = bottledWater * 0.5 => (assumed daily)
  const bottledWaterPerDay = toNumberOrZero(form.bottledWater);
  const waterDaily = bottledWaterPerDay * emissionFactors.bottledWater;

  // Convert daily components to annual kg CO2e
  const DAYS_PER_YEAR = 365;

  const breakdownAnnualKg = {
    travel_kg: transportDaily * DAYS_PER_YEAR,
    electricity_kg: electricityDaily * DAYS_PER_YEAR,
    gas_kg: gasDaily * DAYS_PER_YEAR,
    diet_kg: dietDaily * DAYS_PER_YEAR,
    flights_kg: flightDaily * DAYS_PER_YEAR,
    meat_kg: meatDaily * DAYS_PER_YEAR,
    devices_kg: deviceDaily * DAYS_PER_YEAR,
    laundry_kg: laundryDaily * DAYS_PER_YEAR,
    bottled_water_kg: waterDaily * DAYS_PER_YEAR,
  };

  // Total annual
  const footprintKgPerYear = Object.values(breakdownAnnualKg).reduce((a, b) => a + b, 0);

  return {
    footprintKgPerYear: Number(footprintKgPerYear.toFixed(2)),
    breakdownKgPerYear: Object.fromEntries(
      Object.entries(breakdownAnnualKg).map(([k, v]) => [k, Number(v.toFixed(2))])
    ),
  };
}

