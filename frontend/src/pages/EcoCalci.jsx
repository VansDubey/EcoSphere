import React, { useContext, useState } from 'react';
import axios from 'axios';
import { ShopContext } from '../contexts/ShopContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
import IntroRightCalci from '../components/IntroRightCalci';
import IntroLeftCalci from '../components/IntroLeftCalci'
import bulbImg from '../assets/CalculatorImages/light-bulb_1566384.png';
import transportImg from '../assets/CalculatorImages/logistics-delivery_10857143.png';
import houseImg from '../assets/CalculatorImages/eco-house_5383420.png';
import foodImg from '../assets/CalculatorImages/catering_3475952.png';
import shoppingImg from '../assets/CalculatorImages/shopping-bag_5939887.png';

function CarbonFootprintCalculator() {
  const { token } = useContext(ShopContext);
  const [form, setForm] = useState({
    dailyKm: '',
    transportMode: 'car',
    electricity: '',
    gas: '',
    diet: 'nonVeg',
    flights: '',
    meatMeals: '',
    devices: '',
    laundryLoads: '',
    bottledWater: '',
  });

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateReport = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/report`,
        { userInputs: form },
        { headers: { token } }
      );
      setReport(res.data);

    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!report?.reportId) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/report/${report.reportId}/pdf`,
        {
          responseType: 'blob',
          headers: token ? { token } : undefined,
        }
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EcoSphere-Report-${report.reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to download PDF.');
    }
  };

  return (
    <div className='eco-static-bg p-5' >
      <h1 className="text-4xl md:text-4xl text-center font-bold text-white mb-4 mt-5">
        Calculate your annual carbon footprint
      </h1>
      <p className='text-green-100 mb-5 text-lg text-center'>EcoCalci – Deterministic footprint + personalized plan (annual) and a downloadable report.</p>


      <div className="max-w-2xl mx-auto shadow-lg p-8 rounded-lg mt-10 bg-green-100">
        <div className="space-y-4">
          <Input label="Daily travel distance (km)" name="dailyKm" value={form.dailyKm} onChange={handleChange} type="number" />
          <Select label="Transport Mode" name="transportMode" value={form.transportMode} onChange={handleChange} options={['car', 'bike', 'bus', 'train', 'walk', 'cycle']} />

          <Input label="Monthly electricity use (kWh)" name="electricity" value={form.electricity} onChange={handleChange} type="number" />
          <Input label="Monthly gas use (kg)" name="gas" value={form.gas} onChange={handleChange} type="number" />

          <Select label="Diet Type" name="diet" value={form.diet} onChange={handleChange} options={['vegan', 'vegetarian', 'nonVeg']} />
          <Input label="Flights per year" name="flights" value={form.flights} onChange={handleChange} type="number" />
          <Input label="Meat meals per week" name="meatMeals" value={form.meatMeals} onChange={handleChange} type="number" />
          <Input label="Electronic devices used daily" name="devices" value={form.devices} onChange={handleChange} type="number" />
          <Input label="Laundry/Dishwasher loads per week" name="laundryLoads" value={form.laundryLoads} onChange={handleChange} type="number" />
          <Input label="Bottled water used per day" name="bottledWater" value={form.bottledWater} onChange={handleChange} type="number" />

          <button
            onClick={calculateReport}
            disabled={loading}
            className=" bg-emerald-400 text-green-900 font-semibold px-6 py-2 rounded-full shadow-[0_4px_0_#047857] hover:translate-y-[1px] hover:shadow-[0_2px_0_#047857] active:translate-y-[2px] active:shadow-none transition-all duration-150 disabled:opacity-60"
          >
            {loading ? 'Generating report...' : 'Calculate Annual Footprint'}
          </button>

          {report && (
            <div className="mt-6 bg-green-200 border border-green-400 p-4 rounded-md text-green-900">
              <p className="font-semibold">
                Your <b>annual</b> carbon footprint is approximately{' '}
                <span className="text-green-900">{report.footprint_kg_per_year} kg CO₂e/year</span>
              </p>
              <p className="mt-2">
                Risk level: <b>{report.risk_level}</b> (benchmark: {report.benchmark_value_kg_per_year} kg CO₂e/year)
              </p>

              <div className="mt-4">
                <div className="text-sm font-semibold mb-2">Top categories</div>
                <ul className="list-disc pl-5">
                  {Object.entries(report.breakdown || {})
                    .sort((a,b)=>b[1]-a[1])
                    .slice(0,4)
                    .map(([k,v]) => (
                      <li key={k}>{k.replace(/_/g,' ')}: {v} kg</li>
                    ))}
                </ul>
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold mb-2"> Top Actions</div>
                {report.ai_plan?.top_actions?.length ? (
                  <div className="grid gap-3">
                    {report.ai_plan.top_actions.slice(0,3).map((a, idx) => (
                      <div key={idx} className="bg-white/60 border border-green-300 rounded-md p-3">
                        <div className="font-semibold">{a.action}</div>
                        <div className="text-sm">Category: {a.category}</div>
                        <div className="text-sm">Impact: ~{a.estimated_impact_kg_per_year} kg CO₂e/year</div>
                        <div className="text-sm">Difficulty: {a.difficulty}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm">AI plan is not available yet.</div>
                )}
              </div>

              <button
                onClick={downloadPdf}
                className="mt-4 bg-emerald-600 text-white font-semibold px-6 py-2 rounded-full"
              >
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
      <h1 className="text-4xl md:text-5xl text-center font-bold text-white mb-5 mt-20">
        How your choices impact Environment?
      </h1>
       <p className='text-green-100 mb-10 text-lg text-center'>Every choice matters. EcoCalci helps you track your annual footprint across energy, travel, food, and shopping—so you can reduce the categories that matter most.</p>
        <IntroRightCalci
        header="Save Power, Save the Planet"
        info="Turning off a fan for 5 hours daily can save around 1 kg of CO₂ per week, which is like skipping a 3 km drive. Switching off your laptop overnight saves nearly 1 kg CO₂ per week, equal to not using a ceiling light for 20 hours. Replacing one bulb with an LED saves about 40 kg of CO₂ annually — that’s like having one tree work for you all year."

        imgURL={bulbImg}
      />

      <IntroLeftCalci
        header="Travel Smarter, Emit Less"
        info="Taking a bus instead of your car for 10 km helps you save about 2 kg CO₂, equivalent to charging 250 smartphones. Just walking or cycling 2 km can cut 0.5 kg CO₂, which is like planting a small tree every 4 days."
        imgURL={transportImg}

      />

      <IntroRightCalci
        header="Eat Mindfully, Live Sustainably"
        info="Skipping meat for just one day saves up to 3 kg of CO₂ and 1500 litres of water — imagine saving 10 bathtubs full in a day! Using a reusable water bottle instead of plastic saves 0.2 kg CO₂ per use and avoids waste that could last 450 years."
        imgURL={foodImg}
      />

      <IntroLeftCalci
        header=" Efficient Living, Greener Future"
        info="Switching to LED bulbs reduces up to 40 kg of CO₂ per year per bulb, just like a tree absorbing emissions all year long. Powering down your laptop at night saves 1 kg CO₂ per week, which adds up fast with small changes."
        imgURL={houseImg } />

      <IntroRightCalci
        header="Shop Wise, Save Carbon"
        info="Buying just one recycled item can cut up to 90% of production emissions, which is like skipping a 10 km car trip. And every time you use a cloth bag instead of plastic, you save about 0.3 kg CO₂ — plus one less bag floating in the ocean."
        imgURL={ shoppingImg }
      />
      </div>

    </div>

  );
}


// Reusable Input Component with green focus
function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-green-800">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full text-green-900 border border-green-800 rounded-md p-2
                   focus:outline-none focus:border-green-900 focus:ring-1 focus:ring-green-900"
      />
    </div>
  );
}

// Reusable Select Component with green focus
function Select({ label, name, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-green-800">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 block text-green-900 w-full border border-green-800 rounded-md p-2
                   focus:outline-none focus:border-green-900 focus:ring-1 focus:ring-green-900"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt[0].toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CarbonFootprintCalculator;
