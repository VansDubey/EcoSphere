import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../contexts/ShopContext';
import axios from 'axios';

function ProfileStats() {
    const { token, backendUrl } = useContext(ShopContext);
    const [stats, setStats] = useState({
        carbonScore: 0,
        reportsGenerated: 0,
        communityStatus: 'Not Joined'
    });

    useEffect(() => {
        if (!token) return;
        
        const fetchStats = async () => {
            try {
                // Fetch reports count
                const reportsRes = await axios.get(`${backendUrl}/api/report/me`, {
                    headers: { token }
                });
                const reports = reportsRes.data?.reports || [];
                
                // Get latest carbon score from reports
                const latestReport = reports[0];
                const carbonScore = latestReport?.footprint_kg_per_year || 0;
                
                // Check community status (you can adjust this based on your actual community logic)
                // For now, checking if user has joined any initiatives
                const initiativesRes = await axios.get(`${backendUrl}/api/initiative/getinitiatives`, {
                    headers: { token }
                });
                const initiatives = initiativesRes.data?.List || [];
                const userInitiatives = initiatives.filter(init => 
                    init.members?.some(member => member._id === reportsRes.data?.user?._id)
                );
                
                setStats({
                    carbonScore: carbonScore || 0,
                    reportsGenerated: reports.length,
                    communityStatus: userInitiatives.length > 0 ? 'Active' : 'Not Joined'
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        fetchStats();
    }, [token, backendUrl]);

    return (
        <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Carbon Score */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <div className="text-2xl font-bold text-[#BFFF00] mb-1">
                    {stats.carbonScore > 0 ? `${stats.carbonScore.toFixed(0)} kg` : '0 kg'}
                </div>
                <div className="text-xs text-green-800 font-medium">
                    Carbon Score
                </div>
            </div>

            {/* Reports Generated */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <div className="text-2xl font-bold text-[#BFFF00] mb-1">
                    {stats.reportsGenerated}
                </div>
                <div className="text-xs text-green-800 font-medium">
                    Reports Generated
                </div>
            </div>

            {/* Community Status */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <div className="text-2xl font-bold mb-1">
                    <span className={`${stats.communityStatus === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
                        {stats.communityStatus === 'Active' ? '● Active' : '○ Not Joined'}
                    </span>
                </div>
                <div className="text-xs text-green-800 font-medium">
                    Community
                </div>
            </div>
        </div>
    );
}

export default ProfileStats;