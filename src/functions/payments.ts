/**
 * @fileoverview Cloud Functions for handling payment-related events.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const db = admin.firestore();

// Initialize Stripe with your secret key.
// IMPORTANT: Store your secret key in Firebase environment variables.
const stripe = new Stripe(functions.config().stripe.secret_key, {
    apiVersion: '2024-04-10',
});

/**
 * =====================================================================================
 * D) onDonationWebhook - Secure webhook for payment gateways.
 * =====================================================================================
 * @description An HTTPS endpoint to receive webhook events from Stripe (or another
 * payment provider). It verifies the event signature and updates Firestore accordingly.
 *
 * @usage This URL is provided to the payment gateway's webhook configuration.
 */
export const onDonationWebhook = functions
    .region('europe-west1')
    .https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = functions.config().stripe.webhook_secret;

    if (!sig || !webhookSecret) {
        console.error("Webhook secret or signature missing.");
        res.status(400).send('Webhook Error: Configuration missing.');
        return;
    }

    let event: Stripe.Event;

    try {
        // 1. Validate Signature: Verify the event came from Stripe.
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Metadata should contain the firestore donationId we created on the client
        const donationId = session.metadata?.donationId;
        const courseId = session.metadata?.courseId;

        if (!donationId || !courseId) {
             console.error("Metadata missing donationId or courseId in session:", session.id);
             res.status(400).send('Metadata missing.');
             return;
        }

        try {
            // 2. Update Firestore document
            const donationRef = db.doc(`donations/${donationId}`);
            const courseRef = db.doc(`formations/${courseId}`);
            const courseSnap = await courseRef.get();
            const authorId = courseSnap.data()?.authorId;
            const formateurStatsRef = db.doc(`formateur_stats/${authorId}`);

            const batch = db.batch();
            batch.update(donationRef, { statut: 'succes', transactionId: session.id });
            batch.update(formateurStatsRef, { totalRevenue: admin.firestore.FieldValue.increment(session.amount_total! / 100) });
            
            await batch.commit();
            console.log(`Donation ${donationId} successfully marked as 'succes'.`);
        } catch(error) {
            console.error(`Error updating donation ${donationId}:`, error);
            res.status(500).send('Internal server error while updating donation.');
            return;
        }
    }

    // 3. Respond to Stripe to acknowledge receipt of the event
    res.status(200).json({ received: true });
});
