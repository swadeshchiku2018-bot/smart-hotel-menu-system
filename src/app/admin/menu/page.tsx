import { getDishes } from '@/actions/dishes';
import { getCategories } from '@/actions/categories';
import MenuClient from './MenuClient';

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const dishes = await getDishes();
  const categories = await getCategories();
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Menu Management</h1>
        <p className="text-slate-500 mt-2">Add, edit, or remove dishes and categorize them.</p>
      </div>
      
      <MenuClient initialDishes={dishes} initialCategories={categories} />
    </div>
  );
}
