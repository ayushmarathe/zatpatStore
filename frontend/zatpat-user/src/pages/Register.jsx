import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
    const [form, setForm] = useState({
        username: "",
        password: "",
        fullName: "", // 🔥 New
        email: "",    // 🔥 New
        dob: ""       // 🔥 New
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async () => {
        // Updated validation
        if (!form.username || !form.password || !form.fullName || !form.email || !form.dob) {
            alert("Please fill all fields");
            return;
        }

        try {
            setLoading(true);

            // 🔥 Sending the full profile data to the backend
            await api.post("/api/auth/register", {
                username: form.username,
                password: form.password,
                fullName: form.fullName,
                email: form.email,
                dob: form.dob,
                role: "USER"
            });

            alert("Registration successful! Please login.");
            navigate("/");

        } catch (err) {
            console.error(err);
            alert("Registration failed (Username/Email may already exist)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.heading}>Create Account</h2>

                <input
                    name="fullName"
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={handleChange}
                    style={styles.input}
                />

                <input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleChange}
                    style={styles.input}
                />

                <input
                    name="dob"
                    type="date"
                    value={form.dob}
                    onChange={handleChange}
                    style={styles.input}
                    title="Date of Birth"
                />

                <div style={styles.divider} />

                <input
                    name="username"
                    placeholder="Choose Username"
                    value={form.username}
                    onChange={handleChange}
                    style={styles.input}
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Set Password"
                    value={form.password}
                    onChange={handleChange}
                    style={styles.input}
                />

                <button
                    onClick={handleRegister}
                    disabled={loading}
                    style={{
                        ...styles.button,
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? "Creating Account..." : "Register"}
                </button>

                <p style={styles.footerText}>
                    Already have an account?{" "}
                    <span
                        style={styles.link}
                        onClick={() => navigate("/")}
                    >
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#020617", // Darker Zatpat background
        padding: "20px"
    },
    card: {
        background: "#1e293b",
        padding: "30px",
        borderRadius: "20px",
        width: "350px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        border: "1px solid #334155",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
    },
    heading: {
        color: "#fff",
        textAlign: "center",
        marginBottom: "10px",
        fontSize: "24px",
        fontWeight: "800"
    },
    input: {
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid #334155",
        background: "#0f172a",
        color: "#fff",
        outline: "none",
        fontSize: "14px"
    },
    divider: {
        height: "1px",
        background: "#334155",
        margin: "10px 0"
    },
    button: {
        padding: "14px",
        background: "#6366f1", // Zatpat Blue
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: "700",
        marginTop: "10px",
        fontSize: "16px"
    },
    footerText: {
        fontSize: "13px",
        color: "#94a3b8",
        textAlign: "center",
        marginTop: "10px"
    },
    link: {
        color: "#6366f1",
        cursor: "pointer",
        fontWeight: "700"
    }
};

export default Register;