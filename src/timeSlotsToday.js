// src/timeSlotsToday.js

function parseTimeToDate(timeStr) {
  // timeStr: "HH:MM"
  const [h, m] = String(timeStr).split(":").map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

function formatHHMM(date) {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function buildSlots(open, close, slotMinutes) {
  if (!open || !close || !slotMinutes) return [];

  const start = parseTimeToDate(open);
  const end = parseTimeToDate(close);

  if (!(start < end)) return [];

  const slots = [];
  let current = new Date(start);
  let i = 1;

  // Build N slots: each entry has fra=current, til=next
  while (current < end) {
    const next = new Date(current.getTime() + slotMinutes * 60000);
    if (next > end) break;

    slots.push({
      i,
      fra: formatHHMM(current),
      til: formatHHMM(next),
    });

    current = next;
    i++;
  }

  return slots;
}


// Prefer API tenant shape only
export function getTimeSlotsToday(settings) {
  const t = settings?.tenant;

  if (t?.today?.open && t?.today?.close && t?.slotMinutes) {
    return buildSlots(t.today.open, t.today.close, t.slotMinutes);
  }

  return [];
}
