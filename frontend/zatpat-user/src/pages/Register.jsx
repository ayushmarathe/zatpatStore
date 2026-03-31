import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {

    const [form, setForm] = useState({
        username: "",
        password: ""
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

        if (!form.username || !form.password) {
            alert("Please fill all fields");
            return;
        }

        try {
            setLoading(true);

            await api.post("/api/auth/register", {
                username: form.username,
                password: form.password,
                role: "USER"
            });

            alert("Registration successful");
            navigate("/");

        } catch (err) {
            console.error(err);
            alert("Registration failed (username may exist)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>

            <div style={styles.card}>
                <h2 style={styles.heading}>Create Account</h2>

                <input
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    style={styles.input}
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
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
                    {loading ? "Registering..." : "Register"}
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
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a"
    },
    card: {
        background: "#1e293b",
        padding: "30px",
        borderRadius: "12px",
        width: "320px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        border: "1px solid #334155"
    },
    heading: {
        color: "#fff",
        textAlign: "center",
        marginBottom: "10px"
    },
    input: {
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #334155",
        background: "#0f172a",
        color: "#fff",
        outline: "none"
    },
    button: {
        padding: "12px",
        background: "#6366f1",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600"
    },
    footerText: {
        fontSize: "12px",
        color: "#94a3b8",
        textAlign: "center"
    },
    link: {
        color: "#6366f1",
        cursor: "pointer",
        fontWeight: "600"
    }
};

export default Register;