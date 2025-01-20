import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import styles from './ModalComponent.module.css';

Modal.setAppElement('#root'); // Replace '#root' with your app root element ID

function NewSessionModal({ isOpen, settings, sessionDetails, onRequestClose, onSave }) {
    const [lnr, setLnr] = useState('');
    const [name, setName] = useState('');
    const cardInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...sessionDetails, name, lnr });
        onRequestClose();
    };

    useEffect(() => {
        if (isOpen) {
            setLnr('');
            setName('');
            setTimeout(() => {
                if (cardInputRef.current) {
                    cardInputRef.current.focus();
                }
            }, 0); // setTimeout with 0 delay
        }
    }, [isOpen]);
    
    // useEffect(() => {
    //     if (lnr) {
    //         // Fetch user details from the library system using the lnr
    //         const fetchUserDetails = async () => {
    //             try {
    //                 const response = await fetch(`https://ullensaker.bib.no/cgi-bin/rest_service/web_lninfo/1.0/data/?vilha=fornavn&lnr=${lnr}`);
    //                 if (response.ok) {
    //                     const data = await response.json();
    //                     console.log(data);
    //                     if (data.data) {
    //                         setName(data.data[0].fornavn);
    //                     } else {
    //                         setName(lnr);
    //                     }
    //                 } else {
    //                     console.error('Failed to fetch user details');
    //                 }
    //             } catch (error) {
    //                 console.error('Error fetching user details:', error);
    //             }
    //         };

    //         fetchUserDetails();
    //     }
    // }, [lnr]);

    let timeSlotInfo = "";
    if (sessionDetails.timeSlot !== undefined){

        sessionDetails.fra = settings.aapningstider[settings.today].timeSlots[sessionDetails.timeSlot - 1].fra;
        sessionDetails.til = settings.aapningstider[settings.today].timeSlots[sessionDetails.timeSlot].til;

        timeSlotInfo = sessionDetails.fra + " - " + sessionDetails.til;
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className={styles.Modal}
            overlayClassName={styles.Overlay}
            contentLabel="New Session"
        >
            <h2>Legg til ny spiller</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.formSection}>
                    <label htmlFor="station">Stasjon:</label>
                    <span>{sessionDetails.computer}</span>
                </div>
                <div className={styles.formSection}>
                    <label htmlFor="station">Tid:</label>
                    <span>{timeSlotInfo}</span>
                </div>
                <div className={styles.formSection}>
                    <label htmlFor="lnr">Lånernr:</label>
                    <input
                        type="text"
                        value={lnr}
                        ref={cardInputRef}
                        placeholder='N00 og så videre'
                        id='lnr'
                        onChange={(e) => setLnr(e.target.value)}
                    />
                </div>
                <div className={styles.formSection}>
                    <label htmlFor="name">Navn:</label>
                    <input
                        type="text"
                        value={name}
                        id='name'
                        placeholder='Bare fornavn. Navnet synes på gamingrommet'
                        // readOnly
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className={styles.formSection}>
                    <button type="submit">Lagre</button>
                    <button type="button" onClick={onRequestClose}>Angre</button>
                </div>
            </form>
        </Modal>
    );
}

export default NewSessionModal;