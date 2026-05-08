import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { sendEmailOTP } from '../services/emailService.js';
import OTPModel from '../models/OTP.js';
import User from '../models/User.js';

export const sendOTP = asyncHandler(async (req, res) => {
    const { email, purpose } = req.body;

    if (!email) {
        throw new AppError(400, 'Vui lòng cung cấp email.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Nếu đang đăng ký, kiểm tra email đã tồn tại chưa
    if (purpose === 'register') {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            throw new AppError(409, 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.');
        }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Xóa OTP cũ (nếu có) và lưu OTP mới vào MongoDB
    await OTPModel.deleteMany({ email: normalizedEmail });
    await OTPModel.create({
        email: normalizedEmail,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 phút
    });

    // Gửi qua Email
    await sendEmailOTP(email, otp);

    res.status(200).json({
        status: 'success',
        message: 'Mã OTP đã được gửi qua Email.',
    });
});

export const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new AppError(400, 'Vui lòng cung cấp email và mã OTP.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Tìm OTP trong MongoDB
    const storedOTP = await OTPModel.findOne({
        email: normalizedEmail,
        otp: otp.trim(),
        expiresAt: { $gt: new Date() },
    });

    if (!storedOTP) {
        throw new AppError(400, 'Mã OTP không chính xác hoặc đã hết hạn.');
    }

    // Xóa OTP sau khi xác thực thành công
    await OTPModel.deleteMany({ email: normalizedEmail });

    res.status(200).json({
        status: 'success',
        message: 'Xác thực OTP thành công.',
    });
});
