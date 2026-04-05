import { readFileSync, existsSync } from 'fs';
import { NextResponse } from 'next/server';

const unsplashImages: Record<string, string> = {
  'hero': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200',
  'starters': 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&q=80&w=600',
  'main-course': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
  'breads-&-naan': 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=600',
  'desserts': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=600',
  'beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=600',
  'paneer-tikka': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600',
  'chicken-65': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&q=80&w=600',
  'crispy-corn': 'https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?auto=format&fit=crop&q=80&w=600',
  'hara-bhara-kabab': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600',
  'dal-makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
  'paneer-butter-masala': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
  'butter-chicken': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&q=80&w=600',
  'mix-veg-curry': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
  'butter-naan': 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&q=80&w=600',
  'garlic-naan': 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&q=80&w=600',
  'tandoori-roti': 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=600',
  'butter-kulcha': 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=600',
  'gulab-jamun': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=600',
  'rasmalai': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=600',
  'vanilla-ice-cream': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=600',
  'masala-chai': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=600',
  'fresh-lime-soda': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600',
  'cold-coffee': 'https://images.unsplash.com/photo-1530373239216-42518e6b4063?auto=format&fit=crop&q=80&w=600',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1514813836041-518668f092b1?auto=format&fit=crop&q=80&w=600';

export async function GET(request: Request, { params }: { params: { name: string } }) {
  const name = params.name;
  let url = unsplashImages[name];
  
  if (!url) {
    if (name.includes('paneer') || name.includes('starter') || name.includes('kabab')) url = unsplashImages['paneer-tikka'];
    else if (name.includes('dal') || name.includes('curry') || name.includes('masala')) url = unsplashImages['dal-makhani'];
    else if (name.includes('naan') || name.includes('roti') || name.includes('kulcha')) url = unsplashImages['butter-naan'];
    else url = DEFAULT_IMAGE;
  }
  
  return NextResponse.redirect(url);
}
