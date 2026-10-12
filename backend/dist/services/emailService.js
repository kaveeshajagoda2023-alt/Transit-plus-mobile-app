import { Resend } from 'resend';
import { config } from '../config/index.js';
export async function sendPassengerVerificationCode(email, code) {
    if (!config.resendApiKey || !config.emailFrom) {
        throw new Error('EMAIL_NOT_CONFIGURED');
    }
    const resend = new Resend(config.resendApiKey);
    const { error } = await resend.emails.send({
        from: config.emailFrom,
        to: [email],
        subject: 'Your TransitPulse verification code',
        html: `<div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6"><h2>Verify your TransitPulse email</h2><p>Enter this code in the app to finish creating your account:</p><p style="font-size:30px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`,
        text: `Your TransitPulse verification code is ${code}. It expires in 10 minutes. If you did not request it, you can ignore this email.`,
    }, { signal: AbortSignal.timeout(10_000) });
    if (error) {
        throw new Error('EMAIL_DELIVERY_FAILED');
    }
}
