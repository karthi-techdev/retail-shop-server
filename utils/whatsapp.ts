import twilio from 'twilio';

let client: twilio.Twilio | null = null;

const initTwilio = () => {
    if (!client) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        if (accountSid && authToken && accountSid !== 'AC_PLACEHOLDER') {
            client = twilio(accountSid, authToken);
        }
    }
};

const formatNumber = (mobile: string) => {
    // Strip all non-numeric characters first
    let cleanNumber = mobile.replace(/\D/g, '');

    // If it starts with a 10 digit number, assume it's Indian (+91)
    if (cleanNumber.length === 10) {
        return `+91${cleanNumber}`;
    }

    // Otherwise, just ensure it has a +
    return `+${cleanNumber}`;
};

export const sendWhatsAppMessage = async (toMobile: string, messageBody: string) => {
    initTwilio();
    const formattedNumber = formatNumber(toMobile);
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

        console.log(`[WhatsApp] Message sent successfully. SID: ${message.sid}`);
        return true;
    } catch (error: any) {
        console.error('--- TWILIO WHATSAPP ERROR START ---');
        console.error('Code:', error.code);
        console.error('Message:', error.message);
        console.error('More Info:', error.moreInfo);
        console.error('--- TWILIO WHATSAPP ERROR END ---');

        // We log the error but still throw to let the caller know
        throw new Error(`WhatsApp Failed: ${error.message}`);
    }
};

export const sendWhatsAppOTP = async (toMobile: string, otp: string) => {
    console.log(`\n\n---------------------------------`);
    console.log(`[RECOVERY LOG] Registration OTP for ${toMobile}: ${otp}`);
    console.log(`---------------------------------\n\n`);
    
    return sendWhatsAppMessage(toMobile, `Your Retail Shop OTP is: ${otp}`);
};

