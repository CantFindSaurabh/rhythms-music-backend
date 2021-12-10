const sgMail = require('@sendgrid/mail')
const sendGridApiKey = process.env.SEND_GRID_API_KEY;

sgMail.setApiKey(sendGridApiKey);

const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
}

const sendWelcomeMail = async (name, email) => {
    try {
        await sgMail.send({
            to: email,
            from: "hackitsaurabh@gmail.com",
            subject: "Welcome to Rhythms",
            html: `<h3>Welcome ${name}</h3>`
        })
    } catch (e) {
        console.log(e);
        setTimeout(() => {
            sendOtpMail();
        }, 100000)
    }
}

const sendSignUpOtpMail = async email => {
    const otp = generateOtp();

    try {
        await sgMail.send({
            to: email,
            from: "hackitsaurabh@gmail.com",
            subject: "Otp for Signup",
            html: `<h3>${otp}</h3>`
        })
    } catch (e) {
        sendSignUpOtpMail()
    }

    return otp;
}

const sendForgotPassOtpMail = async email => {
    const otp = generateOtp();

    try {
        await sgMail.send({
            to: email,
            from: "hackitsaurabh@gmail.com",
            subject: "Otp for password change",
            html: `<h3>${otp}</h3>`
        })
    } catch (e) {
        console.log(e);
        setTimeOut(() => {
            sendOtpMail();
        }, 100000)
    }

    return otp;
}

module.exports = {
    welcome: sendWelcomeMail,
    sendSignUpOtp: sendSignUpOtpMail,
    sendForgotPassOtp: sendForgotPassOtpMail,
}