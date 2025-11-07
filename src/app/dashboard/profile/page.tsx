// This page's content is now in the settings page.
// We redirect to the settings page to avoid duplication.
import { redirect } from 'next/navigation';

export default function ProfilePage() {
    redirect('/dashboard/settings');
}
