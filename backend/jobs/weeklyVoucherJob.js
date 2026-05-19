import cron from 'node-cron';
import Voucher from '../models/Voucher.js';
import UserVoucher from '../models/UserVoucher.js';
import User from '../models/User.js';

/**
 * ─── Weekly Voucher Gift System ───────────────────────────
 * Mỗi tuần (thứ Hai lúc 00:00), hệ thống tự động:
 * 1. Tạo 2 voucher mới (mức giảm thấp) dạng "xanh" (không cần săn)
 * 2. Cấp cho TẤT CẢ user đã đăng ký
 * 3. Tự động đặt trạng thái "approved" (dùng ngay, không cần duyệt)
 * 4. Voucher có hạn sử dụng 7 ngày
 */

// Cấu hình 2 voucher tặng mỗi tuần
const WEEKLY_VOUCHERS_CONFIG = [
  {
    suffix: 'A',
    description: 'Voucher tuần - Giảm 5.000đ cho đơn từ 50.000đ',
    discountType: 'fixed',
    discountValue: 5000,
    minOrderValue: 50000,
    maxDiscount: 5000,
  },
  {
    suffix: 'B',
    description: 'Voucher tuần - Giảm 3% cho đơn từ 100.000đ',
    discountType: 'percentage',
    discountValue: 3,
    minOrderValue: 100000,
    maxDiscount: 15000,
  },
];

const generateWeekCode = () => {
  const now = new Date();
  const year = now.getFullYear();
  // Tính tuần trong năm
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNum = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  return `${year}W${String(weekNum).padStart(2, '0')}`;
};

const distributeWeeklyVouchers = async () => {
  try {
    const weekCode = generateWeekCode();
    console.log(`[WeeklyVoucher] Bắt đầu phát voucher tuần ${weekCode}...`);

    // 1. Tạo 2 voucher cho tuần này (nếu chưa tồn tại)
    const createdVouchers = [];

    for (const config of WEEKLY_VOUCHERS_CONFIG) {
      const code = `TUAN-${weekCode}-${config.suffix}`;

      // Kiểm tra đã tạo chưa
      let voucher = await Voucher.findOne({ code });
      if (voucher) {
        console.log(`[WeeklyVoucher] Voucher ${code} đã tồn tại, bỏ qua.`);
        createdVouchers.push(voucher);
        continue;
      }

      // Hết hạn sau 7 ngày
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      voucher = await Voucher.create({
        code,
        description: config.description,
        discountType: config.discountType,
        discountValue: config.discountValue,
        minOrderValue: config.minOrderValue,
        maxDiscount: config.maxDiscount,
        usageLimit: 0, // 0 = không giới hạn tổng lượt dùng
        usageLimitPerUser: 1, // mỗi user chỉ dùng 1 lần
        expiresAt,
        startsAt: new Date(),
        isActive: true,
        isHuntedOnly: true, // phải có trong UserVoucher mới dùng được
        missionTask: 'Quà tặng hàng tuần từ PhoneSin 🎁',
      });

      console.log(`[WeeklyVoucher] ✅ Tạo voucher ${code} thành công.`);
      createdVouchers.push(voucher);
    }

    // 2. Lấy tất cả user (chỉ lấy id)
    const users = await User.find({ role: { $ne: 'admin' } }).select('_id').lean();
    console.log(`[WeeklyVoucher] Đang phát cho ${users.length} khách hàng...`);

    // 3. Cấp voucher cho từng user
    let assignedCount = 0;

    for (const user of users) {
      for (const voucher of createdVouchers) {
        try {
          // Kiểm tra đã cấp chưa (unique index sẽ chặn trùng)
          const exists = await UserVoucher.findOne({
            user: user._id,
            voucher: voucher._id,
          });

          if (exists) continue;

          await UserVoucher.create({
            user: user._id,
            voucher: voucher._id,
            huntedAt: new Date(),
            isUsed: false,
            proofImage: '',
            status: 'approved', // ← tự động duyệt, dùng ngay!
            adminNote: 'Quà tặng tự động hàng tuần',
          });

          assignedCount++;
        } catch (err) {
          // Bỏ qua lỗi duplicate (user đã có voucher này)
          if (err.code !== 11000) {
            console.error(`[WeeklyVoucher] Lỗi cấp voucher cho user ${user._id}:`, err.message);
          }
        }
      }
    }

    console.log(`[WeeklyVoucher] ✅ Hoàn tất! Đã cấp ${assignedCount} voucher cho ${users.length} khách hàng.`);
  } catch (error) {
    console.error('[WeeklyVoucher] ❌ Lỗi phát voucher tuần:', error.message);
  }
};

/**
 * Khởi chạy cron job
 * Schedule: Mỗi thứ Hai lúc 00:00 (0 0 * * 1)
 */
const startWeeklyVoucherJob = () => {
  // Chạy mỗi thứ Hai lúc 00:00
  cron.schedule('0 0 * * 1', () => {
    console.log('[WeeklyVoucher] ⏰ Cron trigger: phát voucher tuần mới...');
    distributeWeeklyVouchers();
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });

  console.log('[WeeklyVoucher] 📅 Đã đăng ký job phát voucher hàng tuần (Thứ 2, 00:00 GMT+7)');
};

export { startWeeklyVoucherJob, distributeWeeklyVouchers };
