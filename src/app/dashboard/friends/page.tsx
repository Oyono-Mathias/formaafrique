// This file has been renamed to src/app/dashboard/team/page.tsx
// The new page will serve as a list of classmates from the same training program.
// This placeholder is left to avoid breaking changes if any other part of the system still references it.
// In a real scenario, you would set up a redirect or remove this file after ensuring all links are updated.

import { redirect } from 'next/navigation';

export default function OldFriendsPage() {
    redirect('/dashboard/team');
}
