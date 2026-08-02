import React, { useMemo, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { Search, Description, Business, Numbers } from '@mui/icons-material';

import axios from 'axios';

import { useAlert } from '../../../components/AlertContext.tsx';
import { useSession } from '../../../authority/SessionContext.tsx';

/**
 * 项目结算统计
 *
 * 按项目名称模糊查询关联商户，多选后由后端生成多 sheet 的 Excel：
 * 每个选中商户一个 sheet（余电上网结算单结构），最后一个 sheet 是这些商户的合计。
 *
 * 商户查询复用「电费账单管理」的列表接口（同「商户电价管理」query_yagetq），
 * 只传 gwsnkwpp 即为纯项目名称模糊匹配。
 */
const SEARCH_API = '/tablequery/listreacttable/query_yagetq';
const EXPORT_API = '/projectsettlementstat/export';

// 一个项目下的商户数量有限，一次取足以避免跨页多选丢选择
const SEARCH_LIMIT = 200;

// 接口原始返回行（字段沿用商户电价管理 query_yagetq 列表）
interface ProjectRow {
  pkXbbyezwt: number;
  gwsnkwpp: string;   // 项目名称
  bwblkhay: string;   // 发电户号
  mrvqpphi: string;   // 商户
  pwayuydj: string;   // 发电类型
  xjegvvik: string;   // 电价计算依据
}

interface ProjectMerchant {
  /** 唯一标识：多选以它为准 */
  id: number;
  projectName: string;
  merchantName: string;
  /** 发电户号，导出时按它关联结算单 */
  accountNumber: string;
  generationType: string;
  priceBasis: string;
}

const mapRowToMerchant = (row: ProjectRow): ProjectMerchant => ({
  id: row.pkXbbyezwt,
  projectName: row.gwsnkwpp ?? '',
  merchantName: row.mrvqpphi ?? '',
  accountNumber: row.bwblkhay ?? '',
  generationType: row.pwayuydj ?? '',
  priceBasis: row.xjegvvik ?? '',
});

// 年份下拉：当前年往前 5 年、往后 1 年
const buildYearOptions = (): number[] => {
  const current = new Date().getFullYear();

  return Array.from({ length: 7 }, (_, i) => current + 1 - i);
};

const Projectsettlementstat: React.FC = () => {
  const { token } = useSession();
  const { showAlert } = useAlert();

  const yearOptions = useMemo(buildYearOptions, []);

  const [projectName, setProjectName] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const [merchants, setMerchants] = useState<ProjectMerchant[]>([]);
  // 以发电户号作为选中标识：它既是导出要传的值，也比商户主键更能保证唯一
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());

  const [searching, setSearching] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  // 是否已经查过一次：用于区分「还没查」和「查了没结果」
  const [searched, setSearched] = useState<boolean>(false);

  // 没有发电户号的行关联不到结算单，不参与选择
  const selectableAccounts = useMemo(
    () => Array.from(new Set(merchants.map((m) => m.accountNumber).filter((n) => !!n))),
    [merchants]);

  const allSelected = selectableAccounts.length > 0
    && selectableAccounts.every((n) => selectedAccounts.has(n));

  const handleSearch = async () => {
    if (!projectName.trim()) {
      showAlert('请先输入项目名称', 'warning');

      return;
    }

    setSearching(true);

    try {
      const { data } = await axios.post(
        import.meta.env.VITE_JET_ASP_BPC_API + SEARCH_API,
        {
          page: 1,
          limit: SEARCH_LIMIT,
          gwsnkwpp: projectName.trim(), // 只按项目名称模糊匹配
          queryMode: 'or'
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            grooveToken: token
          }
        });

      if (data?.success) {
        const rows: ProjectRow[] = Array.isArray(data.data) ? data.data : [];

        setMerchants(rows.map(mapRowToMerchant));
        // 查询结果变化后原有选择作废，避免把上一次的商户混进导出
        setSelectedAccounts(new Set());
        setSearched(true);
      } else {
        showAlert(data?.message ?? '查询项目商户失败', 'error');
      }
    } catch (err) {
      showAlert('查询项目商户异常：' + (err instanceof Error ? err.message : err), 'error');
    } finally {
      setSearching(false);
    }
  };

  const toggleOne = (accountNumber: string) => {
    if (!accountNumber) return;

    setSelectedAccounts((prev) => {
      const next = new Set(prev);

      if (next.has(accountNumber)) {
        next.delete(accountNumber);
      } else {
        next.add(accountNumber);
      }

      return next;
    });
  };

  const toggleAll = () => {
    setSelectedAccounts(allSelected ? new Set() : new Set(selectableAccounts));
  };

  const handleExport = async () => {
    if (selectedAccounts.size === 0) return;

    setExporting(true);

    try {
      const response = await axios.post(
        import.meta.env.VITE_JET_ASP_BPC_API + EXPORT_API,
        {
          projectName: projectName.trim(),
          year: String(year),
          // 结算单按发电户号关联（tb_cuqscwai.MUSWISJH），传户号比传商户主键直接
          accountNumbers: Array.from(selectedAccounts)
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'grooveToken': token
          },
          responseType: 'blob'
        });

      // 后端异常时返回的是 JSON，此处按文本解析出错误信息提示
      if (response.data.type && response.data.type.indexOf('application/json') > -1) {
        const message = JSON.parse(await response.data.text());

        showAlert(message.message || '导出结算统计失败', 'error');

        return;
      }

      // 文件名优先取后端 Content-Disposition（已 URL 编码）
      const disposition = response.headers['content-disposition'] as string | undefined;
      const matched = disposition ? /filename=([^;]+)/.exec(disposition) : null;
      const fileName = matched ? decodeURIComponent(matched[1].trim().replace(/^"|"$/g, ''))
        : `${projectName.trim()}${year}项目结算统计.xlsx`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      // 后端会把当年没有结算单的商户回传，它们的 sheet 是空的，明确告知免得被当成漏数据
      const skipped = response.headers['x-skipped-accounts'] as string | undefined;

      if (skipped) {
        const accounts = decodeURIComponent(skipped).split(',').filter(Boolean);

        showAlert(
          `${accounts.length} 个商户在 ${year} 年没有余电上网结算单，对应 sheet 为空：${accounts.join('、')}`,
          'warning');
      }
    } catch (err) {
      showAlert('导出结算统计失败：' + (err instanceof Error ? err.message : err), 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-full text-slate-800">
      {/* 页头 */}
      <div className="mb-6">
        <p className="text-[11px] font-bold tracking-[0.3em] text-slate-500 uppercase mb-1">电费结算统计</p>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">项目结算统计</h2>
        <p className="text-sm text-slate-400 mt-1">
          按项目名称查询关联商户，勾选后导出多商户余电上网结算单（含合计表）
        </p>
      </div>

      {/* 查询条件 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
            <label className="text-[11px] font-bold text-slate-500 tracking-wider">项目名称</label>
            <div className="relative">
              <Business className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" sx={{ fontSize: 15 }} />
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="输入项目名称，支持模糊匹配"
                className="w-full h-8 pl-8 pr-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 w-[110px]">
            <label className="text-[11px] font-bold text-slate-500 tracking-wider">结算年份</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full h-8 px-2 text-[13px] bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-400 transition-colors"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y} 年</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSearch}
            disabled={searching}
            className="flex items-center gap-1.5 h-8 px-3.5 bg-slate-900 text-white text-[13px] font-semibold rounded-lg shadow-sm shadow-slate-200 hover:bg-blue-600 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search sx={{ fontSize: 15 }} />
            {searching ? '查询中...' : '查询'}
          </button>
        </div>
      </div>

      {/* 商户列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">关联商户</h3>
            {merchants.length > 0 && (
              <span className="text-[12px] text-slate-400">
                共 {merchants.length} 个，已选 {selectedAccounts.size} 个
              </span>
            )}
          </div>

          {selectableAccounts.length > 0 && (
            <button
              onClick={toggleAll}
              className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {allSelected ? '取消全选' : '全选'}
            </button>
          )}
        </div>

        {searching ? (
          <div className="flex flex-col items-center justify-center min-h-[240px] gap-4">
            <CircularProgress size={24} sx={{ color: '#0f172a' }} />
            <p className="text-xs text-slate-600 tracking-widest uppercase">正在查询...</p>
          </div>
        ) : merchants.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[240px] gap-2">
            <p className="text-sm text-slate-400">
              {searched ? '没有查询到该项目关联的商户' : '输入项目名称后点击查询'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-max min-w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                  <th className="p-3 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 accent-slate-900 cursor-pointer"
                    />
                  </th>
                  <th className="p-3 font-bold whitespace-nowrap">项目名称</th>
                  <th className="p-3 font-bold whitespace-nowrap">商户名称</th>
                  <th className="p-3 font-bold whitespace-nowrap">发电户号</th>
                  <th className="p-3 font-bold whitespace-nowrap">发电类型</th>
                  <th className="p-3 font-bold whitespace-nowrap">电价计算依据</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-900">
                {merchants.map((m, index) => (
                  <tr
                    key={m.accountNumber || `row-${index}`}
                    onClick={() => toggleOne(m.accountNumber)}
                    className={`transition-colors ${m.accountNumber
                      ? 'hover:bg-blue-50/40 cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'}`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedAccounts.has(m.accountNumber)}
                        disabled={!m.accountNumber}
                        onChange={() => toggleOne(m.accountNumber)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 accent-slate-900 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="p-3 whitespace-nowrap">{m.projectName || '-'}</td>
                    <td className="p-3 font-medium whitespace-nowrap">{m.merchantName || '-'}</td>
                    <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Numbers className="text-slate-300" sx={{ fontSize: 14 }} />
                        {m.accountNumber || '-'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">{m.generationType || '-'}</td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">{m.priceBasis || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 导出操作条 */}
      <div className="mt-6 flex items-center justify-end gap-4">
        <span className="text-[12px] text-slate-400">
          每个选中商户导出一个 sheet，最后追加一个合计 sheet
        </span>
        <button
          onClick={handleExport}
          disabled={selectedAccounts.size === 0 || exporting}
          className="flex items-center gap-1.5 h-8 px-3.5 bg-slate-900 text-white text-[13px] font-semibold rounded-lg shadow-sm shadow-slate-200 hover:bg-blue-600 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Description sx={{ fontSize: 15 }} />
          {exporting ? '导出中...' : `导出 Excel${selectedAccounts.size > 0 ? `（${selectedAccounts.size}）` : ''}`}
        </button>
      </div>
    </div>
  );
};

export default Projectsettlementstat;
