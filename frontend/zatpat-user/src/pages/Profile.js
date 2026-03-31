import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        dob: "",
        avatar: "👤"
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    // 🔥 FETCH PROFILE ON LOAD
    useEffect(() => {
        api.get("/api/profile/me")
            .then(res => {
                setProfile({
                    fullName: res.data.fullName || "",
                    email: res.data.email || "",
                    dob: res.data.dob || "",
                    avatar: res.data.avatar || "👤"
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching profile", err);
                setLoading(false);
            });
    }, []);

    // 🔥 UPDATE PROFILE
    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage("Updating...");
        try {
            await api.put("/api/profile/update", profile);
            setMessage("✅ Profile updated successfully!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("❌ Failed to update profile.");
        }
    };

    if (loading) return <div style={styles.container}>Loading...</div>;

    return (
        <div style={styles.container}>
            {/* CLOSE BUTTON */}
            <button onClick={() => navigate("/home")} style={styles.closeBtn} title="Close">
                &times;
            </button>

            <div style={styles.centeredWrapper}>
                <header style={styles.header}>
                    <div style={styles.avatarCircle}>{profile.avatar}</div>
                    <h2 style={styles.title}>Your Profile</h2>
                    <p style={styles.subtitle}>Manage your Zatpat Profile</p>
                </header>

                <form onSubmit={handleUpdate} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input 
                            type="text" 
                            style={styles.input} 
                            value={profile.fullName} 
                            onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input 
                            type="email" 
                            style={styles.input} 
                            value={profile.email} 
                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                            placeholder="name@example.com"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Date of Birth</label>
                        <input 
                            type="date" 
                            style={styles.input} 
                            value={profile.dob} 
                            onChange={(e) => setProfile({...profile, dob: e.target.value})}
                        />
                    </div>

                    <button type="submit" style={styles.saveBtn}>Save Changes</button>
                    {message && <p style={styles.statusMsg}>{message}</p>}
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { 
        minHeight: "100vh", 
        background: "#020617", 
        color: "#fff", 
        padding: "20px", 
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: "flex",            // 🔥 Forces Flexbox
        flexDirection: "column",    // 🔥 Stack header and card
        justifyContent: "center",   // 🔥 Vertical Center
        alignItems: "center",       // 🔥 Horizontal Center
        position: "relative"
    },

    centeredWrapper: { 
        width: "100%", 
        maxWidth: "420px",          // 🔥 Keeps the form compact and elegant
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },

    closeBtn: { 
        position: "fixed", 
        top: "25px", 
        right: "30px", 
        background: "rgba(255,255,255,0.05)", 
        border: "1px solid rgba(255,255,255,0.1)", 
        color: "#94a3b8", 
        fontSize: "32px", 
        width: "50px", 
        height: "50px", 
        borderRadius: "15px", 
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        transition: "0.2s"
    },

    header: { 
        textAlign: "center",
        marginBottom: "30px" 
    },

    avatarCircle: { 
        width: "85px", 
        height: "85px", 
        background: "rgba(99, 102, 241, 0.1)", 
        border: "2px solid #6366f1", 
        borderRadius: "50%", 
        margin: "0 auto 15px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        fontSize: "42px",
        boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)"
    },

    title: { fontSize: "28px", fontWeight: "900", margin: "0 0 5px 0", letterSpacing: "-0.5px" },
    subtitle: { color: "#64748b", fontSize: "14px", fontWeight: "500" },

    form: { 
        background: "rgba(255,255,255,0.02)", 
        backdropFilter: "blur(10px)",
        padding: "35px", 
        borderRadius: "32px", 
        border: "1px solid rgba(255,255,255,0.06)", 
        textAlign: "left",
        width: "100%",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
    },

    inputGroup: { marginBottom: "20px" },
    label: { 
        display: "block", 
        fontSize: "11px", 
        color: "#6366f1", 
        fontWeight: "800", 
        marginBottom: "8px", 
        textTransform: "uppercase",
        letterSpacing: "1px"
    },

    input: { 
        width: "100%", 
        background: "#0a0f1d", 
        border: "1px solid #1e293b", 
        padding: "14px 18px", 
        borderRadius: "14px", 
        color: "#fff", 
        outline: "none", 
        fontSize: "15px",
        transition: "border-color 0.2s"
    },

    saveBtn: { 
        width: "100%", 
        background: "#6366f1", 
        color: "#fff", 
        border: "none", 
        padding: "16px", 
        borderRadius: "14px", 
        fontWeight: "700", 
        cursor: "pointer", 
        marginTop: "10px", 
        fontSize: "16px",
        boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
        transition: "transform 0.2s"
    },

    statusMsg: { 
        marginTop: "20px", 
        fontSize: "14px", 
        color: "#4ade80", 
        textAlign: "center",
        fontWeight: "600" 
    }
};

export default Profile;