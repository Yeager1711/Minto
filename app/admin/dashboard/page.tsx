'use client'
import React, { useEffect, useState } from 'react';
import Dashboard from '../dashboard/PC/page'; // PC layout
import MobileDashboard from '../dashboard/Reponsive_Dashboard/page'; // Mobile/Tablet layout

const Navigation: React.FC = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); // Adjust breakpoint as needed
        };

        handleResize(); // Set initial value
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile ? <MobileDashboard /> : <Dashboard />;
};

export default Navigation;
