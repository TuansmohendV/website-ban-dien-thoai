import VoucherBanner from '../models/VoucherBanner.js';

// GET /api/voucher-banners — Public: get active banners ordered
export const getPublicVoucherBanners = async (req, res) => {
  try {
    const banners = await VoucherBanner.find({
      isActive: true,
      isDeleted: { $ne: true },
    }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/voucher-banners — Admin: get all banners
export const getAdminVoucherBanners = async (req, res) => {
  try {
    const includeDeleted = String(req.query.includeDeleted) === 'true';
    const query = includeDeleted ? {} : { isDeleted: { $ne: true } };
    const banners = await VoucherBanner.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/voucher-banners — Admin: create banner
export const createVoucherBanner = async (req, res) => {
  try {
    const { title, subtitle, imageUrl, linkUrl, badgeText, bgColor, textColor, order, isActive } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Tiêu đề và ảnh là bắt buộc.' });
    }
    const banner = await VoucherBanner.create({
      title, subtitle, imageUrl, linkUrl, badgeText, bgColor, textColor, order, isActive,
    });
    res.status(201).json({ success: true, data: banner, message: 'Tạo banner thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/voucher-banners/:id — Admin: update banner
export const updateVoucherBanner = async (req, res) => {
  try {
    const banner = await VoucherBanner.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      req.body,
      { new: true, runValidators: true }
    );
    if (!banner) return res.status(404).json({ success: false, message: 'Không tìm thấy banner.' });
    res.json({ success: true, data: banner, message: 'Cập nhật banner thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/voucher-banners/:id — Admin: delete banner
export const deleteVoucherBanner = async (req, res) => {
  try {
    const banner = await VoucherBanner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Không tìm thấy banner.' });

    banner.isActive = false;
    banner.isDeleted = true;
    banner.deletedAt = new Date();
    await banner.save();

    res.json({ success: true, message: 'Đã ẩn banner khỏi giao diện (xoá mềm), dữ liệu vẫn còn trong database.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
