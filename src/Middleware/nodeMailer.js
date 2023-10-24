

import nodemailer from 'nodemailer'
import { ADDRESS } from '../Config/env.config.js';


const { PORT } = ADDRESS
const SendLinkVerification = async (email, verificationToken, code) => {
  try {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Replace with the SMTP server hostname (e.g., smtp.gmail.com for Gmail)
      port: 587, // Replace with the port number of the SMTP server (e.g., 587 for Gmail)
      secure: false, // Set to true if the SMTP server requires a secure connection (e.g., true for Gmail)
      auth: {
        user: "dev.huydang@gmail.com", // Your email address
        pass: "ogqodogodpwwdjzv", // Your email password or application-specific password
      },
    });

    // Email content
    const mailOptions = {
      from: 'dev.huydang@gmail.com', // Địa chỉ email người gửi
      to: email, // Địa chỉ email người nhận
      subject: 'Xác nhận đăng ký tài khoản', // Tiêu đề email
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Thêm CSS vào email */
        body {
          font-family: Arial, sans-serif;
          background-color: #f6f6f6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #007bff;
          color: #ffffff;
          padding: 10px;
          text-align: center;
        }
        .content {
          background-color: #ffffff;
          padding: 20px;
          border-radius: 5px;
        }
        .button {
          display: block;
          width: 200px;
          margin: 20px auto;
          padding: 10px 20px;
          background-color: #007bff;
          color: #ffffff;
          text-align: center;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Xác nhận đăng ký tài khoản</h1>
        </div>
        <div class="content">
          <p>Vui lòng click vào liên kết dưới đây để xác nhận đăng ký tài khoản:</p>
          <a class="button" href="http://${PORT}:1234/api/auth/verification-email?token=${verificationToken}">Xác nhận đăng ký</a>
          <h1>Verification Code is: ${code}</h1>
          
        </div>
      </div>
    </body>
    </html>
  `, // Nội dung email
    };

    // Send the email
    await transporter.sendMail(mailOptions);


    console.log("Verification code email sent successfully");
  } catch (error) {
    console.error("Error sending verification code email: ", error.message);
    throw new Error("Error sending verification code email");
  }
};

const SendLinkRetsetPassword = async (email, verificationToken) => {
  try {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Replace with the SMTP server hostname (e.g., smtp.gmail.com for Gmail)
      port: 587, // Replace with the port number of the SMTP server (e.g., 587 for Gmail)
      secure: false, // Set to true if the SMTP server requires a secure connection (e.g., true for Gmail)
      auth: {
        user: "dev.huydang@gmail.com", // Your email address
        pass: "ogqodogodpwwdjzv", // Your email password or application-specific password
      },
    });

    // Email content
    const mailOptions = {
      from: 'dev.huydang@gmail.com', // Địa chỉ email người gửi
      to: email, // Địa chỉ email người nhận
      subject: 'Xác nhận đăng ký tài khoản', // Tiêu đề email
      html: `
 <!DOCTYPE html>
 <html>
 <head>
   <style>
     /* Thêm CSS vào email */
     body {
       font-family: Arial, sans-serif;
       background-color: #f6f6f6;
       margin: 0;
       padding: 0;
     }
     .container {
       max-width: 600px;
       margin: 0 auto;
       padding: 20px;
     }
     .header {
       background-color: #007bff;
       color: #ffffff;
       padding: 10px;
       text-align: center;
     }
     .content {
       background-color: #ffffff;
       padding: 20px;
       border-radius: 5px;
     }
     .button {
       display: block;
       width: 200px;
       margin: 20px auto;
       padding: 10px 20px;
       background-color: #007bff;
       color: #ffffff;
       text-align: center;
       text-decoration: none;
       border-radius: 5px;
     }
   </style>
 </head>
 <body>
   <div class="container">
     <div class="header">
       <h1>Forgot Password</h1>
     </div>
     <div class="content">
       <p>Bạn quên Mật khẩu, vui lòng Click vào đây để xác nhận Reset Password:</p>
       <a class="button" href="http://${PORT}:1234/auth/reset-password?token=${verificationToken}">Confirm</a>
     </div>
   </div>
 </body>
 </html>
`, // Nội dung email
    };

    // Send the email
    await transporter.sendMail(mailOptions);


    console.log("Verification code email sent successfully");
  } catch (error) {
    console.error("Error sending verification code email: ", error);
    throw new Error("Error sending verification code email");
  }
};

const Notifications = async (email) => {
  try {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Replace with the SMTP server hostname (e.g., smtp.gmail.com for Gmail)
      port: 587, // Replace with the port number of the SMTP server (e.g., 587 for Gmail)
      secure: false, // Set to true if the SMTP server requires a secure connection (e.g., true for Gmail)
      auth: {
        user: "dev.huydang@gmail.com", // Your email address
        pass: "ogqodogodpwwdjzv", // Your email password or application-specific password
      },
    });

    // Email content
    const mailOptions = {
      from: 'dev.huydang@gmail.com', // Địa chỉ email người gửi
      to: email, // Địa chỉ email người nhận
      subject: 'Đăng ký xác thực thành công', // Tiêu đề email
      html: `
 <!DOCTYPE html>
 <html>
 <head>
   <style>
     /* Thêm CSS vào email */
     body {
       font-family: Arial, sans-serif;
       background-color: #f6f6f6;
       margin: 0;
       padding: 0;
     }
     .container {
       max-width: 600px;
       margin: 0 auto;
       padding: 20px;
     }
     .header {
       background-color: #007bff;
       color: #ffffff;
       padding: 10px;
       text-align: center;
     }
     .content {
       background-color: #ffffff;
       padding: 20px;
       border-radius: 5px;
     }
     .button {
       display: block;
       width: 200px;
       margin: 20px auto;
       padding: 10px 20px;
       background-color: #007bff;
       color: #ffffff;
       text-align: center;
       text-decoration: none;
       border-radius: 5px;
     }
   </style>
 </head>
 <body>
   <div class="container">
     <div class="header">
       <h1>Xác nhận đăng ký tài khoản</h1>
     </div>
     <div class="content">
       <h3>Notifications: Xin chào ${email}</h3>
       <h2>Tài khoản của bạn đã được xác thực</h2>
       <a class="button" href="http://localhost:1234/api/auth/login">Đăng nhập</a>
       
     </div>
   </div>
 </body>
 </html>
`, // Nội dung email
    };

    // Send the email
    await transporter.sendMail(mailOptions);


    console.log("Verification code email sent successfully");
  } catch (error) {
    console.error("Error sending verification code email: ", error);
    throw new Error("Error sending verification code email");
  }
};




const generateRandomCode = () => {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export {
  SendLinkVerification,
  generateRandomCode,
  SendLinkRetsetPassword,
  Notifications
}