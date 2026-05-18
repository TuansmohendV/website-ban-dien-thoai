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
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  if (host && port && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: parseBoolean(process.env.SMTP_SECURE) || port === 465,
      auth: { user, pass },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });
  }

  // Dev fallback: mail payload is generated and logged only.
  return nodemailer.createTransport({ 
    jsonTransport: true,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });
};

const escapePdfText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const createSimplePdf = ({ title, lines = [] }) => {
  const contentLines = [
    'BT',
    '/F1 18 Tf',
    '50 790 Td',
    `(${escapePdfText(title)}) Tj`,
    '/F1 10 Tf',
    '0 -28 Td',
    ...lines.flatMap((line) => [
      `(${escapePdfText(line).slice(0, 105)}) Tj`,
      '0 -16 Td',
    ]),
    'ET',
  ];
  const stream = contentLines.join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'ascii'));
    pdf += object;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'ascii');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'ascii');
};

const buildInvoicePdfAttachment = (order, websiteUrl) => {
  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  const orderId = order._id.toString();
  const shortId = orderId.slice(-6).toUpperCase();
  const invoiceUrl = `${websiteUrl}/invoice/${orderId}`;
  const lines = [
    `Ma hoa don: #${shortId}`,
    `Ma don hang: ${orderId}`,
    `Khach hang: ${order.customerInfo?.fullName || ''}`,
    `Dien thoai: ${order.customerInfo?.phone || ''}`,
    `Email: ${order.customerInfo?.email || ''}`,
    `Dia chi: ${[
      order.shippingAddress?.street,
      order.shippingAddress?.ward,
      order.shippingAddress?.district,
      order.shippingAddress?.province,
    ].filter(Boolean).join(', ')}`,
    `Ngay tao: ${new Date(order.createdAt || Date.now()).toLocaleString('vi-VN')}`,
    `Phuong thuc thanh toan: ${order.paymentMethod || ''}`,
    '',
    'San pham:',
    ...(order.items || []).map((item, index) =>
      `${index + 1}. ${item.name} x${item.quantity} - ${formatPrice(item.lineTotal)}`
    ),
    '',
    `Tam tinh: ${formatPrice(order.subtotal || order.total)}`,
    `Giam gia: ${formatPrice(order.discountTotal || 0)}`,
    `Phi van chuyen: ${formatPrice(order.shippingFee || 0)}`,
    `Tong cong: ${formatPrice(order.total || 0)}`,
    `Xem hoa don dien tu: ${invoiceUrl}`,
  ];

  return {
    filename: `phonesin-invoice-${shortId}.pdf`,
    content: createSimplePdf({
      title: `PHONESIN INVOICE #${shortId}`,
      lines,
    }),
    contentType: 'application/pdf',
  };
};

export const sendResetOtpEmail = async ({ to, otpCode, expiresAt }) => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@phonesin.vn';
  const subject = 'PhoneSin - Mã OTP khôi phục mật khẩu';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #008d71; margin: 0; font-size: 28px;">PhoneSin Mobile</h2>
        <p style="color: #666; margin: 8px 0 0 0;">Khôi phục mật khẩu</p>
      </div>
      <p style="color: #333;">Chào bạn,</p>
      <p style="color: #333;">Mã xác thực (OTP) để khôi phục mật khẩu của bạn là:</p>
      <div style="background: linear-gradient(135deg, #008d71, #00b894); padding: 20px; text-align: center; font-size: 36px; font-weight: bold; color: white; letter-spacing: 10px; border-radius: 8px; margin: 20px 0;">
        ${otpCode}
      </div>
      <p style="color: #666; font-size: 14px;">Mã này có hiệu lực đến <b>${new Date(expiresAt).toLocaleString('vi-VN')}</b>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 12px; color: #aaa; text-align: center;">© PhoneSin Mobile - Email tự động, vui lòng không phản hồi.</p>
    </div>
  `;

  const text = `Mã OTP khôi phục mật khẩu của bạn là: ${otpCode}. Có hiệu lực đến ${new Date(expiresAt).toLocaleString('vi-VN')}.`;

  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({ to, from, subject, text, html });
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
  console.log(`[EMAIL] Preparing confirmation email for: ${to}, Order: ${order?._id}`);
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@phonesin.vn';
  const subject = `PhoneSin - Xác nhận đơn hàng #${order._id.toString().slice(-6).toUpperCase()}`;
  const pdfAttachment = buildInvoicePdfAttachment(order, websiteUrl);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const itemsHtml = (order.items || []).map(item => `
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
        <h2 style="color: #333; margin-top: 0;">Chào ${order.customerInfo?.fullName || 'khách hàng'},</h2>
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

        <table style="width: 100%; border-collapse: collapse; margin-top: 30px; table-layout: fixed;">
          <tr>
            <td style="padding-right: 8px;">
              <a href="${statusUrl}" style="background-color: #009981; color: white; padding: 12px 5px; text-decoration: none; border-radius: 8px; font-weight: bold; display: block; text-align: center; font-size: 14px;">
                Xem trạng thái
              </a>
            </td>
            <td style="padding-left: 8px;">
              <a href="${websiteUrl}/invoice/${order._id}" style="background-color: #ee0000; color: white; padding: 12px 5px; text-decoration: none; border-radius: 8px; font-weight: bold; display: block; text-align: center; font-size: 14px;">
                Xem hóa đơn
              </a>
            </td>
          </tr>
        </table>

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
    console.log(`[EMAIL] Sending via SendGrid...`);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to,
      from,
      subject,
      text,
      html,
      attachments: [{
        filename: pdfAttachment.filename,
        type: pdfAttachment.contentType,
        content: pdfAttachment.content.toString('base64'),
        disposition: 'attachment',
      }],
    });
    return { provider: 'sendgrid' };
  }

  console.log(`[EMAIL] Sending via SMTP (Transporter)...`);
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
    attachments: [pdfAttachment],
  });
  console.log(`[EMAIL] Success: ${info.messageId}`);
  return info;
};

export const sendOrderStatusEmail = async ({ to, order, websiteUrl = 'http://localhost:5173' }) => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@phonesin.vn';
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
        <h2 style="color: #333; margin-top: 0;">Chào ${order.customerInfo?.fullName || 'khách hàng'},</h2>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          Trạng thái đơn hàng <strong>#${order._id}</strong> của bạn đã được cập nhật thành: <span style="color: #008d71; font-weight: bold;">${currentStatus}</span>.
        </p>
        <div style="text-align: center; margin-top: 30px;">
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
  console.log(`[EMAIL] Preparing invoice email for: ${to}, Order: ${order?._id}`);
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@phonesin.vn';
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
      <td style="padding:10px 12px; border-bottom:1px solid #f0f0f0; font-size:14px; text-align:center; color:#555;">x${item.quantity}</td>
      <td style="padding:10px 12px; border-bottom:1px solid #f0f0f0; font-size:14px; text-align:right; font-weight:bold; color:#333;">${formatPrice(item.lineTotal)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #ee0000; padding: 25px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">PHONESIN</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px;">Chào ${order.customerInfo?.fullName || 'bạn'},</h2>
        <p style="color: #555; line-height: 1.6; font-size: 15px;">
          Đơn hàng <strong>#${shortId}</strong> của bạn đã được giao thành công. Chúng tôi xin gửi bạn hóa đơn điện tử cho các sản phẩm đã mua.
        </p>

        <div style="margin: 25px 0; background-color: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 8px; padding: 20px;">
           <table style="width: 100%; border-collapse: collapse;">
             <thead>
               <tr>
                 <th style="text-align:left; font-size:12px; color:#999; text-transform:uppercase; padding-bottom:10px;">Sản phẩm</th>
                 <th style="text-align:center; font-size:12px; color:#999; text-transform:uppercase; padding-bottom:10px;">SL</th>
                 <th style="text-align:right; font-size:12px; color:#999; text-transform:uppercase; padding-bottom:10px;">Giá</th>
               </tr>
             </thead>
             <tbody>
               ${itemsHtml}
             </tbody>
           </table>
           
           <div style="margin-top: 15px; text-align: right;">
              <p style="margin: 5px 0; font-size: 14px; color: #666;">Tổng tiền sản phẩm: ${formatPrice(order.subtotal || order.total)}</p>
              ${order.discountTotal > 0 ? `<p style="margin: 5px 0; font-size: 14px; color: #ee0000;">Giảm giá: -${formatPrice(order.discountTotal)}</p>` : ''}
              <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: 900; color: #ee0000;">TỔNG CỘNG: ${formatPrice(order.total)}</p>
           </div>
        </div>

        <div style="text-align: center; margin-top: 35px;">
          <p style="margin-bottom: 20px; font-size: 14px; color: #666;">Bạn có thể tải hóa đơn PDF hoặc xem chi tiết tại đây:</p>
          <a href="${invoiceUrl}" style="background-color: #ee0000; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(238,0,0,0.2);">XEM HÓA ĐƠN ĐIỆN TỬ</a>
        </div>

        <div style="text-align: center; margin-top: 15px;">
          <a href="${ordersUrl}" style="color: #666; text-decoration: underline; font-size: 13px;">Xem lịch sử đơn hàng của tôi</a>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
          Cảm ơn bạn đã tin tưởng và chọn <strong>PhoneSin Store</strong>.<br/>
          Đây là email tự động, vui lòng không phản hồi email này.
        </p>
      </div>
    </div>
  `;

  const text = `Cảm ơn bạn đã đặt hàng tại PhoneSin! Đơn hàng #${shortId} đã giao thành công. Xem hóa đơn tại: ${invoiceUrl}`;

  if (process.env.SENDGRID_API_KEY) {
    console.log(`[EMAIL] Sending invoice via SendGrid...`);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const pdfAttachment = buildInvoicePdfAttachment(order, websiteUrl);
    await sgMail.send({
      to,
      from,
      subject,
      text,
      html,
      attachments: [{
        filename: pdfAttachment.filename,
        type: pdfAttachment.contentType,
        content: pdfAttachment.content.toString('base64'),
        disposition: 'attachment',
      }],
    });
    return { provider: 'sendgrid' };
  }

  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
    attachments: [buildInvoicePdfAttachment(order, websiteUrl)],
  });
  console.log(`[EMAIL] Invoice Success: ${info.messageId}`);
  return info;
};
