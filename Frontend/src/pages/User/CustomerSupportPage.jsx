import React, { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../../lib/api';

const CustomerSupportPage = () => {
    const [tickets, setTickets] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notice, setNotice] = useState('');
    const [form, setForm] = useState({
        title: '',
        category: 'product',
        description: '',
    });

    const loadSupportData = async () => {
        setLoading(true);
        setNotice('');
        try {
            const [ticketRes, faqRes] = await Promise.all([
                api.get('/api/support/tickets'),
                api.get('/api/support/faqs', { params: { limit: 5 } }),
            ]);

            const nextTickets = Array.isArray(ticketRes.data?.data) ? ticketRes.data.data : [];
            const nextFaqs = Array.isArray(faqRes.data?.data) ? faqRes.data.data : [];
            setTickets(nextTickets);
            setFaqs(nextFaqs);
            setSelectedTicketId(nextTickets[0]?._id || '');
        } catch (error) {
            setNotice(getApiErrorMessage(error, 'Khong tai duoc du lieu ho tro.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSupportData();
    }, []);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setNotice('');
        try {
            await api.post('/api/support/tickets', {
                title: form.title.trim(),
                category: form.category,
                description: form.description.trim(),
            });

            setForm({
                title: '',
                category: 'product',
                description: '',
            });
            await loadSupportData();
            setNotice('Gui yeu cau ho tro thanh cong.');
        } catch (error) {
            setNotice(getApiErrorMessage(error, 'Khong the tao ticket ho tro.'));
        } finally {
            setSubmitting(false);
        }
    };

    const selectedTicket = tickets.find((ticket) => ticket._id === selectedTicketId);

    return (
        <div className="min-h-screen bg-[#f1f3f6] py-8">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <section className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
                    <h1 className="text-2xl font-black text-gray-900 mb-5">Ho tro khach hang</h1>
                    <form onSubmit={handleCreateTicket} className="space-y-4">
                        <input
                            value={form.title}
                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Tieu de yeu cau"
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 outline-none focus:border-[#008d71]"
                            required
                        />
                        <select
                            value={form.category}
                            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 outline-none focus:border-[#008d71]"
                        >
                            <option value="product">San pham</option>
                            <option value="order">Don hang</option>
                            <option value="payment">Thanh toan</option>
                            <option value="other">Khac</option>
                        </select>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Mo ta van de can ho tro..."
                            className="w-full min-h-28 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#008d71]"
                            required
                        />
                        <button
                            disabled={submitting}
                            className="h-11 px-6 bg-[#008d71] text-white rounded-xl font-bold disabled:opacity-60"
                        >
                            {submitting ? 'Dang gui...' : 'Gui yeu cau'}
                        </button>
                    </form>
                    {notice && <p className="mt-4 text-sm font-semibold text-gray-700">{notice}</p>}
                </section>

                <section className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h2 className="text-lg font-black text-gray-900 mb-4">Ticket cua ban</h2>
                    {loading ? (
                        <p className="text-sm text-gray-400">Dang tai...</p>
                    ) : tickets.length === 0 ? (
                        <p className="text-sm text-gray-400">Chua co ticket nao.</p>
                    ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                            {tickets.map((ticket) => (
                                <button
                                    key={ticket._id}
                                    onClick={() => setSelectedTicketId(ticket._id)}
                                    className={`w-full text-left p-3 rounded-xl border ${
                                        selectedTicketId === ticket._id
                                            ? 'border-[#008d71] bg-[#e5f9e0]'
                                            : 'border-gray-100'
                                    }`}
                                >
                                    <p className="font-bold text-sm text-gray-900">{ticket.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{ticket.status}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedTicket && (
                        <div className="mt-5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <p className="text-sm font-bold text-gray-900">{selectedTicket.title}</p>
                            <p className="text-sm text-gray-600 mt-2">{selectedTicket.description}</p>
                            {selectedTicket.adminResponse && (
                                <p className="text-sm text-[#008d71] mt-3">
                                    Phan hoi: {selectedTicket.adminResponse}
                                </p>
                            )}
                        </div>
                    )}
                </section>

                <section className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100">
                    <h2 className="text-lg font-black text-gray-900 mb-4">Cau hoi thuong gap</h2>
                    {faqs.length === 0 ? (
                        <p className="text-sm text-gray-400">Chua co du lieu FAQ.</p>
                    ) : (
                        <div className="space-y-3">
                            {faqs.map((faq) => (
                                <details key={faq._id} className="rounded-xl border border-gray-100 p-4">
                                    <summary className="font-semibold text-gray-900 cursor-pointer">
                                        {faq.question}
                                    </summary>
                                    <p className="text-sm text-gray-600 mt-3">{faq.answer}</p>
                                </details>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CustomerSupportPage;
