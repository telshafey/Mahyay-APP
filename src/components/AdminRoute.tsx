import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.tsx';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const authContext = useContext(AuthContext);

    if (authContext?.isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-white">جاري التحقق من الصلاحيات...</p>
            </div>
        );
    }
    
    if (authContext?.profile?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;