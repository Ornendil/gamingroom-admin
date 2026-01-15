import React, { useMemo, useState, useEffect } from 'react';
import './App.css';
import CalendarComponent from './components/CalendarComponent/CalendarComponent';
import LoginFormComponent from './components/LoginFormComponent/LoginFormComponent';
import ExampleSessions from './components/SessionComponent/ExampleSessions';
import useAuth from './components/useAuth';
import { logout, login } from './functions';

import { fetchTenant } from "./apiTenant";
import { buildSettingsFromTenant } from "./tenantSettings";
import { ADMIN_BASE_URL } from './helpers/baseUrl';



const sessions = [
    // { "id": "0", "time_slot": "1", "navn": "Morten", "passord": "blyant", "status": "finished", "computer": "PC1" },
]

function App() {

    const { isLoggedIn, setIsLoggedIn, isLoading } = useAuth();

    const [currentTime, setCurrentTime] = useState(new Date());

    const [tenant, setTenant] = useState(null);
    const [tenantError, setTenantError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const t = await fetchTenant();
                if (!cancelled) setTenant(t);
            } catch (e) {
                if (!cancelled) setTenantError(e.message || String(e));
            }
        })();

        return () => { cancelled = true; };
    }, []);

    const settings = useMemo(() => {
        if (!tenant) return null;
        return buildSettingsFromTenant(tenant);
    }, [tenant]);


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



    const tenantSlug = settings?.tenant?.slug;
    const tenantLogo = tenantSlug ? `${ADMIN_BASE_URL}/tenant-logos/${tenantSlug}.svg` : null;

    const [logoSrc, setLogoSrc] = useState(tenantLogo ?? `${ADMIN_BASE_URL}/tenant-logos/logo.svg`);

    useEffect(() => {
        // Try tenant logo first, fall back if missing
        if (!tenantLogo) {
            setLogoSrc(`${ADMIN_BASE_URL}/tenant-logos/logo.svg`);
            return;
        }
        setLogoSrc(tenantLogo);
    }, [tenantLogo]);



    // While loading, display a loading screen or a simple spinner
    if (isLoading) {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Gamingrom</h1>
                    <div>Laster…</div>
                </header>
            </div>
        );
    }

    if (isLoggedIn) {
        if (!settings) {
            return (
                <div className="App">
                    <header className="App-header">
                        <h1>Gamingrom</h1>
                        <div>Laster…</div>
                    </header>
                </div>
            );
        }

        return (
            <div className="App">
                <header className="App-header">
                    <div className='App-title'>

                        <img
                            className="App-logo"
                            src={logoSrc}
                            alt=''
                            onError={() => setLogoSrc(`${ADMIN_BASE_URL}/tenant-logos/logo.svg`)}
                        />
                        <div className='App-title-text'>
                            <h1>Gamingrom</h1>
                            {settings?.tenant?.displayName && (
                                <div style={{ fontSize: 16, opacity: 0.8 }}>
                                    {settings.tenant.displayName}
                                </div>
                            )}
                        </div>

                    </div>
                    <div className="clock">
                        {currentTime.toLocaleTimeString()}
                    </div>

                    {tenantError && <div style={{ color: "salmon" }}>{tenantError}</div>}

                    {settings ? (
                        <>
                            <ExampleSessions statuses={settings.statuses} />
                            <div className="button" onClick={handleLogout}>Logg ut</div>
                        </>
                    ) : (
                        <div>Laster tenant…</div>
                    )}
                </header>
                <CalendarComponent sessions={sessions} settings={settings} />
            </div>
        );
    } else {
        return (<div className="App"><LoginFormComponent onLogin={handleLogin} tenantLogo={tenantLogo} /></div>);
    }

}

export default App;