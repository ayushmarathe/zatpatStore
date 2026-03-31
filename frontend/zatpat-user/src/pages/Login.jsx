import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";

function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await api.post("/api/auth/login", {
                username,
                password
            });

            const token = res.data.token;

            // 🔥 Decode token
            const decoded = jwtDecode(token);

            const role = decoded.role || decoded.authorities?.[0];

            if (role !== "ROLE_USER" && role !== "USER") {
                alert("Admins are not allowed in user app");
                return;
            }

            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            navigate("/home");

        } catch (err) {
            alert("Invalid credentials");
        }
    };

    return (
        <div style={styles.container}>

            <div style={styles.card}>
                <h2 style={styles.heading}>Login</h2>

                <input
                    placeholder="Username"
                    style={styles.input}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    style={styles.input}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button style={styles.button} onClick={handleLogin}>
                    Login
                </button>

                <p style={styles.linkText}>
                    Don’t have an account?{" "}
                    <span
                        style={styles.link}
                        onClick={() => navigate("/register")}
                    >
                        Register
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
        width: "300px",
        display: "flex",
        flexDirection: "column",
        gap: "15px"
    },
    heading: {
        color: "#fff",
        textAlign: "center"
    },
    input: {
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #334155",
        background: "#0f172a",
        color: "#fff"
    },
    button: {
        padding: "10px",
        background: "#6366f1",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },
    linkText: {
        color: "#94a3b8",
        fontSize: "12px",
        textAlign: "center"
    },
    link: {
        color: "#6366f1",
        cursor: "pointer",
        fontWeight: "bold"
    }
};

export default Login;