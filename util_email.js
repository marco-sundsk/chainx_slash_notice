'use strict';
require("dotenv").config();

// const curTime = require("./common");
// const cfg = require("./config");
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    "host": process.env.email_host,
    "port": process.env.email_port,
    "secureConnection": process.env.email_ssl.toLowerCase() == 'true', // use SSL
    "auth": {
        "user": process.env.email_uid, // user name
        "pass": process.env.email_pwd  // password
    }
});

exports.sendMail = async function (title, body) {  // 发邮件
    console.log('title:', title, 'body:', body);
    let mailOptions = {
        from: process.env.email_from, // sender address mailfrom must be same with the user
        to: process.env.email_to, // list of receivers
        subject: title, // Subject line
        text: body, // plaintext body
    };
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: ' + info.response);
    } catch(err) {
        console.log(err);
    }
};