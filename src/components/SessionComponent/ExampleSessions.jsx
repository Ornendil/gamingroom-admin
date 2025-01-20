// SessionComponent.jsx
import React from 'react';
import styles from './SessionComponent.module.css'; // You can create a corresponding CSS file for styling if needed

function ExampleSessions({ statuses }) {
    
    return (
        <div className={styles.examples}>
            {Object.entries(statuses).map(([key, value]) => (
                <div
                    className={`${styles.session} ${styles[key]} session`}
                    title={value.tooltip}
                    key={key}
                    >
                        {value.title}
                </div>
            ))}
        </div>
    );
}

export default ExampleSessions;
