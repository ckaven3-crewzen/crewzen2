import { redirect } from 'next/navigation';

export default function PublicLandingPage() {
  // Redirect to Login as the main entry point
  redirect('/login');
} 