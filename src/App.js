import React, { useState, useEffect } from 'react';
import './App.css';
import CalendarComponent from './components/CalendarComponent/CalendarComponent';
import LoginFormComponent from './components/LoginFormComponent/LoginFormComponent';
import ExampleSessions from './components/SessionComponent/ExampleSessions';
import useAuth from './components/useAuth';
import { logout, login } from './functions';
import settings from './data';


const sessions = [
    // { "id": "0", "time_slot": "1", "navn": "Morten", "passord": "blyant", "status": "finished", "computer": "PC1" },
]

function App() {
    
    const { isLoggedIn, setIsLoggedIn, isLoading } = useAuth();

    const [currentTime, setCurrentTime] = useState(new Date());

    // Effect to update the current time every second
    useEffect(() => {
        const clockInterval = setInterval(() => {
        setCurrentTime(new Date()); // Update current time state
        }, 1000); // Update every second
        return () => clearInterval(clockInterval); // Clear interval on component unmount
    }, []);

    const handleLogin = (username, password) => {
        login(username, password, setIsLoggedIn);
    };

    const handleLogout = () => {
        logout(setIsLoggedIn);
    };
    
    
    // While loading, display a loading screen or a simple spinner
    if (isLoading) {
        return (
            <div className="App">
                <header className="App-header">
                    {/* <p>Loading...</p> */}
                </header>
            </div>
        );
    }

    if (isLoggedIn) {
        return (
            <div className="App">
                <header className="App-header">
                    <h1><img className="App-logo" src='logo.svg' alt=''/>Gamingrom</h1>
                    <div className="clock">
                    {currentTime.toLocaleTimeString()}
                    </div>
                    <ExampleSessions statuses={settings.statuses}/>
                    <div className='button' onClick={handleLogout}>Logg ut</div>
                </header>
                <CalendarComponent sessions={sessions} settings={settings} />
            </div>
        );
    } else {
        return (<div className="App"><LoginFormComponent onLogin={handleLogin} /></div>);
    }

}

export default App;