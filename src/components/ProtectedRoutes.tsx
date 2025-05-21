import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import  verifyToken  from "../utils/verifyToken"; 

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const valid = await verifyToken();
      setIsValid(valid ?? false);
    };
    check();
  }, []);

  if (isValid === null) return null; 
  if (!isValid) return <Navigate to="/" />;
  return children;
};

export default ProtectedRoute;
