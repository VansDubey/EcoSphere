import React from "react";
import { FaShareAlt, FaCog } from "react-icons/fa";
import { ShopContext } from "../contexts/ShopContext";
import axios from "axios";
import ProfileStats from "./ProfileStats";

const MONO = "'SFMono-Regular', 'Menlo', 'Consolas', monospace";
const SERIF = "'Georgia', 'Times New Roman', serif";

function ProfileTop() {
    const [profileData, setProfileData] = React.useState({});
    const { token, backendUrl } = React.useContext(ShopContext);

    const fetchProfileData = async () => {
        if (!token) return;
        try {
            const response = await axios.post(
                `${backendUrl}/api/user/profile`,
                {},
                { headers: { token } }
            );
            if (response.data.success) {
                setProfileData(response.data.user);
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    };

    React.useEffect(() => {
        if (token) fetchProfileData();
    }, [token]);

    const handleAvatarClick = () => {
        document.getElementById('profile-photo-input')?.click();
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                await axios.post(
                    `${backendUrl}/api/user/profile/photo`,
                    { profilePhoto: reader.result },
                    { headers: { token } }
                );
                fetchProfileData();
            } catch (error) {
                console.error('Error uploading photo:', error);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleShare = async () => {
        const shareData = {
            title: 'EcoSphere Profile',
            text: 'Check out my EcoSphere profile! I\'m making a difference for the environment.',
            url: window.location.href
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Profile link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const memberSince = profileData.createdAt
        ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'N/A';

    return (
        <div style={{ borderRadius: "16px 16px 0 0", overflow: "hidden", border: "1px solid #DCEBD8", borderBottom: "none" }}>

            {/* Cover Banner */}
            <div style={{ height: 88, width: "100%", backgroundColor: "#16321F" }} />

            {/* Profile Info */}
            <div style={{ backgroundColor: "#F3F8F1", padding: "0 32px 28px" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 20,
                        marginTop: -34
                    }}
                >
                    {/* Avatar + name */}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
                        <div
                            onClick={handleAvatarClick}
                            style={{ position: "relative", cursor: "pointer" }}
                            className="group"
                        >
                            <div
                                style={{
                                    width: 76,
                                    height: 76,
                                    borderRadius: "50%",
                                    backgroundColor: "#CFEF3E",
                                    border: "4px solid #F3F8F1",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontFamily: MONO,
                                    fontSize: 26,
                                    fontWeight: 500,
                                    color: "#16321F",
                                    overflow: "hidden",
                                    flexShrink: 0
                                }}
                            >
                                {profileData.profilePhoto ? (
                                    <img
                                        src={profileData.profilePhoto}
                                        alt="Profile"
                                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                                    />
                                ) : (
                                    profileData.name ? profileData.name.charAt(0).toUpperCase() : "U"
                                )}
                            </div>
                            <div
                                className="opacity-0 group-hover:opacity-100"
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "rgba(0,0,0,0.5)",
                                    borderRadius: "50%",
                                    color: "white",
                                    fontSize: 11,
                                    transition: "opacity 0.15s"
                                }}
                            >
                                Change
                            </div>
                            <input
                                type="file"
                                id="profile-photo-input"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                style={{ display: "none" }}
                            />
                        </div>

                        <div style={{ paddingBottom: 6 }}>
                                    <p style={{ fontSize: 21, color: "#16321F", margin: "0 0 4px" }}>
                                        {profileData.name || "User name"}
                                    </p>

                            <p style={{ fontSize: 13, color: "#4C6B4F", margin: "0 0 2px" }}>
                                {profileData.email || "user@example.com"}
                            </p>
                            <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.02em", color: "#7C9A7E", margin: 0, textTransform: "uppercase" }}>
                                Member since {memberSince}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, paddingBottom: 8 }}>
                        <button
                            onClick={handleShare}
                            aria-label="Share profile"
                            style={{
                                width: 36, height: 36, borderRadius: "50%",
                                border: "1px solid #C9DEC4", backgroundColor: "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#16321F", cursor: "pointer"
                            }}
                        >
                            <FaShareAlt style={{ fontSize: 14 }} />
                        </button>

                    </div>
                </div>

                <ProfileStats />
            </div>
        </div>
    );
}

export default ProfileTop;