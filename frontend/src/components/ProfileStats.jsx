import React from "react";
import { ShopContext } from "../contexts/ShopContext";
import axios from "axios";

const MONO = "'SFMono-Regular', 'Menlo', 'Consolas', monospace";

function ProfileStats() {
    const [stats, setStats] = React.useState({
        carbonScore: 0,
        reportsGenerated: 0,
        joinedCommunity: false
    });
    const { token, backendUrl } = React.useContext(ShopContext);

    const fetchStats = async () => {
        if (!token) return;
        try {
            // Fetch reports to get carbon score and count
            const reportsRes = await axios.get(
                `${backendUrl}/api/report/me`,
                { headers: { token } }
            );
            const reports = reportsRes.data?.reports || [];
            const latestReport = reports[0];
            const carbonScore = latestReport?.footprint_kg_per_year || 0;

            // Fetch initiatives to check community status
            const initiativesRes = await axios.get(
                `${backendUrl}/api/initiative/getinitiatives`,
                { headers: { token } }
            );
            const initiatives = initiativesRes.data?.List || [];
            
            // Check if user is a member of any initiative
            // Note: We need the user ID from the profile data
            const profileRes = await axios.post(
                `${backendUrl}/api/user/profile`,
                {},
                { headers: { token } }
            );
            const userId = profileRes.data?.user?._id;
            
            const joinedCommunity = initiatives.some(init => 
                init.members?.some(member => member._id === userId)
            );

            setStats({
                carbonScore: carbonScore || 0,
                reportsGenerated: reports.length,
                joinedCommunity
            });
        } catch (error) {
            console.error("Error fetching profile stats:", error);
        }
    };

    React.useEffect(() => {
        if (token) fetchStats();
    }, [token]);

    const { carbonScore, reportsGenerated, joinedCommunity } = stats;

    // Ring gauge math (scale is a placeholder — swap in your real target score)
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const fillRatio = Math.min(carbonScore / 10000, 1);
    const dashOffset = circumference * (1 - fillRatio);

    return (
        <div
            style={{
                marginTop: 24,
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                border: "1px solid #DCEBD8",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                gap: 32,
                flexWrap: "wrap"
            }}
        >
            {/* Carbon score with ring */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
                    <circle cx="28" cy="28" r={radius} fill="none" stroke="#EAF3DE" strokeWidth="6" />
                    <circle
                        cx="28" cy="28" r={radius} fill="none" stroke="#639922" strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        transform="rotate(-90 28 28)"
                    />
                </svg>
                <div>
                    <p style={{ fontFamily: MONO, fontSize: 20, fontWeight: 500, color: "#16321F", margin: 0, lineHeight: 1.1 }}>
                        {carbonScore.toLocaleString()} kg
                    </p>
                    <p style={{ fontSize: 12, color: "#6B8F71", margin: "2px 0 0" }}>Carbon score</p>
                </div>
            </div>

            <div style={{ width: 1, height: 36, backgroundColor: "#DCEBD8" }} />

            <div>
                <p style={{ fontFamily: MONO, fontSize: 20, fontWeight: 500, color: "#16321F", margin: 0, lineHeight: 1.1 }}>
                    {reportsGenerated}
                </p>
                <p style={{ fontSize: 12, color: "#6B8F71", margin: "2px 0 0" }}>Reports generated</p>
            </div>

            <div style={{ width: 1, height: 36, backgroundColor: "#DCEBD8" }} />

            <div>
                <p style={{ fontFamily: MONO, fontSize: 20, fontWeight: 500, color: joinedCommunity ? "#16321F" : "#B4B2A9", margin: 0, lineHeight: 1.1 }}>
                    {joinedCommunity ? "✓" : "—"}
                </p>
                <p style={{ fontSize: 12, color: "#6B8F71", margin: "2px 0 0" }}>
                    {joinedCommunity ? "Joined community" : "Not joined community"}
                </p>
            </div>
        </div>
    );
}

export default ProfileStats;