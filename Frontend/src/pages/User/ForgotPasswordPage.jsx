import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/shopApi';

const ForgotPasswordPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await authService.forgotPassword({ identifier });
      setMessage(
        response.resetToken
          ? `Reset token test: ${response.resetToken}`
          : response.message || 'Da gui yeu cau khoi phuc.'
      );
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Khong the tao yeu cau khoi phuc.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] px-4 py-12 font-sans">
      <div className="mx-auto max-w-[720px] rounded-[36px] bg-white p-10 shadow-2xl">
        <Link to="/login" className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
          ← Ve dang nhap
        </Link>
        <h1 className="mt-6 text-[34px] font-black uppercase tracking-tight text-gray-900">
          Quen mat khau
        </h1>
        <p className="mt-2 text-[15px] text-gray-500">
          Backend se tao reset token test khi ban nhap email hoac so dien thoai.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <input
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Email hoac so dien thoai"
            className="w-full rounded-2xl border border-gray-200 px-4 py-4 text-[14px] font-medium outline-none focus:border-[#008d71]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-[#008d71] px-5 py-4 text-[13px] font-black uppercase tracking-wide text-white disabled:opacity-50"
          >
            {submitting ? 'Dang xu ly...' : 'Gui yeu cau'}
          </button>
        </form>

        {message && (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
