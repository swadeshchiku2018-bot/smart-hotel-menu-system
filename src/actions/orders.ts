'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getOrders() {
  return prisma.order.findMany({
    include: {
      table: true,
      items: {
        include: { dish: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getHistoryOrders(dateStr: string) {
  const startOfDay = new Date(dateStr);
  const endOfDay = new Date(dateStr);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return prisma.order.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      table: true,
      items: {
        include: { dish: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateOrderStatus(orderId: string, status: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
  revalidatePath('/admin/orders');
  revalidatePath('/admin');
}

export async function createOrder(tableId: string, items: {dishId: string, quantity: number, price: number, portion?: string}[], customerPhone?: string, chefInstruction?: string) {
  try {
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order = await prisma.order.create({
      data: {
        tableId,
        customerPhone,
        chefInstruction,
        totalAmount,
        items: {
          create: items.map(item => ({
            dishId: item.dishId,
            quantity: item.quantity,
            price: item.price,
            portion: item.portion ?? 'Full',
          }))
        }
      }
    });
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { success: true, order };
  } catch (error: any) {
    console.error('Create Order Server Action Error:', error);
    return { success: false, error: error.message || 'Failed to place order' };
  }
}
