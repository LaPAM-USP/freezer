import { initialDrawers, initialBoxes } from '../data/initialFreezerData';
import { LAB_MEMBERS } from '../data/constants';

const STORAGE_KEY = 'lapam_freezer_80_data_v1';
const MEMBERS_STORAGE_KEY = 'lapam_freezer_members_v1';

export function loadMembersData() {
  try {
    const saved = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load members from localStorage:', err);
  }
  return LAB_MEMBERS;
}

export function saveMembersData(members) {
  try {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
  } catch (err) {
    console.error('Failed to save members to localStorage:', err);
  }
}


export function loadFreezerData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.drawers) && Array.isArray(parsed.boxes)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load freezer data from localStorage:', err);
  }
  return {
    drawers: initialDrawers,
    boxes: initialBoxes,
  };
}

export function saveFreezerData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save freezer data to localStorage:', err);
  }
}

export function resetToInitialData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to reset storage:', err);
  }
  return {
    drawers: initialDrawers,
    boxes: initialBoxes,
  };
}

export function exportDataToJson(drawers, boxes) {
  const payload = {
    appName: "LaPAM Freezer -80 Inventory",
    version: "1.0",
    exportDate: new Date().toISOString(),
    drawers,
    boxes,
  };
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lapam-freezer-80-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportDataToCsv(boxes, drawers) {
  const headers = [
    "Spot Coordinate",
    "Drawer",
    "Row",
    "Column",
    "Box Name / Title",
    "Owner",
    "Category",
    "Biosafety Level",
    "Registration Date",
    "Expiry Date",
    "Occupied / Capacity",
    "Status",
    "Tags",
    "Description & Notes"
  ];

  const rows = boxes.map((b) => {
    return [
      `"${b.spotId}"`,
      b.drawer,
      b.row,
      b.col,
      `"${(b.title || '').replace(/"/g, '""')}"`,
      `"${(b.ownerName || '').replace(/"/g, '""')}"`,
      `"${(b.category || '').replace(/"/g, '""')}"`,
      `"${(b.biosafety || '').replace(/"/g, '""')}"`,
      `"${b.date || ''}"`,
      `"${b.expiryDate || ''}"`,
      `"${b.occupiedCount || 0}/${b.totalCapacity || 81}"`,
      `"${b.status || 'active'}"`,
      `"${(b.tags ? b.tags.join('; ') : '').replace(/"/g, '""')}"`,
      `"${((b.description || '') + ' ' + (b.notes || '')).replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lapam-freezer-80-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
