import { useRef, useEffect, useState } from 'react';

export const usePerformanceMonitor = (componentName) => {
    const renderCount = useRef(0);
    const lastRenderTime = useRef(Date.now());
    const [isMonitoring, setIsMonitoring] = useState(false);

    useEffect(() => {
        renderCount.current += 1;
        const now = Date.now();
        const timeSinceLastRender = now - lastRenderTime.current;
        lastRenderTime.current = now;

        // Performance monitoring logic without console logs
    }, []);

    const monitorDataFetch = (dataType, fetchFunction) => {
        return async (...args) => {
            const startTime = Date.now();
            const data = await fetchFunction(...args);
            const loadTime = Date.now() - startTime;

            // Performance monitoring logic without console logs
            return data;
        };
    };

    const monitorDataLoad = (dataType, data) => {
        // Performance monitoring logic without console logs
    };

    const toggleMonitoring = () => {
        setIsMonitoring(!isMonitoring);
    };

    return {
        renderCount: renderCount.current,
        isMonitoring,
        toggleMonitoring,
        monitorDataFetch,
        monitorDataLoad
    };
};

export const useDataLoadMonitor = (dataType, loading, error, data) => {
    const startTime = useRef(null);
    const loadTime = useRef(null);

    useEffect(() => {
        if (loading && !startTime.current) {
            startTime.current = performance.now();
        } else if (!loading && startTime.current) {
            loadTime.current = performance.now() - startTime.current;
            startTime.current = null;
        }
    }, [loading, dataType]);

    useEffect(() => {
        if (error) {
            // Handle error silently or add proper error handling
        }
    }, [error, dataType]);

    useEffect(() => {
        if (data && data.length > 0) {
            // Data loaded successfully
        }
    }, [data, dataType]);

    return { loadTime: loadTime.current };
};
