import cron from 'node-cron';
import productRepository from '../repository/productRepository';
import { sendWhatsAppMessage } from './whatsapp';
import { sendPushNotification } from './firebase';

let lastProcessedMinute = '';

export const startCronJobs = () => {
    // Run every minute to check if any user has a scheduled alert time: * * * * *
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        if (lastProcessedMinute === currentTime) {
            return;
        }
        lastProcessedMinute = currentTime;

        console.log(`Checking alerts for time: ${currentTime}`);

        try {
            const lowStockProducts = await productRepository.getLowStockProducts();
            const nearExpiryProducts = await productRepository.getNearExpiryProducts();

            // Store alerts grouped by userId and Category
            const userAlertsMap: {
                [userId: string]: {
                    user: any,
                    lowStock: string[],
                    expiring: string[],
                    expired: string[]
                }
            } = {};

            const addAlert = (user: any, category: 'lowStock' | 'expiring' | 'expired', item: string) => {
                const userId = user._id.toString();
                if (!userAlertsMap[userId]) {
                    userAlertsMap[userId] = { user, lowStock: [], expiring: [], expired: [] };
                }
                if (!userAlertsMap[userId][category].includes(item)) {
                    userAlertsMap[userId][category].push(item);
                }
            };

            // Process Low Stock
            lowStockProducts.forEach(product => {
                const user = product.user as any;
                const preferredTime = user.expiryAlertTime || '10:00';
                if (preferredTime === currentTime) {
                    addAlert(user, 'lowStock', `${product.name} (${product.availableUnits} units)`);
                }
            });

            // Process Near Expiry / Expired
            nearExpiryProducts.forEach(product => {
                const user = product.user as any;
                const alertDays = user.expiryAlertDays || 3;
                const preferredTime = user.expiryAlertTime || '10:00';

                if (preferredTime === currentTime) {
                    const expiry = new Date(product.expiryDate);
                    const diffTime = expiry.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const formatDate = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

                    if (diffDays <= 0) {
                        addAlert(user, 'expired', `${product.name} (${formatDate(expiry)})`);
                    } else if (diffDays <= alertDays) {
                        addAlert(user, 'expiring', `${product.name} in ${diffDays}d (${formatDate(expiry)})`);
                    }
                }
            });

            // Send combined messages for each user
            for (const userId in userAlertsMap) {
                const { user, lowStock, expiring, expired } = userAlertsMap[userId];

                const sections = [];
                if (lowStock.length > 0) sections.push(`*⚠️ Low Stock:* ${lowStock.join(', ')}`);
                if (expired.length > 0) sections.push(`*❌ EXPIRED:* ${expired.join(', ')}`);
                if (expiring.length > 0) sections.push(`*🕑 Expiring:* ${expiring.join(', ')}`);

                if (sections.length > 0) {
                    const combinedMessage = `*Retail Shop Expiry Alert Inventory Summary*\n\n` +
                        sections.join('\n\n');

                    if (user.whatsappNotifications) {
                        try {
                            await sendWhatsAppMessage(user.mobile, combinedMessage);
                        } catch (e) { console.error('WhatsApp Error:', e); }
                    }

                    if (user.pushNotifications && user.fcmToken) {
                        try {
                            await sendPushNotification(user.fcmToken, 'Inventory Alert 📋', combinedMessage);
                        } catch (e) { console.error('Push Error:', e); }
                    }
                }
            }
        } catch (error) {
            console.error('Error in cron job', error);
        }
    });
};
