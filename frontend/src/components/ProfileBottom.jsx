import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileReports from './ProfileReports';

function ProfileBottom() {
  const [activeTab, setActiveTab] = useState("Footprint");
  const navigate = useNavigate();

  return (
    <div style={{borderRadius:"10px"}} className="bg-green-100 text-white px-4 pt-6 pb-20 font-sans rounded-t-3xl border border-green-100">
      
      {/* Tabs */}
      <div className="bg-[#0c2d1a] border border-green-100 rounded-full flex justify-between text-sm font-medium mb-8 overflow-hidden">
        {["Reports", "Footprint"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 transition-all duration-200 ${
              activeTab === tab
                ? "bg-[#BFFF00] text-[#012E1C] font-semibold"
                : "text-lime-100 hover:bg-[#194d30]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* === Reports Tab === */}
      {activeTab === "Reports" && (
        <div className="flex flex-col items-center justify-center mt-12 text-center">
          <ProfileReports />
        </div>
      )}

      {/* === Footprint Tab === */}
      {activeTab === "Footprint" && (
        <div className="flex flex-col items-center justify-center mt-12 text-center">
          <p className="text-sm text-green-800 mb-4">
            Your Carbon Footprint is not yet calculated!
          </p>
          <button
            onClick={() => navigate('/eco-calculator')}
            className="bg-[#BFFF00] text-green-900 font-semibold px-6 py-3 rounded-full hover:opacity-90 transition shadow-md"
          >
            Calculate Now
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileBottom;
