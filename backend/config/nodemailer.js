/*Person in charge: Heng Jun Kai TP077223*/
// Description 
/*Created On: 04/08/2025 */
/*Edited On: 04/08/2025 */

/**
 * TECHNOLOGY: Nodemailer
 * 
 * Nodemailer is a Node.js email library for sending emails via SMTP.
 * Features: SMTP transport, HTML emails, attachments, TLS security
 * 
 * This config uses Brevo SMTP service for reliable email delivery.
 * Used for: registration confirmations, password resets, notifications
 */

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: "903c88001@smtp-brevo.com",
        pass: "TbMB0IsnxyjRNW75",
    },
});

export default transporter;