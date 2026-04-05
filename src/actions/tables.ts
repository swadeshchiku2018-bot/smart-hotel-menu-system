'use server';

import prisma from '@/lib/prisma';
import QRCode from 'qrcode';
import { revalidatePath } from 'next/cache';
import os from 'os';

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const ifaces of interfaces[name] || []) {
      if (ifaces.family === 'IPv4' && !ifaces.internal) {
        return ifaces.address;
      }
    }
  }
  return 'localhost';
}

export async function getTables() {
  return prisma.table.findMany({
    orderBy: { tableNumber: 'asc' }
  });
}

export async function addTable(tableNumber: number, baseUrl: string) {
  let smartBaseUrl = baseUrl;
  // Automatically fix the localhost QR Code bug for the user!
  if (process.env.NODE_ENV !== 'production' && baseUrl.includes('localhost')) {
    smartBaseUrl = `http://${getLocalIp()}:3000`;
  }

  const table = await prisma.table.create({
    data: { tableNumber }
  });
  
  // Generate QR Code URL
  // e.g., http://192.168.1.x:3000/menu/1
  const menuUrl = `${smartBaseUrl}/menu/${table.id}`;

  const qrCodeDataUrl = await QRCode.toDataURL(menuUrl);
  
  await prisma.table.update({
    where: { id: table.id },
    data: { qrCodeUrl: qrCodeDataUrl }
  });

  revalidatePath('/admin/tables');
}

export async function deleteTable(id: string) {
  await prisma.table.delete({ where: { id } });
  revalidatePath('/admin/tables');
}
