'use server';

import fs from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'src', 'lib', 'settings.json');

function ensureSettingsFile() {
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, JSON.stringify({ hotelName: 'LUXE DINING', adminUpiId: '' }));
  }
}

export async function getSettings() {
  try {
    ensureSettingsFile();
    const data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    return {
      hotelName: data.hotelName || 'LUXE DINING',
      adminUpiId: data.adminUpiId || '',
      loginBgUrl: data.loginBgUrl || ''
    };
  } catch (e) {
    return { hotelName: 'LUXE DINING', adminUpiId: '', loginBgUrl: '' };
  }
}

export async function getHotelName() {
  const s = await getSettings();
  return s.hotelName;
}

export async function updateSettings(newData: { hotelName?: string, adminUpiId?: string, loginBgUrl?: string }) {
  try {
    ensureSettingsFile();
    const data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (newData.hotelName !== undefined) data.hotelName = newData.hotelName;
    if (newData.adminUpiId !== undefined) data.adminUpiId = newData.adminUpiId;
    if (newData.loginBgUrl !== undefined) data.loginBgUrl = newData.loginBgUrl;
    fs.writeFileSync(settingsPath, JSON.stringify(data));
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
