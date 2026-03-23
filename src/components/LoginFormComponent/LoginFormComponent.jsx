import React, { useEffect, useState } from 'react';
import styles from './LoginFormComponent.module.css';
import { adminUrl } from '../../helpers/baseUrl';

function LoginFormComponent({ onLogin, tenantLogo }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        onLogin(username, password);
    };

    const fallbackLogo = adminUrl('/tenant-logos/logo.svg');
    const [logoSrc, setLogoSrc] = useState(tenantLogo ?? fallbackLogo);

    useEffect(() => {
        setLogoSrc(tenantLogo ?? fallbackLogo);
    }, [fallbackLogo, tenantLogo]);

    return (
        <form onSubmit={handleSubmit} id={styles.loginForm} className={styles.form}>
            <img
                className={styles.loginLogo}
                src={logoSrc}
                alt=''
                onError={() => setLogoSrc(fallbackLogo)}
            />
            <h1>Gamingrom Admin</h1>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
        </form>
    );
}

export default LoginFormComponent;
