import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Simple security key to prevent abuse
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (key !== 'hotel-seed-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Clear existing menu data
    await (prisma as any).orderItem.deleteMany({});
    await (prisma as any).order.deleteMany({});
    await (prisma as any).dish.deleteMany({});
    await (prisma as any).category.deleteMany({});

    // Seed categories
    const catNames = ['Starters', 'Main Course', 'Breads & Naan', 'Desserts', 'Beverages'];
    const categories: Record<string, any> = {};
    for (const name of catNames) {
      categories[name] = await (prisma as any).category.create({ data: { name } });
    }

    // Seed dishes
    const dishes = [
      { name: 'Paneer Tikka', price: 210, description: 'Clay oven roasted cottage cheese with spices', cat: 'Starters', hasPortions: true, hPrice: 120, qPrice: 70 },
      { name: 'Chicken 65', price: 240, description: 'Spicy, deep-fried chicken tempered with curry leaves', cat: 'Starters' },
      { name: 'Crispy Corn', price: 160, description: 'Golden fried corn with peppers and spices', cat: 'Starters' },
      { name: 'Hara Bhara Kabab', price: 180, description: 'Spinach and pea patties with nutty crunch', cat: 'Starters' },
      { name: 'Dal Makhani', price: 240, description: 'Slow cooked black lentils with cream and butter', cat: 'Main Course', hasPortions: true, hPrice: 140, qPrice: 80 },
      { name: 'Paneer Butter Masala', price: 280, description: 'Cottage cheese in rich tomato gravy', cat: 'Main Course', hasPortions: true, hPrice: 160, qPrice: 90 },
      { name: 'Butter Chicken', price: 320, description: 'Charcoal grilled chicken in creamy tomato sauce', cat: 'Main Course', hasPortions: true, hPrice: 190, qPrice: 110 },
      { name: 'Mix Veg Curry', price: 220, description: 'Seasonal vegetables in aromatic gravy', cat: 'Main Course' },
      { name: 'Butter Naan', price: 45, description: 'Soft leavened bread with butter', cat: 'Breads & Naan' },
      { name: 'Garlic Naan', price: 55, description: 'Leavened bread with garlic and herbs', cat: 'Breads & Naan' },
      { name: 'Tandoori Roti', price: 20, description: 'Whole wheat bread baked in clay oven', cat: 'Breads & Naan' },
      { name: 'Butter Kulcha', price: 65, description: 'Stuffing of potato and spices in soft bread', cat: 'Breads & Naan' },
      { name: 'Gulab Jamun', price: 80, description: 'Deep fried milk solids in sugar syrup (2 pcs)', cat: 'Desserts' },
      { name: 'Rasmalai', price: 90, description: 'Soft cottage cheese balls in saffron milk', cat: 'Desserts' },
      { name: 'Vanilla Ice Cream', price: 70, description: 'Premium vanilla bean ice cream', cat: 'Desserts' },
      { name: 'Masala Chai', price: 30, description: 'Indian tea with ginger and cardamom', cat: 'Beverages' },
      { name: 'Fresh Lime Soda', price: 60, description: 'Refreshing sweet and salty soda', cat: 'Beverages' },
      { name: 'Cold Coffee', price: 110, description: 'Creamy blended coffee with chocolate', cat: 'Beverages' },
    ];

    for (const d of dishes) {
      await (prisma as any).dish.create({
        data: {
          name: d.name,
          price: d.price,
          description: d.description || null,
          categoryId: categories[d.cat].id,
          hasPortions: (d as any).hasPortions || false,
          halfPrice: (d as any).hPrice || null,
          quarterPrice: (d as any).qPrice || null,
        }
      });
    }

    // Seed tables 1–10
    for (let i = 1; i <= 10; i++) {
      await (prisma as any).table.upsert({
        where: { tableNumber: i },
        update: {},
        create: { tableNumber: i }
      });
    }

    // Seed default admin user
    const bcrypt = await import('bcryptjs');
    const existing = await (prisma as any).user.findFirst({ where: { name: 'admin' } });
    if (!existing) {
      const hashedPassword = bcrypt.hashSync('admin', 10);
      await (prisma as any).user.create({
        data: { name: 'admin', role: 'ADMIN', hashedPassword }
      });
    }

    return NextResponse.json({
      success: true,
      message: '✅ Database seeded! Categories, 18 dishes, 10 tables, and admin user created.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
