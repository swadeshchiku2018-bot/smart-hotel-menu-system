import LoginClient from './LoginClient';
import { getSettings } from '@/actions/settings';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const settings = await getSettings();
  
  return <LoginClient hotelName={settings.hotelName} loginBg={(settings as any).loginBgUrl} />;
}
