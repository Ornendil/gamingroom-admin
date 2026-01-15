// useCurrentTimePercentage.js
import { useState, useEffect } from 'react';
import { parseTime } from './functions';


const useCurrentTimePercentage = (timeSlotsToday) => {
    const [currentTimeAsPercentOfDay, setCurrentTimeAsPercentOfDay] = useState(0);

useEffect(() => {
    if (!timeSlotsToday || timeSlotsToday.length < 2) {
        setCurrentTimeAsPercentOfDay(0);
        return;
    }

    const updateCurrentTimePercentage = () => {
        const now = new Date();

        // First real slot start
        const startOfDay = parseTime(timeSlotsToday[0].fra);

        // Last boundary row = closing time
        const endOfDay = parseTime(
            timeSlotsToday[timeSlotsToday.length - 1].fra
        );

        if (!(startOfDay < endOfDay)) {
            setCurrentTimeAsPercentOfDay(0);
            return;
        }

        const percentOfDay =
            ((now - startOfDay) / (endOfDay - startOfDay)) * 100;

        setCurrentTimeAsPercentOfDay(percentOfDay);
    };

    updateCurrentTimePercentage();
    const intervalId = setInterval(updateCurrentTimePercentage, 60000);

    return () => clearInterval(intervalId);
}, [timeSlotsToday]);


    return currentTimeAsPercentOfDay;
};

export default useCurrentTimePercentage;
