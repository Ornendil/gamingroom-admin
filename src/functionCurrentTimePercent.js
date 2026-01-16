// useCurrentTimePercentage.js
import { useState, useEffect } from "react";
import { parseTime } from "./functions";

const useCurrentTimePercentage = (timeSlots) => {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
      setPct(0);
      return;
    }

    const startStr = timeSlots[0].fra;
    const endStr = timeSlots[timeSlots.length - 1].til;

    const update = () => {
      const now = new Date();
      const start = parseTime(startStr);
      const end = parseTime(endStr);

      if (!(start instanceof Date) || !(end instanceof Date) || end <= start) {
        setPct(0);
        return;
      }

      const raw = ((now - start) / (end - start)) * 100;
      setPct(Math.max(0, Math.min(100, raw)));
    };

    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [timeSlots]);

  return pct;
};

export default useCurrentTimePercentage;
