# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Firebase Configuration

This project is configured to use Firebase. To connect it to your own Firebase project, you need to provide your Firebase configuration in a `.env.local` file at the root of the project.

1.  Create a file named `.env.local`.
2.  Add the following environment variables with the values from your Firebase project's web app configuration:

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

You can find these values in your Firebase project settings under "General" -> "Your apps" -> "SDK setup and configuration".

After adding these values, restart your development server for the changes to take effect.
# formaafrique
# formaafrique
