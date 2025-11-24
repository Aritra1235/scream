import { config } from "../config/index";

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

    const form = new FormData();

    const toValue = Array.isArray(to) ? to.join(",") : to;

    form.append("from", from);
    form.append("to", toValue);
    form.append("subject", subject);

    if (text) {
        form.append("text", text);
    }

    if (html) {
        form.append("html", html);
    }

    const authHeader = typeof btoa === "function"
        ? btoa(`api:${config.email.mailgunApiKey}`)
        : Buffer.from(`api:${config.email.mailgunApiKey}`).toString("base64");

    try {
        const response = await fetch(`https://api.eu.mailgun.net/v3/${config.email.mailgunDomain}/messages`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${authHeader}`,
            },
            body: form,
        });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => "");
            console.error("Failed to send email via Mailgun API", {
                status: response.status,
                statusText: response.statusText,
                body: errorBody,
            });
            throw new Error(`Mailgun API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json().catch(() => null);

        console.log("Email sent successfully via Mailgun API", {
            status: response.status,
            id: (data as any)?.id,
            message: (data as any)?.message,
        });

        return data;
    } catch (error) {
        console.error("Failed to send email via Mailgun API", {
            error: error instanceof Error ? error.message : error,
        });
        throw error;
    }
}

export default sendEmail;


