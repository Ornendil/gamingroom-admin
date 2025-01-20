import React, { useState } from 'react';
import styles from './LoginFormComponent.module.css';

function LoginFormComponent({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        onLogin(username, password);
    };

    return (
        <form onSubmit={handleSubmit} id={styles.loginForm} className={styles.form}>
            <img className={styles.loginLogo} src='logo.svg' alt=''/>
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
