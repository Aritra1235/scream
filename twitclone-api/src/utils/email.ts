import { config } from "../config/index";
import Mailgun from "mailgun.js";
import FormData from "form-data";


interface SendEmailOptions {
    from: string;
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
}

async function sendEmail({ from, to, subject, text, html }: SendEmailOptions) {
    if (config.email.dontSendEmail === "true") {
        console.log("[Email] Skipping send (DONT_SEND_EMAIL is true)", { to, subject });
        return;
    }

    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
        username: "api",
        key: config.email.mailgunApiKey,
        url: "https://api.eu.mailgun.net"
    });
    try {
        const messageData: any = {
            from,
            to,
            subject,
        };

        if (text) {
            messageData.text = text;
        }

        if (html) {
            messageData.html = html;
        }

        console.log('Attempting to send email:', { 
            from, 
            to, 
            subject, 
            domain: config.email.mailgunDomain,
            hasApiKey: !!config.email.mailgunApiKey 
        });

        const data = await mg.messages.create(config.email.mailgunDomain, messageData);
        
        console.log('Email sent successfully:', { 
            id: data.id, 
            message: data.message 
        });
        
        return data;
    } catch (error) {
        console.error("Failed to send email - detailed error:", {
            error: error instanceof Error ? error.message : error,
            errorName: error instanceof Error ? error.name : 'Unknown',
            errorStack: error instanceof Error ? error.stack : 'No stack trace',
            mailgunDomain: config.email.mailgunDomain,
            hasApiKey: !!config.email.mailgunApiKey,
            messageData: { from, to, subject }
        });
        throw error;
    }
}

export default sendEmail;