// SessionComponent.jsx
import React from 'react';
import EditableTextField from '../EditableTextField';
import interact from "interactjs";
import { useEffect, useRef } from 'react';
import { throttle } from 'lodash';
import styles from './SessionComponent.module.css'; // You can create a corresponding CSS file for styling if needed
import {
    getTimeSlotBelow,
    getDraggableBelow,
    updateTime,
    updateName,
    updateLnr,
    // updateStatus,
    deleteSession,
    checkForValidDrop,
    parseTime
} from '../../functions';
import { useState } from 'react';
import { Menu, Item, Separator, contextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import './ContextMenu.css';

function SessionComponent({
    session,
    onClick,
    settings,
    updateDataEntry,
    removeDataEntry,
    setIsEditing,
    setData,
    onDelete,
    onChangeStatus,
    onChangeName
}) {

    const computerSettings = settings.computers[session.computer];
    const timeSlotsToday = settings.aapningstider[settings.today].timeSlots;
    const timeSlotIndex = session.time_slot - 1;
    const row = session.time_slot;
    const col = computerSettings ? computerSettings.index : 1;
    session.fra = timeSlotsToday[timeSlotIndex].fra;
    session.til = timeSlotsToday[timeSlotIndex].til;


    // Set status based on time, rather than the status from in the API (which isn't in active use anymore)
    const now = new Date();
    const fra = parseTime(timeSlotsToday[timeSlotIndex].fra);
    const til = parseTime(timeSlotsToday[timeSlotIndex + 1].til);
    
    if (now<fra) {
        session.status = 'scheduled';
    } else if (now>fra && now<til) {
        session.status = 'ongoing';
    } else {
        session.status = 'finished';
    }


    let sessionClass = `${styles.session} ${styles[session.status]} session`;
    let tooltip = `Bruker nummer ${session.id}`;

    const ref = useRef(null);

    const throttledOnMove = useRef(throttle((event) => {
        // This function is where you'd handle the visual feedback of dragging
        const timeSlotData = checkForValidDrop(event, getTimeSlotBelow, getDraggableBelow);
        if (timeSlotData) {
            updateDataEntry({
                id: parseInt(session.id, 10),
                computer: timeSlotData.computer,
                fra: timeSlotsToday[timeSlotData.slot - 1].fra,
                til: timeSlotsToday[timeSlotData.slot].til,
                time_slot: timeSlotData.slot,
            });
        }
    }, 50)).current;

    // This effect sets up the interact.js draggable functionality
    useEffect(() => {
        const currentRef = ref.current;
        if (currentRef) {
            interact(currentRef).draggable({
                inertia: false,
                modifiers: [
                    interact.modifiers.restrictRect({
                        restriction: 'parent',
                        endOnly: true,
                    }),
                ],
                autoScroll: true,
                onstart: () => setIsEditing(true),
                onmove: throttledOnMove,
                onend: (event) => {
                    const timeSlotData = checkForValidDrop(event, getTimeSlotBelow, getDraggableBelow);
                    if (timeSlotData) {
                        updateTime({
                            'id': session.id,
                            'slot': timeSlotData.slot,
                            'fra': timeSlotsToday[timeSlotData.slot - 1].fra,
                            'til': timeSlotsToday[timeSlotData.slot].til,
                            'computer': timeSlotData.computer
                        }, updateDataEntry);
                        setIsEditing(false);
                    }
                },
            });
        }

        return () => {
            if (currentRef) {
                interact(currentRef).unset();
            }
        };
    }, [throttledOnMove, setIsEditing, session.id, timeSlotsToday, updateDataEntry]);


    // Context Menu
    const [menuId] = useState('menu_id_' + session.id);  // Unique ID for each session's menu

    const handleContextMenu = (event) => {
        event.preventDefault();
        contextMenu.show({
            id: menuId,
            event: event,
        });
    };

    const cancelEditing = () => {
        // Handle cancel logic if necessary
    };

    return (
        <>
            <div
                ref={ref}
                className={sessionClass}
                title={tooltip}
                onContextMenu={handleContextMenu}
                // onClick={() => onClick(session)}
                style={{ gridRowStart: row, gridColumnStart: col }}>
                <div className={styles.left}>
                    <div className={styles.navnDiv}>
                        {/* <span className={styles["icon-user"]}></span> */}
                        <span className={styles.navn}>{session.navn}</span>
                    </div>
                    {/* <div className={styles.passordDiv}>
                        <span className={styles["icon-key"]}></span>
                        <span className={styles.passord}>{session.passord}</span>
                    </div> */}
                    <div className={styles.lnrDiv}>
                        <span className={styles.lnr}>{session.lnr}</span>
                    </div>
                </div>
                <div className={styles.right}>
                    <div className={styles.fra}>{timeSlotsToday[timeSlotIndex].fra}</div>
                    <div className={styles.til}>{timeSlotsToday[timeSlotIndex + 1].til}</div>
                </div>
            </div>
            <Menu
                id={menuId}
                animation={false}
                theme="light"
                >
                <Item closeOnClick={false}>
                    <EditableTextField
                        label='Endre navn'
                        text={session.navn}
                        // className={styles.navn}
                        onSave={(newName) => updateName(session, newName, updateDataEntry)}
                        onCancel={cancelEditing}
                    />
                </Item>
                <Item closeOnClick={false}>
                    <EditableTextField
                        label='Endre lånernummer'
                        text={session.lnr}
                        // className={styles.lnr}
                        onSave={(newLnr) => updateLnr(session, newLnr, updateDataEntry)}
                        onCancel={cancelEditing}
                    />
                </Item>
                <Separator />
                {/* <Item disabled>Endre status</Item>
                {Object.entries(settings.statuses).map(([key, value]) => (
                    <Item 
                        key={key}
                        title={value.tooltip
                        }
                        className={styles["submenu"]}
                        onClick={() => updateStatus(session, key, updateDataEntry)}
                    >
                        {value.title}
                    </Item>
                ))}
                <Separator /> */}
                <Item onClick={() => deleteSession(session, removeDataEntry)}>Slett sesjon</Item>
            </Menu>
        </>
    );
}

export default SessionComponent;
