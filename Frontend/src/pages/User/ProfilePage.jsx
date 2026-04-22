import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, LogOut, MapPin, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useOrders } from '../../context/OrdersContext';
import { addressService, userService } from '../../services/shopApi';

const emptyAddress = {
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

const ProfilePage = () => {
  const {
    user,
    isAuthenticated,
    logout,
    updateProfile,
    changePassword,
    getErrorMessage,
  } = useAuth();
  const { formatPrice } = useLanguage();
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState('');
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'other',
    dateOfBirth: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setProfileForm({
      fullName: user?.fullName || user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      gender: user?.gender || 'other',
      dateOfBirth: user?.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : '',
    });
  }, [user]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const [nextStats, nextAddresses] = await Promise.all([
          userService.getStats(),
          addressService.getAddresses(),
        ]);

        if (!mounted) {
          return;
        }

        setStats(nextStats);
        setAddresses(nextAddresses);
      } catch {
        if (mounted) {
          setStats(null);
          setAddresses([]);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);

  const resetAddressForm = () => {
    setAddressForm(emptyAddress);
    setEditingAddressId('');
  };

  const handleSaveProfile = async () => {
    setBusy(true);

    try {
      await updateProfile(profileForm);
      setMessage('Da cap nhat ho so thanh cong.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Khong the cap nhat ho so.'));
    } finally {
      setBusy(false);
    }
  };

  const handleSavePassword = async () => {
    setBusy(true);

    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setMessage('Da doi mat khau thanh cong.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Khong the doi mat khau.'));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveAddress = async () => {
    setBusy(true);

    try {
      if (editingAddressId) {
        await addressService.updateAddress(editingAddressId, addressForm);
      } else {
        await addressService.createAddress(addressForm);
      }

      const nextAddresses = await addressService.getAddresses();
      setAddresses(nextAddresses);
      resetAddressForm();
      setMessage('Da cap nhat dia chi thanh cong.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Khong the luu dia chi.'));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    setBusy(true);

    try {
      await addressService.deleteAddress(id);
      const nextAddresses = await addressService.getAddresses();
      setAddresses(nextAddresses);
      setMessage('Da xoa dia chi.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Khong the xoa dia chi.'));
    } finally {
      setBusy(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] px-4 py-20 font-sans">
        <div className="mx-auto max-w-[860px] rounded-[34px] bg-white p-16 text-center shadow-sm">
          <h1 className="text-[28px] font-black uppercase tracking-tight text-gray-900">
            Dang nhap de quan ly tai khoan
          </h1>
          <p className="mt-3 text-[15px] text-gray-500">
            Ho so, thong ke va dia chi backend chi hien thi khi ban da dang nhap.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex rounded-full bg-[#008d71] px-5 py-3 text-[12px] font-black uppercase tracking-wide text-white"
          >
            Dang nhap ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-20 font-sans">
      <div className="mx-auto grid w-full max-w-[1300px] gap-6 px-4 pt-10 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-[30px] bg-white p-5 shadow-sm lg:sticky lg:top-28">
          <div className="rounded-[24px] bg-[#004f44] p-5 text-white">
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-emerald-100">
              Tai khoan
            </p>
            <h2 className="mt-3 text-[24px] font-black uppercase leading-tight">
              {user.name}
            </h2>
            <p className="mt-2 text-[14px] text-white/75">{user.email || user.phone}</p>
          </div>

          <div className="mt-5 space-y-2">
            {[
              { id: 'overview', label: 'Tong quan', icon: <User size={16} /> },
              { id: 'profile', label: 'Thong tin ca nhan', icon: <User size={16} /> },
              { id: 'addresses', label: 'Quan ly dia chi', icon: <MapPin size={16} /> },
              { id: 'security', label: 'Bao mat', icon: <KeyRound size={16} /> },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[13px] font-black uppercase tracking-wide ${
                  activeTab === item.id
                    ? 'bg-[#e5f9e0] text-[#008d71]'
                    : 'bg-gray-50 text-gray-600'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => logout()}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[13px] font-black uppercase tracking-wide text-red-600"
            >
              <LogOut size={16} />
              Dang xuat
            </button>
          </div>
        </aside>

        <main className="space-y-6">
          {message && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {message}
            </div>
          )}

          {activeTab === 'overview' && (
            <section className="space-y-6">
              <div className="rounded-[34px] bg-white p-6 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
                  Tong quan tu backend
                </p>
                <h1 className="mt-3 text-[32px] font-black uppercase tracking-tight text-gray-900">
                  Ho so ca nhan
                </h1>
                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  {[
                    { label: 'Tong don', value: stats?.totalOrders || 0 },
                    { label: 'Dang xu ly', value: stats?.activeOrders || 0 },
                    { label: 'Da hoan thanh', value: stats?.completedOrders || 0 },
                    { label: 'Tong chi tieu', value: formatPrice(stats?.totalSpent || 0) },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[24px] bg-gray-50 p-4">
                      <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">
                        {item.label}
                      </p>
                      <p className="mt-2 text-[24px] font-black text-gray-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[34px] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
                      Don hang gan day
                    </p>
                    <h2 className="mt-2 text-[24px] font-black uppercase tracking-tight text-gray-900">
                      Hoat dong mua hang
                    </h2>
                  </div>
                  <Link
                    to="/orders"
                    className="rounded-full border border-[#008d71]/20 bg-[#e5f9e0] px-4 py-2 text-[12px] font-black uppercase tracking-wide text-[#008d71]"
                  >
                    Xem tat ca
                  </Link>
                </div>
                <div className="mt-6 space-y-3">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order.id} className="rounded-[24px] bg-gray-50 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-[14px] font-black text-gray-900">
                              Don #{order.id}
                            </p>
                            <p className="mt-1 text-[13px] text-gray-500">{order.date}</p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-[13px] font-black uppercase tracking-wide text-[#008d71]">
                              {order.status}
                            </p>
                            <p className="mt-1 text-[16px] font-black text-gray-900">
                              {formatPrice(order.totalAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[14px] text-gray-500">
                      Chua co don hang nao duoc dong bo ve trang nay.
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'profile' && (
            <section className="rounded-[34px] bg-white p-6 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
                Cap nhat tai khoan
              </p>
              <h2 className="mt-3 text-[28px] font-black uppercase tracking-tight text-gray-900">
                Thong tin ca nhan
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      fullName: event.target.value,
                    }))
                  }
                  placeholder="Ho va ten"
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                />
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="Email"
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                />
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="So dien thoai"
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                />
                <select
                  value={profileForm.gender}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      gender: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                >
                  <option value="other">Khac</option>
                  <option value="male">Nam</option>
                  <option value="female">Nu</option>
                </select>
                <input
                  type="date"
                  value={profileForm.dateOfBirth}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      dateOfBirth: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                />
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={handleSaveProfile}
                className="mt-6 rounded-2xl bg-[#008d71] px-5 py-4 text-[13px] font-black uppercase tracking-wide text-white disabled:opacity-50"
              >
                Luu thay doi
              </button>
            </section>
          )}

          {activeTab === 'addresses' && (
            <section className="space-y-6">
              <div className="rounded-[34px] bg-white p-6 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
                  CRUD dia chi
                </p>
                <h2 className="mt-3 text-[28px] font-black uppercase tracking-tight text-gray-900">
                  Quan ly dia chi
                </h2>
                <div className="mt-6 space-y-3">
                  {addresses.length > 0 ? (
                    addresses.map((address) => (
                      <div key={address.id} className="rounded-[24px] bg-gray-50 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-[16px] font-black text-gray-900">
                              {address.recipientName}
                            </p>
                            <p className="mt-1 text-[13px] text-gray-500">
                              {address.phone}
                            </p>
                            <p className="mt-2 text-[14px] text-gray-600">
                              {address.fullAddress}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAddressId(address.id);
                                setAddressForm({
                                  label: address.label,
                                  recipientName: address.recipientName,
                                  phone: address.phone,
                                  province: address.province,
                                  district: address.district,
                                  ward: address.ward,
                                  street: address.street,
                                  note: address.note,
                                  isDefault: address.isDefault,
                                });
                              }}
                              className="rounded-full border border-gray-200 px-4 py-2 text-[12px] font-black uppercase tracking-wide text-gray-600"
                            >
                              Sua
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(address.id)}
                              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[12px] font-black uppercase tracking-wide text-red-600"
                            >
                              Xoa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[14px] text-gray-500">
                      Ban chua luu dia chi nao tren backend.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[34px] bg-white p-6 shadow-sm">
                <h3 className="text-[22px] font-black uppercase tracking-tight text-gray-900">
                  {editingAddressId ? 'Cap nhat dia chi' : 'Them dia chi moi'}
                </h3>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    value={addressForm.label}
                    onChange={(event) =>
                      setAddressForm((current) => ({
                        ...current,
                        label: event.target.value,
                      }))
                    }
                    placeholder="Nhan dia chi"
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                  />
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
                    placeholder="So dien thoai"
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
                    className="md:col-span-2 rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                  />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleSaveAddress}
                    className="rounded-2xl bg-[#008d71] px-5 py-4 text-[13px] font-black uppercase tracking-wide text-white disabled:opacity-50"
                  >
                    {editingAddressId ? 'Cap nhat dia chi' : 'Them dia chi'}
                  </button>
                  {editingAddressId && (
                    <button
                      type="button"
                      onClick={resetAddressForm}
                      className="rounded-2xl border border-gray-200 px-5 py-4 text-[13px] font-black uppercase tracking-wide text-gray-600"
                    >
                      Huy sua
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="rounded-[34px] bg-white p-6 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
                Doi mat khau
              </p>
              <h2 className="mt-3 text-[28px] font-black uppercase tracking-tight text-gray-900">
                Bao mat tai khoan
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                  placeholder="Mat khau hien tai"
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                />
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                  placeholder="Mat khau moi"
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
                />
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={handleSavePassword}
                className="mt-6 rounded-2xl bg-[#008d71] px-5 py-4 text-[13px] font-black uppercase tracking-wide text-white disabled:opacity-50"
              >
                Doi mat khau
              </button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
