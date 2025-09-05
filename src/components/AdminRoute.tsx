import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const authContext = useAuthContext();

    if (authContext.isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-white">جاري التحقق من الصلاحيات...</p>
            </div>
        );
    }
    
    if (authContext.profile?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;