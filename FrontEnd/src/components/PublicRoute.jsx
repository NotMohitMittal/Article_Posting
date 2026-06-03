import { Navigate } from "react-router-dom";

const PublicRoute = ({ authUser, children }) => {
  if (authUser) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PublicRoute;
