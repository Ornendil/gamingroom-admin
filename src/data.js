
import { getToday, generateTimeSlots } from './functions';

// Data:
let settings = {
    "timeSlotSize": 15, // In minutes
    "today": getToday(),
    "aapningstider": {
        "mandag": { "fra": "12:00", "til": "16:00" },
        "tirsdag": { "fra": "12:00", "til": "18:00" },
        "onsdag": { "fra": "12:00", "til": "16:00" },
        "torsdag": { "fra": "12:00", "til": "18:00" },
        "fredag": { "fra": "12:00", "til": "16:00" },
        "lørdag": { "fra": "10:00", "til": "15:00" },
        "søndag": { "fra": "12:00", "til": "12:00" },
    },
    "computers": {
        "PC1": {
            "index": 1,
            "title": "PC 1"
        },
        "PC2": {
            "index": 2,
            "title": "PC 2"
        },
        "PC3": {
            "index": 3,
            "title": "PC 3"
        },
        "PC4": {
            "index": 4,
            "title": "PC 4"
        },
        "XBOX1": {
            "index": 5,
            "title": "XBOX 1"
        },
        "XBOX2": {
            "index": 6,
            "title": "XBOX 2"
        },
    },
    "statuses": {
        "scheduled": {
            "title": "Planlagt",
            "tooltip": "Økten er planlagt og har ikke startet ennå."
        },
        "ongoing": {
            "title": "Spiller",
            "tooltip": "Spilleren spiller for øyeblikket."
        },
        "finished": {
            "title": "Ferdig",
            "tooltip": "Spilleren er ferdig med å spille."
        },
        // "unused": {
        //     "title": "Ubrukt",
        //     "tooltip": "Spilleren logget aldri på."
        // },
        // "overdue": {
        //     "title": "På overtid",
        //     "tooltip": "Tiden har egentlig gått ut, men spilleren spiller fortsatt."
        // }
    }
}

console.log(settings);

settings.aapningstider[settings.today].timeSlots = generateTimeSlots(settings);

export default settings;