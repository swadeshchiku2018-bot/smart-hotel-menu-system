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
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Paneer_tikka.jpg/640px-Paneer_tikka.jpg' },
      { name: 'Chicken 65', price: 240, description: 'Spicy, deep-fried chicken tempered with curry leaves', cat: 'Starters',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Chicken_65_%28Chettinad_dish%29.jpg/640px-Chicken_65_%28Chettinad_dish%29.jpg' },
      { name: 'Crispy Corn', price: 160, description: 'Golden fried corn with peppers and spices', cat: 'Starters',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Indian-fried-corn.jpg/640px-Indian-fried-corn.jpg' },
      { name: 'Hara Bhara Kabab', price: 180, description: 'Spinach and pea patties with nutty crunch', cat: 'Starters',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Hara_bhara_kebab.jpg/640px-Hara_bhara_kebab.jpg' },

      // Main Course
      { name: 'Dal Makhani', price: 240, description: 'Slow cooked black lentils with cream and butter', cat: 'Main Course', hasPortions: true, hPrice: 140, qPrice: 80,
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Dal_makhani_recipe.jpg/640px-Dal_makhani_recipe.jpg' },
      { name: 'Paneer Butter Masala', price: 280, description: 'Cottage cheese in rich tomato gravy', cat: 'Main Course', hasPortions: true, hPrice: 160, qPrice: 90,
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Panneer_Butter_Masala.jpg/640px-Panneer_Butter_Masala.jpg' },
      { name: 'Butter Chicken', price: 320, description: 'Charcoal grilled chicken in creamy tomato sauce', cat: 'Main Course', hasPortions: true, hPrice: 190, qPrice: 110,
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Butter_Chicken.jpg/640px-Butter_Chicken.jpg' },
      { name: 'Mix Veg Curry', price: 220, description: 'Seasonal vegetables in aromatic gravy', cat: 'Main Course',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sabzi-mix-veg.jpg/640px-Sabzi-mix-veg.jpg' },

      // Breads
      { name: 'Butter Naan', price: 45, description: 'Soft leavened bread with butter', cat: 'Breads & Naan',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/NaanBread.jpg/640px-NaanBread.jpg' },
      { name: 'Garlic Naan', price: 55, description: 'Leavened bread with garlic and herbs', cat: 'Breads & Naan',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Garlic_Naan.jpg/640px-Garlic_Naan.jpg' },
      { name: 'Tandoori Roti', price: 20, description: 'Whole wheat bread baked in clay oven', cat: 'Breads & Naan',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/TandooriRotis.jpg/640px-TandooriRotis.jpg' },
      { name: 'Butter Kulcha', price: 65, description: 'Stuffed bread with potato and spices', cat: 'Breads & Naan',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Kulcha.jpg/640px-Kulcha.jpg' },

      // Desserts
      { name: 'Gulab Jamun', price: 80, description: 'Deep fried milk solids in sugar syrup (2 pcs)', cat: 'Desserts',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Gulab_jamun_%28Gibraltar%2C_November_2010%29.jpg/640px-Gulab_jamun_%28Gibraltar%2C_November_2010%29.jpg' },
      { name: 'Rasmalai', price: 90, description: 'Soft cottage cheese balls in saffron milk', cat: 'Desserts',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Ras-Malai.jpg/640px-Ras-Malai.jpg' },
      { name: 'Vanilla Ice Cream', price: 70, description: 'Premium vanilla bean ice cream', cat: 'Desserts',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer_%28Wouter_Hagens%29.jpg/640px-Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer_%28Wouter_Hagens%29.jpg' },

      // Beverages
      { name: 'Masala Chai', price: 30, description: 'Indian tea with ginger and cardamom', cat: 'Beverages',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Masala_Chai.JPG/640px-Masala_Chai.JPG' },
      { name: 'Fresh Lime Soda', price: 60, description: 'Refreshing sweet and salty soda', cat: 'Beverages',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Lime_soda.jpg/640px-Lime_soda.jpg' },
      { name: 'Cold Coffee', price: 110, description: 'Creamy blended coffee with chocolate', cat: 'Beverages',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/640px-A_small_cup_of_coffee.JPG' },
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
