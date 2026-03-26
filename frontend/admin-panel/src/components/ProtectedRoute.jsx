import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" />;
  }

  try {
    const decoded = jwtDecode(token);

    // 🔥 CHECK ADMIN ROLE
    if (decoded.role !== "ADMIN") {
      return <Navigate to="/" />;
    }

    return children;

  } catch (err) {
    return <Navigate to="/" />;
  }
}

export default ProtectedRoute;