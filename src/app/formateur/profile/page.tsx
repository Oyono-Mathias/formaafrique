// This is a placeholder file for the profile page.
// We will implement this in a future step.
import { redirect } from 'next/navigation';

export default function FormateurProfilePage() {
    // This page's content is now in the settings page.
    // We redirect to the settings page to avoid duplication.
    redirect('/formateur/settings');
}
