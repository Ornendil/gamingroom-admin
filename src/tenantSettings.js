// src/tenantSettings.js

function devicesToComputers(devices) {
  // Your current UI expects { PC1: {index,title}, ... }
  // API returns [{id,label,type}, ...]
  const computers = {};
  (devices ?? []).forEach((d, idx) => {
    const key = String(d.id || "");
    computers[key] = { index: idx + 1, title: d.label, type: d.type };
  });
  return computers;
}

export const STATUSES = {
  scheduled: { title: "Planlagt", tooltip: "Økten er planlagt." },
  ongoing: { title: "Aktiv", tooltip: "Spilleren spiller nå." },
  finished: { title: "Ferdig", tooltip: "Spilleren er ferdig med å spille." },
};

export function buildSettingsFromTenant(tenant) {

  const settings = {
    timeSlotSize: tenant?.slotMinutes ?? 15,
    computers: devicesToComputers(tenant?.devices),
    statuses: STATUSES,
    tenant, // keep original too (displayName, authMode, etc.)
  };

  console.log("Built settings from tenant:", settings);
  return settings;
}
