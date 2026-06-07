import Address from '../models/Address.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

const setDefaultAddress = async (userId, addressIdToKeep) => {
  await Address.updateMany(
    { user: userId, _id: { $ne: addressIdToKeep } },
    { $set: { isDefault: false } }
  );
};

const requireAddressFields = (payload) => {
  const requiredFields = [
    'recipientName',
    'phone',
    'province',
    'district',
    'ward',
    'street',
  ];

  const missingFields = requiredFields.filter((field) => !payload[field]);

  if (missingFields.length > 0) {
    throw new AppError(
      400,
      `Thiếu thông tin địa chỉ bắt buộc: ${missingFields.join(', ')}.`
    );
  }
};

export const createAddress = asyncHandler(async (req, res) => {
  requireAddressFields(req.body);

  const totalAddresses = await Address.countDocuments({ user: req.user._id });
  const shouldBeDefault = req.body.isDefault || totalAddresses === 0;

  const address = await Address.create({
    user: req.user._id,
    label: req.body.label,
    recipientName: req.body.recipientName,
    phone: req.body.phone,
    province: req.body.province,
    district: req.body.district,
    ward: req.body.ward,
    street: req.body.street,
    note: req.body.note,
    isDefault: shouldBeDefault,
  });

  if (shouldBeDefault) {
    await setDefaultAddress(req.user._id, address._id);
  }

  res.status(201).json({
    message: 'Thêm địa chỉ thành công.',
    address,
  });
});

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id, isActive: true }).sort({
    isDefault: -1,
    updatedAt: -1,
  });

  res.json({
    data: addresses,
  });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    throw new AppError(404, 'Không tìm thấy địa chỉ cần cập nhật.');
  }

  const nextAddress = {
    recipientName: req.body.recipientName ?? address.recipientName,
    phone: req.body.phone ?? address.phone,
    province: req.body.province ?? address.province,
    district: req.body.district ?? address.district,
    ward: req.body.ward ?? address.ward,
    street: req.body.street ?? address.street,
  };

  requireAddressFields(nextAddress);

  address.label = req.body.label ?? address.label;
  address.recipientName = nextAddress.recipientName;
  address.phone = nextAddress.phone;
  address.province = nextAddress.province;
  address.district = nextAddress.district;
  address.ward = nextAddress.ward;
  address.street = nextAddress.street;
  address.note = req.body.note ?? address.note;
  address.isDefault = req.body.isDefault ?? address.isDefault;

  await address.save();

  if (address.isDefault) {
    await setDefaultAddress(req.user._id, address._id);
  }

  res.json({
    message: 'Cập nhật địa chỉ thành công.',
    address,
  });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    throw new AppError(404, 'Không tìm thấy địa chỉ cần xóa.');
  }

  const wasDefault = address.isDefault;
  address.isActive = false;
  address.isDefault = false;
  await address.save();

  if (wasDefault) {
    const fallbackAddress = await Address.findOne({ user: req.user._id, isActive: true }).sort({
      updatedAt: -1,
    });

    if (fallbackAddress) {
      fallbackAddress.isDefault = true;
      await fallbackAddress.save();
      await setDefaultAddress(req.user._id, fallbackAddress._id);
    }
  }

  res.json({
    message: 'Xóa địa chỉ thành công.',
  });
});
