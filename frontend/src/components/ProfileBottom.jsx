import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../contexts/ShopContext";
import ProfileReports from "./ProfileReports";

function ProfileBottom() {
    const [activeTab, setActiveTab] = React.useState("reports");
    const { token, backendUrl } = useContext(ShopContext);
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) return;
        
        const fetchReports = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${backendUrl}/api/report/me`, {
                    headers: { token }
                });
                setReports(res.data?.reports || []);
            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [token, backendUrl]);

    return (
        <div style={{ borderRadius: "0 0 16px 16px", overflow: "hidden", border: "1px solid #DCEBD8", borderTop: "none" }}>

            {/* Tabs */}
            <div
                style={{
                    backgroundColor: "#F3F8F1",
                    padding: "0 32px",
                    display: "flex",
                    gap: 28
                }}
            >
                {["reports", "footprint"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: "14px 2px",
                            fontSize: 14,
                            textTransform: "capitalize",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: activeTab === tab ? "#16321F" : "#7C9A7E",
                            fontWeight: activeTab === tab ? 500 : 400,
                            borderBottom: activeTab === tab ? "2px solid #639922" : "2px solid transparent"
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ backgroundColor: "#FFFFFF", padding: "56px 32px", textAlign: "center" }}>
                {activeTab === "reports" ? (
                    <>
                        {loading ? (
                            <p style={{ fontSize: 14, color: "#4C6B4F", margin: 0 }}>
                                Loading reports...
                            </p>
                        ) : reports.length > 0 ? (
                            <ProfileReports />
                        ) : (
                            <>
                                <p style={{ fontSize: 14, color: "#4C6B4F", margin: "0 0 18px" }}>
                                    Your carbon footprint is not yet calculated.
                                </p>
                                <button
                                    onClick={() => navigate('/eco-calculator')}
                                    style={{
                                        backgroundColor: "#CFEF3E",
                                        color: "#16321F",
                                        border: "none",
                                        borderRadius: 8,
                                        padding: "10px 22px",
                                        fontSize: 14,
                                        fontWeight: 500,
                                        cursor: "pointer"
                                    }}
                                >
                                    Calculate now
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <p style={{ fontSize: 14, color: "#4C6B4F", margin: "0 0 18px" }}>
                            Your footprint breakdown will appear here.
                        </p>
                        <button
                            onClick={() => navigate('/eco-calculator')}
                            style={{
                                backgroundColor: "#CFEF3E",
                                color: "#16321F",
                                border: "none",
                                borderRadius: 8,
                                padding: "10px 22px",
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: "pointer"
                            }}
                        >
                            Calculate Now
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default ProfileBottom;
