import React, { useEffect, useState } from 'react';
import { Typography, Paper, IconButton, CircularProgress, Tooltip, Collapse } from '@mui/material';
import {
  ChevronRight, Business, LocationOn,
  Edit, Delete,
  Pageview,
  CheckCircleOutline,
  CancelOutlined,
  Search,
  KeyboardArrowUp,
  KeyboardArrowDown,
  BoltOutlined,
  PowerOutlined,
  CurrencyYen
} from '@mui/icons-material';

import { Dialog, Slide } from '@mui/material';

import { type TransitionProps } from '@mui/material/transitions';

import axios from 'axios';

import { useAlert } from '../../../components/AlertContext.tsx';
import { useSession } from '../../../authority/SessionContext.tsx';
import { useConfirm } from '../../../components/useConfirmDialog';

import Parameterization from '../../../components/RenderComponent.tsx';
import { WrapSoloFormNode } from '../../../components/WrapNode.tsx';
import SelfConsumptionDialog from '../../../components/FormDialogSoloPage.tsx';
import SurplusToGridDialog from '../../../components/FormDialogSoloPage.tsx';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Settlement {
  year: number;
  selfConsumptionSumResult: string;
  surplusToGridId: number;
  surplusToGridSumResult: string;
  isLatest: boolean;
}

interface Merchant {
  id: number;
  projectName: string;
  settlementTypeId: string;
  settlementType: string;
  name: string;
  type: string;
  priceBasis: string;
  number: string;
  address: string;
  totalSettlement: string;
  annualSettlement: string;
  isBothSettlement: boolean;
  settlementList: Settlement[];
}

interface SelfConsumptionItem {
  id: number;
  name: string;
  selfUsedTotal: string;
  selfUsedFee: string;
  settlementDate: string;
  relatedBillId: number | null;
}

interface SurplusToGridItem {
  id: number;
  name: string;
  surplusToGridTotal: string;
  surplusToGridFee: string;
  settlementDate: string;
  relatedBillId: number | null;
}

// --- 财务视角辅助：金额解析 / 格式化 / 结算状态推导 ---
type SettleStatus = 'settled' | 'partial' | 'pending';

const STATUS_META: Record<SettleStatus, { label: string; dot: string; chip: string }> = {
  settled: { label: '已结算', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-600' },
  partial: { label: '部分结算', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-600' },
  pending: { label: '待结算', dot: 'bg-slate-400', chip: 'bg-slate-100 text-slate-500' },
};

// 把后端返回的金额字符串（可能带 ¥、逗号、'-'）解析为数字
const parseMoney = (v?: string | number | null): number => {
  if (v == null) return 0;
  const n = Number(String(v).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

// 千分位 + 两位小数（不含币种符号）；兼容后端返回的字符串/数字，非数字返回 '-'
const formatMoney = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  return Number.isNaN(num)
    ? '-'
    : num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// 单个商户的财务摘要（全部来自真实 settlementList 数据）
const deriveMerchantFinance = (m: Merchant) => {
  const list = Array.isArray(m.settlementList) ? m.settlementList : [];
  const latest =
    list.find((s) => s.isLatest) ??
    [...list].sort((a, b) => b.year - a.year)[0] ??
    null;

  const selfAmt = parseMoney(latest?.selfConsumptionSumResult);
  const surplusAmt = parseMoney(latest?.surplusToGridSumResult);
  const annual = selfAmt + surplusAmt;
  const total = list.reduce(
    (sum, s) => sum + parseMoney(s.selfConsumptionSumResult) + parseMoney(s.surplusToGridSumResult),
    0,
  );

  const needSurplus = m.isBothSettlement === true;
  const hasSelf = selfAmt > 0;
  const hasSurplus = surplusAmt > 0;

  let status: SettleStatus;
  if (!hasSelf && !hasSurplus) status = 'pending';
  else if (needSurplus && !(hasSelf && hasSurplus)) status = 'partial';
  else status = 'settled';

  return { latest, selfAmt, surplusAmt, annual, total, status, needSurplus };
};

// --- 1. 动画组件 (MUI 逻辑) ---
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface BillData {
  id: number;
  month: string;
  unit: string;
  account: string;
  state: string;
  details: any[]; // 根据你的表头定义更具体的类型
}

// --- 财务报表通用头部 / 页脚 ---
const BillReportHeader: React.FC<{ title: string; unit: string; period: string; state: string }> = ({
  title, unit, period, state,
}) => (
  <div className="mb-8 border-b border-slate-200 pb-6">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold tracking-[0.3em] text-slate-500 uppercase mb-1">电费结算财务报表</p>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">{title}</h2>
        <p className="text-slate-600 text-sm mt-1">编制单位：<span className="font-medium text-slate-800">{unit}</span></p>
        <p className="text-slate-600 text-xs mt-1">单位：<span className="">元/千千瓦时</span></p>
      </div>
      <div className="flex gap-2">
        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">{state}</span>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">所属期 {period}</span>
      </div>
    </div>
  </div>
);

const BillReportFooter: React.FC = () => (
  <div className="mt-6 flex flex-wrap items-center justify-end gap-x-10 gap-y-2 text-xs text-slate-500 px-1">
    <span>制表人：________</span>
    <span>复核人：________</span>
    <span>制表日期：{new Date().toLocaleDateString('zh-CN')}</span>
  </div>
);

// --- 代理价格结算单详情页面 ---
const AgentPriceBillContent: React.FC<{ id: number }> = ({ id }) => {
  const { token } = useSession();

  const [loading, setLoading] = useState<boolean>(true);
  const [billData, setBillData] = useState<BillData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 定义获取数据的异步函数
    const fetchBillDetail = async () => {
      setLoading(true);
      setError(null);

      axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/queryformdata/view_tb_qyfyxnob_kaiinc/' + id, {}, {
        headers: {
          'Content-Type': 'application/json',
          'grooveToken': token
        }
      }).then(response => {
        if (response.data && response.data.success) {
          // response.data.data
          console.log('Fetched bill detail:', response.data.data);

          const date = new Date(response.data.data.omtwplej);

          const formattedDate = date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: 'long', // 'long' 会显示 "一月"，'short' 会显示 "1月"
          }).replace(' ', '');

          setBillData({
            id: id,
            month: formattedDate,
            unit: response.data.data.mbnwpthn,
            account: response.data.data.muswisjh,
            state: '审核中',
            details: response.data.data.listYfvuhw, // 这里需要根据实际数据结构进行解析和赋值
          });
        } else {
          setError('Server returned invalid data.');
        }
      }).catch(error => {
        if (error instanceof Error) {
          const wrapError = error as { response?: { status: number, data: any } };
          if (wrapError.response?.status == 400) {
            setError('Bad format request');
          } else if (wrapError.response?.status == 401) {
            setError(wrapError.response?.data);
          } else {
            setError('加载结算单数据失败，请稍后重试');
          }
        }
      }).finally(() => {
        setLoading(false);
      });
    };

    if (id) {
      fetchBillDetail();
    }
  }, [id]); // 监听 id 变化，当传入不同 id 时重新触发

  // 1. 加载状态：显示秀气的加载动画
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <CircularProgress size={24} sx={{ color: '#0f172a' }} />
        <p className="text-xs text-slate-600 tracking-widest uppercase">正在加载数据...</p>
      </div>
    );
  }

  // 2. 错误状态
  if (error || !billData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-sm text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-full text-slate-800">
      <BillReportHeader
        title={`${billData?.month}电费结算单`}
        unit={billData?.unit ?? ''}
        period={billData?.month ?? ''}
        state={billData?.state ?? ''}
      />

      {/* 表格区域：纯 Tailwind 样式 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-[12px]">
            <thead>
              {/* 第一层：大分类 */}
              <tr className="bg-slate-50/80 text-slate-800 font-bold border-b border-slate-200">
                <th rowSpan={2} className="p-3 border-r border-slate-200 min-w-[120px] text-slate-800">
                  项目名称
                </th>
                <th colSpan={7} className="p-2 border-r border-slate-200">当月数据</th>
                <th colSpan={6} className="p-2 border-r border-slate-200">累计数据</th>
                <th rowSpan={2} className="p-3 min-w-[80px]">备注</th>
              </tr>

              {/* 第二层：具体指标 */}
              <tr className="bg-slate-50/50 text-slate-800 font-bold border-b border-slate-200">
                {/* 当月数据明细 */}
                <th className="p-2 border-r border-slate-100 font-medium">结算电量</th>
                <th className="p-2 border-r border-slate-100 font-medium">代购电价</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价（含税）</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价（不含税）</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th className="p-2 border-r border-slate-100 font-medium">营业收入</th>
                <th className="p-2 border-r border-slate-200 font-medium">销项税额</th>

                {/* 累计数据明细 */}
                <th className="p-2 border-r border-slate-100 font-medium">结算电量</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价（含税）</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价（不含税）</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th className="p-2 border-r border-slate-100 font-medium">营业收入</th>
                <th className="p-2 border-r border-slate-100 font-medium">销项税额</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-900">
              {billData.details && billData.details.length > 0 ? (
                billData.details.map((item, index) => (
                  <tr className="even:bg-slate-50/40 hover:bg-blue-50/40 transition-colors" key={index}>
                    <td className="p-3 border-r border-slate-100 font-bold">{item}</td>
                    <td className="p-3 border-r border-slate-100 font-mono">37,000.00</td>
                    <td className="p-3 border-r border-slate-100 font-mono italic text-slate-400">-</td>
                    <td className="p-3 border-r border-slate-100 font-mono">0.690292</td>
                    <td className="p-3 border-r border-slate-100 font-mono">0.610878</td>
                    <td className="p-3 border-r border-slate-100 font-mono">25,540.79</td>
                    <td className="p-3 border-r border-slate-100 font-mono">22,602.47</td>
                    <td className="p-3 border-r border-slate-200 font-mono">2,938.32</td>
                    {/* 累计数据示例 */}
                    <td className="p-3 border-r border-slate-100 font-mono">160,300.00</td>
                    <td className="p-3 border-r border-slate-100 font-mono">0.713469</td>
                    <td className="p-3 border-r border-slate-100 font-mono">0.631389</td>
                    <td className="p-3 border-r border-slate-100 font-mono">114,369.15</td>
                    <td className="p-3 border-r border-slate-100 font-mono">101,211.64</td>
                    <td className="p-3 border-r border-slate-100 font-mono">13,157.51</td>
                    <td className="p-3">-</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={16} className="p-3 text-center text-slate-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BillReportFooter />
    </div>
  );
};

// --- 商户电费结算单详情页面 ---
const MerchantBillContent: React.FC<{ id: number }> = ({ id }) => {
  const { token } = useSession();

  const [loading, setLoading] = useState<boolean>(true);
  const [billData, setBillData] = useState<BillData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 定义获取数据的异步函数
    const fetchBillDetail = async () => {
      setLoading(true);
      setError(null);

      axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/queryformdata/view_tb_lgtnnfgg_bdonpj/' + id, {}, {
        headers: {
          'Content-Type': 'application/json',
          'grooveToken': token
        }
      }).then(response => {
        if (response.data && response.data.success) {
          // response.data.data
          console.log('Fetched bill detail:', response.data.data);

          const date = new Date(response.data.data.odjdvwac);

          const formattedDate = date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: 'long', // 'long' 会显示 "一月"，'short' 会显示 "1月"
          }).replace(' ', '');

          setBillData({
            id: id,
            month: formattedDate,
            unit: response.data.data.yagcdbmm,
            account: response.data.data.colVcuumj,
            state: '审核中',
            details: response.data.data.listXagloo, // 这里需要根据实际数据结构进行解析和赋值
          });
        } else {
          setError('Server returned invalid data.');
        }
      }).catch(error => {
        if (error instanceof Error) {
          const wrapError = error as { response?: { status: number, data: any } };
          if (wrapError.response?.status == 400) {
            setError('Bad format request');
          } else if (wrapError.response?.status == 401) {
            setError(wrapError.response?.data);
          } else {
            setError('加载结算单数据失败，请稍后重试');
          }
        }
      }).finally(() => {
        setLoading(false);
      });
    };

    if (id) {
      fetchBillDetail();
    }
  }, [id]); // 监听 id 变化，当传入不同 id 时重新触发

  // 1. 加载状态：显示秀气的加载动画
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <CircularProgress size={24} sx={{ color: '#0f172a' }} />
        <p className="text-xs text-slate-600 tracking-widest uppercase">正在加载数据...</p>
      </div>
    );
  }

  // 2. 错误状态
  if (error || !billData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-sm text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-full text-slate-800" id="report-elem">
      <BillReportHeader
        title={`${billData?.month}电费结算单`}
        unit={billData?.unit ?? ''}
        period={billData?.month ?? ''}
        state={billData?.state ?? ''}
      />

      {/* 表格区域：纯 Tailwind 样式 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-[12px]">
            <thead>
              {/* 第一层：大分类 */}
              <tr className="bg-slate-50/80 text-slate-800 font-bold border-b border-slate-200">
                <th rowSpan={2} className="p-3 border-r border-slate-200 min-w-[120px] text-slate-800">
                  项目名称
                </th>
                <th colSpan={7} className="p-2 border-r border-slate-200">当月数据</th>
                <th colSpan={6} className="p-2 border-r border-slate-200">累计数据</th>
                <th rowSpan={2} className="p-3 min-w-[80px]">备注</th>
              </tr>

              {/* 第二层：具体指标 */}
              <tr className="bg-slate-50/50 text-slate-800 font-bold border-b border-slate-200">
                {/* 当月数据明细 */}
                <th className="p-2 border-r border-slate-100 font-medium">结算电量</th>
                <th className="p-2 border-r border-slate-100 font-medium">国网电价</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价（含税）</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价（不含税）</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th className="p-2 border-r border-slate-100 font-medium">营业收入</th>
                <th className="p-2 border-r border-slate-200 font-medium">销项税额</th>

                {/* 累计数据明细 */}
                <th className="p-2 border-r border-slate-100 font-medium">结算电量</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价（含税）</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价（不含税）</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th className="p-2 border-r border-slate-100 font-medium">营业收入</th>
                <th className="p-2 border-r border-slate-100 font-medium">销项税额</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-900">
              {billData.details && billData.details.length > 0 ? (
                billData.details.map((item, index) => (
                  <tr className="even:bg-slate-50/40 hover:bg-blue-50/40 transition-colors" key={index}>
                    <td className="p-3 border-r border-slate-100 font-mono">{item.lthpoiid}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.jkvkqasy ? 'italic text-slate-400' : '')}>{item.jkvkqasy ? item.jkvkqasy : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.bojynqlr ? 'italic text-slate-400' : '')}>{item.bojynqlr ? Number(item.bojynqlr).toFixed(2) : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.dldpvrrr ? 'italic text-slate-400' : '')}>{item.dldpvrrr ? Number(item.dldpvrrr).toFixed(2) : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.xatbfkda ? 'italic text-slate-400' : '')}>{item.xatbfkda ? Number(item.xatbfkda).toFixed(2) : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.jvpxjaqg ? 'italic text-slate-400' : '')}>{item.jvpxjaqg ? Number(item.jvpxjaqg).toFixed(2) : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.ksdmwveh ? 'italic text-slate-400' : '')}>{item.ksdmwveh ? Number(item.ksdmwveh).toFixed(2) : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.fzzwewsa ? 'italic text-slate-400' : '')}>{item.fzzwewsa ? Number(item.fzzwewsa).toFixed(2) : '-'}</td>
                    {/* 累计数据示例 */}
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.vbbrigih ? 'italic text-slate-400' : '')}>{item.vbbrigih ? item.vbbrigih : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.zgcbnfjo ? 'italic text-slate-400' : '')}>{item.zgcbnfjo ? Number(item.zgcbnfjo).toFixed(2) : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.ddvacirx ? 'italic text-slate-400' : '')}>{item.ddvacirx ? Number(item.ddvacirx).toFixed(2) : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.yvbkpsbb ? 'italic text-slate-400' : '')}>{item.yvbkpsbb ? Number(item.yvbkpsbb).toFixed(2) : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.okjbddep ? 'italic text-slate-400' : '')}>{item.okjbddep ? Number(item.okjbddep).toFixed(2) : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.hbzfvhlz ? 'italic text-slate-400' : '')}>{item.hbzfvhlz ? Number(item.hbzfvhlz).toFixed(2) : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.ahdikvey ? 'italic text-slate-400' : '')}>{item.ahdikvey ? Number(item.ahdikvey).toFixed(2) : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={17} className="p-3 text-center text-slate-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BillReportFooter />
    </div>
  );
};

// --- 固定价格结算单详情页面 ---
const FixedPriceBillContent: React.FC<{ id: number }> = ({ id }) => {
  const { token } = useSession();

  const [loading, setLoading] = useState<boolean>(true);
  const [billData, setBillData] = useState<BillData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 定义获取数据的异步函数
    const fetchBillDetail = async () => {
      setLoading(true);
      setError(null);

      axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/queryformdata/view_tb_cuqscwai_clbnay/' + id, {}, {
        headers: {
          'Content-Type': 'application/json',
          'grooveToken': token
        }
      }).then(response => {
        if (response.data && response.data.success) {
          // response.data.data
          // console.log('Fetched bill detail:', response.data.data);

          const date = new Date(response.data.data.omtwplej);

          const formattedDate = date.toLocaleString('zh-CN', { year: 'numeric' });

          setBillData({
            id: id,
            month: formattedDate,
            unit: response.data.data.mbnwpthn,
            account: response.data.data.muswisjh,
            state: '审核中',
            details: response.data.data.listYfvuhw, // 这里需要根据实际数据结构进行解析和赋值
          });
        } else {
          setError('Server returned invalid data.');
        }
      }).catch(error => {
        if (error instanceof Error) {
          const wrapError = error as { response?: { status: number, data: any } };
          if (wrapError.response?.status == 400) {
            setError('Bad format request');
          } else if (wrapError.response?.status == 401) {
            setError(wrapError.response?.data);
          } else {
            setError('加载结算单数据失败，请稍后重试');
          }
        }
      }).finally(() => {
        setLoading(false);
      });
    };

    if (id) {
      fetchBillDetail();
    }
  }, [id]); // 监听 id 变化，当传入不同 id 时重新触发

  // 1. 加载状态：显示秀气的加载动画
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <CircularProgress size={24} sx={{ color: '#0f172a' }} />
        <p className="text-xs text-slate-600 tracking-widest uppercase">正在加载数据...</p>
      </div>
    );
  }

  // 2. 错误状态
  if (error || !billData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-sm text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-full text-slate-800" id='report-elem'>
      <BillReportHeader
        title={`${billData?.month}电费结算单`}
        unit={billData?.unit ?? ''}
        period={billData?.month ?? ''}
        state={billData?.state ?? ''}
      />

      {/* 表格区域：纯 Tailwind 样式 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              {/* 第一层：核心分类 */}
              <tr className="bg-slate-50/80 text-slate-800 font-bold border-b border-slate-200">
                <th rowSpan={3} className="p-2 border-r border-slate-200 min-w-[80px]">所属期</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">总上网电量</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">上网电量</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">客户用电量</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">补贴电量</th>
                <th colSpan={4} className="p-2 border-r border-slate-200">合计</th>
                <th colSpan={5} className="p-2 border-r border-slate-200">余电上网部分</th>
                <th colSpan={4} className="p-2 border-r border-slate-200">自发自用部分</th>
              </tr>

              {/* 第二层 & 第三层：细分指标 */}
              <tr className="bg-slate-50/50 text-slate-800 font-bold border-b border-slate-200">
                {/* 合计子表头 */}
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电价<br />(含税)</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th rowSpan={2} className="p-2 border-r border-slate-200 font-medium">结算收入</th>
                <th rowSpan={2} className="p-2 border-r border-slate-200 font-medium">销项税额</th>

                {/* 余电上网子表头 */}
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电价<br />(含税)</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th rowSpan={2} className="p-2 border-r border-slate-200 font-medium">结算收入</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">销项税额</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">补贴金额</th>

                {/* 自发自用子表头 */}
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电价<br />(含税)</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">营业收入</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">销项税额</th>
              </tr>
              {/* 第三层级逻辑已并入第二层 rowSpan */}
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-900">
              {billData.details && billData.details.length > 0 ? (
                billData.details.map((item, index) => {
                  const date = new Date(item.qrfxwkpy);

                  const formattedDate = date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: 'long', // 'long' 会显示 "一月"，'short' 会显示 "1月"
                  }).replace(' ', '');

                  return (
                    <tr className="even:bg-slate-50/40 hover:bg-blue-50/40 transition-colors" key={index}>
                      <td className="p-3 border-r border-slate-100">{formattedDate}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.umakupcb)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.ovehnwzi)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.kdaiahlw)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.colYwkcgr)}</td>

                      {/* 合计数据列 */}
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.fgtqnhyn)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.nwcjwyrf)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.mrseixpo)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.kdzxnwil)}</td>

                      {/* 余电上网数据列 */}
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.qgwvxncr)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.jshfcttg)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.tpjmbqpf)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.rxnrcarc)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.colTgqbxp)}</td>

                      {/* 自发自用数据列 */}
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.afnfufjj)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.szimebex)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.nughvqbr)}</td>
                      <td className="p-3">{formatMoney(item.huscgxas)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={16} className="p-3 text-center text-slate-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BillReportFooter />
    </div >
  );
};

// --- 全额上网电费结算单详情页面（复制自余电上网结算单，去除「自发自用」相关内容） ---
const FullGridBillContent: React.FC<{ id: number }> = ({ id }) => {
  const { token } = useSession();

  const [loading, setLoading] = useState<boolean>(true);
  const [billData, setBillData] = useState<BillData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 定义获取数据的异步函数
    const fetchBillDetail = async () => {
      setLoading(true);
      setError(null);

      axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/queryformdata/view_tb_cuqscwai_clbnay/' + id, {}, {
        headers: {
          'Content-Type': 'application/json',
          'grooveToken': token
        }
      }).then(response => {
        if (response.data && response.data.success) {
          const date = new Date(response.data.data.omtwplej);

          const formattedDate = date.toLocaleString('zh-CN', { year: 'numeric' });

          setBillData({
            id: id,
            month: formattedDate,
            unit: response.data.data.mbnwpthn,
            account: response.data.data.muswisjh,
            state: '审核中',
            details: response.data.data.listYfvuhw,
          });
        } else {
          setError('Server returned invalid data.');
        }
      }).catch(error => {
        if (error instanceof Error) {
          const wrapError = error as { response?: { status: number, data: any } };
          if (wrapError.response?.status == 400) {
            setError('Bad format request');
          } else if (wrapError.response?.status == 401) {
            setError(wrapError.response?.data);
          } else {
            setError('加载结算单数据失败，请稍后重试');
          }
        }
      }).finally(() => {
        setLoading(false);
      });
    };

    if (id) {
      fetchBillDetail();
    }
  }, [id]);

  // 1. 加载状态：显示秀气的加载动画
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <CircularProgress size={24} sx={{ color: '#0f172a' }} />
        <p className="text-xs text-slate-600 tracking-widest uppercase">正在加载数据...</p>
      </div>
    );
  }

  // 2. 错误状态
  if (error || !billData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-sm text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-full text-slate-800" id='report-elem'>
      <BillReportHeader
        title={`${billData?.month}电费结算单`}
        unit={billData?.unit ?? ''}
        period={billData?.month ?? ''}
        state={billData?.state ?? ''}
      />

      {/* 表格区域：纯 Tailwind 样式（全额上网：无自发自用部分） */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              {/* 第一层：核心分类 */}
              <tr className="bg-slate-50/80 text-slate-800 font-bold border-b border-slate-200">
                <th rowSpan={3} className="p-2 border-r border-slate-200 min-w-[80px]">所属期</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">总上网电量</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">余电上网电量</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">补贴电量</th>
                <th colSpan={4} className="p-2 border-r border-slate-200">合计</th>
                <th colSpan={5} className="p-2 border-r border-slate-200">余电上网部分</th>
              </tr>

              {/* 第二层 & 第三层：细分指标 */}
              <tr className="bg-slate-50/50 text-slate-800 font-bold border-b border-slate-200">
                {/* 合计子表头 */}
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电价<br />(含税)</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th rowSpan={2} className="p-2 border-r border-slate-200 font-medium">结算收入</th>
                <th rowSpan={2} className="p-2 border-r border-slate-200 font-medium">销项税额</th>

                {/* 余电上网子表头 */}
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电价<br />(含税)</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th rowSpan={2} className="p-2 border-r border-slate-200 font-medium">结算收入</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">销项税额</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">补贴金额</th>
              </tr>
              {/* 第三层级逻辑已并入第二层 rowSpan */}
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-900">
              {billData.details && billData.details.length > 0 ? (
                billData.details.map((item, index) => {
                  const date = new Date(item.qrfxwkpy);

                  const formattedDate = date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: 'long', // 'long' 会显示 "一月"，'short' 会显示 "1月"
                  }).replace(' ', '');

                  return (
                    <tr className="even:bg-slate-50/40 hover:bg-blue-50/40 transition-colors" key={index}>
                      <td className="p-3 border-r border-slate-100">{formattedDate}</td>
                      <td className="p-3 border-r border-slate-100">{item.umakupcb}</td>
                      <td className="p-3 border-r border-slate-100">{item.ovehnwzi}</td>

                      {/* 合计数据列 */}
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.fgtqnhyn)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.nwcjwyrf)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.colTgqbxp)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.mrseixpo)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.kdzxnwil)}</td>

                      {/* 余电上网数据列 */}
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.qgwvxncr)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.jshfcttg)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.tpjmbqpf)}</td>
                      <td className="p-3">{formatMoney(item.rxnrcarc)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="p-3 text-center text-slate-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BillReportFooter />
    </div >
  );
};

// --- 消耗比电费结算单详情页面 ---
const ConsumptionRatioBillContent: React.FC<{ id: number }> = ({ id }) => {
  const { token } = useSession();

  const [loading, setLoading] = useState<boolean>(true);
  const [billData, setBillData] = useState<BillData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 定义获取数据的异步函数
    const fetchBillDetail = async () => {
      setLoading(true);
      setError(null);

      axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/queryformdata/view_tb_cuqscwai_dncdtj/' + id, {}, {
        headers: {
          'Content-Type': 'application/json',
          'grooveToken': token
        }
      }).then(response => {
        if (response.data && response.data.success) {
          // response.data.data
          console.log('Fetched bill detail:', response.data.data);

          const date = new Date(response.data.data.omtwplej);

          const formattedDate = date.toLocaleString('zh-CN', { year: 'numeric' });

          setBillData({
            id: id,
            month: formattedDate,
            unit: response.data.data.mbnwpthn,
            account: response.data.data.muswisjh,
            state: '审核中',
            details: response.data.data.listYfvuhw, // 这里需要根据实际数据结构进行解析和赋值
          });
        } else {
          setError('Server returned invalid data.');
        }
      }).catch(error => {
        if (error instanceof Error) {
          const wrapError = error as { response?: { status: number, data: any } };
          if (wrapError.response?.status == 400) {
            setError('Bad format request');
          } else if (wrapError.response?.status == 401) {
            setError(wrapError.response?.data);
          } else {
            setError('加载结算单数据失败，请稍后重试');
          }
        }
      }).finally(() => {
        setLoading(false);
      });
    };

    if (id) {
      fetchBillDetail();
    }
  }, [id]); // 监听 id 变化，当传入不同 id 时重新触发

  // 1. 加载状态：显示秀气的加载动画
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <CircularProgress size={24} sx={{ color: '#0f172a' }} />
        <p className="text-xs text-slate-600 tracking-widest uppercase">正在加载数据...</p>
      </div>
    );
  }

  // 2. 错误状态
  if (error || !billData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-sm text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-full text-slate-800" id='report-elem'>
      <BillReportHeader
        title={`${billData?.month}电费结算单`}
        unit={billData?.unit ?? ''}
        period={billData?.month ?? ''}
        state={billData?.state ?? ''}
      />

      {/* 表格区域：纯 Tailwind 样式 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              {/* 第一层：核心分类 */}
              <tr className="bg-slate-50/80 text-slate-800 font-bold border-b border-slate-200">
                <th rowSpan={3} className="p-2 border-r border-slate-200 min-w-[80px]">所属期</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">总上网电量</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">余电上网电量</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">自发自用电量</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">补贴电量</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">消纳比例</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">折扣</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">非分时电度电价</th>
                <th colSpan={4} className="p-2 border-r border-slate-200">合计</th>
                <th colSpan={5} className="p-2 border-r border-slate-200">余电上网部分</th>
                <th colSpan={4} className="p-2 border-r border-slate-200">自发自用部分</th>
              </tr>

              {/* 第二层 & 第三层：细分指标 */}
              <tr className="bg-slate-50/50 text-slate-800 font-bold border-b border-slate-200">
                {/* 合计子表头 */}
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电价<br />(含税)</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th rowSpan={2} className="p-2 border-r border-slate-200 font-medium">结算收入</th>
                <th rowSpan={2} className="p-2 border-r border-slate-200 font-medium">销项税额</th>

                {/* 余电上网子表头 */}
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电价<br />(含税)</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th rowSpan={2} className="p-2 border-r border-slate-200 font-medium">结算收入</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">销项税额</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">补贴金额</th>

                {/* 自发自用子表头 */}
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电价<br />(含税)</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">营业收入</th>
                <th rowSpan={2} className="p-2 border-r border-slate-100 font-medium">销项税额</th>
              </tr>
              {/* 第三层级逻辑已并入第二层 rowSpan */}
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-900">
              {billData.details && billData.details.length > 0 ? (
                billData.details.map((item, index) => {
                  const date = new Date(item.qrfxwkpy);

                  const formattedDate = date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: 'long', // 'long' 会显示 "一月"，'short' 会显示 "1月"
                  }).replace(' ', '');

                  return (
                    <tr className="even:bg-slate-50/40 hover:bg-blue-50/40 transition-colors" key={index}>
                      <td className="p-3 border-r border-slate-100">{formattedDate}</td>
                      <td className="p-3 border-r border-slate-100">{item.umakupcb}</td>
                      <td className="p-3 border-r border-slate-100">{item.ovehnwzi}</td>
                      <td className="p-3 border-r border-slate-100">{item.kdaiahlw}</td>
                      <td className="p-3 border-r border-slate-100">{item.colGudugq}</td>
                      <td className="p-3 border-r border-slate-100">{item.colZyszui}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.colJbhosi)}</td>

                      {/* 合计数据列 */}
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.fgtqnhyn)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.nwcjwyrf)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.mrseixpo)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.kdzxnwil)}</td>

                      {/* 余电上网数据列 */}
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.qgwvxncr)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.jshfcttg)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.tpjmbqpf)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.rxnrcarc)}</td>

                      {/* 自发自用数据列 */}
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.afnfufjj)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.szimebex)}</td>
                      <td className="p-3 border-r border-slate-100">{formatMoney(item.nughvqbr)}</td>
                      <td className="p-3">{formatMoney(item.huscgxas)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={19} className="p-3 text-center text-slate-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BillReportFooter />
    </div >
  );
};

const TimelineList: React.FC = () => {
  const { showAlert } = useAlert();
  const { token } = useSession();
  const { confirm } = useConfirm();

  // 当前选中的商户（左列表 → 右详情）
  const [selectedMerchantId, setSelectedMerchantId] = useState<number | null>(null);
  // 左侧列表：搜索（项目名称 / 发电户号）与分页
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(0);
  const pageSize = 5;

  const [open, setOpen] = useState(false);
  const [selectedBillType, setSelectedBillType] = useState<string | null>(null);
  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);
  const [accountNumber, setAccountNumber] = useState<string | null>(null);

  const [settlementYear, setSettlementYear] = useState<number | null>(null);
  const [selfConsumptionList, setSelfConsumptionList] = useState<[SelfConsumptionItem] | null>(null);

  // 自用结算单月度明细：内联展示在「自用电费结算」下方
  const [showSelfList, setShowSelfList] = useState<boolean>(false);
  // 余电上网结算明细：内联展示在「余电上网结算」下方
  const [showSurplusToGridList, setShowSurplusToGridList] = useState<boolean>(false);
  const [surplusToGridList, setSurplusToGridList] = useState<[SurplusToGridItem] | null>(null);
  // 当年度余电上网结算单 id（年度级，用于预览 / 删除）
  const [surplusToGridId, setSurplusToGridId] = useState<number | null>(null);
  // 当前选中的结算块（按 `${year}-self` / `${year}-surplus` 区分），用于高亮切换
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const [selfConsumptionDialogTitle, setSelfConsumptionDialogTitle] = useState<string>("");
  const [selfConsumptionDialogOpen, setSelfConsumptionDialogOpen] = useState<boolean>(false);
  const [selfConsumptionPkId, setSelfConsumptionPkId] = useState<number | null>(null);

  // 自发自用结算单id
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [surplusToGridDialogTitle, setSurplusToGridDialogTitle] = useState<string>("");
  const [surplusToGridDialogOpen, setSurplusToGridDialogOpen] = useState<boolean>(false);
  const [surplusToGridPkId, setSurplusToGridPkId] = useState<number | null>(null);

  // 余电上网结算单id
  const [confirmDeleteSurplusToGrid, setConfirmDeleteSurplusToGrid] = useState<number | null>(null);

  // 余电上网结算单item id
  const [confirmDeleteSurplusToGridItem, setConfirmDeleteSurplusToGridItem] = useState<number | null>(null);

  // 余电上网结算单item明细弹窗（view_tb_exswzlwt_kcdgmf）
  const [surplusToGridItemOpen, setSurplusToGridItemOpen] = useState<boolean>(false);
  const [selectedSurplusToGridItemId, setSelectedSurplusToGridItemId] = useState<number | null>(null);
  const [surplusToGridItemReadOnly, setSurplusToGridItemReadOnly] = useState<boolean>(false);
  const [surplusToGridItemTitle, setSurplusToGridItemTitle] = useState<string>("");
  const [surplusToGridItemSubtitle, setSurplusToGridItemSubtitle] = useState<string>("");

  const [surplusToGridConsumptionItemOpen, setSurplusToGridConsumptionItemOpen] = useState<boolean>(false);
  const [selectedSurplusToGridConsumptionItemId, setSelectedSurplusToGridConsumptionItemId] = useState<number | null>(null);
  const [surplusToGridConsumptionItemReadOnly, setSurplusToGridConsumptionItemReadOnly] = useState<boolean>(false);
  const [surplusToGridConsumptionItemTitle, setSurplusToGridConsumptionItemTitle] = useState<string>("");
  const [surplusToGridConsumptionItemSubtitle, setSurplusToGridConsumptionItemSubtitle] = useState<string>("");


  // 点击「自用电费结算」：拉取月度明细并在下方内联展开
  const handleSelfConsumption = (accountNumber: string, year: number) => {
    setAccountNumber(accountNumber);
    setSettlementYear(year);

    axios.post(import.meta.env.VITE_JET_ASP_BPC_API + `/billsettlement/selfconsumption/year/query/${accountNumber}/${year}`, {

    }, {
      headers: {
        'Content-Type': 'application/json',
        'grooveToken': token
      }
    }).then(response => {
      if (response.data) {
        setSelfConsumptionList(response.data);

        setShowSelfList(true);
      } else {
        showAlert(response.data.message, 'error');
      }
    }).catch(err => {
      showAlert('Handle self-consumption data exception: ' + err.message, 'error');
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleRefreshSelfConsumption = () => {
    axios.post(import.meta.env.VITE_JET_ASP_BPC_API + `/billsettlement/selfconsumption/year/query/${accountNumber}/${settlementYear}`, {

    }, {
      headers: {
        'Content-Type': 'application/json',
        'grooveToken': token
      }
    }).then(response => {
      if (response.data) {
        setSelfConsumptionList(response.data);
      } else {
        showAlert(response.data.message, 'error');
      }
    }).catch(err => {
      showAlert('Refresh self-consumption data exception: ' + err.message, 'error');
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleSurplusToGrid = (accountNumber: string, year: number) => {
    setAccountNumber(accountNumber);
    setSettlementYear(year);

    axios.post(import.meta.env.VITE_JET_ASP_BPC_API + `/billsettlement/surplustogrid/year/query/${accountNumber}/${year}`, {

    }, {
      headers: {
        'Content-Type': 'application/json',
        'grooveToken': token
      }
    }).then(response => {
      if (response.data) {
        setSurplusToGridId(response.data.id);
        setSurplusToGridList(response.data.items);

        setShowSurplusToGridList(true);
      } else {
        showAlert(response.data.message, 'error');
      }
    }).catch(err => {
      showAlert('Handle surplus-to-grid data exception: ' + err.message, 'error');
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleRefreshSurplusToGrid = () => {
    axios.post(import.meta.env.VITE_JET_ASP_BPC_API + `/billsettlement/surplustogrid/year/query/${accountNumber}/${settlementYear}`, {

    }, {
      headers: {
        'Content-Type': 'application/json',
        'grooveToken': token
      }
    }).then(response => {
      if (response.data) {
        setSurplusToGridId(response.data.id);
        setSurplusToGridList(response.data.items);
      } else {
        showAlert(response.data.message, 'error');
      }
    }).catch(err => {
      showAlert('Refresh surplus-to-grid data exception: ' + err.message, 'error');
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleCreateSelfConsumption = (yearMonth: string) => {
    axios.post(import.meta.env.VITE_JET_ASP_BPC_API + `/billsettlement/selfconsumption/creation/${accountNumber}/${yearMonth}`, {

    }, {
      headers: {
        'Content-Type': 'application/json',
        'grooveToken': token
      }
    }).then(response => {
      if (response.data.success === false) {
        showAlert(response.data.message, 'error');
      } else {
        fetchMerchants();
        handleRefreshSelfConsumption();
      }
    }).catch(err => {
      showAlert('Handle self-consumption data exception: ' + err.message, 'error');
    }).finally(() => {
      setLoading(false);
    });
  }

  const handleViewSelfConsumption = (id: number) => {
    setOpen(true);

    setSelectedBillId(id);
    setSelectedBillType('P0002');
  }

  const handleEditSelfConsumption = (id: number) => {
    setSelfConsumptionDialogTitle('自用电费结算单');
    setSelfConsumptionDialogOpen(true);

    setSelfConsumptionPkId(id);
  }

  const handleDeleteSelfConsumption = async (id: number) => {
    const formData = new FormData();

    formData.append('pkLgtnnfgg', id.toString());

    axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/deleteformdata/view_tb_lgtnnfgg_bdonpj', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'grooveToken': token
      }
    }).then(response => {
      if (response.data && response.data.success) {
        fetchMerchants();
        handleRefreshSelfConsumption();
      } else {
        showAlert('Failed to delete data.', 'error');
      }
    }).catch(err => {
      showAlert('Delete data exception.', 'error');
    }).finally(() => {
    });
  }

  const handleCreateSurplusToGrid = (accountNumber: string, yearMonth: string) => {
    setAccountNumber(accountNumber);

    /*
    if (id != null) {
      setSelectedBillId(id);
      setSelectedBillType('P0003');
      setOpen(true);
    } else { */
    axios.post(import.meta.env.VITE_JET_ASP_BPC_API + `/billsettlement/surplustogridmonthly/creation/${accountNumber}/${yearMonth}`, {

    }, {
      headers: {
        'Content-Type': 'application/json',
        'grooveToken': token
      }
    }).then(response => {
      if (response.data) {
        setSelectedBillId(response.data);
        setSelectedBillType('P0003');
        setOpen(true);

        fetchMerchants();
      } else {
        showAlert(response.data.message, 'error');
      }
    }).catch(err => {
      showAlert('Handle surplus to grid data exception: ' + err.message, 'error');
    }).finally(() => {
      setLoading(false);
    });
    // }
  };

  const handleViewSurplusToGrid = (id: number, billType: string) => {
    setSelectedBillId(id);
    setSelectedBillType(billType);
    setOpen(true);
  }

  const handleEditSurplusToGrid = (id: number) => {
    setSurplusToGridDialogTitle('电费结算单');
    setSurplusToGridDialogOpen(true);
    setSurplusToGridPkId(id);
  }

  const handleDeleteSurplusToGrid = (id: number) => {
    const formData = new FormData();

    formData.append('pkCuqscwai', id.toString());

    axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/deleteformdata/view_tb_cuqscwai_clbnay', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'grooveToken': token
      }
    }).then(response => {
      if (response.data && response.data.success) {
        fetchMerchants();
        handleRefreshSurplusToGrid();
      } else {
        showAlert('Failed to delete data.', 'error');
      }
    }).catch(err => {
      showAlert('Delete data exception.', 'error');
    }).finally(() => {
    });
  }

  const handleViewSurplusToGridItem = (id: number, settlementDate?: string, merchant?: Merchant) => {
    setSelectedSurplusToGridItemId(id);
    setSurplusToGridItemReadOnly(true);
    setSurplusToGridItemTitle(`${(settlementDate ?? '').slice(0, 7)}上网结算单`);
    setSurplusToGridItemSubtitle(merchant ? `${merchant.projectName} - ${merchant.number}` : '');
    setSurplusToGridItemOpen(true);
  }

  const handleEditSurplusToGridItem = (id: number, settlementDate?: string, merchant?: Merchant) => {
    setSelectedSurplusToGridItemId(id);
    setSurplusToGridItemReadOnly(false);
    setSurplusToGridItemTitle(`${(settlementDate ?? '').slice(0, 7)}上网结算单`);
    setSurplusToGridItemSubtitle(merchant ? `${merchant.projectName} - ${merchant.number}` : '');
    setSurplusToGridItemOpen(true);
  }

  const handleDeleteSurplusToGridItem = (id: number, merchant?: Merchant) => {
    const formData = new FormData();

    formData.append('pkExswzlwt', id.toString());

    axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/deleteformdata/view_tb_exswzlwt_kcdgmf', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'grooveToken': token
      }
    }).then(response => {
      if (response.data && response.data.success) {
        fetchMerchants();

        handleRefreshSurplusToGrid();
      } else {
        showAlert('Failed to delete data.', 'error');
      }
    }).catch(err => {
      showAlert('Delete data exception.', 'error');
    }).finally(() => {
    });
  }

  const handleViewSurplusToGridConsumptionItem = (id: number, settlementDate?: string, merchant?: Merchant) => {
    setSelectedSurplusToGridConsumptionItemId(id);
    setSurplusToGridConsumptionItemReadOnly(true);
    setSurplusToGridConsumptionItemTitle(`${(settlementDate ?? '').slice(0, 7)}上网结算单`);
    setSurplusToGridConsumptionItemSubtitle(merchant ? `${merchant.projectName} - ${merchant.number}` : '');
    setSurplusToGridConsumptionItemOpen(true);
  }

  const handleEditSurplusToGridConsumptionItem = (id: number, settlementDate?: string, merchant?: Merchant) => {
    setSelectedSurplusToGridConsumptionItemId(id);
    setSurplusToGridConsumptionItemReadOnly(false);
    setSurplusToGridConsumptionItemTitle(`${(settlementDate ?? '').slice(0, 7)}上网结算单`);
    setSurplusToGridConsumptionItemSubtitle(merchant ? `${merchant.projectName} - ${merchant.number}` : '');
    setSurplusToGridConsumptionItemOpen(true);
  }

  const handleDeleteSurplusToGridConsumptionItem = (id: number, merchant?: Merchant) => {
    const formData = new FormData();

    formData.append('pkExswzlwt', id.toString());

    axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/deleteformdata/view_tb_exswzlwt_lqufqi', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'grooveToken': token
      }
    }).then(response => {
      if (response.data && response.data.success) {
        fetchMerchants();

        handleRefreshSurplusToGrid();
      } else {
        showAlert('Failed to delete data.', 'error');
      }
    }).catch(err => {
      showAlert('Delete data exception.', 'error');
    }).finally(() => {
    });
  }

  const handleCreateSurplusToGridItem = (accountNumber: string, yearMonth: string) => {
    setAccountNumber(accountNumber);

    /*
    if (id != null) {
      setSelectedBillId(id);
      setSelectedBillType('P0003');
      setOpen(true);
    } else { */
    axios.post(import.meta.env.VITE_JET_ASP_BPC_API + `/billsettlement/surplustogridmonthly/creation/${accountNumber}/${yearMonth}`, {

    }, {
      headers: {
        'Content-Type': 'application/json',
        'grooveToken': token
      }
    }).then(response => {
      if (response.data && response.data.success === false) {
        showAlert(response.data.message, 'error');
      } else if(response.data) {
         fetchMerchants();

        handleRefreshSurplusToGrid();
      } else {
        showAlert('Unknown service exception', 'error');
      }
    }).catch(err => {
      showAlert('Handle surplus to grid data exception: ' + err.message, 'error');
    }).finally(() => {
      setLoading(false);
    });
    // }
  };

  const handleDownloadPDF = async () => {
    // 1. 获取要导出的 DOM 节点
    // 建议给你的 Table 外层 div 加一个 id="report-elem"
    const element = document.getElementById('report-elem');
    if (!element) return;

    try {
      // 2. 将 DOM 转为 Canvas
      // scale: 2 可以大幅提升 PDF 的清晰度（两倍倍率）
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true, // 如果有图片链接，开启跨域
        backgroundColor: '#ffffff' // 确保背景是白色
      });

      const imgData = canvas.toDataURL('image/png');

      // 3. 创建 PDF 对象
      // 'l' 表示 landscape（横向），'mm' 表示毫米，'a4' 是纸张尺寸
      const pdf = new jsPDF('l', 'mm', 'a4');

      // 计算图片在 PDF 中的比例
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // 4. 将图片添加到 PDF 并保存
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      pdf.save(`电费结算单_${new Date().getTime()}.pdf`);

    } catch (error) {
      console.error('PDF 导出失败:', error);
    }
  };

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. 获取数据的方法
  const fetchMerchants = async () => {
    setLoading(true);

    axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/billsettlement/kanban', {
      "keyword": searchQuery.trim(), // 项目名称 / 发电户号 / 商户名 统一关键字（后端 OR 匹配）
      "pageNumber": pageNumber + 1, // 后端分页从1开始
      "pageSize": pageSize
    }, {
      headers: {
        'Content-Type': 'application/json',
        'grooveToken': token
      }
    }).then(response => {
      if (response.data) {
        setMerchants(response.data.resultList || []);

        setTotalPages(Math.max(1, response.data.totalPages ?? 1));
      } else {
        showAlert(response.data.message, 'error');
      }
    }).catch(err => {
      showAlert('Query data exception: ' + err.message, 'error');
    }).finally(() => {
      setLoading(false);
    });
  };

  // 2. 挂载 / 翻页时拉取对应页数据（服务端分页）
  useEffect(() => {
    fetchMerchants();
  }, [pageNumber]);

  // 商户加载后，自动选中第一个（若当前选中已失效）
  useEffect(() => {
    if (!Array.isArray(merchants) || merchants.length === 0) {
      setSelectedMerchantId(null);
      return;
    }
    setSelectedMerchantId((prev) =>
      prev != null && merchants.some((m) => m.id === prev) ? prev : merchants[0].id,
    );
  }, [merchants]);

  // 切换商户时收起内联明细并清除选中高亮，避免展示上一次的数据
  useEffect(() => {
    setShowSelfList(false);
    setShowSurplusToGridList(false);
    setSurplusToGridId(null);
    setSelectedBlock(null);
  }, [selectedMerchantId]);

  const selectedMerchant =
    Array.isArray(merchants) ? merchants.find((m) => m.id === selectedMerchantId) ?? null : null;

  // 服务端已按关键字 + 页码返回 resultList，这里直接使用
  const pagedMerchants = Array.isArray(merchants) ? merchants : [];

  // 触发搜索：回到第一页并查询（blur / 回车时调用）
  const handleSearch = () => {
    if (pageNumber !== 0) {
      setPageNumber(0); // 翻页副作用会带新关键字重新查询
    } else {
      fetchMerchants(); // 已在第一页，直接查询
    }
  };

  // 自用结算单月度明细（内联展示在「自用电费结算」下方）
  const renderSelfConsumptionList = () => (
    <div className="mt-4 rounded-lg border border-indigo-100/80 bg-slate-50/40 p-4">
      <div className="mb-3">
        <Typography className="text-sm font-semibold text-slate-600 pl-2 border-l-4 border-blue-600">
          {settlementYear}年度
        </Typography>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {selfConsumptionList && selfConsumptionList.length > 0 ? (
          selfConsumptionList.map((sc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white hover:bg-indigo-50/30 hover:border-indigo-100 transition-all group/item cursor-pointer relative"
            >
              {/* 确认删除遮罩层 */}
              {confirmDeleteId !== null && confirmDeleteId === sc.id && (
                <div className="absolute inset-0 z-30 bg-white/95 flex items-center justify-end pr-4 gap-2 animate-in fade-in duration-200">
                  <span className="text-sm text-slate-600 font-medium mr-2">确定删除此结算单吗？</span>
                  <IconButton size="small" onClick={() => { handleDeleteSelfConsumption(sc.id); setConfirmDeleteId(null); }}>
                    <CheckCircleOutline fontSize="small" className="text-pink-600" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setConfirmDeleteId(null)}>
                    <CancelOutlined fontSize="small" className="text-gray-400" />
                  </IconButton>
                </div>
              )}

              {/* 左侧：月份与电量 */}
              <div className="flex flex-col">
                <Tooltip title={sc.id ? "点击查阅" : sc.relatedBillId ? "点击生成" : "缺少电费账单，无法生成"} placement="bottom" arrow>
                  <div
                    className={`inline-flex items-center text-sm ${sc.id ? 'font-semibold text-slate-700 group-hover/item:text-indigo-600' : 'text-slate-400 group-hover/item:text-indigo-400'} transition-colors`}
                    onClick={(e) => { e.stopPropagation(); if (sc.id) handleViewSelfConsumption(sc.id); else if (sc.relatedBillId) handleCreateSelfConsumption(sc.settlementDate); }}
                  >
                    {sc.name}月份结算单
                    {sc.id && (
                      <span className="relative ml-0.5 inline-flex h-2 w-2 -translate-y-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                      </span>
                    )}
                  </div>
                </Tooltip>
                <span className={`text-[12px] ${sc.id ? 'text-slate-600' : 'text-slate-400'} mt-0.5`}>
                  自用电量: <span className="font-mono">{sc.selfUsedTotal}</span> kWh
                </span>
              </div>

              {/* 右侧：缺电费账单 → 静态提示（不随悬浮淡出）；否则金额与日期 */}
              {(!sc.id && !sc.relatedBillId) ? (
                <span className="text-[11px] text-slate-400 italic whitespace-nowrap">缺少电费账单</span>
              ) : (
                <div className="text-right flex items-center space-x-2 group-hover/item:opacity-0 group-hover/item:scale-75">
                  <div className="flex flex-col">
                    <span className={`inline-flex items-center text-sm font-mono font-bold ${sc.id ? 'text-slate-800' : 'text-slate-400'} transition-colors`}>
                      <CurrencyYen sx={{ fontSize: 13 }} />{sc.selfUsedFee}
                    </span>
                    <span className={`text-[12px] ${sc.id ? 'text-slate-600' : 'text-slate-400'} mt-0.5`}>
                      {sc.settlementDate}
                    </span>
                  </div>
                  <ChevronRight fontSize="inherit" className="text-slate-300 transition-all duration-300" />
                </div>
              )}

              {/* 悬浮操作组 */}
              <div className="absolute right-4 flex items-center gap-1 opacity-0 scale-95 transition-all duration-300 group-hover/item:opacity-100 group-hover/item:scale-100 pointer-events-none group-hover/item:pointer-events-auto">
                {!sc.id && sc.relatedBillId && (
                  <Tooltip title={"生成结算单"} placement="bottom" arrow>
                    <IconButton sx={{ padding: '6px', '& .MuiSvgIcon-root': { fontSize: '12px' } }}
                      onClick={(e) => { e.stopPropagation(); handleCreateSelfConsumption(sc.settlementDate); }}>
                      <Edit fontSize="inherit" className="hover:text-indigo-600" />
                    </IconButton>
                  </Tooltip>
                )}
                {sc.id && (
                  <>
                    <Tooltip title={"查阅"} placement="bottom" arrow>
                      <IconButton sx={{ padding: '6px', '& .MuiSvgIcon-root': { fontSize: '12px' } }}
                        onClick={(e) => { e.stopPropagation(); handleViewSelfConsumption(sc.id); }}>
                        <Pageview fontSize="inherit" className="hover:text-indigo-600" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={"修改"} placement="bottom" arrow>
                      <IconButton sx={{ padding: '6px', '& .MuiSvgIcon-root': { fontSize: '12px' } }}
                        onClick={(e) => { e.stopPropagation(); handleEditSelfConsumption(sc.id); }}>
                        <Edit fontSize="inherit" className="hover:text-indigo-600" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={"删除"} placement="bottom" arrow>
                      <IconButton sx={{ padding: '6px', '& .MuiSvgIcon-root': { fontSize: '12px' } }}
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(sc.id); }}>
                        <Delete fontSize="inherit" className="hover:text-red-500" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="sm:col-span-2 text-center text-xs text-slate-400 py-6">暂无月度结算数据</p>
        )}
      </div>
    </div>
  );

  // 余电上网结算明细（内联展示在「余电上网结算」下方）—— 参考自用部分；字段沿用自用 DTO，若后端不同请调整
  const renderSurplusList = (merchant: Merchant) => (
    <div className="mt-4 rounded-lg border border-emerald-100/80 bg-slate-50/40 p-4">
      <div className="flex items-center justify-between mb-3">
        {surplusToGridId ? (
          <Tooltip title="点击预览年度结算单" placement="bottom" arrow>
            <Typography
              component="span"
              onClick={() => handleViewSurplusToGrid(surplusToGridId!, merchant.isBothSettlement ? 'P0003' : 'P0003F')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 pl-2 border-l-4 border-emerald-600 cursor-pointer hover:text-emerald-600 hover:underline underline-offset-4 transition-colors"
            >
              {settlementYear}年度
              <span className="relative ml-0.5 inline-flex h-2 w-2 -translate-y-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
              </span>
            </Typography>
          </Tooltip>
        ) : (
          <Typography className="text-sm font-semibold text-slate-600 pl-2 border-l-4 border-emerald-600">
            {settlementYear}年度
          </Typography>
        )}

        {/* 年度级余电结算单：预览 / 删除 */}
        {surplusToGridId && (
          confirmDeleteSurplusToGrid === surplusToGridId ? (
            <div className="flex items-center gap-0.5">
              <span className="text-xs text-slate-600 mr-1">确认删除?</span>
              <IconButton size="small" onClick={() => { 
                handleDeleteSurplusToGrid(surplusToGridId!); handleRefreshSurplusToGrid(); setConfirmDeleteSurplusToGrid(null); }}>
                <CheckCircleOutline fontSize="inherit" className="text-pink-600" />
              </IconButton>
              <IconButton size="small" onClick={() => setConfirmDeleteSurplusToGrid(null)}>
                <CancelOutlined fontSize="inherit" className="text-gray-400" />
              </IconButton>
            </div>
          ) : (
            <div className="flex items-center gap-0.5">
              <Tooltip title="预览" placement="bottom" arrow>
                <IconButton sx={{ padding: '4px', '& .MuiSvgIcon-root': { fontSize: '14px' } }}
                  onClick={() => handleViewSurplusToGrid(surplusToGridId!, merchant.isBothSettlement ? 'P0003' : 'P0003F')}>
                  <Pageview fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Tooltip title="删除" placement="bottom" arrow>
                <IconButton sx={{ padding: '4px', '& .MuiSvgIcon-root': { fontSize: '14px' } }}
                  onClick={() => setConfirmDeleteSurplusToGrid(surplusToGridId)}>
                  <Delete fontSize="inherit" className="text-red-500" />
                </IconButton>
              </Tooltip>
            </div>
          )
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {surplusToGridList && surplusToGridList.length > 0 ? (
          surplusToGridList.map((sc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white hover:bg-emerald-50/30 hover:border-emerald-100 transition-all group/item cursor-pointer relative"
            >
              {/* 确认删除遮罩层（月度明细项） */}
              {confirmDeleteSurplusToGridItem !== null && confirmDeleteSurplusToGridItem === sc.id && (
                <div className="absolute inset-0 z-30 bg-white/95 flex items-center justify-end pr-4 gap-2 animate-in fade-in duration-200">
                  <span className="text-sm text-slate-600 font-medium mr-2">确定删除此结算单吗？</span>
                  <IconButton size="small" onClick={() => { 
                      if(merchant.type === 'P0004') {
                        handleDeleteSurplusToGridConsumptionItem(sc.id); 
                        setConfirmDeleteSurplusToGridItem(null);
                      } else {
                        handleDeleteSurplusToGridItem(sc.id); 
                        setConfirmDeleteSurplusToGridItem(null);
                      }
                    }}>
                    <CheckCircleOutline fontSize="small" className="text-pink-600" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setConfirmDeleteSurplusToGridItem(null)}>
                    <CancelOutlined fontSize="small" className="text-gray-400" />
                  </IconButton>
                </div>
              )}

              {/* 左侧：月份与电量 */}
              <div className="flex flex-col">
                <Tooltip title={sc.id ? "点击查阅" : sc.relatedBillId ? "点击生成" : "缺少电费账单，无法生成"} placement="bottom" arrow>
                  <div
                    className={`text-sm ${sc.id ? 'font-semibold text-slate-700 group-hover/item:text-emerald-600' : 'text-slate-400 group-hover/item:text-emerald-400'} transition-colors`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (sc.id) {
                        if(merchant.type === 'P0004') { 
                          handleViewSurplusToGridConsumptionItem(sc.id, sc.settlementDate, merchant);
                        } else {
                          handleViewSurplusToGridItem(sc.id, sc.settlementDate, merchant);
                        }
                      }
                      else if (sc.relatedBillId) handleCreateSurplusToGrid(merchant.number, sc.settlementDate);
                    }}
                  >
                    {sc.name}月份结算单
                  </div>
                </Tooltip>
                <span className={`text-[12px] ${sc.id ? 'text-slate-600' : 'text-slate-400'} mt-1`}>
                  上网电量: <span className="font-mono">{sc.surplusToGridTotal}</span> kWh
                </span>
              </div>

              {/* 右侧：缺电费账单 → 默认静态提示（不随悬浮淡出）；否则金额与日期 */}
              {(!sc.id && !sc.relatedBillId) ? (
                <span className="text-[11px] text-slate-400 italic whitespace-nowrap">缺少电费账单</span>
              ) : (
                <div className="text-right flex items-center space-x-2 group-hover/item:opacity-0 group-hover/item:scale-75">
                  <div className="flex flex-col">
                    <span className={`inline-flex items-center text-sm font-mono font-bold ${sc.id ? 'text-slate-800' : 'text-slate-400'} transition-colors`}>
                      <CurrencyYen sx={{ fontSize: 13 }} />{sc.surplusToGridFee}
                    </span>
                    <span className={`text-[12px] ${sc.id ? 'text-slate-600' : 'text-slate-400'} mt-1`}>
                      {sc.settlementDate}
                    </span>
                  </div>
                  <ChevronRight fontSize="inherit" className="text-slate-300 transition-all duration-300" />
                </div>
              )}

              {/* 悬浮操作组：有 id → 查阅/修改/删除；无 id 但有电费账单 → 生成；缺账单 → 提示，不可生成 */}
              <div className="absolute right-4 flex items-center gap-1 opacity-0 scale-95 transition-all duration-300 group-hover/item:opacity-100 group-hover/item:scale-100 pointer-events-none group-hover/item:pointer-events-auto">
                {sc.id ? (
                  <>
                    <Tooltip title={"查阅"} placement="bottom" arrow>
                      <IconButton sx={{ padding: '6px', '& .MuiSvgIcon-root': { fontSize: '12px' } }}
                        onClick={(e) => { e.stopPropagation(); 
                        if(merchant.type === 'P0004') {
                          handleViewSurplusToGridConsumptionItem(sc.id, sc.settlementDate, merchant); 
                        } else {
                          handleViewSurplusToGridItem(sc.id, sc.settlementDate, merchant);
                        }
                        }}>
                        <Pageview fontSize="inherit" className="hover:text-emerald-600" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={"修改"} placement="bottom" arrow>
                      <IconButton sx={{ padding: '6px', '& .MuiSvgIcon-root': { fontSize: '12px' } }}
                        onClick={(e) => { e.stopPropagation(); 
                        if(merchant.type === 'P0004') {
                          handleEditSurplusToGridConsumptionItem(sc.id, sc.settlementDate, merchant); 
                        } else {
                          handleEditSurplusToGridItem(sc.id, sc.settlementDate, merchant); 
                        }  
                        
                        }}>
                        <Edit fontSize="inherit" className="hover:text-emerald-600" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={"删除"} placement="bottom" arrow>
                      <IconButton sx={{ padding: '6px', '& .MuiSvgIcon-root': { fontSize: '12px' } }}
                        onClick={(e) => { e.stopPropagation(); 
                          setConfirmDeleteSurplusToGridItem(sc.id); 
                        }}>
                        <Delete fontSize="inherit" className="hover:text-red-500" />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : sc.relatedBillId ? (
                  <Tooltip title={"生成结算单"} placement="bottom" arrow>
                    <IconButton sx={{ padding: '6px', '& .MuiSvgIcon-root': { fontSize: '12px' } }}
                      onClick={(e) => { e.stopPropagation(); handleCreateSurplusToGridItem(merchant.number, sc.settlementDate); }}>
                      <Edit fontSize="inherit" className="hover:text-emerald-600" />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <p className="sm:col-span-2 text-center text-xs text-slate-400 py-6">暂无月度结算数据</p>
        )}
      </div>
    </div>
  );

  // 单个年度的结算情况（右侧详情主体）——自用 / 余电上网，含查看/生成/编辑/删除
  const renderYearDetail = (merchant: Merchant, item: Settlement) => {
    const selfSelected = selectedBlock === `${item.year}-self`;
    const surplusSelected = selectedBlock === `${item.year}-surplus`;
    const showList = showSelfList && settlementYear === item.year;
    const surplusShow = showSurplusToGridList && settlementYear === item.year;
    const noSurplus = item.surplusToGridId === null || !item.surplusToGridSumResult;
    // 切换该年度自用月度明细的展开 / 收起
    const toggleSelfList = () => {
      if (showList) {
        setShowSelfList(false);
        setSelectedBlock(null); // 收起时取消选中高亮
      } else {
        setSelectedBlock(`${item.year}-self`);
        setShowSurplusToGridList(false); // 互斥：关闭余电列表
        handleSelfConsumption(merchant.number, item.year);
      }
    };
    // 切换该年度余电上网明细的展开 / 收起
    const toggleSurplusList = () => {
      if (surplusShow) {
        setShowSurplusToGridList(false);
        setSelectedBlock(null);
      } else {
        setSelectedBlock(`${item.year}-surplus`);
        setShowSelfList(false); // 互斥：关闭自用列表
        handleSurplusToGrid(merchant.number, item.year);
      }
    };
    return (
      <div className="relative">
        {/* 年份节点 */}
        <div className="relative z-10 flex items-center gap-2 mb-2.5">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.isLatest ? 'bg-blue-500 ring-2 ring-blue-100' : 'bg-slate-300'}`} />
          <span className="text-sm font-semibold text-slate-700">
            {item.year}<span className="text-xs font-normal text-slate-400 ml-0.5">年度</span>
          </span>
        </div>

        {/* 连线 + 横向并排的半宽结算块 */}
        <div className="relative pl-6">
          {/* 折线连接（年份节点 → 结算块行） */}
          <div className="absolute left-[3px] -top-2 w-4 h-[26px] border-l border-b border-slate-200 rounded-bl-lg" />

          {/* 自用 / 余电 同一节点，横向并排 */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* 自用电费结算 */}
            {merchant.isBothSettlement && (
              <div
                className={`relative flex flex-col gap-1 group/surplus cursor-pointer border px-2.5 py-1.5 rounded-md transition-colors sm:w-44 ${selfSelected ? 'bg-indigo-50 border-indigo-300' : 'border-transparent hover:bg-slate-50'
                  }`}
                onClick={toggleSelfList}
              >
                <div className="flex items-center">
                  <span className="flex items-center gap-1 text-[12px] uppercase tracking-wide text-slate-600 font-semibold">
                    <BoltOutlined className="text-indigo-400" sx={{ fontSize: 13 }} />自发自用
                  </span>
                </div>
                <span className="inline-flex items-center text-xs font-mono font-semibold text-slate-800 leading-tight">
                  {item.selfConsumptionSumResult === '-' || !item.selfConsumptionSumResult
                    ? <span className="text-slate-300">—</span>
                    : <><CurrencyYen sx={{ fontSize: 12 }} className="text-slate-400" />{item.selfConsumptionSumResult}</>}
                </span>

                {/* 展开时：下方中间出现向下箭头（连接下方明细）；收起时无 */}
                {showList && (
                  <KeyboardArrowDown className="absolute left-1/2 -translate-x-1/2 -bottom-2.5 text-indigo-300" sx={{ fontSize: 18 }} />
                )}
              </div>
            )}
            {/* 余电上网结算（按需展示） */}
            <div
              className={`relative flex flex-col gap-1 cursor-pointer border px-2.5 py-1.5 rounded-md transition-colors group/surplus sm:w-44 ${surplusSelected ? 'bg-emerald-50 border-emerald-300' : 'border-transparent hover:bg-slate-50'
                }`}
              onClick={toggleSurplusList}
            >
              <div className="flex items-center">
                <span className="flex items-center gap-1 text-[12px] uppercase tracking-wide text-slate-600 font-semibold">
                  <PowerOutlined className="text-emerald-400" sx={{ fontSize: 13 }} />{merchant.isBothSettlement ? '余电上网' : '全额上网'}
                </span>
              </div>
              <span className="inline-flex items-center text-xs font-mono font-semibold text-slate-800 leading-tight">
                  <CurrencyYen sx={{ fontSize: 12 }} className="text-slate-400" />{item.surplusToGridSumResult}
                </span>

              {/* 展开时：下方中间出现向下箭头 */}
              {surplusShow && (
                <KeyboardArrowDown className="absolute left-1/2 -translate-x-1/2 -bottom-2.5 text-emerald-300" sx={{ fontSize: 18 }} />
              )}
            </div>
          </div>

          {/* 自用结算单月度明细：内联展开在该年度结算块下方（展开/收起带收拢动画） */}
          <Collapse in={showList} timeout={300} unmountOnExit>
            <div className={`mt-3 transition-opacity duration-300 ${showList ? 'opacity-100' : 'opacity-0'}`}>
              {renderSelfConsumptionList()}
            </div>
          </Collapse>

          {/* 余电上网结算明细：内联展开 */}
          <Collapse in={surplusShow} timeout={300} unmountOnExit>
            <div className={`mt-3 transition-opacity duration-300 ${surplusShow ? 'opacity-100' : 'opacity-0'}`}>
              {renderSurplusList(merchant)}
            </div>
          </Collapse>
        </div>
      </div>
    );
  };

  return (
    <div className="p-5 min-h-screen">
      <div className="mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center">
              商户电费结算台账
            </h1>
            <p className="text-sm text-slate-400 mt-1">商户全额上网、自发自用余电上网电量及电费综合结算统计情况</p>
          </div>
          <div className="relative">
            <Search sx={{ fontSize: 18 }} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={handleSearch}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
              placeholder="项目名称 / 发电户号 / 商户名"
              className="w-60 rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
            />
          </div>
        </header>

        {loading ? (
          // 1. 加载中
          <div className="flex justify-center p-20">
            <CircularProgress size="small" />
          </div>
        ) : (!Array.isArray(merchants) || merchants.length === 0) ? (
          // 2. 无数据
          <div className="text-center p-20">
            <p className="text-sm text-slate-400">尚未查询到商户数据</p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-50 bg-white overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* 左侧：商户标签 */}
              <div className="lg:col-span-4 bg-gray-100 py-3 pl-3 lg:pr-0 flex flex-col gap-2">
                {pagedMerchants.map((merchant) => {
                  const fin = deriveMerchantFinance(merchant);
                  const meta = STATUS_META[fin.status];
                  const active = selectedMerchantId === merchant.id;
                  return (
                    <button
                      key={merchant.id}
                      onClick={() => setSelectedMerchantId(merchant.id)}
                      className={`group relative w-full text-left transition-all rounded-lg lg:rounded-r-none ${active
                        ? 'p-4 bg-white z-10 shadow-[-4px_0_12px_-4px_rgba(15,23,42,0.10)]'
                        : 'p-3.5 hover:bg-gray-200'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-semibold truncate ${active ? 'text-slate-800' : 'text-slate-600 group-hover:text-slate-900'}`}>
                          {merchant.projectName || '未命名项目'}
                        </p>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />
                      </div>
                      <p className="mt-1 text-[11px] font-mono text-slate-600 truncate">
                        {merchant.number}
                      </p>
                      <div className="mt-2 flex items-baseline justify-between gap-2">
                        <span className="text-[11px] text-slate-600 truncate">{merchant.settlementType || '—'}</span>
                        <span className={`inline-flex items-center text-sm font-mono font-semibold flex-shrink-0 ${active ? 'text-slate-800' : 'text-slate-600'}`}><CurrencyYen sx={{ fontSize: 13 }} />{formatMoney(fin.annual)}</span>
                      </div>
                    </button>
                  );
                })}

                {/* 占位行：补足到 pageSize 行，保持列表高度恒定，避免翻页时高度抖动 */}
                {pagedMerchants.length > 0 &&
                  Array.from({ length: Math.max(0, pageSize - pagedMerchants.length) }).map((_, i) => (
                    <div key={`ph-${i}`} aria-hidden className="invisible p-3.5 lg:pr-0">
                      <p className="text-sm">&nbsp;</p>
                      <p className="mt-1 text-[11px]">&nbsp;</p>
                      <div className="mt-2 text-sm">&nbsp;</div>
                    </div>
                  ))}

                {pagedMerchants.length === 0 && (
                  <p className="text-xs text-slate-400 italic px-1 py-6 pr-3 text-center">无匹配商户</p>
                )}

                {/* 分页：上下箭头 */}
                {totalPages > 1 && (
                  <div className="mt-2 flex items-center justify-center gap-3 pr-3">
                    <IconButton
                      size="small"
                      onClick={() => setPageNumber(Math.max(0, pageNumber - 1))}
                      disabled={pageNumber <= 0}
                      aria-label="上一页"
                    >
                      <KeyboardArrowUp fontSize="small" />
                    </IconButton>
                    <span className="text-xs tabular-nums text-slate-500">{pageNumber + 1} / {totalPages}</span>
                    <IconButton
                      size="small"
                      onClick={() => setPageNumber(Math.min(totalPages - 1, pageNumber + 1))}
                      disabled={pageNumber >= totalPages - 1}
                      aria-label="下一页"
                    >
                      <KeyboardArrowDown fontSize="small" />
                    </IconButton>
                  </div>
                )}
              </div>

              {/* 右侧：选中商户详情面板 */}
              <div className="lg:col-span-8 min-w-0 relative z-0">
                {selectedMerchant ? (() => {
                  const accFin = deriveMerchantFinance(selectedMerchant);
                  const meta = STATUS_META[accFin.status];
                  const list = [...(selectedMerchant.settlementList ?? [])].sort((a, b) => b.year - a.year);
                  const current = list[0] ?? null; // 顶部金额条展示最新年度
                  const curSelf = parseMoney(current?.selfConsumptionSumResult);
                  const curSurplus = parseMoney(current?.surplusToGridSumResult);
                  const curAnnual = curSelf + curSurplus;
                  return (
                    <Paper elevation={0} className="relative bg-white overflow-hidden rounded-none border-0 shadow-none">
                      {/* 财务账户头部 */}
                      <div className="p-6 border-b border-slate-100">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 flex-shrink-0"><Business /></div>
                            <div className="min-w-0">
                              <h2 className="text-base font-bold text-slate-800 truncate">{selectedMerchant.projectName || '未命名项目'}</h2>
                              <p className="text-[12px] text-slate-400 font-mono">{selectedMerchant.number}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${meta.chip}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{meta.label}
                          </span>
                        </div>

                        {/* 金额条（按选中年度） */}
                        <div className="mt-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-4 flex flex-wrap items-end gap-x-10 gap-y-3">
                          <div>
                            <span className="text-[12px] uppercase tracking-wider text-slate-500 font-bold">
                              {current ? `${current.year}年结算金额` : '本年结算金额'}
                            </span>
                            <div className="flex items-center text-2xl font-bold text-slate-900 font-mono tracking-tight"><CurrencyYen sx={{ fontSize: 22 }} />{formatMoney(curAnnual)}</div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] text-slate-400">自发自用</span>
                            <span className="inline-flex items-center text-sm font-mono text-slate-700">{curSelf > 0 ? <><CurrencyYen sx={{ fontSize: 13 }} />{formatMoney(curSelf)}</> : '—'}</span>
                          </div>
                          {accFin.needSurplus && (
                            <div className="flex flex-col">
                              <span className="text-[11px] text-slate-400">余电上网</span>
                              <span className="inline-flex items-center text-sm font-mono text-slate-700">{curSurplus > 0 ? <><CurrencyYen sx={{ fontSize: 13 }} />{formatMoney(curSurplus)}</> : '—'}</span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-[11px] text-slate-400">累计结算</span>
                            <span className="inline-flex items-center text-sm font-mono text-slate-700"><CurrencyYen sx={{ fontSize: 13 }} />{formatMoney(accFin.total)}</span>
                          </div>
                        </div>

                        {/* 账户元信息 */}
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[12px] uppercase tracking-wider text-slate-500 font-bold">商户</span>
                            <span className="text-sm text-slate-600 truncate">{selectedMerchant.name}</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[12px] uppercase tracking-wider text-slate-500 font-bold">电价类别</span>
                            <span className="text-sm text-slate-600 truncate">{selectedMerchant.settlementType}</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[12px] uppercase tracking-wider text-slate-500 font-bold">电价依据</span>
                            <div className="flex items-center text-slate-600 text-sm truncate">
                              <span className="truncate">{selectedMerchant.priceBasis}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 结算年度 + 当前年度结算情况 */}
                      <div className="p-6">
                        {list.length === 0 ? (
                          <div className="text-center py-10 text-sm text-slate-400">暂无结算数据，请先上传账单</div>
                        ) : (
                          <>
                            <div className="space-y-6">
                              {list.map((yr) => (
                                <div key={yr.year}>
                                  {renderYearDetail(selectedMerchant, yr)}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </Paper>
                  );
                })() : (
                  <div className="text-center p-20 text-sm text-slate-400">请选择左侧商户查看结算详情</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog
        fullScreen
        open={open}
        onClose={() => setOpen(false)}
        TransitionComponent={Transition}
      >
        {/* --- 极简秀气版 Header --- */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-5 py-2.5 bg-white/60 backdrop-blur-xl border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {/* 左侧极小图标 */}
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shadow-sm">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <div className="flex flex-col">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">电费结算单</h2>
            </div>
          </div>

          {/* 极小关闭按钮 */}
          <button
            onClick={() => setOpen(false)}
            className="relative w-7 h-7 flex items-center justify-center rounded-full border border-slate-50 bg-white hover:bg-slate-50 hover:border-slate-100 transition-all duration-300 group"
          >
            <div className="relative w-3 h-3">
              {/* 极细 X 线条：只有 1px 宽 */}
              <span className="absolute inset-0 m-auto w-full h-[1px] bg-slate-400 rotate-45 group-hover:bg-slate-900 transition-colors"></span>
              <span className="absolute inset-0 m-auto w-full h-[1px] bg-slate-400 -rotate-45 group-hover:bg-slate-900 transition-colors"></span>
            </div>
          </button>
        </div>
        {/* --- 秀气版 Header 结束 --- */}

        {/* 内容区 */}
        <div className="overflow-y-auto">
          {selectedBillId && selectedBillType === 'P0001' && <AgentPriceBillContent id={selectedBillId!} />}
          {selectedBillId && selectedBillType === 'P0002' && <MerchantBillContent id={selectedBillId!} />}
          {selectedBillId && selectedBillType === 'P0003' && <FixedPriceBillContent id={selectedBillId!} />}
          {selectedBillId && selectedBillType === 'P0003F' && <FullGridBillContent id={selectedBillId!} />}
          {selectedBillId && selectedBillType === 'P0004' && <ConsumptionRatioBillContent id={selectedBillId!} />}
        </div>
        {/* 在 BillContent 组件的末尾，或者 Dialog 的内容容器底部添加以下代码 */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-6 flex justify-center items-center gap-4">

          {/* 关闭按钮：极简轻盈风格 */}
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200"
          >
            关闭
          </button>

          {/* 下载按钮：精致高对比度风格 */}
          <button
            onClick={handleDownloadPDF} // 示例逻辑：触发打印或下载
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl shadow-lg shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-100 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下载
          </button>

        </div>
      </Dialog>

      <SelfConsumptionDialog
        title={selfConsumptionDialogTitle}
        dialogSize={'lg'}
        open={selfConsumptionDialogOpen}
        onClose={() => {
          setSelfConsumptionDialogOpen(false);
        }}
        children={WrapSoloFormNode(Parameterization('ViewTbLgtnnfggBdonpj', {
          initialData: selfConsumptionPkId != null && selfConsumptionPkId > 0 ? {
            'pkLgtnnfgg': selfConsumptionPkId
          } : {},
          onCancel: (formData: any) => {
            setSelfConsumptionDialogOpen(false);
          },
          onSubmit: (formData: any) => {
            setSelfConsumptionDialogOpen(false);
          },
        }))}
      />

      <SurplusToGridDialog
        title={surplusToGridDialogTitle}
        dialogSize={'lg'}
        open={surplusToGridDialogOpen}
        onClose={() => {
          setSurplusToGridDialogOpen(false);
        }}
        children={WrapSoloFormNode(Parameterization('ViewTbCuqscwaiClbnay', {
          initialData: surplusToGridPkId != null && surplusToGridPkId > 0 ? {
            'pkCuqscwai': surplusToGridPkId
          } : {},
          onCancel: (formData: any) => {
            setSurplusToGridDialogOpen(false);
          },
          onSubmit: (formData: any) => {
            setSurplusToGridDialogOpen(false);
          },
        }))}
      />

      <SurplusToGridDialog
        title={surplusToGridItemTitle}
        subtitle={surplusToGridItemSubtitle}
        open={surplusToGridItemOpen}
        onClose={() => {
          setSurplusToGridItemOpen(false);
        }}
        children={WrapSoloFormNode(Parameterization("ViewTbExswzlwtKcdgmf", {
          readOnly: surplusToGridItemReadOnly,
          initialData: selectedSurplusToGridItemId != null && selectedSurplusToGridItemId > 0 ? {
            'pkExswzlwt': selectedSurplusToGridItemId
          } : {},
          onCancel: (formData: any) => {
            setSurplusToGridItemOpen(false);
          },
          onSubmit: (formData: any) => {
            setSurplusToGridItemOpen(false);
            fetchMerchants();
            handleRefreshSurplusToGrid();
          },
        }))}
      />

      <SurplusToGridDialog
        title={surplusToGridConsumptionItemTitle}
        subtitle={surplusToGridConsumptionItemSubtitle}
        open={surplusToGridConsumptionItemOpen}
        onClose={() => {
          setSurplusToGridItemOpen(false);
        }}
        children={WrapSoloFormNode(Parameterization("ViewTbExswzlwtLqufqi", {
          readOnly: surplusToGridConsumptionItemReadOnly,
          initialData: selectedSurplusToGridConsumptionItemId != null && selectedSurplusToGridConsumptionItemId > 0 ? {
            'pkExswzlwt': selectedSurplusToGridConsumptionItemId
          } : {},
          onCancel: (formData: any) => {
            setSurplusToGridConsumptionItemOpen(false);
          },
          onSubmit: (formData: any) => {
            setSurplusToGridConsumptionItemOpen(false);
            fetchMerchants();
            handleRefreshSurplusToGrid();
          },
        }))}
      />
    </div>
  );
};

export default TimelineList;