import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import {
  emptyCartResponse,
  recalculateCart,
  withCartSummary,
} from '../utils/cart.js';
import { buildOwnerQuery, getRequestOwner } from '../utils/requestOwner.js';

const getHydratedCart = async (cartId) => {
  const cart = await Cart.findById(cartId)
    .populate('items.product', 'name slug image price countInStock status')
    .populate('items.variant', 'color storage price stock image isActive');

  return withCartSummary(cart);
};

const getOrCreateCart = async (owner) => {
  const ownerQuery = buildOwnerQuery(owner);
  let cart = await Cart.findOne(ownerQuery);

  if (!cart) {
    cart = await Cart.create({
      ...ownerQuery,
      items: [],
    });
  }

  return cart;
};

const resolveCartItem = async (productId, variantId) => {
  const product = await Product.findById(productId);

  if (!product || product.status !== 'active') {
    throw new AppError(404, 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.');
  }

  let variant = null;
  let stock = product.countInStock;
  let unitPrice = product.price;
  let image = product.image;
  let selectedColor = '';
  let selectedStorage = product.storage || '';

  if (variantId) {
    variant = await ProductVariant.findById(variantId);

    if (
      !variant ||
      String(variant.product) !== String(product._id) ||
      !variant.isActive
    ) {
      throw new AppError(404, 'Biến thể sản phẩm không hợp lệ.');
    }

    stock = variant.stock;
    unitPrice = variant.price;
    image = variant.image || product.image;
    selectedColor = variant.color || '';
    selectedStorage = variant.storage || product.storage || '';
  }

  return {
    product,
    variant,
    stock,
    unitPrice,
    image,
    selectedColor,
    selectedStorage,
  };
};

export const addToCart = asyncHandler(async (req, res) => {
  const owner = getRequestOwner(req, { allowGuest: false });
  const quantity = Number(req.body.quantity) || 1;

  if (!req.body.productId || quantity < 1) {
    throw new AppError(400, 'Vui lòng chọn sản phẩm và số lượng hợp lệ.');
  }

  const {
    product,
    variant,
    stock,
    unitPrice,
    image,
    selectedColor,
    selectedStorage,
  } = await resolveCartItem(req.body.productId, req.body.variantId);

  const cart = await getOrCreateCart(owner);

  const existingItem = cart.items.find(
    (item) =>
      String(item.product) === String(product._id) &&
      String(item.variant || '') === String(variant?._id || '')
  );

  const nextQuantity = (existingItem?.quantity || 0) + quantity;

  if (nextQuantity > stock) {
    throw new AppError(400, 'Số lượng vượt quá tồn kho hiện tại.');
  }

  if (existingItem) {
    existingItem.quantity = nextQuantity;
    existingItem.unitPrice = unitPrice;
    existingItem.lineTotal = unitPrice * nextQuantity;
    existingItem.image = image;
    existingItem.maxStock = stock;
    existingItem.selectedColor = selectedColor;
    existingItem.selectedStorage = selectedStorage;
  } else {
    cart.items.push({
      product: product._id,
      variant: variant?._id || null,
      name: product.name,
      image,
      selectedColor,
      selectedStorage,
      unitPrice,
      quantity,
      lineTotal: unitPrice * quantity,
      maxStock: stock,
    });
  }

  recalculateCart(cart);
  await cart.save();

  res.status(201).json({
    message: 'Đã thêm sản phẩm vào giỏ hàng.',
    cart: await getHydratedCart(cart._id),
  });
});

export const getCart = asyncHandler(async (req, res) => {
  const owner = getRequestOwner(req, {
    allowGuest: false,
    throwIfMissing: false,
  });

  if (!owner) {
    return res.json(emptyCartResponse());
  }

  const cart = await Cart.findOne(buildOwnerQuery(owner))
    .populate('items.product', 'name slug image price countInStock status')
    .populate('items.variant', 'color storage price stock image isActive');

  if (!cart) {
    return res.json(emptyCartResponse());
  }

  res.json(withCartSummary(cart));
});

export const updateCart = asyncHandler(async (req, res) => {
  const owner = getRequestOwner(req, { allowGuest: false });
  const quantity = Number(req.body.quantity);

  if (Number.isNaN(quantity) || quantity < 0) {
    throw new AppError(400, 'Số lượng cập nhật không hợp lệ.');
  }

  const cart = await Cart.findOne(buildOwnerQuery(owner));

  if (!cart) {
    throw new AppError(404, 'Không tìm thấy giỏ hàng để cập nhật.');
  }

  const targetItem =
    (req.body.itemId && cart.items.id(req.body.itemId)) ||
    cart.items.find(
      (item) =>
        String(item.product) === String(req.body.productId || item.product) &&
        String(item.variant || '') ===
          String(
            req.body.currentVariantId ||
              req.body.variantId ||
              item.variant ||
              ''
          )
    );

  if (!targetItem) {
    throw new AppError(404, 'Không tìm thấy sản phẩm cần cập nhật trong giỏ.');
  }

  const nextVariantId = req.body.variantId || targetItem.variant;
  const resolved = await resolveCartItem(targetItem.product, nextVariantId);

  if (quantity === 0) {
    targetItem.deleteOne();
  } else {
    if (quantity > resolved.stock) {
      throw new AppError(400, 'Số lượng mới vượt quá tồn kho hiện tại.');
    }

    targetItem.variant = resolved.variant?._id || null;
    targetItem.unitPrice = resolved.unitPrice;
    targetItem.quantity = quantity;
    targetItem.lineTotal = resolved.unitPrice * quantity;
    targetItem.image = resolved.image;
    targetItem.maxStock = resolved.stock;
    targetItem.selectedColor = resolved.selectedColor;
    targetItem.selectedStorage = resolved.selectedStorage;
  }

  recalculateCart(cart);
  await cart.save();

  res.json({
    message: 'Cập nhật giỏ hàng thành công.',
    cart: await getHydratedCart(cart._id),
  });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const owner = getRequestOwner(req, { allowGuest: false });
  const cart = await Cart.findOne(buildOwnerQuery(owner));

  if (!cart) {
    return res.json({
      message: 'Giỏ hàng đang trống.',
      cart: emptyCartResponse(),
    });
  }

  const itemId = req.body.itemId || req.query.itemId;
  const productId = req.body.productId || req.query.productId;
  const variantId = req.body.variantId || req.query.variantId;
  const clearAll = req.body.clearAll === true || req.query.clearAll === 'true';

  if (clearAll) {
    cart.items = [];
  } else {
    const initialCount = cart.items.length;
    cart.items = cart.items.filter(
      (item) =>
        !(
          (itemId && String(item._id) === String(itemId)) ||
          (productId &&
            String(item.product) === String(productId) &&
            String(item.variant || '') === String(variantId || item.variant || ''))
        )
    );

    if (cart.items.length === initialCount) {
      throw new AppError(404, 'Không tìm thấy sản phẩm cần xóa khỏi giỏ.');
    }
  }

  recalculateCart(cart);
  await cart.save();

  res.json({
    message: 'Đã cập nhật giỏ hàng.',
    cart: await getHydratedCart(cart._id),
  });
});

export const getCartCount = asyncHandler(async (req, res) => {
  const owner = getRequestOwner(req, {
    allowGuest: false,
    throwIfMissing: false,
  });

  if (!owner) {
    return res.json({ count: 0 });
  }

  const cart = await Cart.findOne(buildOwnerQuery(owner)).select('items.quantity');

  const count =
    cart?.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

  res.json({ count });
});
