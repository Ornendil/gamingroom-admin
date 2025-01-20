import React from 'react';
import './ComputerComponent.css';
import SessionComponent from '../SessionComponent/SessionComponent'; // Import the SessionComponent

function ComputerComponent({ sessions, onSessionClick, settings }) {
    return (
        <div className="computer-column">
            <div className='time-slots' style={{ '--number-of-time-slots': settings.aapningstider[settings.today].timeSlots.length }}>
                {settings.aapningstider[settings.today].timeSlots.map((slot, index) => (
                    <div key={index} className="time-slot">
                        {/* {slot.fra} - {slot.til} */}
                    </div>
                ))}

            </div>
            <div
                className='sessions'
                style={{ '--number-of-time-slots': settings.aapningstider[settings.today].timeSlots.length }}
            >
                {sessions.map((session, index) => (
                    <SessionComponent
                        key={session.id}
                        index={index}
                        session={session}
                        onClick={onSessionClick}
                        settings={settings}
                    />
                ))}
            </div>
        </div>
    );
}

export default ComputerComponent;