import { redirect } from 'next/navigation';

export default function Home() {
  // Default landing redirects straight to admin console
  redirect('/admin');
}
