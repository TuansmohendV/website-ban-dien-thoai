import Banner from '../models/Banner.js';

export const getPublicBanners = async (req, res) => {
  try {
    const filter = { status: 'active' };
    if (req.query.targetPage) filter.targetPage = req.query.targetPage;
    
    const banners = await Banner.find(filter).sort({ position: 1, createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminBanners = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const filter = String(includeInactive) === 'true' ? {} : { status: 'active' };
    
    const banners = await Banner.find(filter).sort({ position: 1, createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
    }
    
    banner.status = 'inactive';
    await banner.save();
    
    res.json({ success: true, message: 'Chuyển banner vào trạng thái đã tắt (xoá mềm) thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
