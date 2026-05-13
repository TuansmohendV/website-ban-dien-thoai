import AppError from './appError.js';

export const getRequestOwner = (
  req,
  { allowGuest = true, throwIfMissing = true } = {}
) => {
  if (req.user?._id) {
    return { user: req.user._id };
  }

  const guestId =
    req.headers['x-guest-id'] ||
    req.body?.guestId ||
    req.query?.guestId ||
    null;

  if (allowGuest && guestId) {
    return { guestId: String(guestId).trim() };
  }

  if (throwIfMissing) {
    throw new AppError(
      allowGuest ? 400 : 401,
      allowGuest
        ? 'Thiếu thông tin người dùng hoặc guest cart. Vui lòng đăng nhập hoặc gửi x-guest-id.'
        : 'Bạn cần đăng nhập để thực hiện chức năng này.'
    );
  }

  return null;
};

export const buildOwnerQuery = (owner) => {
  if (!owner) {
    return {};
  }

  if (owner.user) {
    return { user: owner.user };
  }

  return { guestId: owner.guestId };
};
