import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      <Link to="/products">
        <button style={{ marginTop: "20px" }}>
          Manage Products
        </button>
      </Link>
      <Link to="/orders">
        <button>Manage Orders</button>
      </Link>
    </div>
  );
}

export default Dashboard;