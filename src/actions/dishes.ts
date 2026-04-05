'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getDishes() {
  return prisma.dish.findMany({
    include: { category: true },
    orderBy: { categoryId: 'asc' }
  });
}

export async function addDish(data: {
  name: string;
  price: number;
  description?: string | null;
  categoryId: string;
  imageUrl?: string | null;
  hasPortions?: boolean;
  halfPrice?: number | null;
  quarterPrice?: number | null;
}) {
  try {
    const dish = await prisma.dish.create({
      data: {
        ...data,
        description: data.description?.trim() || null,
        imageUrl: data.imageUrl?.trim() || null,
      }
    });
    revalidatePath('/admin/menu');
    revalidatePath('/menu/[tableId]', 'page');
    return { success: true, dish };
  } catch (error: any) {
    console.error('Add Dish Server Action Error:', error);
    return { success: false, error: error.message || 'Failed to add dish' };
  }
}

export async function updateDish(id: string, data: {
  name?: string;
  price?: number;
  description?: string | null;
  imageUrl?: string | null;
  hasPortions?: boolean;
  halfPrice?: number | null;
  quarterPrice?: number | null;
}) {
  try {
    await prisma.dish.update({
      where: { id },
      data: {
        ...data,
        // Ensure empty strings are handled as null for optional fields
        description: data.description === '' ? null : data.description,
        imageUrl: data.imageUrl === '' ? null : data.imageUrl,
      }
    });
    revalidatePath('/admin/menu');
    revalidatePath('/menu/[tableId]', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Update Server Action Error:', error);
    return { success: false, error: error.message || 'Database update failed' };
  }
}

export async function toggleDishAvailability(id: string, isAvailable: boolean) {
  try {
    await prisma.dish.update({
      where: { id },
      data: { isAvailable }
    });
    revalidatePath('/admin/menu');
    revalidatePath('/menu/[tableId]', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Toggle Availability Error:', error);
    return { success: false, error: error.message || 'Failed to update availability' };
  }
}

export async function deleteDish(id: string) {
  try {
    await prisma.dish.delete({ where: { id } });
    revalidatePath('/admin/menu');
    revalidatePath('/menu/[tableId]', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Delete Dish Error:', error);
    return { success: false, error: error.message || 'Failed to delete dish' };
  }
}
