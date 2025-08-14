import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.tsx';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const authContext = useContext(AuthContext);

    if (authContext?.isLoading) {
        return (
            <div className="text-white text-center p-10">
                <p>جاري التحقق من الصلاحيات...</p>
            </div>
        );
    }

    if (!authContext?.isAdmin) {
        // Redirect them to the home page if they are not an admin
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
