import React from "react";
import { FaShareAlt, FaCog, FaCamera } from "react-icons/fa";
import { ShopContext } from "../contexts/ShopContext";
import axios from "axios";
import ProfileStats from "./ProfileStats";

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
        if (token) {
            fetchProfileData();
        }
    }, [token]);

    const handleAvatarClick = () => {
        const fileInput = document.getElementById('profile-photo-input');
        if (fileInput) {
            fileInput.click();
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64Image = reader.result;
                await axios.post(
                    `${backendUrl}/api/user/profile/photo`,
                    { profilePhoto: base64Image },
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
        ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        })
        : 'N/A';

    return (
        <div className="relative rounded-2xl overflow-hidden shadow-sm">
            {/* Cover Banner */}
            <div
                className="h-28 w-full bg-gradient-to-r from-[#14301a] to-[#1f4d2b]"
                style={{ position: 'relative', zIndex: 1 }}
            />

            {/* Profile Info Container */}
            <div
                className="px-8 sm:px-10 pb-8 pt-0 flex flex-col md:flex-row md:items-end justify-between gap-6"
                style={{
                    backgroundColor: '#eef7ee',
                    position: 'relative',
                    zIndex: 2
                }}
            >
                <div className="flex flex-col sm:flex-row sm:items-end gap-5">

                    {/* Avatar with overlap */}
                    <div className="relative -mt-10 shrink-0">
                        <div
                            className="relative inline-block cursor-pointer group"
                            onClick={handleAvatarClick}
                        >
                            <div
                                className="w-24 h-24 bg-[#BFFF00] text-black rounded-full flex items-center justify-center text-3xl font-extrabold shadow-md border-4 border-white overflow-hidden"
                                style={{ zIndex: 3 }}
                            >
                                {profileData.profilePhoto ? (
                                    <img
                                        src={profileData.profilePhoto}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    profileData.name ? profileData.name.charAt(0).toUpperCase() : "U"
                                )}
                            </div>
                            {/* Camera icon overlay on hover */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <FaCamera className="text-white text-lg" />
                            </div>
                        </div>
                        <input
                            type="file"
                            id="profile-photo-input"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                        />
                    </div>

                    {/* User Info */}
                    <div className="pt-2 pb-1">
                        <h3 className="font-bold text-xl text-[#14301a] mb-1 leading-tight">
                            {profileData.name || 'User Name'}
                        </h3>
                        <p className="text-sm text-[#3d6b45] mb-1">
                            {profileData.email || 'user@example.com'}
                        </p>
                        <p className="text-xs text-[#6b8f71]">
                            Member since {memberSince}
                        </p>
                    </div>
                </div>

                {/* Right side: actions + stats */}
                <div className="flex flex-col items-start md:items-end gap-4 w-full md:w-auto">
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 text-[#3d6b45] self-end">
                        <button
                            onClick={handleShare}
                            className="p-2 rounded-full hover:bg-[#d9ecda] hover:text-[#1f4d2b] transition"
                            title="Share Profile"
                        >
                            <FaShareAlt className="text-lg" />
                        </button>
                        <button
                            className="p-2 rounded-full hover:bg-[#d9ecda] hover:text-[#1f4d2b] transition"
                            title="Settings"
                        >
                            <FaCog className="text-lg" />
                        </button>
                    </div>

                    {/* Profile Stats */}
                    <div className="w-full md:w-80 bg-white rounded-xl px-4 py-3 shadow-sm border border-[#d9ecda]">
                        <ProfileStats />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileTop;