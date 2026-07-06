import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import axios from 'axios';

import { useAlert } from '../../../components/AlertContext';
import { useSession } from '../../../authority/SessionContext';

interface ConsumptionPriceSettingProps {
    generationAccount: string; // 发电户号
    recordId?: number;         // pkGvfrokeq，用于加载/保存该条用电量统计记录的峰平尖谷电价
    settlementDate?: string;   // 结算日期（仅用于显示）
    onClose?: () => void;      // 收起内联面板
}

// 峰 / 平 / 尖 / 谷 四个时段（后端返回的 array 默认按此顺序排列）
const PERIODS = [
    { key: 'feng', label: '峰' },
    { key: 'ping', label: '平' },
    { key: 'jian', label: '尖' },
    { key: 'gu', label: '谷' },
] as const;

// 后端返回行：array[{ id, name, amount, price }]
interface PriceItem {
    id: number | null;
    name: string;
    amount: string; // 电量（千瓦时），可修改
    price: string;  // 电价（元/千瓦时）
}

// 解析为数字（空 / 非法按 0）
const num = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

// 校验电价：允许留空（后台更新为 null）；非空时需为有效数字且 >= 0
const validatePrice = (v: string): string => {
    if (v.trim() === '') return '';
    const n = Number(v);
    if (!Number.isFinite(n)) return '电价必须是有效数字';
    if (n < 0) return '电价不能小于 0';
    return '';
};

const thStyle = 'py-2 px-3 text-xs font-semibold text-gray-600';
const tdStyle = 'py-2 px-3 text-sm text-gray-700 align-top';
const cellInput =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-right text-gray-900 ' +
    'focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500';
// 电价输入框样式（区分校验错误态，避免 Tailwind 同属性类名冲突）
const priceInputClass = (hasError: boolean) =>
    'w-full rounded-md border bg-white px-3 py-1.5 text-sm text-right text-gray-900 focus:outline-none focus:ring-2 ' +
    (hasError
        ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400'
        : 'border-gray-300 focus:ring-violet-500/40 focus:border-violet-500');

const ConsumptionPriceSetting: React.FC<ConsumptionPriceSettingProps> = ({ generationAccount, recordId, settlementDate, onClose }) => {
    const { token } = useSession();
    const { showAlert } = useAlert();

    const [items, setItems] = useState<PriceItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    // 电价校验错误，按行下标存储
    const [errors, setErrors] = useState<Record<number, string>>({});

    // 展开时按 recordId 加载峰平尖谷电价（array 默认按峰平尖谷顺序排列）
    useEffect(() => {
        if (recordId == null) {
            setItems([]);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setErrors({});
        axios
            .post(`${import.meta.env.VITE_JET_ASP_BPC_API}/selfconsumption/price/setting/${recordId}`, {}, {
                headers: { 'Content-Type': 'application/json', grooveToken: token },
            })
            .then((res) => {
                if (cancelled) return;
                const arr = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
                setItems(arr.map((it: any) => ({
                    id: it.id ?? null,
                    name: it.name ?? '',
                    amount: it.amount != null ? String(it.amount) : '',
                    price: it.price != null ? String(it.price) : '',
                })));
            })
            .catch((err) => {
                if (cancelled) return;
                const status = err.response?.status;
                showAlert(status === 401 ? (err.response?.data ?? '未授权') : '加载电价设置失败，请稍后重试。', 'error');
                setItems([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recordId, token]);

    const handleChange = (index: number, field: 'amount' | 'price', value: string) => {
        setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
        if (field === 'price') {
            setErrors((prev) => {
                const next = { ...prev };
                const err = validatePrice(value);
                if (err) next[index] = err;
                else delete next[index];
                return next;
            });
        }
    };

    const handleSave = () => {
        // 保存前校验所有电价
        const newErrors: Record<number, string> = {};
        items.forEach((it, i) => {
            const err = validatePrice(it.price);
            if (err) newErrors[i] = err;
        });
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setSaving(true);
        // 保存：json 数组，每项 { id, amount, price }；电价留空时传 null，后台更新为 null
        const payload = items.map((it) => ({
            id: it.id,
            amount: num(it.amount),
            price: it.price.trim() === '' ? null : num(it.price),
        }));
        axios
            .post(`${import.meta.env.VITE_JET_ASP_BPC_API}/selfconsumption/price/update`, payload, {
                headers: { 'Content-Type': 'application/json', grooveToken: token },
            })
            .then((res) => {
                if (res.data?.success === false) {
                    showAlert(res.data?.message ?? '保存失败', 'error');
                } else {
                    showAlert('保存成功', 'success');
                }
            })
            .catch((err) => {
                const status = err.response?.status;
                showAlert(status === 401 ? (err.response?.data ?? '未授权') : '保存失败，请稍后重试。', 'error');
            })
            .finally(() => setSaving(false));
    };

    return (
        <div className="px-6 py-5">
            <div className="w-1/2 min-w-[320px] max-w-full">
            <div className="flex items-center justify-between gap-8 mb-3">
                <h3 className="text-sm font-bold text-gray-800">
                    电价详情设置
                    {settlementDate ? <span className="ml-2 font-normal text-gray-400">结算日期：{settlementDate}</span> : null}
                </h3>
                <div className="flex items-center gap-2">
                    {onClose && (
                        <button
                            className="text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                            onClick={onClose}
                        >
                            收起
                        </button>
                    )}
                    <button
                        disabled={saving || loading}
                        className="text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-60 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors shadow-sm"
                        onClick={handleSave}
                    >
                        保存
                    </button>
                </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-slate-50/80">
                            <th className={thStyle}>时段</th>
                            <th className={`${thStyle} text-right`}>电量（千瓦时）</th>
                            <th className={`${thStyle} text-right`}>电价（元/千瓦时）</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="py-8 text-center">
                                    <CircularProgress size={20} sx={{ color: '#7c3aed' }} />
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-sm text-slate-400">暂无电价数据</td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={item.id ?? index} className="hover:bg-gray-50/50 transition-colors">
                                    <td className={tdStyle}>
                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700">
                                            {PERIODS[index]?.label ?? item.name}
                                        </span>
                                    </td>
                                    <td className={`${tdStyle} text-right`}>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            className={cellInput}
                                            placeholder="0"
                                            value={item.amount}
                                            onChange={(e) => handleChange(index, 'amount', e.target.value)}
                                        />
                                    </td>
                                    <td className={`${tdStyle} text-right`}>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            min={0}
                                            className={priceInputClass(!!errors[index])}
                                            placeholder="0.0000"
                                            value={item.price}
                                            onChange={(e) => handleChange(index, 'price', e.target.value)}
                                        />
                                        {errors[index] && (
                                            <p className="mt-1 text-xs text-red-500 text-right">{errors[index]}</p>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            </div>
        </div>
    );
};

export default ConsumptionPriceSetting;
