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
      // Starters — real food photos from Unsplash
      { name: 'Paneer Tikka', price: 210, description: 'Clay oven roasted cottage cheese with spices', cat: 'Starters', hasPortions: true, hPrice: 120, qPrice: 70,
        img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80' },
      { name: 'Chicken 65', price: 240, description: 'Spicy, deep-fried chicken tempered with curry leaves', cat: 'Starters',
        img: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&q=80' },
      { name: 'Crispy Corn', price: 160, description: 'Golden fried corn with peppers and spices', cat: 'Starters',
        img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80' },
      { name: 'Hara Bhara Kabab', price: 180, description: 'Spinach and pea patties with nutty crunch', cat: 'Starters',
        img: 'https://images.unsplash.com/photo-1630409351241-e90e7f1b1a3e?w=400&q=80' },

      // Main Course
      { name: 'Dal Makhani', price: 240, description: 'Slow cooked black lentils with cream and butter', cat: 'Main Course', hasPortions: true, hPrice: 140, qPrice: 80,
        img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80' },
      { name: 'Paneer Butter Masala', price: 280, description: 'Cottage cheese in rich tomato gravy', cat: 'Main Course', hasPortions: true, hPrice: 160, qPrice: 90,
        img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80' },
      { name: 'Butter Chicken', price: 320, description: 'Charcoal grilled chicken in creamy tomato sauce', cat: 'Main Course', hasPortions: true, hPrice: 190, qPrice: 110,
        img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80' },
      { name: 'Mix Veg Curry', price: 220, description: 'Seasonal vegetables in aromatic gravy', cat: 'Main Course',
        img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },

      // Breads
      { name: 'Butter Naan', price: 45, description: 'Soft leavened bread with butter', cat: 'Breads & Naan',
        img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80' },
      { name: 'Garlic Naan', price: 55, description: 'Leavened bread with garlic and herbs', cat: 'Breads & Naan',
        img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80' },
      { name: 'Tandoori Roti', price: 20, description: 'Whole wheat bread baked in clay oven', cat: 'Breads & Naan',
        img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
      { name: 'Butter Kulcha', price: 65, description: 'Stuffed bread with potato and spices', cat: 'Breads & Naan',
        img: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80' },

      // Desserts
      { name: 'Gulab Jamun', price: 80, description: 'Deep fried milk solids in sugar syrup (2 pcs)', cat: 'Desserts',
        img: 'https://images.unsplash.com/photo-1666411237194-bf4178bc63f4?w=400&q=80' },
      { name: 'Rasmalai', price: 90, description: 'Soft cottage cheese balls in saffron milk', cat: 'Desserts',
        img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80' },
      { name: 'Vanilla Ice Cream', price: 70, description: 'Premium vanilla bean ice cream', cat: 'Desserts',
        img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80' },

      // Beverages
      { name: 'Masala Chai', price: 30, description: 'Indian tea with ginger and cardamom', cat: 'Beverages',
        img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
      { name: 'Fresh Lime Soda', price: 60, description: 'Refreshing sweet and salty soda', cat: 'Beverages',
        img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80' },
      { name: 'Cold Coffee', price: 110, description: 'Creamy blended coffee with chocolate', cat: 'Beverages',
        img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
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
