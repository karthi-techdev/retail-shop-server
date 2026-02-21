import * as admin from 'firebase-admin';

// Initialize Firebase Admin with dummy/empty config if env var isn't set yet.
// In production, you would set process.env.FIREBASE_SERVICE_ACCOUNT to a JSON string or path.
let initialized = false;

export const initFirebaseAdmin = () => {
    if (initialized) return;

    try {
        const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

        if (serviceAccountStr && serviceAccountStr !== 'PLACEHOLDER') {
            const serviceAccount = JSON.parse(serviceAccountStr);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            initialized = true;
            console.log('Firebase Admin SDK initialized successfully');
        } else {
            console.warn('Firebase Admin SDK not initialized: Missing FIREBASE_SERVICE_ACCOUNT_JSON');
        }
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
    }
};

export const sendPushNotification = async (fcmToken: string, title: string, body: string) => {
    initFirebaseAdmin();

    if (!initialized) {
        console.log(`\n\n[MOCK PUSH NOTIFICATION] -> Sent to token [${fcmToken.substring(0, 10)}...]: ${title} - ${body}\n\n`);
        return true;
    }

    try {
        const message = {
            notification: {
                title,
                body,
            },
            token: fcmToken,
        };

        const response = await admin.messaging().send(message);
        console.log(`Push notification sent successfully: ${response}`);
        return true;
    } catch (error) {
        console.error('Firebase messaging error:', error);
        throw new Error('Could not send push notification');
    }
};
