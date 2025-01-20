// useCurrentTimePercentage.js
import { useState, useEffect } from 'react';
import { parseTime } from './functions';


const useCurrentTimePercentage = (settings) => {
    const [currentTimeAsPercentOfDay, setCurrentTimeAsPercentOfDay] = useState(0);

    useEffect(() => {
        const updateCurrentTimePercentage = () => {
            const now = new Date();
            const startOfDay = parseTime(settings.aapningstider[settings.today].fra);
            const endOfDay = parseTime(settings.aapningstider[settings.today].til);
            const percentOfDay = ((now - startOfDay) / (endOfDay - startOfDay)) * 100;

            setCurrentTimeAsPercentOfDay(percentOfDay);
        };

        updateCurrentTimePercentage(); // Run initially
        const intervalId = setInterval(updateCurrentTimePercentage, 60000);

        return () => clearInterval(intervalId);
    }, [settings]);

    return currentTimeAsPercentOfDay;
};

export default useCurrentTimePercentage;
