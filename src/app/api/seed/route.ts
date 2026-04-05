import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (key !== 'hotel-seed-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await (prisma as any).orderItem.deleteMany({});
    await (prisma as any).order.deleteMany({});
    await (prisma as any).dish.deleteMany({});
    await (prisma as any).category.deleteMany({});

    const catNames = ['Starters', 'Main Course', 'Breads & Naan', 'Desserts', 'Beverages'];
    const categories: Record<string, any> = {};
    for (const name of catNames) {
      categories[name] = await (prisma as any).category.create({ data: { name } });
    }

    const dishes = [
      // Starters
      { name: 'Paneer Tikka', price: 210, description: 'Clay oven roasted cottage cheese with spices', cat: 'Starters', hasPortions: true, hPrice: 120, qPrice: 70,
        img: '/api/images/paneer-tikka' },
      { name: 'Chicken 65', price: 240, description: 'Spicy, deep-fried chicken tempered with curry leaves', cat: 'Starters',
        img: '/api/images/chicken-65' },
      { name: 'Crispy Corn', price: 160, description: 'Golden fried corn with peppers and spices', cat: 'Starters',
        img: '/api/images/crispy-corn' },
      { name: 'Hara Bhara Kabab', price: 180, description: 'Spinach and pea patties with nutty crunch', cat: 'Starters',
        img: '/api/images/hara-bhara-kabab' },

      // Main Course
      { name: 'Dal Makhani', price: 240, description: 'Slow cooked black lentils with cream and butter', cat: 'Main Course', hasPortions: true, hPrice: 140, qPrice: 80,
        img: '/api/images/dal-makhani' },
      { name: 'Paneer Butter Masala', price: 280, description: 'Cottage cheese in rich tomato gravy', cat: 'Main Course', hasPortions: true, hPrice: 160, qPrice: 90,
        img: '/api/images/paneer-butter-masala' },
      { name: 'Butter Chicken', price: 320, description: 'Charcoal grilled chicken in creamy tomato sauce', cat: 'Main Course', hasPortions: true, hPrice: 190, qPrice: 110,
        img: '/api/images/butter-chicken' },
      { name: 'Mix Veg Curry', price: 220, description: 'Seasonal vegetables in aromatic gravy', cat: 'Main Course',
        img: '/api/images/mix-veg-curry' },

      // Breads
      { name: 'Butter Naan', price: 45, description: 'Soft leavened bread with butter', cat: 'Breads & Naan',
        img: '/api/images/butter-naan' },
      { name: 'Garlic Naan', price: 55, description: 'Leavened bread with garlic and herbs', cat: 'Breads & Naan',
        img: '/api/images/garlic-naan' },
      { name: 'Tandoori Roti', price: 20, description: 'Whole wheat bread baked in clay oven', cat: 'Breads & Naan',
        img: '/api/images/tandoori-roti' },
      { name: 'Butter Kulcha', price: 65, description: 'Stuffed bread with potato and spices', cat: 'Breads & Naan',
        img: '/api/images/butter-kulcha' },

      // Desserts
      { name: 'Gulab Jamun', price: 80, description: 'Deep fried milk solids in sugar syrup (2 pcs)', cat: 'Desserts',
        img: '/api/images/gulab-jamun' },
      { name: 'Rasmalai', price: 90, description: 'Soft cottage cheese balls in saffron milk', cat: 'Desserts',
        img: '/api/images/rasmalai' },
      { name: 'Vanilla Ice Cream', price: 70, description: 'Premium vanilla bean ice cream', cat: 'Desserts',
        img: '/api/images/vanilla-ice-cream' },

      // Beverages
      { name: 'Masala Chai', price: 30, description: 'Indian tea with ginger and cardamom', cat: 'Beverages',
        img: '/api/images/masala-chai' },
      { name: 'Fresh Lime Soda', price: 60, description: 'Refreshing sweet and salty soda', cat: 'Beverages',
        img: '/api/images/fresh-lime-soda' },
      { name: 'Cold Coffee', price: 110, description: 'Creamy blended coffee with chocolate', cat: 'Beverages',
        img: '/api/images/cold-coffee' },
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
          imageUrl: d.img,
        }
      });
    }

    // Tables 1–10
    for (let i = 1; i <= 10; i++) {
      await (prisma as any).table.upsert({
        where: { tableNumber: i },
        update: {},
        create: { tableNumber: i }
      });
    }

    // Admin user
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
      message: '✅ Seeded! 18 dishes with photos, 10 tables, and admin user created.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
