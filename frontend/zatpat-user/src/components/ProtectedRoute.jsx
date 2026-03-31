function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) return <Navigate to="/" />;

    if (role !== "ROLE_USER" && role !== "USER") {
        return <Navigate to="/" />;
    }

    return children;
}