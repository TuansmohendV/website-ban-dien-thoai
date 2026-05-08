import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setNotice({ type: 'error', message: 'Vui lòng nhập đầy đủ các trường mật khẩu.' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setNotice({ type: 'error', message: 'Mật khẩu mới và xác nhận mật khẩu chưa khớp.' });
      return;
    }

    try {
      setIsSubmitting(true);
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setNotice({ type: 'success', message: 'Đổi mật khẩu thành công.' });
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setNotice({ type: 'error', message: error.message || 'Không thể đổi mật khẩu lúc này.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-10 font-sans">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h1 className="text-2xl sm:text-[28px] font-black text-gray-900 tracking-tight mb-6">
            Đổi mật khẩu
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[13px] font-black text-gray-500 uppercase tracking-wide">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                className="w-full h-[54px] bg-white border border-gray-200 rounded-xl px-5 font-bold text-gray-900 shadow-sm focus:border-[#008d71] outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-black text-gray-500 uppercase tracking-wide">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                className="w-full h-[54px] bg-white border border-gray-200 rounded-xl px-5 font-bold text-gray-900 shadow-sm focus:border-[#008d71] outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-black text-gray-500 uppercase tracking-wide">
                Nhập lại mật khẩu mới
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className="w-full h-[54px] bg-white border border-gray-200 rounded-xl px-5 font-bold text-gray-900 shadow-sm focus:border-[#008d71] outline-none transition-all"
              />
            </div>

            {notice && (
              <div
                className={`rounded-2xl px-5 py-4 text-sm font-bold ${
                  notice.type === 'error'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-[#e5f9e0] text-[#008d71] border border-[#008d71]/20'
                }`}
              >
                {notice.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex-1 h-[52px] rounded-2xl border border-gray-200 text-gray-700 font-black uppercase"
              >
                Quay lại hồ sơ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-[52px] rounded-2xl bg-[#008d71] text-white font-black uppercase tracking-wider hover:bg-[#007a62] transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Đang đổi...' : 'Xác nhận đổi mật khẩu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
