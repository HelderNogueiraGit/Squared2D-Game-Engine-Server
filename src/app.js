const server = require('./ServerManager.js');
const fs = require('fs');
const app = new server();
app.initialize();

const nodemailer = require('nodemailer');
const fileData = fs.readFileSync('src/email.txt', 'utf8');
let welcomeMessage = fs.readFileSync('src/welcome.txt', 'utf8');

welcomeMessage = welcomeMessage.replace("username", "Helder Nogueira");
welcomeMessage = welcomeMessage.replace("codepin", "446254123");
console.log("File: " + fileData);
const host = fileData.split(':')[0];
const user = fileData.split(':')[1];
const pass = fileData.split(':')[2];

// Create a transporter
let transporter = nodemailer.createTransport({
    host: '10.8.0.1',  // your SMTP host
    port: 587,                     // 587 for TLS, 465 for SSL
    secure: false,                 // true for 465, false for 587
    auth: {
        user: user, // your email
        pass: pass // your password or app password
    },
    tls: {
        rejectUnauthorized: false // Accept self-signed or mismatched SAN/CN
    }
});

let mailOptions = {
    from: '"Squared2D Account" squared2d@privguard.online',
    to: 'stuff@privguard.online',
    subject: 'Welcome! Verify Your Account',
    text: welcomeMessage
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Email sent: ' + info.response);
});

