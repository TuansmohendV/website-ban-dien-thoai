import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

const parseBoolean = (value) =>
  String(value || '')
    .trim()
    .toLowerCase() === 'true';

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  // If using Gmail specifically (common for dev/small projects)
  if (!host && user && user.includes('gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  if (host && port && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: parseBoolean(process.env.SMTP_SECURE) || port === 465,
      auth: { user, pass },
    });
  }

  // Dev fallback: mail payload is generated and logged only.
  return nodemailer.createTransport({ jsonTransport: true });
};

export const sendResetOtpEmail = async ({ to, otpCode, expiresAt }) => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@phonesin.vn';
  const expiresText = new Date(expiresAt).toLocaleString('vi-VN');

  const subject = 'PhoneSin - Ma xac thuc doi mat khau';
  const text = `Ma OTP cua ban la: ${otpCode}. Ma co hieu luc den ${expiresText}.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2>Khoi phuc mat khau PhoneSin</h2>
      <p>Ban vua yeu cau doi mat khau. Su dung ma OTP ben duoi:</p>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 20px 0;">${otpCode}</div>
      <p>Ma co hieu luc den <strong>${expiresText}</strong>.</p>
      <p style="color: #666;">Neu ban khong yeu cau, vui long bo qua email nay.</p>
    </div>
  `;

  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to,
      from,
      subject,
      text,
      html,
    });

    return { provider: 'sendgrid' };
  }

  const transporter = createTransporter();
  const info = await transporter.sendMail({ from, to, subject, text, html });

  if (!process.env.SMTP_HOST && !process.env.SENDGRID_API_KEY) {
    console.log(`[DEV_MAIL] OTP for ${to}: ${otpCode}`);
  }

  return info;
};
export const sendOrderConfirmationEmail = async ({ to, order, websiteUrl = 'http://localhost:5173' }) => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'no-reply@phonesin.vn';
  const subject = `PhoneSin - Xác nhận đơn hàng #${order._id.toString().slice(-6).toUpperCase()}`;

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br/>
        <small style="color: #666;">${item.selectedColor || ''} ${item.selectedStorage || ''}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.lineTotal)}</td>
    </tr>
  `).join('');

  const statusUrl = `${websiteUrl}/orders`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #ee0000; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">PhoneSin</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-top: 0;">Chào ${order.customerInfo.fullName},</h2>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          Cảm ơn bạn đã mua hàng và tin tưởng <strong>PhoneSin</strong>. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
        </p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; font-size: 14px; color: #888; text-transform: uppercase;">Thông tin đơn hàng</h3>
          <p style="margin: 5px 0;">Mã đơn hàng: <strong>#${order._id}</strong></p>
          <p style="margin: 5px 0;">Ngày đặt: ${new Date(order.createdAt).toLocaleString('vi-VN')}</p>
          <p style="margin: 5px 0;">Phương thức: ${order.paymentMethod}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="padding: 10px; text-align: left; font-size: 13px;">Sản phẩm</th>
              <th style="padding: 10px; text-align: center; font-size: 13px;">SL</th>
              <th style="padding: 10px; text-align: right; font-size: 13px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            ${order.discountTotal > 0 ? `
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; color: #666;">Giảm giá:</td>
              <td style="padding: 10px; text-align: right; color: #ee0000;">-${formatPrice(order.discountTotal)}</td>
            </tr>` : ''}
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; font-size: 16px;">Tổng cộng:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px; color: #ee0000;">${formatPrice(order.total)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${statusUrl}" style="background-color: #009981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Xem trạng thái đơn hàng
          </a>
        </div>

        <p style="margin-top: 40px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px;">
          Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ hotline <strong>1900.2091</strong> hoặc phản hồi email này.<br/>
          Trân trọng,<br/>
          Đội ngũ PhoneSin
        </p>
      </div>
    </div>
  `;

  const text = `Cảm ơn bạn đã mua hàng tại PhoneSin. Đơn hàng #${order._id} của bạn có tổng giá trị ${formatPrice(order.total)}. Xem trạng thái tại: ${statusUrl}`;

  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({ to, from, subject, text, html });
    return { provider: 'sendgrid' };
  }

  const transporter = createTransporter();
  const info = await transporter.sendMail({ from, to, subject, text, html });
  return info;
};

export const sendOrderStatusEmail = async ({ to, order, websiteUrl = 'http://localhost:5173' }) => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'no-reply@phonesin.vn';
  const subject = `PhoneSin - Cập nhật trạng thái đơn hàng #${order._id.toString().slice(-6).toUpperCase()}`;

  const statusMap = {
    'pending': 'Chờ xác nhận',
    'confirmed': 'Đã xác nhận',
    'processing': 'Đang lấy hàng',
    'packing': 'Đang đóng gói',
    'shipping': 'Đang giao hàng',
    'delivered': 'Đã giao thành công',
    'cancelled': 'Đã hủy'
  };

  const currentStatus = statusMap[order.status] || order.status;
  const statusUrl = `${websiteUrl}/orders`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #008d71; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Cập Nhật Đơn Hàng</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-top: 0;">Chào ${order.customerInfo.fullName},</h2>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          Trạng thái đơn hàng <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> của bạn vừa được cập nhật thành:
        </p>
        <div style="background-color: #f8fafc; border-left: 4px solid #008d71; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0; color: #008d71; font-size: 20px;">${currentStatus}</h3>
        </div>
        <p style="font-size: 15px; color: #666;">
          Bạn có thể theo dõi chi tiết hành trình đơn hàng bằng cách nhấp vào nút bên dưới:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${statusUrl}" style="background-color: #008d71; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Xem Trạng Thái Đơn Hàng</a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
        <p style="font-size: 13px; color: #999; text-align: center;">
          Cảm ơn bạn đã tin tưởng và mua sắm tại PhoneSin!
        </p>
      </div>
    </div>
  `;

  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({ to, from, subject, html });
    return { provider: 'sendgrid' };
  }

  const transporter = createTransporter();
  const info = await transporter.sendMail({ from, to, subject, html });

  if (!process.env.SMTP_HOST && !process.env.SENDGRID_API_KEY) {
    console.log(`[DEV_MAIL] Order status update for ${to} to ${order.status}`);
  }

  return info;
};
export const sendDeliveredInvoiceEmail = async ({ to, order, websiteUrl = 'http://localhost:5173' }) => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'no-reply@phonesin.vn';
  const orderId = order._id.toString();
  const shortId = orderId.slice(-6).toUpperCase();
  const subject = `PhoneSin - Cảm ơn bạn đã nhận hàng! Hóa đơn đơn #${shortId} đã sẵn sàng`;

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  const invoiceUrl = `${websiteUrl}/invoice/${orderId}`;
  const ordersUrl = `${websiteUrl}/orders`;

  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding:10px 12px; border-bottom:1px solid #f0f0f0; font-size:14px; color:#333;">
        <strong>${item.name}</strong><br/>
        <small style="color:#888;">${item.selectedColor || ''} ${item.selectedStorage || ''}</small>
      </td>
      <td style="padding:10px 12px; border-bottom:1px solid #f0f0f0; text-align:center; font-size:14px; color:#555;">x${item.quantity}</td>
      <td style="padding:10px 12px; border-bottom:1px solid #f0f0f0; text-align:right; font-size:14px; font-weight:bold; color:#222;">${formatPrice(item.lineTotal)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:620px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#ee0000,#cc0000); padding:32px 24px; text-align:center;">
        <h1 style="margin:0; color:#fff; font-size:26px; font-weight:900; letter-spacing:-0.5px;">PhoneSin</h1>
        <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">Cửa hàng điện thoại uy tín hàng đầu</p>
      </div>

      <!-- Body -->
      <div style="padding:36px 32px;">

        <!-- Thank you -->
        <div style="text-align:center; margin-bottom:28px;">
          <div style="font-size:48px; margin-bottom:12px;">🎉</div>
          <h2 style="margin:0 0 8px; color:#111; font-size:22px; font-weight:900;">Cảm ơn bạn đã đặt hàng tại PhoneSin!</h2>
          <p style="margin:0; font-size:15px; color:#555; line-height:1.7;">
            Đơn hàng <strong style="color:#ee0000;">#${shortId}</strong> của bạn đã được giao thành công và thanh toán hoàn tất.<br/>
            Đây là hóa đơn của bạn — bạn có thể <strong>xem và xuất hóa đơn</strong> bất cứ lúc nào.
          </p>
        </div>

        <!-- Invoice CTA -->
        <div style="background:#fff7f7; border:2px solid #fee2e2; border-radius:12px; padding:24px; text-align:center; margin-bottom:28px;">
          <p style="margin:0 0 4px; font-size:12px; font-weight:700; color:#ee0000; text-transform:uppercase; letter-spacing:1px;">Hóa Đơn Điện Tử</p>
          <p style="margin:0 0 16px; font-size:14px; color:#666;">Nhấn nút bên dưới để xem hóa đơn chi tiết và in/lưu PDF của bạn</p>
          <a href="${invoiceUrl}" style="display:inline-block; background:#ee0000; color:#fff; font-size:15px; font-weight:900; padding:14px 32px; border-radius:10px; text-decoration:none; letter-spacing:0.5px;">
            🧾 Xem &amp; Xuất Hóa Đơn
          </a>
        </div>

        <!-- Order summary -->
        <div style="background:#f9fafb; border-radius:10px; padding:20px; margin-bottom:24px;">
          <p style="margin:0 0 12px; font-size:11px; font-weight:700; color:#999; text-transform:uppercase; letter-spacing:1px;">Tóm tắt đơn hàng</p>
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:#f0f0f0;">
                <th style="padding:10px 12px; text-align:left; font-size:12px; color:#666; font-weight:700;">Sản phẩm</th>
                <th style="padding:10px 12px; text-align:center; font-size:12px; color:#666; font-weight:700;">SL</th>
                <th style="padding:10px 12px; text-align:right; font-size:12px; color:#666; font-weight:700;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px 12px 4px; text-align:right; font-size:15px; font-weight:900; color:#111;">Tổng thanh toán:</td>
                <td style="padding:12px 12px 4px; text-align:right; font-size:18px; font-weight:900; color:#ee0000;">${formatPrice(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Track order -->
        <div style="text-align:center; margin-bottom:24px;">
          <a href="${ordersUrl}" style="display:inline-block; background:#f3f4f6; color:#333; font-size:13px; font-weight:700; padding:12px 24px; border-radius:8px; text-decoration:none;">
            📦 Xem lịch sử đơn hàng
          </a>
        </div>

        <!-- Footer note -->
        <div style="border-top:1px solid #f0f0f0; padding-top:20px; text-align:center;">
          <p style="margin:0; font-size:12px; color:#aaa; line-height:1.8;">
            Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline <strong style="color:#555;">1900.2091</strong><br/>
            hoặc trả lời trực tiếp email này.<br/>
            Trân trọng, <strong style="color:#ee0000;">Đội ngũ PhoneSin</strong>
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `Cảm ơn bạn đã đặt hàng tại PhoneSin! Đơn hàng #${shortId} đã giao thành công. Xem hóa đơn tại: ${invoiceUrl}`;

  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({ to, from, subject, text, html });
    return { provider: 'sendgrid' };
  }

  const transporter = createTransporter();
  const info = await transporter.sendMail({ from, to, subject, text, html });

  if (!process.env.SMTP_HOST && !process.env.SENDGRID_API_KEY) {
    console.log(`[DEV_MAIL] Invoice email sent to ${to} for order ${orderId}`);
  }

  return info;
};

export const sendMarketingEmail = async ({ to, subject, title, content, buttonText = 'Xem ngay', buttonUrl }) => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'no-reply@phonesin.vn';
  const websiteUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const targetUrl = buttonUrl || websiteUrl;

  const html = `
    <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:620px; margin:0 auto; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
      <div style="background:#008d71; color:#fff; padding:24px; text-align:center;">
        <h1 style="margin:0; font-size:24px;">PhoneSin Mobile</h1>
      </div>
      <div style="padding:30px;">
        <h2 style="margin:0 0 14px; color:#111; font-size:22px;">${title}</h2>
        <div style="color:#444; font-size:15px; line-height:1.7;">${content}</div>
        <div style="text-align:center; margin-top:28px;">
          <a href="${targetUrl}" style="display:inline-block; background:#ee0000; color:#fff; padding:13px 26px; border-radius:8px; text-decoration:none; font-weight:800;">${buttonText}</a>
        </div>
        <p style="margin-top:30px; color:#999; font-size:12px; text-align:center;">Email được gửi tự động từ PhoneSin Mobile.</p>
      </div>
    </div>
  `;

  const text = `${title}\n\n${String(content || '').replace(/<[^>]+>/g, ' ')}\n\n${targetUrl}`;

  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({ to, from, subject, text, html });
    return { provider: 'sendgrid' };
  }

  const transporter = createTransporter();
  return transporter.sendMail({ from, to, subject, text, html });
};
