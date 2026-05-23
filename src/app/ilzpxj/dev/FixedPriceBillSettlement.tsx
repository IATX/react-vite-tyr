import React, { useEffect, useState } from 'react';
import { Typography, Paper, Button, Chip, Collapse, IconButton, CircularProgress, Alert, DialogTitle, DialogContent, Tooltip } from '@mui/material';
import {
  Assignment, TrendingUp, ChevronRight,
  ExpandMore, ExpandLess, ContactPage, Business,
  AccountBalanceWallet, LocationOn,
  Refresh,
  Close
} from '@mui/icons-material';

import { Dialog, Slide, AppBar, Toolbar, } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { type TransitionProps } from '@mui/material/transitions';

import axios from 'axios';

import { useAlert } from '../../../components/AlertContext.tsx';
import { useSession } from '../../../authority/SessionContext.tsx';

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
  settlementType: string;
  name: string;
  type: string;
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
}

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
      {/* 头部：Tailwind Flex 布局 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">{billData?.month}电费结算单</h2>
          <p className="text-slate-800 text-sm mt-1">编制单位：{billData?.unit}</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">{billData?.state}</span>
          <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full uppercase">{billData?.month}</span>
        </div>
      </div>

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
                <th className="p-2 border-r border-slate-100 font-medium">结算电量<br />(千瓦时)</th>
                <th className="p-2 border-r border-slate-100 font-medium">代购电价<br />(元/千瓦时)</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价(含税)<br />元/千瓦时</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价(不含税)<br />元/千瓦时</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th className="p-2 border-r border-slate-100 font-medium">营业收入</th>
                <th className="p-2 border-r border-slate-200 font-medium">销项税额</th>

                {/* 累计数据明细 */}
                <th className="p-2 border-r border-slate-100 font-medium">结算电量<br />(千千瓦时)</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价(含税)<br />元/千瓦时</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价(不含税)<br />元/千瓦时</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th className="p-2 border-r border-slate-100 font-medium">营业收入</th>
                <th className="p-2 border-r border-slate-100 font-medium">销项税额</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-900">
              {billData.details && billData.details.length > 0 ? (
                billData.details.map((item, index) => (
                  <tr className="hover:bg-slate-50/50 transition-colors" key={index}>
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
                  <td colSpan={13} className="p-3 text-center text-slate-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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
      {/* 头部：Tailwind Flex 布局 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">{billData?.month}电费结算单</h2>
          <p className="text-slate-800 text-sm mt-1">编制单位：{billData?.unit}</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">{billData?.state}</span>
          <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full uppercase">{billData?.month}</span>
        </div>
      </div>

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
                <th className="p-2 border-r border-slate-100 font-medium">结算电量<br />(千瓦时)</th>
                <th className="p-2 border-r border-slate-100 font-medium">代购电价<br />(元/千瓦时)</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价(含税)<br />元/千瓦时</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价(不含税)<br />元/千瓦时</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th className="p-2 border-r border-slate-100 font-medium">营业收入</th>
                <th className="p-2 border-r border-slate-200 font-medium">销项税额</th>

                {/* 累计数据明细 */}
                <th className="p-2 border-r border-slate-100 font-medium">结算电量<br />(千千瓦时)</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价(含税)<br />元/千瓦时</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电价(不含税)<br />元/千瓦时</th>
                <th className="p-2 border-r border-slate-100 font-medium">结算电费</th>
                <th className="p-2 border-r border-slate-100 font-medium">营业收入</th>
                <th className="p-2 border-r border-slate-100 font-medium">销项税额</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-900">
              {billData.details && billData.details.length > 0 ? (
                billData.details.map((item, index) => (
                  <tr className="hover:bg-slate-50/50 transition-colors" key={index}>
                    <td className="p-3 border-r border-slate-100 font-mono">{item.lthpoiid}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.jkvkqasy ? 'italic text-slate-400' : '')}>{item.jkvkqasy ? item.jkvkqasy : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.bojynqlr ? 'italic text-slate-400' : '')}>{item.bojynqlr ? item.bojynqlr : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.dldpvrrr ? 'italic text-slate-400' : '')}>{item.dldpvrrr ? item.dldpvrrr : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.xatbfkda ? 'italic text-slate-400' : '')}>{item.xatbfkda ? item.xatbfkda : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.jvpxjaqg ? 'italic text-slate-400' : '')}>{item.jvpxjaqg ? item.jvpxjaqg : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.ksdmwveh ? 'italic text-slate-400' : '')}>{item.ksdmwveh ? item.ksdmwveh : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.fzzwewsa ? 'italic text-slate-400' : '')}>{item.fzzwewsa ? item.fzzwewsa : '-'}</td>
                    {/* 累计数据示例 */}
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.vbbrigih ? 'italic text-slate-400' : '')}>{item.vbbrigih ? item.vbbrigih : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.zgcbnfjo ? 'italic text-slate-400' : '')}>{item.zgcbnfjo ? item.zgcbnfjo : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.ddvacirx ? 'italic text-slate-400' : '')}>{item.ddvacirx ? item.ddvacirx : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.yvbkpsbb ? 'italic text-slate-400' : '')}>{item.yvbkpsbb ? item.yvbkpsbb : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.okjbddep ? 'italic text-slate-400' : '')}>{item.okjbddep ? item.okjbddep : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.hbzfvhlz ? 'italic text-slate-400' : '')}>{item.hbzfvhlz ? item.hbzfvhlz : '-'}</td>
                    <td className={`p-3 border-r border-slate-100 font-mono ` + (!item.ahdikvey ? 'italic text-slate-400' : '')}>{item.ahdikvey ? item.ahdikvey : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="p-3 text-center text-slate-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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
      {/* 头部：Tailwind Flex 布局 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">{billData?.month}电费结算单</h2>
          <p className="text-slate-800 text-sm mt-1">编制单位：{billData?.unit}</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">{billData?.state}</span>
          <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full uppercase">{billData?.month}</span>
        </div>
      </div>

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
                <th colSpan={4} className="p-2 border-r border-slate-200">合计</th>
                <th colSpan={4} className="p-2 border-r border-slate-200">余电上网部分</th>
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
                    <tr className="hover:bg-slate-50/80 transition-colors" key={index}>
                      <td className="p-3 border-r border-slate-100">{formattedDate}</td>
                      <td className="p-3 border-r border-slate-100">{item.umakupcb}</td>
                      <td className="p-3 border-r border-slate-100">{item.ovehnwzi}</td>
                      <td className="p-3 border-r border-slate-100">{item.kdaiahlw}</td>

                      {/* 合计数据列 */}
                      <td className="p-3 border-r border-slate-100">{item.fgtqnhyn}</td>
                      <td className="p-3 border-r border-slate-100">{item.nwcjwyrf}</td>
                      <td className="p-3 border-r border-slate-100">{item.mrseixpo}</td>
                      <td className="p-3 border-r border-slate-100">{item.kdzxnwil}</td>

                      {/* 余电上网数据列 */}
                      <td className="p-3 border-r border-slate-100">{item.qgwvxncr}</td>
                      <td className="p-3 border-r border-slate-100">{item.jshfcttg}</td>
                      <td className="p-3 border-r border-slate-100">{item.tpjmbqpf}</td>
                      <td className="p-3 border-r border-slate-100">{item.rxnrcarc}</td>

                      {/* 自发自用数据列 */}
                      <td className="p-3 border-r border-slate-100">{item.afnfufjj}</td>
                      <td className="p-3 border-r border-slate-100">{item.szimebex}</td>
                      <td className="p-3 border-r border-slate-100">{item.nughvqbr}</td>
                      <td className="p-3">{item.huscgxas}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={13} className="p-3 text-center text-slate-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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

      axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/queryformdata/view_tb_enpqommq_stpinc/' + id, {}, {
        headers: {
          'Content-Type': 'application/json',
          'grooveToken': token
        }
      }).then(response => {
        if (response.data && response.data.success) {
          // response.data.data
          console.log('Fetched bill detail:', response.data.data);

          const date = new Date(response.data.data.qyziqspn);

          const formattedDate = date.toLocaleString('zh-CN', { year: 'numeric' });

          setBillData({
            id: id,
            month: formattedDate,
            unit: response.data.data.kwotkios,
            account: response.data.data.bykrkknf,
            state: '审核中',
            details: response.data.data.listMmpppb, // 这里需要根据实际数据结构进行解析和赋值
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
      {/* 头部：Tailwind Flex 布局 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">{billData?.month}电费结算单</h2>
          <p className="text-slate-800 text-sm mt-1">编制单位：{billData?.unit}</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">{billData?.state}</span>
          <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full uppercase">{billData?.month}</span>
        </div>
      </div>

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
                <th rowSpan={3} className="p-2 border-r border-slate-200">消纳比例</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">折扣</th>
                <th rowSpan={3} className="p-2 border-r border-slate-200">非分时电度电价</th>
                <th colSpan={4} className="p-2 border-r border-slate-200">合计</th>
                <th colSpan={4} className="p-2 border-r border-slate-200">余电上网部分</th>
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
                  const date = new Date(item.kzvyaals);

                  const formattedDate = date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: 'long', // 'long' 会显示 "一月"，'short' 会显示 "1月"
                  }).replace(' ', '');

                  return (
                    <tr className="hover:bg-slate-50/80 transition-colors" key={index}>
                      <td className="p-3 border-r border-slate-100">{formattedDate}</td>
                      <td className="p-3 border-r border-slate-100">{item.blpwfphd}</td>
                      <td className="p-3 border-r border-slate-100">{item.bgbmzbmj}</td>
                      <td className="p-3 border-r border-slate-100">{item.qjcendqr}</td>
                      <td className="p-3 border-r border-slate-100">{item.ggincvpc}</td>
                      <td className="p-3 border-r border-slate-100">{item.nojglnvw}</td>
                      <td className="p-3 border-r border-slate-100">{item.uvznuyzx}</td>

                      {/* 合计数据列 */}
                      <td className="p-3 border-r border-slate-100">{item.umuvkyot}</td>
                      <td className="p-3 border-r border-slate-100">{item.spiaexwa}</td>
                      <td className="p-3 border-r border-slate-100">{item.uqvxnemb}</td>
                      <td className="p-3 border-r border-slate-100">{item.fkmeyflu}</td>

                      {/* 余电上网数据列 */}
                      <td className="p-3 border-r border-slate-100">{item.miquhxyq}</td>
                      <td className="p-3 border-r border-slate-100">{item.mpzhyjqp}</td>
                      <td className="p-3 border-r border-slate-100">{item.urpukiol}</td>
                      <td className="p-3 border-r border-slate-100">{item.ndtxpupf}</td>

                      {/* 自发自用数据列 */}
                      <td className="p-3 border-r border-slate-100">{item.vbzfcepe}</td>
                      <td className="p-3 border-r border-slate-100">{item.nopmhtfz}</td>
                      <td className="p-3 border-r border-slate-100">{item.vcbppsvv}</td>
                      <td className="p-3">{item.vcbppsvv}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={13} className="p-3 text-center text-slate-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
};

const TimelineList: React.FC = () => {
  const { showAlert } = useAlert();
  const { token } = useSession();

  // 管理每个商户的展开状态
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({
  });

  const [open, setOpen] = useState(false);
  const [selectedBillType, setSelectedBillType] = useState<string | null>(null);
  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);
  const [accountNumber, setAccountNumber] = useState<string | null>(null);

  const [settlementYear, setSettlementYear] = useState<number | null>(null);
  const [selfConsumptionList, setSelfConsumptionList] = useState<[SelfConsumptionItem] | null>(null);

  // 1. 控制弹窗显隐的状态
  const [isSelfConsumptionModalOpen, setIsSelfConsumptionModalOpen] = useState(false);

  // 3. 关闭弹窗
  const closeSelfConsumptionModal = () => {
    setIsSelfConsumptionModalOpen(false);
  };


  const toggleMerchant = (id: number) => {
    setOpenStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 2. 打开弹窗（记得阻止冒泡，防止触发最外层卡片的点击事件）
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

        setIsSelfConsumptionModalOpen(true);
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

  const handleViewSelfConsumption = (id: number, yearMonth: string) => {
    if (id == null) {
      axios.post(import.meta.env.VITE_JET_ASP_BPC_API + `/billsettlement/selfconsumption/creation/${accountNumber}/${yearMonth}`, {

      }, {
        headers: {
          'Content-Type': 'application/json',
          'grooveToken': token
        }
      }).then(response => {
        if (response.data) {
          handleRefreshSelfConsumption()
        } else {
          showAlert(response.data.message, 'error');
        }
      }).catch(err => {
        showAlert('Handle self-consumption data exception: ' + err.message, 'error');
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setOpen(true);

      setSelectedBillId(id);
      setSelectedBillType('P0002');
    }
  }

  const handleSurplusToGrid = (id: number, accountNumber: string, year: number) => {
    setAccountNumber(accountNumber);
    setSettlementYear(year);

    if (id != null) {
      setSelectedBillId(id);
      setSelectedBillType('P0003');
      setOpen(true);
    } else {
      showAlert('请上传余电上网电费账单', 'warning');
    }




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
      "name": '',
      "code": '',
    }, {
      headers: {
        'Content-Type': 'application/json',
        'grooveToken': token
      }
    }).then(response => {
      if (response.data) {
        setMerchants(response.data);
      } else {
        showAlert(response.data.message, 'error');
      }
    }).catch(err => {
      showAlert('Query data exception: ' + err.message, 'error');
    }).finally(() => {
      setLoading(false);
    });
  };

  // 2. 组件挂载时调用
  useEffect(() => {
    fetchMerchants();
  }, []);

  const columns: Merchant[][] = [[], [], []];

  if (Array.isArray(merchants)) {
    merchants.forEach((item, index) => {
      columns[index % 3].push(item);
    });
  }

  return (
    <div className="p-5 min-h-screen">
      <div className="mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center">
              商户电费结算概览
            </h1>
            <p className="text-sm text-slate-500 mt-2 flex items-center gap-2"><svg className="MuiSvgIcon-root MuiSvgIcon-fontSizeSmall css-120dh41-MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="InfoOutlinedIcon"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8"></path></svg>
              基于瀑布流布局的紧凑型账单看板
            </p>
          </div>
          <Button startIcon={<Refresh />} onClick={fetchMerchants} size="small">
            刷新数据
          </Button>
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
          <div className="flex flex-row gap-6 items-start">
            {columns.map((colData, idx) => (
              <div key={idx} className="flex-1 flex flex-col gap-6">
                {colData.map((merchant) => (
                  /* break-inside-avoid 确保卡片不会被跨列截断 */
                  <div key={merchant.id}>
                    <Paper
                      elevation={0}
                      className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-white"
                    >
                      {/* 1. 商户头部信息 - 多行多列展示 */}
                      <div
                        className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => toggleMerchant(merchant.id)}
                      >
                        <div className="flex justify-between items-center mb-4">
                          {/* 左侧容器：图标与名称并列 */}
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="bg-blue-50 p-2 rounded-xl text-blue-600 flex-shrink-0">
                              <Business />
                            </div>
                            <h2 className="text-base font-bold text-slate-800 leading-tight truncate">
                              {merchant.projectName ? merchant.projectName : '未命名项目'}
                            </h2>
                          </div>

                          {/* 右侧：展开收缩图标 */}
                          <div className="text-slate-400 flex-shrink-0 ml-2">
                            {openStates[merchant.id] ? <ExpandLess /> : <ExpandMore />}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-3 border-t border-slate-100 pt-4">
                          <div className="flex flex-col col-span-2">
                            <span className="text-[12px] uppercase tracking-wider text-slate-600 font-bold">商户</span>
                            <span className="text-sm font-mono text-slate-600 truncate text-left">{merchant.name}</span>
                          </div>
                          <div className="flex flex-col col-span-2">
                            <span className="text-[12px] uppercase tracking-wider text-slate-600 font-bold">所属区域</span>
                            <div className="flex items-center text-slate-600 text-sm truncate text-left">
                              <LocationOn className="text-xs mr-0.5 text-slate-300" />{merchant.address}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] uppercase tracking-wider text-slate-600 font-bold">发电户号</span>
                            <span className="text-sm font-mono text-slate-600">{merchant.number}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] uppercase tracking-wider text-slate-600 font-bold">电价类别</span>
                            <span className="text-sm font-mono text-slate-600">{merchant.settlementType}</span>
                          </div>
                          {/*}
                          <div className="flex flex-col">
                            <span className="text-[12px] uppercase tracking-wider text-slate-600 font-bold">年度结算</span>
                            <span className="text-sm text-slate-600">¥ {merchant.annualSettlement}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] uppercase tracking-wider text-slate-600 font-bold">累计结算</span>
                            <span className="text-sm text-slate-600">¥ {merchant.totalSettlement}</span>
                          </div>
                          */}
                        </div>
                      </div>

                      {/* 2. 嵌套 Timeline 详情 */}
                      <Collapse in={openStates[merchant.id]}>
                        {merchant.settlementList.length === 0 ? (
                          // 占位空状态容器
                          <div className="flex flex-col items-center justify-center text-center p-4">
                            <p className="text-xs text-slate-400 p-3">
                              暂无结算数据，请先上传账单
                            </p>
                          </div>
                        ) : (
                          <div className="p-6 relative border-t border-slate-50">
                            {/* 时间轴中线 */}
                            <div className="absolute left-10 top-6 bottom-10 w-px bg-slate-200 border-l border-dashed" />

                            <div className="space-y-6">
                              {/* 【核心修复】在 JSX 里用 map 循环必须用 { } 开启 JavaScript 上下文 */}
                              {merchant.settlementList.map((item, i) => (
                                <div key={i} className="relative pl-10 group">
                                  {/* 节点图标 */}
                                  <div className={`
                                    absolute left-[6px] top-1 w-5 h-5 rounded-full z-10 border-4 border-white transition-colors
                                    ${item.isLatest ? 'bg-blue-600 shadow-sm' : 'bg-slate-300'}
                                  `} />

                                  <div className="flex justify-between items-center w-full">
                                    {/* 左侧主要内容区域 */}
                                    <div className="flex-1 min-w-0 pr-2">
                                      {/* 1. 年度主标题 */}
                                      <Typography className="text-sm font-semibold text-slate-600 mb-2">
                                        {item.year}年度
                                      </Typography>

                                      {/* 2. 下方横向排列的两个结算区块 */}
                                      <div className="grid grid-cols-2 gap-x-4 border-t border-slate-50 pt-2">

                                        {/* 自用电费结算 */}
                                        <div
                                          className="flex flex-col border-r border-slate-100 pr-2 cursor-pointer hover:bg-indigo-200/30 p-2 rounded-lg transition-colors"
                                          onClick={() => handleSelfConsumption(merchant.number, item.year)}
                                        >
                                          <span className="text-[12px] uppercase tracking-wider text-slate-600 font-bold">
                                            自用电费结算
                                          </span>
                                          <span className="text-sm text-slate-600">
                                            {/* 如果后端已经处理过返回了 '-' 则直接显示 '-' */}
                                            {item.selfConsumptionSumResult === '-' || !item.selfConsumptionSumResult
                                              ? '-'
                                              : `¥ ${item.selfConsumptionSumResult}`}
                                          </span>
                                        </div>

                                        {/* 余电上网结算（按需展示） */}
                                        {(merchant.isBothSettlement === true) && (
                                          <div
                                            onClick={() => handleSurplusToGrid(item.surplusToGridId, merchant.number, item.year)}
                                            className="flex flex-col pl-2 cursor-pointer hover:bg-indigo-200/30 p-2 rounded-lg transition-colors"
                                          >
                                            <span className="text-[12px] uppercase tracking-wider text-slate-600 font-bold">
                                              余电上网结算
                                            </span>
                                            <span className="text-sm text-slate-600">
                                              {item.surplusToGridSumResult === '-' || !item.surplusToGridSumResult
                                                ? '-'
                                                : `¥ ${item.surplusToGridSumResult}`}
                                            </span>
                                          </div>
                                        )}

                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Collapse>
                    </Paper>
                  </div>
                ))}
              </div>
            ))}
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

      {/* 4. 自发自用月度账单明细弹窗 */}
      <Dialog
        open={isSelfConsumptionModalOpen}
        onClose={closeSelfConsumptionModal}
        fullWidth
        // 关键：阻止弹窗内部的点击事件向上冒泡
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          className: "rounded-lg" // 配合 Tailwind 美化弹窗外壳
        }}
      >
        <div className="sticky top-0 z-50 flex items-center justify-between px-5 py-2.5 bg-white/60 backdrop-blur-xl border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">西恩迪项目</h2>
              <span className="text-xs text-slate-600 font-normal mt-0.5">3100061404055</span>
            </div>
          </div>

          {/* 极小关闭按钮 */}
          <button
            onClick={closeSelfConsumptionModal}
            className="relative w-7 h-7 flex items-center justify-center rounded-full border border-slate-50 bg-white hover:bg-slate-50 hover:border-slate-100 transition-all duration-300 group"
          >
            <div className="relative w-3 h-3">
              {/* 极细 X 线条：只有 1px 宽 */}
              <span className="absolute inset-0 m-auto w-full h-[1px] bg-slate-400 rotate-45 group-hover:bg-slate-900 transition-colors"></span>
              <span className="absolute inset-0 m-auto w-full h-[1px] bg-slate-400 -rotate-45 group-hover:bg-slate-900 transition-colors"></span>
            </div>
          </button>
        </div>

        {/* 弹窗主体：账单 List 区域 */}
        <DialogContent className="mt-2 space-y-3 overflow-y-auto !px-2">
          <Typography className="text-sm font-semibold text-slate-600 ml-3 pl-2 border-l-4 border-blue-600">
            自用结算单 - {settlementYear}年度
          </Typography>
          <div className="grid grid-cols-2 p-3 gap-2 text-xs">
            {/* 模拟的月度账单数据，开发时替换为：item.monthlyBills 或从后端 API 异步获取 */}
            {selfConsumptionList && selfConsumptionList.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-100 transition-all group/item cursor-pointer"
                onClick={() => handleViewSelfConsumption(item.id, item.settlementDate) /* 点击后打开对应的结算单详情 */}
              >
                {/* 左侧：月份与电量 */}
                <div className="flex flex-col">
                  <Tooltip
                    title={item.id ? "点击查阅" : "点击生成"}
                    placement="bottom"
                    arrow
                  >
                    <span className={`text-sm ${item.id ? 'font-semibold text-slate-700 group-hover/item:text-indigo-600' : 'text-slate-400 group-hover/item:text-indigo-400'} transition-colors`}>
                      {item.name}月份结算单
                    </span>
                  </Tooltip>

                  <span className={`text-[12px] ${item.id ? 'text-slate-600' : 'text-slate-400'} mt-0.5`}>
                    自用电量: <span className="font-mono">{item.selfUsedTotal}</span> kWh
                  </span>
                </div>

                {/* 右侧：金额与生成日期 */}
                <div className="text-right flex items-center space-x-2">
                  <div className="flex flex-col">
                    <span className={`text-sm font-mono font-bold ${item.id ? 'text-slate-800' : 'text-slate-400'} transition-colors`}>
                      ¥{item.selfUsedFee}
                    </span>
                    <span className={`text-[12px] ${item.id ? 'text-slate-600' : 'text-slate-400'} mt-0.5`}>
                      {item.settlementDate}
                    </span>
                  </div>
                  <ChevronRight fontSize="inherit" className="text-slate-300 group-hover/item:text-indigo-400 transition-colors" />
                </div>
              </div>
            ))}
            {/*
            <div className="flex flex-col col-span-2 text-center p-3">
              <p className="text-xs text-slate-400">尚无结算数据</p>
            </div>
            */}
          </div>
          {/* 在 BillContent 组件的末尾，或者 Dialog 的内容容器底部添加以下代码 */}
          <div className="sticky bottom-0 bg-white/80 backdrop-blur-md flex justify-end items-center gap-4">
            {/* 关闭按钮：极简轻盈风格 */}
            <button
              onClick={closeSelfConsumptionModal}
              className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200"
            >
              关闭
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimelineList;