// CalendarComponent.jsx
import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import './CalendarComponent.css';
import SessionComponent from '../SessionComponent/SessionComponent'; // Import the SessionComponent
import {
    save,
    getSessions
} from '../../functions';
import useCurrentTimePercentage from '../../functionCurrentTimePercent';
import ModalComponent from '../ModalComponent/ModalComponent';

function CalendarComponent({ sessions, settings, onLogout }) {
    const [data, setData] = useState(sessions); // This will store your fetched data
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSessionDetails, setNewSessionDetails] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const isEditingRef = useRef(isEditing);

    useEffect(() => {
        isEditingRef.current = isEditing; // Keep the ref updated with the latest value
    }, [isEditing]);

    useEffect(() => {
        let isPollingActive = true;

        const fetchData = async () => {
            if (!isEditingRef.current && isPollingActive) {
                getSessions(setData);
            }

            // Schedule the next fetch only if polling is still active
            if (isPollingActive) {
                setTimeout(fetchData, 5000);
            }
        };

        fetchData();
        // let interval = setInterval(fetchData, 10000); // Start the interval initially
    
        const handleVisibilityChange = () => {
            if (document.hidden) {
                isPollingActive = false;
            } else {
                // Resume polling when the page becomes visible
                if (!isPollingActive) {
                    isPollingActive = true;
                    fetchData(); // Trigger an immediate fetch when coming back to visibility
                }
            }
        };
    
        // Add event listener for visibility change
        document.addEventListener("visibilitychange", handleVisibilityChange);
    
        // Cleanup
        return () => {
            isPollingActive = false; // Stop polling when the component unmounts
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);
    

    const addDataEntry = useCallback((newDataEntry) => {
        setData(prevData => [...prevData, newDataEntry]);
        console.log([newDataEntry]);
    }, []);

    const updateDataEntry = useCallback((updatedData) => {
        setData(prevData => prevData.map(entry =>
            entry.id === updatedData.id ? { ...entry, ...updatedData } : entry
        ));
    }, []);

    const removeDataEntry = useCallback((idToRemove) => {
        setData(prevData => prevData.filter(entry => entry.id !== idToRemove));
    }, []);
    


    // Expose the addDataEntry to the window object for debugging
    useEffect(() => {
        window.addDataEntry = addDataEntry;
        window.updateDataEntry = updateDataEntry;

        // Clean up the function from the window when the component unmounts
        return () => {
            delete window.addDataEntry;
            delete window.updateDataEntry;
        };
    }, [addDataEntry, updateDataEntry]);



    // Function to handle the double-click event on a time slot
    const openSaveModal = async (event) => {

        // Retrieve data attributes from the event target (the div that was double-clicked)
        const div = event.currentTarget;
        const computerKey = div.getAttribute('data-computer');
        const timeKey = div.getAttribute('data-slot');

        setNewSessionDetails({ computer: computerKey, timeSlot: timeKey });
        setIsModalOpen(true);
    };

    // The thing that shows how far the day has progressed
    const currentTimeAsPercentOfDay = useCurrentTimePercentage(settings);
    const calendarStyle = {
        background: `linear-gradient(180deg, rgba(25, 151, 93, .25) ${currentTimeAsPercentOfDay - 0.5}%, rgba(25, 151, 93, .5) ${currentTimeAsPercentOfDay}%, rgba(0,0,0,0) ${currentTimeAsPercentOfDay + 0.25}%)`
    };

    const timeSlotsToday = settings.aapningstider[settings.today].timeSlots;

    return (
        <div className='calendar-wrapper'>
            <div className='dummyDiv'></div>
            <div className='computers-header' style={{ '--number-of-computers': Object.keys(settings.computers).length }}>
                {Object.keys(settings.computers).map((computer, index) => (
                    <div key={computer} className='computer-header'>
                        <h2>{settings.computers[computer].title}</h2>
                    </div>
                ))}
            </div>
            <div className='time-slot-header' style={calendarStyle}>
                {timeSlotsToday.map((slot, index) => (
                    <div
                        key={index}
                        className="time-slot"
                        data-slot={slot.i}
                        data-time={slot.fra}
                        {...(parseInt(slot.i) === timeSlotsToday.length && { 'data-last': true })}
                    >
                        {/* If you want to display the slot time, you can do it here */}
                        {slot.fra} - {slot.til}
                    </div>
                ))}
            </div>
            <div className="calendar-grid" style={calendarStyle}>
                <div className='time-slots' style={{ '--number-of-time-slots': timeSlotsToday.length, '--number-of-computers': Object.keys(settings.computers).length }}>
                    {Object.entries(settings.computers).map(([computerKey, computer], i) => (
                        timeSlotsToday.map((slot, y) => (
                            <div
                                key={`computer-${computerKey}-slot-${y}`}
                                className="time-slot"
                                onDoubleClick={openSaveModal}
                                style={{ gridRowStart: slot.i, gridColumnStart: computer.index }}
                                data-slot={y + 1}
                                data-time={slot.fra}
                                data-computer={computerKey}
                                {...(parseInt(slot.i) === timeSlotsToday.length && { 'data-last': true })}
                            >
                                {/* {computer.title}: {slot.fra} - {slot.til} */}
                            </div>
                        ))
                    ))}
                </div>

                <div className='sessions' style={{ '--number-of-time-slots': timeSlotsToday.length, '--number-of-computers': Object.keys(settings.computers).length }}>
                    {data.map((session, index) => (
                        <SessionComponent
                            key={session.id}
                            index={index}
                            session={session}
                            updateDataEntry={updateDataEntry}
                            removeDataEntry={removeDataEntry}
                            setData={setData}
                            setIsEditing={setIsEditing}
                            // onClick={onSessionClick}
                            settings={settings}
                        />
                    ))}
                </div>
            </div>
            <ModalComponent
                isOpen={isModalOpen}
                settings={settings}
                sessionDetails={newSessionDetails}
                onRequestClose={() => setIsModalOpen(false)}
                onSave={(sessionData) => save(sessionData, addDataEntry)}
            />
        </div>
    );
}

export default CalendarComponent;