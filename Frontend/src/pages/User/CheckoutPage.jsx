import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, MapPin, Ticket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useOrders } from '../../context/OrdersContext';
import { addressService, orderService } from '../../services/shopApi';

const emptyAddressForm = {
  label: 'Nha rieng',
  recipientName: '',
  phone: '',
  province: '',
  district: '',
  ward: '',
  street: '',
  note: '',
  isDefault: false,
};

const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuth();
  const {
    cartItems,
    cartTotal,
    subtotal,
    discountTotal,
    voucherCode,
    loading: cartLoading,
    clearCart,
    applyVoucher,
  } = useCart();
  const { placeOrder, reloadOrders } = useOrders();
  const { formatPrice } = useLanguage();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [voucherInput, setVoucherInput] = useState(voucherCode || '');
  const [voucherMessage, setVoucherMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [customerInfo, setCustomerInfo] = useState({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const shippingFee = cartItems.length > 0 ? 30000 : 0;

  useEffect(() => {
    setCustomerInfo({
      fullName: user?.fullName || user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user]);

  useEffect(() => {
    let mounted = true;

    const loadAddresses = async () => {
      if (!isAuthenticated) {
        setAddresses([]);
        setSelectedAddressId('');
        return;
      }

      try {
        const nextAddresses = await addressService.getAddresses();

        if (!mounted) {
          return;
        }

        setAddresses(nextAddresses);

        const defaultAddress =
          nextAddresses.find((item) => item.isDefault) || nextAddresses[0];

        setSelectedAddressId(defaultAddress?.id || '');
      } catch {
        if (mounted) {
          setAddresses([]);
        }
      }
    };

    loadAddresses();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  const canSubmit =
    cartItems.length > 0 &&
    customerInfo.fullName.trim() &&
    customerInfo.phone.trim() &&
    (selectedAddressId ||
      (!isAuthenticated &&
        addressForm.recipientName.trim() &&
        addressForm.phone.trim() &&
        addressForm.province.trim() &&
        addressForm.district.trim() &&
        addressForm.ward.trim() &&
        addressForm.street.trim()));

  const handleSaveAddress = async () => {
    setSavingAddress(true);

    try {
      const createdAddress = await addressService.createAddress(addressForm);
      const nextAddresses = await addressService.getAddresses();
      setAddresses(nextAddresses);
      setSelectedAddressId(createdAddress.id);
      setAddressForm(emptyAddressForm);
      setShowAddressForm(false);
    } finally {
      setSavingAddress(false);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) {
      return;
    }

    try {
      const response = await applyVoucher(voucherInput.trim());
      setVoucherMessage(response.message || 'Da ap ma thanh cong.');
    } catch (error) {
      setVoucherMessage(error?.response?.data?.message || 'Khong the ap ma giam gia.');
    }
  };

  const handleSubmitOrder = async () => {
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerInfo,
        paymentMethod,
        shippingFee,
        notes,
      };

      if (selectedAddress) {
        payload.addressId = selectedAddress.id;
      } else {
        payload.shippingAddress = {
          label: addressForm.label,
          recipientName: addressForm.recipientName,
          phone: addressForm.phone,
          province: addressForm.province,
          district: addressForm.district,
          ward: addressForm.ward,
          street: addressForm.street,
          note: addressForm.note,
        };
      }

      if (voucherInput.trim()) {
        payload.voucherCode = voucherInput.trim();
      }

      const createdOrder = await placeOrder(payload);
      let finalOrder = createdOrder;

      if (paymentMethod !== 'COD') {
        const paymentResult = await orderService.processPayment({
          orderId: createdOrder.id,
          method: paymentMethod,
          simulateSuccess: true,
        });
        finalOrder = paymentResult.order;
      }

      await clearCart();

      if (isAuthenticated) {
        await reloadOrders();
      }

      setSuccessOrder(finalOrder);
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] px-4 py-10 font-sans">
        <div className="mx-auto max-w-[1300px] animate-pulse rounded-[34px] bg-white p-10 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-4">
              <div className="h-[220px] rounded-[28px] bg-gray-100" />
              <div className="h-[220px] rounded-[28px] bg-gray-100" />
            </div>
            <div className="h-[420px] rounded-[28px] bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems.length && !successOrder) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] px-4 py-20 font-sans">
        <div className="mx-auto max-w-[860px] rounded-[34px] bg-white p-16 text-center shadow-sm">
          <h1 className="text-[28px] font-black uppercase tracking-tight text-gray-900">
            Chua co san pham de thanh toan
          </h1>
          <p className="mt-3 text-[15px] text-gray-500">
            Ban can them san pham vao gio hang truoc khi dat hang.
          </p>
          <Link
            to="/cart"
            className="mt-8 inline-flex rounded-full bg-[#008d71] px-5 py-3 text-[12px] font-black uppercase tracking-wide text-white"
          >
            Ve gio hang
          </Link>
        </div>
      </div>
    );
  }

  if (successOrder) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] px-4 py-20 font-sans">
        <div className="mx-auto max-w-[860px] rounded-[34px] bg-white p-16 text-center shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#e5f9e0] text-[#008d71]">
            <CreditCard size={42} />
          </div>
          <h1 className="mt-6 text-[28px] font-black uppercase tracking-tight text-gray-900">
            Dat hang thanh cong
          </h1>
          <p className="mt-3 text-[15px] text-gray-500">
            Don hang #{successOrder.id} da duoc tao tren backend va san sang cho
            luong theo doi tiep theo.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Link
              to="/orders"
              className="rounded-2xl bg-[#008d71] px-5 py-4 text-[12px] font-black uppercase tracking-wide text-white"
            >
              Xem lich su don
            </Link>
            <Link
              to={`/invoice/${successOrder.id}`}
              className="rounded-2xl border border-gray-200 px-5 py-4 text-[12px] font-black uppercase tracking-wide text-gray-600"
            >
              Xem hoa don
            </Link>
            <Link
              to="/"
              className="rounded-2xl border border-gray-200 px-5 py-4 text-[12px] font-black uppercase tracking-wide text-gray-600"
            >
              Ve trang chu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-20 font-sans">
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-8 px-4 pt-10">
        <div className="rounded-[34px] bg-white px-6 py-8 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
            Thanh toan dong bo
          </p>
          <h1 className="mt-3 text-[32px] font-black uppercase tracking-tight text-gray-900">
            Hoan tat don hang
          </h1>
          <p className="mt-2 text-[14px] text-gray-500">
            Checkout hien dang su dung cart, voucher, order va dia chi tu backend.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <section className="rounded-[30px] bg-white p-6 shadow-sm">
              <p className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                Thong tin nguoi nhan
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <input
                  type="text"
                  value={customerInfo.fullName}
                  onChange={(event) =>
                    setCustomerInfo((current) => ({
                      ...current,
                      fullName: event.target.value,
                    }))
                  }
                  placeholder="Ho va ten"
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                />
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(event) =>
                    setCustomerInfo((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="So dien thoai"
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                />
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(event) =>
                    setCustomerInfo((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="Email"
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                />
              </div>
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <MapPin className="text-[#008d71]" size={18} />
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                      Dia chi giao hang
                    </p>
                    <p className="mt-1 text-[14px] text-gray-500">
                      {isAuthenticated
                        ? 'Chon dia chi da luu hoac tao moi.'
                        : 'Nhap dia chi thu cong cho guest checkout.'}
                    </p>
                  </div>
                </div>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => setShowAddressForm((current) => !current)}
                    className="rounded-full border border-[#008d71]/20 bg-[#e5f9e0] px-4 py-2 text-[12px] font-black uppercase tracking-wide text-[#008d71]"
                  >
                    {showAddressForm ? 'Dong form' : 'Them dia chi'}
                  </button>
                )}
              </div>

              {isAuthenticated && addresses.length > 0 && (
                <div className="mt-5 grid gap-3">
                  {addresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`rounded-[24px] border px-4 py-4 text-left ${
                        selectedAddressId === address.id
                          ? 'border-[#008d71] bg-[#e5f9e0]'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-black text-gray-900">
                            {address.recipientName}
                          </p>
                          <p className="mt-1 text-[13px] font-semibold text-gray-500">
                            {address.phone}
                          </p>
                          <p className="mt-2 text-[14px] text-gray-600">
                            {address.fullAddress}
                          </p>
                        </div>
                        {address.isDefault && (
                          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#008d71]">
                            Mac dinh
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {(!isAuthenticated || showAddressForm || addresses.length === 0) && (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    value={addressForm.recipientName}
                    onChange={(event) =>
                      setAddressForm((current) => ({
                        ...current,
                        recipientName: event.target.value,
                      }))
                    }
                    placeholder="Nguoi nhan"
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                  />
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(event) =>
                      setAddressForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="So dien thoai giao hang"
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                  />
                  <input
                    type="text"
                    value={addressForm.province}
                    onChange={(event) =>
                      setAddressForm((current) => ({
                        ...current,
                        province: event.target.value,
                      }))
                    }
                    placeholder="Tinh / Thanh pho"
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                  />
                  <input
                    type="text"
                    value={addressForm.district}
                    onChange={(event) =>
                      setAddressForm((current) => ({
                        ...current,
                        district: event.target.value,
                      }))
                    }
                    placeholder="Quan / Huyen"
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                  />
                  <input
                    type="text"
                    value={addressForm.ward}
                    onChange={(event) =>
                      setAddressForm((current) => ({
                        ...current,
                        ward: event.target.value,
                      }))
                    }
                    placeholder="Phuong / Xa"
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                  />
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(event) =>
                      setAddressForm((current) => ({
                        ...current,
                        street: event.target.value,
                      }))
                    }
                    placeholder="So nha, ten duong"
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                  />
                  <textarea
                    value={addressForm.note}
                    onChange={(event) =>
                      setAddressForm((current) => ({
                        ...current,
                        note: event.target.value,
                      }))
                    }
                    placeholder="Ghi chu giao hang"
                    className="md:col-span-2 rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                    rows="3"
                  />
                  {isAuthenticated && (
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        disabled={savingAddress}
                        onClick={handleSaveAddress}
                        className="rounded-2xl border border-[#008d71] px-4 py-3 text-[12px] font-black uppercase tracking-wide text-[#008d71] disabled:opacity-50"
                      >
                        {savingAddress ? 'Dang luu...' : 'Luu dia chi nay'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Ticket className="text-[#008d71]" size={18} />
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                    Ma giam gia
                  </p>
                  <p className="mt-1 text-[14px] text-gray-500">
                    Voucher se ap truc tiep len gio hang backend.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={voucherInput}
                  onChange={(event) => setVoucherInput(event.target.value.toUpperCase())}
                  placeholder="Nhap ma voucher"
                  className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="rounded-2xl bg-[#008d71] px-5 py-3 text-[12px] font-black uppercase tracking-wide text-white"
                >
                  Ap dung
                </button>
              </div>
              {voucherMessage && (
                <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  {voucherMessage}
                </div>
              )}
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-sm">
              <p className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                Ghi chu va thanh toan
              </p>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ghi chu cho don hang"
                className="mt-5 w-full rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                rows="4"
              />
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {['COD', 'VNPAY', 'MOMO', 'BANK_TRANSFER'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-[22px] border px-4 py-4 text-left ${
                      paymentMethod === method
                        ? 'border-[#008d71] bg-[#e5f9e0]'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <p className="text-[14px] font-black text-gray-900">{method}</p>
                    <p className="mt-1 text-[13px] text-gray-500">
                      {method === 'COD'
                        ? 'Thanh toan khi nhan hang'
                        : 'Mo phong thanh toan online ngay sau khi tao don'}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-[34px] bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
              Tom tat thanh toan
            </p>
            <div className="mt-6 space-y-4">
              {cartItems.map((item) => (
                <div key={item.itemId || item.id} className="flex gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 p-2">
                    <img src={item.image} alt={item.name} className="max-h-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13px] font-black text-gray-900">
                      {item.name}
                    </p>
                    <p className="mt-1 text-[12px] text-gray-500">
                      x{item.qty} • {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between text-[14px] font-semibold text-gray-500">
                <span>Tam tinh</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[14px] font-semibold text-gray-500">
                <span>Giam gia</span>
                <span>-{formatPrice(discountTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[14px] font-semibold text-gray-500">
                <span>Phi van chuyen</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="flex items-end justify-between border-t border-gray-100 pt-4">
                <span className="text-[16px] font-black uppercase tracking-wide text-gray-900">
                  Tong cong
                </span>
                <span className="text-[28px] font-black text-[#008d71]">
                  {formatPrice(cartTotal + shippingFee)}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleSubmitOrder}
              className="mt-6 w-full rounded-2xl bg-[#008d71] px-5 py-4 text-[13px] font-black uppercase tracking-wide text-white disabled:opacity-50"
            >
              {submitting ? 'Dang tao don...' : 'Xac nhan dat hang'}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
