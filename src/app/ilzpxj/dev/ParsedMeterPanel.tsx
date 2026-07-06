import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { IconButton, Tooltip } from '@mui/material';
import { PictureAsPdfOutlined, Close, InsertDriveFileOutlined } from '@mui/icons-material';
import { useSession } from '../../../authority/SessionContext';

// 计量点分类：发电关口在前、上网关口在后
export type MeterCategory = '发电关口' | '上网关口';

// 单条示数
export interface MeterReading {
    readingType: string;  // 示数类型（尖/峰/平/谷）
    prevReading: string;  // 上期示数
    currReading: string;  // 本期示数
    ratio: string;        // 倍率
    billingQty: string;   // 计费电量
}

// 按电能表编号分组的计量点
export interface ParsedMeterGroup {
    category: MeterCategory; // 计量点分类
    gateType: string;        // 关口类型
    meterNo: string;         // 电能表编号
    readings: MeterReading[];
}

// 分类排序权重：发电关口在前
const CATEGORY_ORDER: Record<MeterCategory, number> = { '发电关口': 0, '上网关口': 1 };

// 分类标签配色
const CATEGORY_BADGE: Record<MeterCategory, string> = {
    '发电关口': 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100',
    '上网关口': 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
};

// TODO: 接入真实 PDF 解析结果，暂用 mock 数据占位
const MOCK_GROUPS: ParsedMeterGroup[] = [
    {
        category: '发电关口', gateType: '主表', meterNo: '3300012345',
        readings: [
            { readingType: '尖', prevReading: '1120.50', currReading: '1180.30', ratio: '100', billingQty: '5980.00' },
            { readingType: '峰', prevReading: '2200.00', currReading: '2360.80', ratio: '100', billingQty: '16080.00' },
            { readingType: '平', prevReading: '3100.20', currReading: '3305.60', ratio: '100', billingQty: '20540.00' },
            { readingType: '谷', prevReading: '900.00', currReading: '1010.40', ratio: '100', billingQty: '11040.00' },
        ],
    },
    {
        category: '上网关口', gateType: '主表', meterNo: '3300067890',
        readings: [
            { readingType: '尖', prevReading: '800.00', currReading: '845.20', ratio: '100', billingQty: '4520.00' },
            { readingType: '峰', prevReading: '1500.00', currReading: '1602.40', ratio: '100', billingQty: '10240.00' },
            { readingType: '平', prevReading: '2100.00', currReading: '2240.60', ratio: '100', billingQty: '14060.00' },
            { readingType: '谷', prevReading: '600.00', currReading: '668.80', ratio: '100', billingQty: '6880.00' },
        ],
    },
];

const thCls = 'px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-center';
const tdCls = 'px-2 py-2 text-xs text-gray-700 whitespace-nowrap text-center';

interface Props {
    accountNumber?: string;      // 发电户号
    yearMonth?: string;          // 结算月份（YYYY-MM）
    groups?: ParsedMeterGroup[]; // 外部直接传入时优先（否则走接口）
    onClose?: () => void;
    pdfUrl?: string;             // 原始 PDF 链接（后续提供）
}

// 后端返回归一化为分组结构（兼容「已分组」或「扁平行」两种形态）
const normalizeGroups = (raw: any): ParsedMeterGroup[] => {
    const arr: any[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
    if (!Array.isArray(arr) || arr.length === 0) return [];
    // 已是分组结构
    if (arr[0] && Array.isArray(arr[0].readings)) return arr as ParsedMeterGroup[];
    // 扁平行 → 按 电能表编号 分组
    const map = new Map<string, ParsedMeterGroup>();
    for (const r of arr) {
        const category = (r.category ?? '发电关口') as MeterCategory;
        const gateType = String(r.gateType ?? '');
        const meterNo = String(r.meterNo ?? '');
        const key = category + '|' + meterNo;
        if (!map.has(key)) map.set(key, { category, gateType, meterNo, readings: [] });
        map.get(key)!.readings.push({
            readingType: String(r.readingType ?? ''),
            prevReading: String(r.prevReading ?? ''),
            currReading: String(r.currReading ?? ''),
            ratio: String(r.ratio ?? ''),
            billingQty: String(r.billingQty ?? ''),
        });
    }
    return Array.from(map.values());
};

const ParsedMeterPanel: React.FC<Props> = ({ accountNumber, yearMonth, groups, onClose, pdfUrl }) => {
    const { token } = useSession();
    const bpcApiUrl = import.meta.env.VITE_JET_ASP_BPC_API;

    const [resp, setResp] = useState<{ accountNumber?: string; yearMonth?: string; sourceFileUrl?: string; groups: ParsedMeterGroup[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 从后台接口拉取原始数据
    useEffect(() => {
        if (groups) return;                       // 外部直接传入时不请求
        if (!accountNumber || !yearMonth) return; // 参数不全不请求
        setLoading(true);
        setError(null);
        axios.post(`${bpcApiUrl}/surplustogrid/elecdetails/${accountNumber}/${yearMonth}`, {}, {
            headers: { 'Content-Type': 'application/json', grooveToken: token },
        })
            .then((res) => {
                const d = res.data?.data ?? res.data ?? {};
                setResp({
                    accountNumber: d.accountNumber,
                    yearMonth: d.yearMonth,
                    sourceFileUrl: d.sourceFileUrl,
                    groups: normalizeGroups(d.items),
                });
            })
            .catch(() => setError('加载原始数据失败，请稍后重试'))
            .finally(() => setLoading(false));
    }, [accountNumber, yearMonth, groups]);

    const source = groups ?? resp?.groups ?? (accountNumber && yearMonth ? [] : MOCK_GROUPS);
    const effectivePdfUrl = pdfUrl ?? resp?.sourceFileUrl;
    const headerTitle = resp?.accountNumber ?? accountNumber ?? '账单数据';
    const headerSubtitle = resp?.yearMonth ?? yearMonth ?? '从PDF文件中解析抽取';
    // 发电关口在前、上网关口在后
    const ordered = [...source].sort((a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category]);

    // 原始 PDF 浮窗：可拖拽的悬浮窗
    const PDF_MIN_W = 360;
    const PDF_MIN_H = 280;
    const [pdfOpen, setPdfOpen] = useState(false);
    const [pdfPos, setPdfPos] = useState({ x: 0, y: 0 });
    const [pdfSize, setPdfSize] = useState({ w: 520, h: 600 });
    const [pdfDragging, setPdfDragging] = useState(false);
    const [pdfResizing, setPdfResizing] = useState(false);
    const dragRef = useRef<{ dx: number; dy: number } | null>(null);
    const resizeRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

    // 打开：弹在图标按钮的右上方（并做视口边界收敛）
    const openPdf = (e: React.MouseEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const x = Math.max(8, Math.min(r.right + 8, vw - pdfSize.w - 8));
        const y = Math.max(8, Math.min(r.top - pdfSize.h - 8, vh - pdfSize.h - 8));
        setPdfPos({ x, y });
        setPdfOpen(true);
    };

    const onPdfDragMove = (e: MouseEvent) => {
        if (!dragRef.current) return;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const x = Math.max(0, Math.min(e.clientX - dragRef.current.dx, vw - 80));
        const y = Math.max(0, Math.min(e.clientY - dragRef.current.dy, vh - 40));
        setPdfPos({ x, y });
    };
    const onPdfDragEnd = () => {
        dragRef.current = null;
        setPdfDragging(false);
        window.removeEventListener('mousemove', onPdfDragMove);
        window.removeEventListener('mouseup', onPdfDragEnd);
    };
    const onPdfDragStart = (e: React.MouseEvent) => {
        dragRef.current = { dx: e.clientX - pdfPos.x, dy: e.clientY - pdfPos.y };
        setPdfDragging(true);
        window.addEventListener('mousemove', onPdfDragMove);
        window.addEventListener('mouseup', onPdfDragEnd);
        e.preventDefault();
    };

    // 右下角缩放
    const onPdfResizeMove = (e: MouseEvent) => {
        if (!resizeRef.current) return;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = Math.max(PDF_MIN_W, Math.min(resizeRef.current.w + (e.clientX - resizeRef.current.x), vw - pdfPos.x - 8));
        const h = Math.max(PDF_MIN_H, Math.min(resizeRef.current.h + (e.clientY - resizeRef.current.y), vh - pdfPos.y - 8));
        setPdfSize({ w, h });
    };
    const onPdfResizeEnd = () => {
        resizeRef.current = null;
        setPdfResizing(false);
        window.removeEventListener('mousemove', onPdfResizeMove);
        window.removeEventListener('mouseup', onPdfResizeEnd);
    };
    const onPdfResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        resizeRef.current = { x: e.clientX, y: e.clientY, w: pdfSize.w, h: pdfSize.h };
        setPdfResizing(true);
        window.addEventListener('mousemove', onPdfResizeMove);
        window.addEventListener('mouseup', onPdfResizeEnd);
    };

    return (
        <div className="bg-white rounded-xl shadow-2xl ring-1 ring-black/5 border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-slate-50/60">
                <div className="flex items-center gap-2">
                    <PictureAsPdfOutlined sx={{ fontSize: 18, color: '#dc2626' }} />
                    <h3 className="text-sm font-bold text-gray-900 tracking-tight">{headerTitle}</h3>
                    <span className="text-[11px] text-slate-600">{headerSubtitle}</span>
                </div>
                <div className="flex items-center gap-0.5">
                    {effectivePdfUrl && (
                        <Tooltip title="查看原始文件" arrow>
                            <IconButton size="small" onClick={openPdf} aria-label="查看原始PDF">
                                <InsertDriveFileOutlined sx={{ fontSize: 18, color: '#dc2626' }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {onClose && (
                        <IconButton size="small" onClick={onClose} aria-label="关闭">
                            <Close sx={{ fontSize: 18 }} />
                        </IconButton>
                    )}
                </div>

                {/* 原始 PDF 浮窗：可拖拽（portal 到 body，避免受父级 transform 影响） */}
                {pdfOpen && ReactDOM.createPortal(
                    <div
                        className="fixed z-[1300] bg-white rounded-xl shadow-2xl ring-1 ring-black/10 border border-slate-200 overflow-hidden flex flex-col"
                        style={{ left: pdfPos.x, top: pdfPos.y, width: pdfSize.w, height: pdfSize.h }}
                    >
                        <div
                            className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-slate-50 cursor-move select-none"
                            onMouseDown={onPdfDragStart}
                        >
                            <div className="flex items-center gap-2">
                                <PictureAsPdfOutlined sx={{ fontSize: 18, color: '#dc2626' }} />
                                <span className="text-sm font-bold text-gray-900">源文件预览</span>
                                <span className="text-[11px] text-slate-600">{headerSubtitle}</span>
                            </div>
                            <IconButton size="small" onMouseDown={(e) => e.stopPropagation()} onClick={() => setPdfOpen(false)} aria-label="关闭">
                                <Close sx={{ fontSize: 18 }} />
                            </IconButton>
                        </div>
                        <div className="flex-1 bg-slate-100">
                            {effectivePdfUrl ? (
                                <iframe
                                    src={effectivePdfUrl}
                                    title="原始文件"
                                    className="w-full h-full border-0"
                                    style={{ pointerEvents: pdfDragging || pdfResizing ? 'none' : 'auto' }}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                                    <PictureAsPdfOutlined sx={{ fontSize: 40 }} />
                                    <span className="text-xs">源文件URL地址无效</span>
                                </div>
                            )}
                        </div>

                        {/* 右下角缩放手柄 */}
                        <div
                            onMouseDown={onPdfResizeStart}
                            className="absolute bottom-0 right-0 z-10 cursor-nwse-resize"
                            style={{ width: 16, height: 16 }}
                        >
                            <div
                                style={{
                                    position: 'absolute', right: 3, bottom: 3, width: 8, height: 8,
                                    borderRight: '2px solid #94a3b8', borderBottom: '2px solid #94a3b8',
                                    borderBottomRightRadius: 2,
                                }}
                            />
                        </div>
                    </div>,
                    document.body
                )}
            </div>

            <div className="max-h-[70vh] overflow-auto">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                        <tr className="border-b border-gray-200">
                            <th className={thCls}>示数类型</th>
                            <th className={thCls}>上期示数</th>
                            <th className={thCls}>本期示数</th>
                            <th className={thCls}>倍率</th>
                            <th className={thCls}>计费电量</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className={'py-10 text-center text-xs ' + (error ? 'text-red-500' : 'text-slate-400')}>
                                    {loading ? '加载中…' : error ? error : '暂无解析数据'}
                                </td>
                            </tr>
                        ) : (
                            ordered.map((g, gi) => (
                                <React.Fragment key={gi}>
                                    {/* 分组标题：电能表编号置于该组数据上方 */}
                                    <tr>
                                        <td colSpan={5} className="px-3 py-2 bg-slate-50 border-y border-slate-200">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={'px-2 py-0.5 rounded-full text-[11px] font-semibold ' + CATEGORY_BADGE[g.category]}>
                                                    {g.category}
                                                </span>
                                                <span className="text-xs text-slate-500">{g.gateType}</span>
                                                <span className="text-slate-300">·</span>
                                                <span className="text-[11px] text-slate-400">电能表编号</span>
                                                <span className="text-sm font-mono font-semibold text-slate-800">{g.meterNo}</span>
                                            </div>
                                        </td>
                                    </tr>
                                    {g.readings.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className={tdCls + ' text-slate-400'}>—</td>
                                        </tr>
                                    ) : (
                                        g.readings.map((r, ri) => (
                                            <tr key={ri} className="hover:bg-indigo-50/40 transition-colors border-b border-gray-100">
                                                <td className={tdCls}>{r.readingType}</td>
                                                <td className={tdCls + ' font-mono'}>{r.prevReading}</td>
                                                <td className={tdCls + ' font-mono'}>{r.currReading}</td>
                                                <td className={tdCls + ' font-mono'}>{r.ratio}</td>
                                                <td className={tdCls + ' font-mono text-gray-900 font-semibold'}>{r.billingQty}</td>
                                            </tr>
                                        ))
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ParsedMeterPanel;
