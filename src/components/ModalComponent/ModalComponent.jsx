import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import styles from './ModalComponent.module.css';

Modal.setAppElement('#root'); // Replace '#root' with your app root element ID

function NewSessionModal({ isOpen, settings, timeSlotsToday, sessionDetails, onRequestClose, onSave }) {
    const [lnr, setLnr] = useState('');
    const [name, setName] = useState('');
    const nameInputRef = useRef(null);
    const cardInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!computed) return; // or show an error

        onSave({
            ...sessionDetails,
            timeSlot: computed.timeSlot,
            fra: computed.fra,
            til: computed.til,
            name,
            lnr,
        });


        onRequestClose();
    };

    useEffect(() => {
        if (isOpen) {
            setLnr('');
            setName('');
            setTimeout(() => {
                if (nameInputRef.current) {
                    nameInputRef.current.focus();
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

    const durationSlots = Math.max(
        1,
        parseInt(settings?.tenant?.defaultSessionSlots ?? 2, 10)
    );
    console.log('durationSlots', durationSlots);

    const slotCount = Array.isArray(timeSlotsToday) ? timeSlotsToday.length : 0;

    let computed = null; // { timeSlot, fra, til }
    let timeSlotInfo = "";

    if (sessionDetails?.timeSlot !== undefined && slotCount > 0) {
        const clicked = parseInt(sessionDetails.timeSlot, 10);

        // last valid start so that start + duration - 1 is within [1..slotCount]
        const lastStart = Math.max(1, slotCount - durationSlots + 1);

        const startSlot = Math.min(Math.max(1, clicked || 1), lastStart);
        const endSlot = startSlot + durationSlots - 1;

        const start = timeSlotsToday[startSlot - 1];
        const end = timeSlotsToday[endSlot - 1];

        if (start && end) {
            computed = { timeSlot: startSlot, fra: start.fra, til: end.til };
            timeSlotInfo = `${computed.fra} - ${computed.til}`;
        }
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
                    <label htmlFor="name">Navn:</label>
                    <input
                        type="text"
                        value={name}
                        ref={nameInputRef}
                        id='name'
                        placeholder='Bare fornavn. Navnet synes på gamingrommet'
                        // readOnly
                        onChange={(e) => setName(e.target.value)}
                    />
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
                    <button type="submit">Lagre</button>
                    <button type="button" onClick={onRequestClose}>Angre</button>
                </div>
            </form>
        </Modal>
    );
}

export default NewSessionModal;