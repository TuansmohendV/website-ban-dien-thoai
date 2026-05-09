import nodemailer from 'nodemailer';

export const sendEmailOTP = async (email, otp) => {
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

  console.log('\n==========================================');
  console.log(`--- EMAIL OTP: ${otp} ---`);
  console.log(`To: ${email}`);
  console.log(`EMAIL_USER: "${emailUser}" (length: ${emailUser.length})`);
  console.log(`EMAIL_PASS length: ${emailPass.length}`);
  console.log('==========================================\n');

  if (!emailUser || !emailPass) {
    console.error('⚠️  Thiếu EMAIL_USER hoặc EMAIL_PASS trong .env!');
    return true;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });

  const mailOptions = {
    from: `"PhoneSin Mobile" <${emailUser}>`,
    to: email,
    subject: 'Mã xác thực đăng nhập PhoneSin',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #008d71; margin: 0; font-size: 28px;">PhoneSin Mobile</h2>
          <p style="color: #666; margin: 8px 0 0 0;">Xác thực tài khoản</p>
        </div>
        <p style="color: #333;">Chào bạn,</p>
        <p style="color: #333;">Mã xác thực (OTP) của bạn là:</p>
        <div style="background: linear-gradient(135deg, #008d71, #00b894); padding: 20px; text-align: center; font-size: 36px; font-weight: bold; color: white; letter-spacing: 10px; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px;">Mã này có hiệu lực trong vòng <b>5 phút</b>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #aaa; text-align: center;">© PhoneSin Mobile - Email tự động, vui lòng không phản hồi.</p>
      </div>
    `,
  };

  // Gửi background - không block request
  transporter.sendMail(mailOptions)
    .then(() => console.log(`✅ Email OTP đã gửi thành công tới: ${email}`))
    .catch(err => console.error(`❌ Lỗi gửi email: [${err.code}] ${err.message}`));

  return true;
};

export const sendEmail = async ({ to, subject, html }) => {
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

  if (!emailUser || !emailPass) {
    console.error('⚠️ Thiếu EMAIL_USER hoặc EMAIL_PASS trong .env!');
    throw new Error('Email service is not configured.');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: `"PhoneSin Mobile" <${emailUser}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};
