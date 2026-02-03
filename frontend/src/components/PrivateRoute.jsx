import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  // Check if user is authenticated
  const userInfo = localStorage.getItem("userInfo");
  const isAuthenticated = userInfo && JSON.parse(userInfo)?.token;

  // If not authenticated, redirect to home page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default PrivateRoute;
