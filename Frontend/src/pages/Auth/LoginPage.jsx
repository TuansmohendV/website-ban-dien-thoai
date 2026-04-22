import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, getErrorMessage } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login({ identifier, password });
      navigate(searchParams.get('redirect') || '/');
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Khong the dang nhap.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] px-4 py-12 font-sans">
      <div className="mx-auto grid w-full max-w-[1200px] overflow-hidden rounded-[36px] bg-white shadow-2xl lg:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-[#004f44] via-[#0f766e] to-[#14b8a6] p-12 text-white lg:block">
          <p className="text-[11px] font-black uppercase tracking-[0.35em] text-emerald-100">
            Dang nhap backend
          </p>
          <h1 className="mt-6 text-[52px] font-black uppercase leading-none tracking-tight">
            PhoneSin account
          </h1>
          <p className="mt-6 max-w-md text-[16px] leading-8 text-white/75">
            Dang nhap de dong bo gio hang, don hang, ho so va danh sach dia chi tu
            backend.
          </p>
          <div className="mt-10 space-y-4">
            {[
              'Ho tro dang nhap bang email hoac so dien thoai.',
              'Sau dang nhap co the xem ngay lich su don hang va thong ke chi tieu.',
              'Cart va voucher se tiep tuc duoc dong bo theo tai khoan.',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-[14px] font-semibold text-white/80"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-12">
          <Link to="/" className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
            ← Ve trang chu
          </Link>
          <h2 className="mt-6 text-[34px] font-black uppercase tracking-tight text-gray-900">
            Dang nhap
          </h2>
          <p className="mt-2 text-[15px] text-gray-500">
            Su dung email hoac so dien thoai da dang ky tren backend.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                Tai khoan
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
                <User size={18} className="text-gray-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="Email hoac so dien thoai"
                  className="w-full text-[14px] font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                Mat khau
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
                <Lock size={18} className="text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhap mat khau"
                  className="w-full text-[14px] font-medium outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-[#008d71] px-5 py-4 text-[13px] font-black uppercase tracking-wide text-white disabled:opacity-50"
            >
              {submitting ? 'Dang dang nhap...' : 'Dang nhap'}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[13px] font-semibold text-gray-500">
            <Link to="/forgot-password" className="text-[#008d71]">
              Quen mat khau?
            </Link>
            <Link to="/register" className="text-[#008d71]">
              Tao tai khoan moi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
