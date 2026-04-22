import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, getErrorMessage } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mat khau xac nhan khong khop.');
      return;
    }

    setSubmitting(true);

    try {
      await register({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        password: form.password,
      });
      navigate('/');
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Khong the dang ky tai khoan.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] px-4 py-12 font-sans">
      <div className="mx-auto grid w-full max-w-[1200px] overflow-hidden rounded-[36px] bg-white shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden bg-gradient-to-br from-[#111827] to-[#1f2937] p-12 text-white lg:block">
          <p className="text-[11px] font-black uppercase tracking-[0.35em] text-emerald-200">
            Tao tai khoan backend
          </p>
          <h1 className="mt-6 text-[52px] font-black uppercase leading-none tracking-tight">
            Tao ho so mua sam
          </h1>
          <p className="mt-6 max-w-md text-[16px] leading-8 text-white/75">
            Sau khi dang ky, tai khoan se co the dong bo cart, order history,
            profile va address book voi backend.
          </p>
        </div>

        <div className="p-8 md:p-12">
          <Link to="/" className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
            ← Ve trang chu
          </Link>
          <h2 className="mt-6 text-[34px] font-black uppercase tracking-tight text-gray-900">
            Dang ky tai khoan
          </h2>
          <p className="mt-2 text-[15px] text-gray-500">
            Hoan tat thong tin de tao tai khoan tren backend.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                Ho va ten
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
                <User size={18} className="text-gray-400" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                  placeholder="Nguyen Van A"
                  className="w-full text-[14px] font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                So dien thoai
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
                <Phone size={18} className="text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="09xxxxxxxx"
                  className="w-full text-[14px] font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                Email
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
                <Mail size={18} className="text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="example@phonesin.vn"
                  className="w-full text-[14px] font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                Mat khau
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Toi thieu 6 ky tu"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
              />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                Xac nhan mat khau
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                placeholder="Nhap lai mat khau"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-[14px] font-medium outline-none focus:border-[#008d71]"
              />
            </div>

            {error && (
              <div className="md:col-span-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="md:col-span-2 rounded-2xl bg-[#008d71] px-5 py-4 text-[13px] font-black uppercase tracking-wide text-white disabled:opacity-50"
            >
              {submitting ? 'Dang tao tai khoan...' : 'Dang ky'}
            </button>
          </form>

          <p className="mt-6 text-[13px] font-semibold text-gray-500">
            Da co tai khoan?{' '}
            <Link to="/login" className="text-[#008d71]">
              Dang nhap ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
