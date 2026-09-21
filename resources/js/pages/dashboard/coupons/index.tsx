import { Head, router } from '@inertiajs/react';
import { Edit, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Coupon {
    id: number;
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    min_order_amount: number;
    max_discount_amount?: number | null;
    usage_limit?: number | null;
    used_count: number;
    is_active: boolean;
    is_valid: boolean;
    expires_at?: string | null;
    created_at: string;
}

interface Props { coupons: Coupon[]; }

const BLANK = { code: '', discount_type: 'percent' as 'percent' | 'fixed', discount_value: '', min_order_amount: '', max_discount_amount: '', usage_limit: '', is_active: true, expires_at: '' };

export default function CouponsIndex({ coupons }: Props) {
    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ ...BLANK });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setForm((p) => ({ ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    };

    const startEdit = (c: Coupon) => {
        setEditingId(c.id);
        setForm({ code: c.code, discount_type: c.discount_type, discount_value: String(c.discount_value), min_order_amount: String(c.min_order_amount), max_discount_amount: c.max_discount_amount ? String(c.max_discount_amount) : '', usage_limit: c.usage_limit ? String(c.usage_limit) : '', is_active: c.is_active, expires_at: c.expires_at ?? '' });
        setShowAdd(false);
    };

    const reset = () => { setShowAdd(false); setEditingId(null); setForm({ ...BLANK }); setErrors({}); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const data = { ...form, is_active: Boolean(form.is_active) };
        const url = editingId ? `/dashboard/coupons/${editingId}` : '/dashboard/coupons';
        router.post(url, data, {
            onSuccess: () => { toast.success(editingId ? 'কুপন আপডেট হয়েছে!' : 'কুপন যোগ হয়েছে!'); reset(); },
            onError: (errs) => { setErrors(errs); toast.error('সমস্যা হয়েছে।'); },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (id: number, code: string) => {
        if (!confirm(`"${code}" কুপন মুছবেন?`)) return;
        router.delete(`/dashboard/coupons/${id}`, { onSuccess: () => toast.success('মুছে ফেলা হয়েছে।') });
    };

    const isOpen = showAdd || editingId !== null;

    return (
        <>
            <Head title="কুপন — Bazar Ghor Admin" />
            <div className="p-6 max-w-5xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">কুপন ব্যবস্থাপনা</h1>
                    <button onClick={() => { setShowAdd(true); setEditingId(null); setForm({ ...BLANK }); }}
                        className="flex items-center gap-2 rounded-xl bg-[#2d6a27] px-5 py-2.5 font-semibold text-white hover:bg-[#3d8f33]">
                        <Plus size={18} /> নতুন কুপন
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">কোড</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ছাড়</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">ব্যবহার</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">স্ট্যাটাস</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">অ্যাকশন</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.length === 0 ? (
                                        <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">কোনো কুপন নেই</td></tr>
                                    ) : coupons.map((c) => (
                                        <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <p className="font-mono font-bold text-gray-800">{c.code}</p>
                                                {c.min_order_amount > 0 && <p className="text-xs text-gray-400">মিনিমাম ৳{Number(c.min_order_amount).toLocaleString()}</p>}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-[#2d6a27]">
                                                {c.discount_type === 'percent' ? `${c.discount_value}%` : `৳${c.discount_value}`}
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell text-gray-600 text-xs">
                                                {c.used_count}{c.usage_limit ? `/${c.usage_limit}` : ''} বার
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.is_valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                    {c.is_valid ? 'সক্রিয়' : 'মেয়াদ শেষ'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => startEdit(c)} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"><Edit size={15} /></button>
                                                    <button onClick={() => handleDelete(c.id, c.code)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"><Trash2 size={15} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Form */}
                    {isOpen && (
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-bold text-gray-800">{editingId ? 'কুপন সম্পাদনা' : 'নতুন কুপন'}</h2>
                                <button onClick={reset}><X size={18} className="text-gray-400" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">কুপন কোড *</label>
                                    <input name="code" value={form.code} onChange={handleChange} placeholder="SAVE20"
                                        className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm font-mono uppercase focus:border-[#2d6a27] focus:outline-none" />
                                    {errors.code && <p className="text-xs text-red-500 mt-0.5">{errors.code}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">ছাড়ের ধরন</label>
                                        <select name="discount_type" value={form.discount_type} onChange={handleChange}
                                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2d6a27] focus:outline-none">
                                            <option value="percent">শতাংশ (%)</option>
                                            <option value="fixed">নির্দিষ্ট (৳)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">ছাড়ের পরিমাণ *</label>
                                        <input type="number" name="discount_value" value={form.discount_value} onChange={handleChange} placeholder="10"
                                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2d6a27] focus:outline-none" />
                                        {errors.discount_value && <p className="text-xs text-red-500">{errors.discount_value}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-600">সর্বনিম্ন অর্ডার (৳)</label>
                                    <input type="number" name="min_order_amount" value={form.min_order_amount} onChange={handleChange} placeholder="0"
                                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2d6a27] focus:outline-none" />
                                </div>

                                {form.discount_type === 'percent' && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">সর্বোচ্চ ছাড় (৳)</label>
                                        <input type="number" name="max_discount_amount" value={form.max_discount_amount} onChange={handleChange} placeholder="ঐচ্ছিক"
                                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2d6a27] focus:outline-none" />
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-medium text-gray-600">ব্যবহারের সীমা</label>
                                    <input type="number" name="usage_limit" value={form.usage_limit} onChange={handleChange} placeholder="সীমা নেই"
                                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2d6a27] focus:outline-none" />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-600">মেয়াদ শেষ</label>
                                    <input type="date" name="expires_at" value={form.expires_at} onChange={handleChange}
                                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2d6a27] focus:outline-none" />
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="is_active" checked={Boolean(form.is_active)} onChange={handleChange} className="h-4 w-4 accent-[#2d6a27]" />
                                    <span className="text-sm font-medium text-gray-700">সক্রিয় করুন</span>
                                </label>

                                <button type="submit" disabled={submitting}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d6a27] py-2.5 font-bold text-white hover:bg-[#3d8f33] disabled:opacity-60">
                                    {submitting ? <><Loader2 size={16} className="animate-spin" /> অপেক্ষা...</> : (editingId ? 'আপডেট' : 'কুপন যোগ')}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
