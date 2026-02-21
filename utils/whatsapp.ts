import twilio from 'twilio';

let client: twilio.Twilio | null = null;

const initTwilio = () => {
    if (!client) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
        const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
        if (accountSid && authToken && accountSid !== 'AC_PLACEHOLDER') {
            client = twilio(accountSid, authToken);
        }
    }
};

const formatNumber = (mobile: any) => {
    // Ensure it's a string
    const mobileStr = (mobile || '').toString();

    // Strip all non-numeric characters first
    let cleanNumber = mobileStr.replace(/\D/g, '');

    console.log(`[WhatsApp] Formatting number: ${mobileStr} -> Clean: ${cleanNumber}`);

    // Remove leading 0 if present
    if (cleanNumber.startsWith('0')) {
        cleanNumber = cleanNumber.substring(1);
    }

    // If it's a 10 digit number, assume it's Indian (+91)
    if (cleanNumber.length === 10) {
        return `+91${cleanNumber}`;
    }

    // Otherwise, ensure it has a +
    return `+${cleanNumber}`;
};

export const sendWhatsAppMessage = async (toMobile: string, messageBody: string) => {
    initTwilio();
    const formattedNumber = formatNumber(toMobile);
    console.log(`[WhatsApp] Sending to: ${formattedNumber}`);

    // WhatsApp Sandbox mandates this exact number unless a Business profile is approved
    const twilioNumber = 'whatsapp:+14155238886';

    if (!client) {
        console.log(`\n\n[MOCK WhatsApp] -> Sent to ${formattedNumber}: ${messageBody}\n\n`);
        return true;
    }

    try {
        const message = await client.messages.create({
            body: messageBody,
            from: twilioNumber,
            to: `whatsapp:${formattedNumber}`
        });

        console.log(`[WhatsApp] Success! SID: ${message.sid}`);
        return true;
    } catch (error: any) {
        console.error('--- TWILIO ERROR ---', error.message);
        throw new Error(`WhatsApp Failed: ${error.message}`);
    }
};

export const sendWhatsAppOTP = async (toMobile: string, otp: string) => {
    // This is the absolute standard Twilio Sandbox Template
    // Pattern: "Your {{1}} code is {{2}}"
    const message = `Your Shop code is ${otp}`;

    console.log(`\n\n---------------------------------`);
    console.log(`[RECOVERY LOG] Registration OTP for ${toMobile}: ${otp}`);
    console.log(`---------------------------------\n\n`);

    return sendWhatsAppMessage(toMobile, message);
};
