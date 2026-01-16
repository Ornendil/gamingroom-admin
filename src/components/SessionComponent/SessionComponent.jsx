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

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

function indexByFra(timeSlots, fra) {
  return timeSlots.findIndex(s => s?.fra === fra); // 0-based
}

function indexByTil(timeSlots, til) {
  return timeSlots.findIndex(s => s?.til === til); // 0-based
}

function getDurationSlots(session, timeSlots, fallback = 2) {
  const s0 = indexByFra(timeSlots, session.fra);
  const e0 = indexByTil(timeSlots, session.til);
  if (s0 >= 0 && e0 >= 0 && e0 >= s0) return (e0 - s0 + 1);
  return fallback;
}

function getFraTilFromStartSlot(startSlot1, durationSlots, timeSlots) {
  const N = timeSlots.length;
  const D = Math.max(1, durationSlots);

  const lastStart = Math.max(1, N - D + 1);
  const s1 = clamp(startSlot1, 1, lastStart);
  const e1 = s1 + D - 1;

  const start = timeSlots[s1 - 1];
  const end = timeSlots[e1 - 1];

  if (!start || !end) return null;
  return { startSlot: s1, fra: start.fra, til: end.til };
}


function SessionComponent({
    session,
    onClick,
    settings,
    devices = [],
    timeSlotsToday,
    updateDataEntry,
    removeDataEntry,
    setIsEditing,
    setData,
    onDelete,
    onChangeStatus,
    onChangeName
}) {

    const sessionComputer = session.computer ?? "";
    const normalized = String(sessionComputer).toLowerCase();

    const deviceIndex = (devices || []).findIndex(d => {
        if (!d?.id) return false;
        const did = String(d.id);
        return did === sessionComputer || did.toLowerCase() === normalized;
    });

    const col = deviceIndex >= 0 ? (deviceIndex + 1) : 1;

    const fallbackDuration = settings?.tenant?.defaultSessionSlots ?? 2;

    const durationSlots = getDurationSlots(session, timeSlotsToday, fallbackDuration);

    // derive start slot from fra if possible, else fall back to session.time_slot
    const startIdx0 = indexByFra(timeSlotsToday, session.fra);
    const startSlot1 = (startIdx0 >= 0) ? (startIdx0 + 1) : session.time_slot;

    const computed = getFraTilFromStartSlot(startSlot1, durationSlots, timeSlotsToday);

    const computedSafe = computed ?? {
        startSlot: session.time_slot || 1,
        fra: session.fra || "",
        til: session.til || "",
    };

    // status based on *actual* fra/til
    const now = new Date();
    const rowStart = computedSafe.startSlot;
    const rowEndExclusive = rowStart + durationSlots;

    const fraTime = computedSafe.fra ? parseTime(computedSafe.fra) : null;
    const tilTime = computedSafe.til ? parseTime(computedSafe.til) : null;

    const status =
        !fraTime || !tilTime ? "scheduled" :
            now < fraTime ? "scheduled" :
            now <= tilTime ? "ongoing" :
            "finished";

    let sessionClass = `${styles.session} ${styles[status]} session`;
    let tooltip = `Bruker nummer ${session.id}`;

    const ref = useRef(null);

    const throttledOnMove = useRef(throttle((event) => {
        const timeSlotData = checkForValidDrop(event, getTimeSlotBelow, getDraggableBelow);
        if (!timeSlotData) return;

        const next = getFraTilFromStartSlot(timeSlotData.slot, durationSlots, timeSlotsToday);
        if (!next) return;

        updateDataEntry({
            id: parseInt(session.id, 10),
            computer: timeSlotData.computer,
            time_slot: next.startSlot,
            fra: next.fra,
            til: next.til,
        });
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
                        const next = getFraTilFromStartSlot(timeSlotData.slot, durationSlots, timeSlotsToday);
                        if (!next) return;

                        updateTime({
                            id: session.id,
                            slot: next.startSlot,
                            fra: next.fra,
                            til: next.til,
                            computer: timeSlotData.computer
                        }, updateDataEntry);
                    }
                    setIsEditing(false);
                },

            });
        }

        return () => {
            if (currentRef) {
                interact(currentRef).unset();
            }
        };
    }, [throttledOnMove, setIsEditing, session.id, timeSlotsToday, updateDataEntry, durationSlots]);


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
                style={{
                    gridRowStart: rowStart,
                    gridRowEnd: rowEndExclusive,
                    gridColumnStart: col
                }}
            >
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
                    <div className={styles.fra}>{computedSafe.fra}</div>
                    <div className={styles.til}>{computedSafe.til}</div>

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
