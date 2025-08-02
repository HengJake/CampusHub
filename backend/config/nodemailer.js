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