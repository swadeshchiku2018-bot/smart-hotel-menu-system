'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export async function addCategory(name: string) {
  await prisma.category.create({ data: { name } });
  revalidatePath('/admin/menu');
  revalidatePath('/menu/[tableId]', 'page');
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin/menu');
  revalidatePath('/menu/[tableId]', 'page');
}
