const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing old data for a fresh start...');
  
  // 1. Delete all existing records to ensure categories don't collide
  // We delete in order of dependency
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.dish.deleteMany({});
  await prisma.category.deleteMany({});
  // Keeping tables because they are likely fixed

  console.log('🌱 Seeding rich Indian menu with 5 categories...');

  // 2. Categories
  const catNames = ['Starters', 'Main Course', 'Breads & Naan', 'Desserts', 'Beverages'];
  const categories = {};

  for (const name of catNames) {
    categories[name] = await prisma.category.create({
      data: { name }
    });
  }

  // 3. Rich Dummy Dishes
  const dishes = [
    // Starters
    { name: 'Paneer Tikka', price: 210, description: 'Clay oven roasted cottage cheese with spices', cat: 'Starters', hasPortions: true, hPrice: 120, qPrice: 70 },
    { name: 'Chicken 65', price: 240, description: 'Spicy, deep-fried chicken tempered with curry leaves', cat: 'Starters' },
    { name: 'Crispy Corn', price: 160, description: 'Golden fried corn with peppers and spices', cat: 'Starters' },
    { name: 'Hara Bhara Kabab', price: 180, description: 'Spinach and pea patties with nutty crunch', cat: 'Starters' },
    
    // Main Course
    { name: 'Dal Makhani', price: 240, description: 'Slow cooked black lentils with cream and butter', cat: 'Main Course', hasPortions: true, hPrice: 140, qPrice: 80 },
    { name: 'Paneer Butter Masala', price: 280, description: 'Cottage cheese in rich tomato gravy', cat: 'Main Course', hasPortions: true, hPrice: 160, qPrice: 90 },
    { name: 'Butter Chicken', price: 320, description: 'Charcoal grilled chicken in creamy tomato sauce', cat: 'Main Course', hasPortions: true, hPrice: 190, qPrice: 110 },
    { name: 'Mix Veg Curry', price: 220, description: 'Seasonal vegetables in aromatic gravy', cat: 'Main Course' },
    
    // Breads
    { name: 'Butter Naan', price: 45, description: 'Soft leavened bread with butter', cat: 'Breads & Naan' },
    { name: 'Garlic Naan', price: 55, description: 'Leavened bread with garlic and herbs', cat: 'Breads & Naan' },
    { name: 'Tandoori Roti', price: 20, description: 'Whole wheat bread baked in clay oven', cat: 'Breads & Naan' },
    { name: 'Butter Kulcha', price: 65, description: 'Stuffing of potato and spices in soft bread', cat: 'Breads & Naan' },
    
    // Desserts
    { name: 'Gulab Jamun', price: 80, description: 'Deep fried milk solids in sugar syrup (2 pcs)', cat: 'Desserts' },
    { name: 'Rasmalai', price: 90, description: 'Soft cottage cheese balls in saffron milk', cat: 'Desserts' },
    { name: 'Vanilla Ice Cream', price: 70, description: 'Premium vanilla bean ice cream', cat: 'Desserts' },
    
    // Beverages
    { name: 'Masala Chai', price: 30, description: 'Indian tea with ginger and cardamom', cat: 'Beverages' },
    { name: 'Fresh Lime Soda', price: 60, description: 'Refreshing sweet and salty soda', cat: 'Beverages' },
    { name: 'Cold Coffee', price: 110, description: 'Creamy blended coffee with chocolate', cat: 'Beverages' }
  ];

  for (const d of dishes) {
    await prisma.dish.create({
      data: {
        name: d.name,
        price: d.price,
        description: d.description || null,
        categoryId: categories[d.cat].id,
        hasPortions: d.hasPortions || false,
        halfPrice: d.hPrice || null,
        quarterPrice: d.qPrice || null,
        imageUrl: `/api/images/${d.name.toLowerCase().replace(/ /g, '-')}`
      }
    });
  }

  // 4. Ensure Table 1 exists
  const table1 = await prisma.table.upsert({
    where: { tableNumber: 1 },
    update: {},
    create: {
      tableNumber: 1,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:3000/menu/demo-table-1`
    }
  });

  console.log('✅ Seeding completed. All old items replaced with rich Indian menu.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
