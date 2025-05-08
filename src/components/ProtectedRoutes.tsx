import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { setAuthState } from "../store/customerConfigSlice";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../store";
import AccessDeniedImage from "../../public/assets/images/Access-denied.png";
interface ProtectedRouteProps {
    element: React.ReactNode;
    moduleKey?: string; // Optional for routes that require module authorization. Example: "HRM", "Inventory", etc.
    permissionKey?: string; // Optional for routes that require permission
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, moduleKey, permissionKey }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const dispatch = useDispatch();
    const userPermissions = useSelector((state: IRootState) => state.customerConfig.permissions) as Record<string, string[]>;

    const [Userdata, setuserdata] = useState<any>(null);

    useEffect(() => {
        const verifyToken = async () => {
            const token = Cookies.get("token");
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            const endpoint = import.meta.env.VITE_API_LIVEHOST;
            const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;

            try {
                const response = await axios.post(
                    `${endpoint}?route=APS/Token/Verify`,
                    null,
                    {
                        headers: {
                            "x-api-key": apiKey,
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.status === true) {
                    const userDetails = response.data.data.user_details[0];
                    const permissions = response.data.data.permissions;
                    setuserdata(userDetails);
                    dispatch(setAuthState({ user: userDetails, permissions }));
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Token verification failed:", error);
                setIsAuthenticated(false);
            }
        };

        verifyToken();
    }, [dispatch]);

    if (isAuthenticated === null) {
        return (
            <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                <div className="logo-loader">
                    <div className="loaderlogo-wrapper">
                        <img src="/assets/images/APS-logo.png" alt="Logo" className="loader-logo" width={"60px"} />
                    </div>
                </div>
            </div>
        );
    }

    if (isAuthenticated && moduleKey) {

        const isAdmin = Userdata.role_id === 1;

        if (moduleKey === "crmPermissions" && !isAdmin) {
            return (
                <div className="flex flex-col items-center">
                    <img src={AccessDeniedImage} alt="Access Denied" className="w-[46%]" />
                </div>
            );
        }

        if (moduleKey !== "crmPermissions") {
            const hasPermission = userPermissions[moduleKey]?.includes(permissionKey || "");
            if (!hasPermission) {
                return <div className="flex flex-col items-center ">
                    <img src={AccessDeniedImage} alt="Access Denied" className="w-[46%]" />
                </div>
            }
        }
    }



    return isAuthenticated ? <>{element}</> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
