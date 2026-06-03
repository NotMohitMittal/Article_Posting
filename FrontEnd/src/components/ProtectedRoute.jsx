import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ authUser, children }) => {
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
