'use server';

import prisma from '@/lib/prisma';

export async function getSettings() {
  try {
    let settings = await (prisma as any).settings.findFirst();
    if (!settings) {
       settings = await (prisma as any).settings.create({
         data: { hotelName: 'LUXE DINING', adminUpiId: '', loginBgUrl: '' }
       });
    }
    return {
      hotelName: settings.hotelName,
      adminUpiId: settings.adminUpiId || '',
      loginBgUrl: settings.loginBgUrl && settings.loginBgUrl.startsWith('data:') 
        ? '/api/images/bg' 
        : (settings.loginBgUrl || '')
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
    let settings = await (prisma as any).settings.findFirst();
    if (!settings) {
       settings = await (prisma as any).settings.create({ data: { hotelName: 'LUXE DINING' } });
    }
    
    await (prisma as any).settings.update({
      where: { id: settings.id },
      data: newData
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
