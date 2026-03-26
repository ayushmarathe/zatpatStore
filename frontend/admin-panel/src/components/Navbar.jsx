import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Clear the token/user data from storage
    localStorage.removeItem("token"); 
    localStorage.removeItem("user");

    // 2. Redirect to Login page
    alert("Logged out successfully"); // Optional confirmation
    navigate("/");
  };

  return (
    <nav style={styles.navbar}>
      {/* 🏠 Clickable Logo */}
      <div style={styles.logoContainer} onClick={() => navigate("/dashboard")}>
        <h2 style={styles.logo}>
          <span style={{ color: "#3b82f6" }}>Zatpat</span> Admin
        </h2>
      </div>

      {/* 👤 User Profile & Logout */}
      <div style={styles.rightSection}>
        <div style={styles.userProfile}>
          <div style={styles.userInfo}>
            <span style={styles.userName}>Gopal Solanki</span>
            <span style={styles.role}>Admin.</span>
          </div>
          <div style={styles.avatar}>G</div>
        </div>

        <div style={styles.divider}></div>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout 🚪
        </button>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#1e293b",
    padding: "0 40px",
    height: "75px",
    color: "#fff",
    borderBottom: "1px solid #334155",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  logoContainer: {
    cursor: "pointer",
  },
  logo: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "bold",
    letterSpacing: "0.5px",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#e2e8f0",
  },
  role: {
    fontSize: "10px",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  avatar: {
    width: "36px",
    height: "36px",
    background: "#3b82f6",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  divider: {
    width: "1px",
    height: "30px",
    background: "#334155",
  },
  logoutBtn: {
    background: "transparent",
    color: "#94a3b8",
    border: "1px solid #334155",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
};

export default Navbar;