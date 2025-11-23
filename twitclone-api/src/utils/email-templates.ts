
type EmailInput = {
    name?: string | null;
    appName?: string;
    supportEmail?: string;
};

type VerificationEmailInput = EmailInput & {
    verificationUrl: string;
    expiresInMinutes?: number;
};

type LoginNotificationInput = EmailInput & {
    time: string;
    ip?: string;
    device?: string;
    city?: string;
    country?: string;
};

const colors = {
    yellow: "#FFDE00",
    red: "#FF4D4D",
    teal: "#00F0FF",
    black: "#000000",
    white: "#FFFFFF",
    bg: "#F0F0F0",
};

const baseStyles = `
    font-family: 'Courier New', Courier, monospace; 
    color: ${colors.black}; 
    line-height: 1.5;
`;

const containerStyle = `
    background-color: ${colors.bg};
    padding: 40px 20px;
`;

const cardStyle = `
    max-width: 600px;
    margin: 0 auto;
    background-color: ${colors.white};
    border: 4px solid ${colors.black};
    box-shadow: 8px 8px 0px ${colors.black};
    padding: 0;
    overflow: hidden;
`;

const headerStyle = `
    background-color: ${colors.yellow};
    border-bottom: 4px solid ${colors.black};
    padding: 20px;
    text-align: center;
`;

const contentStyle = `
    padding: 30px;
`;

const buttonStyle = `
    display: inline-block;
    background-color: ${colors.teal};
    color: ${colors.black};
    text-decoration: none;
    font-weight: bold;
    padding: 15px 30px;
    border: 3px solid ${colors.black};
    box-shadow: 4px 4px 0px ${colors.black};
    text-transform: uppercase;
    font-size: 16px;
    margin-top: 20px;
`;

const footerStyle = `
    border-top: 4px solid ${colors.black};
    background-color: ${colors.white};
    padding: 20px;
    text-align: center;
    font-size: 12px;
    font-weight: bold;
`;

export const verificationEmailHtml = ({
    name,
    verificationUrl,
    appName = "SCREAM",
    supportEmail = "support@scream.aritra.ovh",
    expiresInMinutes = 30,
}: VerificationEmailInput) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; ${baseStyles}">
    <div style="${containerStyle}">
        <div style="${cardStyle}">
            <div style="${headerStyle}">
                <h1 style="margin: 0; font-size: 32px; text-transform: uppercase; letter-spacing: -1px;">${appName}</h1>
            </div>
            <div style="${contentStyle}">
                <h2 style="margin-top: 0; font-size: 24px; text-transform: uppercase; background-color: ${colors.red}; color: ${colors.white}; display: inline-block; padding: 5px 10px; border: 2px solid ${colors.black}; transform: rotate(-1deg);">
                    Verify Your Email
                </h2>
                <p style="font-size: 18px; margin-top: 20px;">
                    <strong>Hi ${name ? name.split(" ")[0] : "there"},</strong>
                </p>
                <p style="font-size: 16px;">
                    Thanks for signing up for <strong>${appName}</strong>! To get started, we need to verify your email address.
                </p>
                <p style="font-size: 16px;">
                    Click the button below to confirm your account.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="${buttonStyle}">
                        Verify My Email
                    </a>
                </div>
                <p style="font-size: 14px; border-left: 4px solid ${colors.black}; padding-left: 15px; margin-top: 30px;">
                    <em>This link expires in ${expiresInMinutes} minutes. If you didn't request this, you can safely ignore this email.</em>
                </p>
                <p style="font-size: 14px; margin-top: 20px;">
                    Having trouble with the button? Copy and paste this link into your browser:<br>
                    <a href="${verificationUrl}" style="color: ${colors.black}; text-decoration: underline; font-weight: bold; word-break: break-all;">${verificationUrl}</a>
                </p>
            </div>
            <div style="${footerStyle}">
                <p style="margin: 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                <p style="margin: 5px 0 0 0;">Need help? <a href="mailto:${supportEmail}" style="color: ${colors.black}; text-decoration: underline;">${supportEmail}</a></p>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const verificationEmailText = ({
    name,
    verificationUrl,
    appName = "SCREAM",
    expiresInMinutes = 30,
}: VerificationEmailInput) =>
    `Hi ${name || "there"},\n\nThanks for signing up for ${appName}! Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis link expires in ${expiresInMinutes} minutes.\n\nIf you didn't request this, you can safely ignore this email.\n\n— The ${appName} Team`;

export const loginNotificationEmailHtml = ({
    name,
    appName = "SCREAM",
    supportEmail = "support@scream.aritra.ovh",
    time,
    ip,
    device,
    city,
    country
}: LoginNotificationInput) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Login Detected</title>
</head>
<body style="margin: 0; padding: 0; ${baseStyles}">
    <div style="${containerStyle}">
        <div style="${cardStyle}">
            <div style="${headerStyle}">
                <h1 style="margin: 0; font-size: 32px; text-transform: uppercase; letter-spacing: -1px;">${appName}</h1>
            </div>
            <div style="${contentStyle}">
                <h2 style="margin-top: 0; font-size: 24px; text-transform: uppercase; background-color: ${colors.teal}; color: ${colors.black}; display: inline-block; padding: 5px 10px; border: 2px solid ${colors.black}; transform: rotate(1deg);">
                    New Login Detected
                </h2>
                <p style="font-size: 18px; margin-top: 20px;">
                    <strong>Hi ${name ? name.split(" ")[0] : "there"},</strong>
                </p>
                <p style="font-size: 16px;">
                    We detected a new login to your <strong>${appName}</strong> account.
                </p>
                
                <div style="background-color: ${colors.yellow}; border: 3px solid ${colors.black}; padding: 20px; margin: 20px 0; box-shadow: 4px 4px 0px ${colors.black};">
                    <p style="margin: 5px 0;"><strong>⏰ Time:</strong> ${time}</p>
                    <p style="margin: 5px 0;"><strong>🌐 IP Address:</strong> ${ip || 'Unknown'}</p>
                    ${(city || country) ? `<p style="margin: 5px 0;"><strong>📍 Location:</strong> ${city ? city + (country ? ', ' : '') : ''}${country || ''}</p>` : ''}
                    ${device ? `<p style="margin: 5px 0;"><strong>📱 Device:</strong> ${device}</p>` : ''}
                </div>

                <p style="font-size: 16px;">
                    If this was you, no action is needed. You can safely ignore this email.
                </p>
                <p style="font-size: 16px; font-weight: bold; color: ${colors.red};">
                    If this wasn't you, please change your password immediately.
                </p>
            </div>
            <div style="${footerStyle}">
                <p style="margin: 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                <p style="margin: 5px 0 0 0;">Need help? <a href="mailto:${supportEmail}" style="color: ${colors.black}; text-decoration: underline;">${supportEmail}</a></p>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const loginNotificationEmailText = ({
    name,
    appName = "SCREAM",
    time,
    ip,
    city,
    country,
}: LoginNotificationInput) => {
    const location = (city || country) ? `${city ? city + (country ? ', ' : '') : ''}${country || ''}` : 'Unknown';

    return `Hi ${name || "there"},\n\nWe detected a new login to your ${appName} account.\n\nTime: ${time}\nIP Address: ${ip || 'Unknown'}\nLocation: ${location}\n\nIf this wasn't you, please change your password immediately.\n\n— The ${appName} Team`;
};
