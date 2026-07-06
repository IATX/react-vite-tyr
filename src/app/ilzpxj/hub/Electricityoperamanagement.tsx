import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Paper, IconButton, TextField, InputAdornment, Tooltip, CircularProgress } from '@mui/material';
import {
  Search,
  SolarPower,
  KeyboardArrowUp,
  KeyboardArrowDown,
  ChevronRight,
} from '@mui/icons-material';

import axios from 'axios';

import { useNavigate } from 'react-router-dom';

import { useAlert } from '../../../components/AlertContext';
import { useSession } from '../../../authority/SessionContext';
import { useBreadcrumbs } from '../../../context/BreadcrumbContext';
import { AppContext } from '../../../context/AppContext';
import ConsumptionStatList from './ConsumptionStatList';

interface Project {
  id: number;
  projectName: string;       // 项目名称
  generationAccount: string; // 发电户号
  merchant: string;          // 商户
  pwayuydj: string;          // 发电类型
}

// 接口原始返回行（字段沿用商户电价管理 query_yagetq 列表）
interface ProjectRow {
  pkXbbyezwt: number;
  gwsnkwpp: string;  // 项目名称
  bwblkhay: string;  // 发电户号
  mrvqpphi: string;  // 商户
  pwayuydj: string;  // 发电类型
}

// 将接口原始行映射为页面展示用的 Project
const mapRowToProject = (row: ProjectRow): Project => ({
  id: row.pkXbbyezwt,
  projectName: row.gwsnkwpp ?? '未命名项目',
  generationAccount: row.bwblkhay ?? '',
  merchant: row.mrvqpphi ?? '',
  pwayuydj: row.pwayuydj ?? '',
});

const PAGE_SIZE = 6;

// 列表页状态持久化：点击卡片跳转到「用电量统计」详情页、再返回时恢复之前的页面状态
// （搜索关键字、当前页）。详情页返回时会重新挂载本组件，故用 sessionStorage
// 在挂载时读取、状态变化时写入。
const LIST_STATE_KEY = 'eom:list-state';

interface PersistedListState {
  keyword: string;
  searchTerm: string;
  page: number;
}

const loadListState = (): Partial<PersistedListState> => {
  try {
    const raw = sessionStorage.getItem(LIST_STATE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedListState>) : {};
  } catch {
    return {};
  }
};

const Electricityoperamanagement: React.FC = () => {
  const { showAlert } = useAlert();
  const { token } = useSession();
  const { setCurrentBayContent } = useContext(AppContext);
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  // 挂载时一次性读取上次的列表状态（从详情页返回时恢复）
  const persisted = useState(loadListState)[0];

  const [keyword, setKeyword] = useState(persisted.keyword ?? '');     // 输入框实时值
  const [searchTerm, setSearchTerm] = useState(persisted.searchTerm ?? ''); // 已提交的查询值（失焦时提交）

  // 项目列表
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // 分页（服务端分页，page 从 1 开始）
  const [page, setPage] = useState(persisted.page ?? 1);
  const [totalPages, setTotalPages] = useState(1);

  // 拉取项目列表（参考 电费账单管理 Electricitybillmanagement.tsx 的 fetchData）
  const fetchData = useCallback(async () => {
    setLoading(true);

    const params = {
      page,
      limit: PAGE_SIZE,
      gwsnkwpp: searchTerm, // 按项目名称查询
      mrvqpphi: searchTerm, // 按商户名称查询
      bwblkhay: searchTerm, // 按发电户号查询
      queryMode: 'or'
    };

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_JET_ASP_BPC_API}/tablequery/listreacttable/query_yagetq`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            grooveToken: token,
          },
        },
      );

      if (data?.success) {
        const rows: ProjectRow[] = Array.isArray(data.data) ? data.data : [];
        setProjects(rows.map(mapRowToProject));
        setTotalPages(Math.max(1, data.totalPage ?? 1));
        if (typeof data.page === 'number' && data.page !== page) {
          setPage(data.page);
        }
      } else {
        showAlert(data?.message ?? '请求失败', 'error');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      showAlert(`查询项目列表异常：${message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, token, showAlert]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 初始打开时设置面包屑为「运维管理」
  useEffect(() => {
    setBreadcrumbs([{ name: '运维管理', url: '/main/trays' }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 状态变化时写入 sessionStorage，供从详情页返回时恢复
  useEffect(() => {
    const state: PersistedListState = { keyword, searchTerm, page };
    try {
      sessionStorage.setItem(LIST_STATE_KEY, JSON.stringify(state));
    } catch {
      /* 忽略持久化失败（如隐私模式） */
    }
  }, [keyword, searchTerm, page]);

  // 失焦时提交查询：更新 searchTerm 并回到第一页，fetchData 会随之自动重新拉取
  const commitSearch = () => {
    const next = keyword.trim();
    if (next === searchTerm) return; // 查询值无变化时不重复请求
    setSearchTerm(next);
    setPage(1);
  };

  // 点击卡片：整页切换到该项目的用电量统计列表，传递 项目名称 / 发电户号 / 商户
  const openConsumptionStat = (project: Project) => {
    setBreadcrumbs([
      { name: '运维管理', url: '/main/trays' },
      { name: `${project.projectName} · ${project.generationAccount}`, url: '/main/trays' },
    ]);
    setCurrentBayContent({
      title: '用电量统计',
      subheader: project.projectName,
      elem: <ConsumptionStatList projectName={project.projectName} generationAccount={project.generationAccount} merchant={project.merchant} merchantId={project.id} />,
      type: 'hub',
    });
    navigate('/main/trays');
  };

  return (
    <div className="p-5 min-h-screen">
      {/* 头部 + 右上角搜索 */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900">
          运维管理
        </h1>
        <p className="text-sm text-slate-500">
          请选择目标项目，查看其用电量统计明细。
        </p>
      </header>

      {/* 搜索：右上角 */}
      <div className="w-full max-w-xs shrink-0">
        <TextField
          fullWidth
          size="small"
          placeholder="搜索项目名称 / 发电户号"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onBlur={commitSearch}
          sx={{
            // focus 时边框用蓝色（!important 压过主题的 focus 样式）
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3b82f6 !important',
            },
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              (e.target as HTMLInputElement).blur();
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" className="text-slate-400" />
                </InputAdornment>
              ),
            },
          }}
        />
      </div>
      </div>

      {/* 项目列表 */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 p-20 text-center">
          <CircularProgress size={32} sx={{ color: '#3b82f6' }} />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-20 text-center">
          <p className="text-sm text-slate-400">未找到匹配的项目</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const accountInvalid = !project.generationAccount;
            return (
            <Paper
              key={project.id}
              elevation={0}
              onClick={() => { if (!accountInvalid) openConsumptionStat(project); }}
              className={
                'group relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all ' +
                (accountInvalid
                  ? 'border-dashed border-red-300 cursor-not-allowed opacity-60'
                  : 'border-slate-200 cursor-pointer hover:border-blue-500 hover:shadow-md')
              }
            >
              {/* 右上角跳转箭头 */}
              {!accountInvalid && (
                <span className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                  <ChevronRight fontSize="small" />
                </span>
              )}

              {/* 项目信息 */}
              <div className="p-5">
                <div className="mb-4 flex items-center gap-3 pr-16">
                  <div className="flex-shrink-0 rounded-xl bg-blue-50 p-2 text-blue-600">
                    <SolarPower />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold leading-tight text-slate-800">
                      {project.projectName}
                    </h2>
                    <p className={
                      'mt-0.5 truncate font-mono text-xs ' +
                      (accountInvalid ? 'font-semibold text-red-500' : 'text-slate-600')
                    }>
                      发电户号：{project.generationAccount || '缺少户号'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 border-t border-slate-100 pt-4">
                  <Field label="商户" value={project.merchant} tip className="col-span-2" />
                  <Field label="发电类型" value={project.pwayuydj || '-'} className="col-span-2" />
                </div>
              </div>
            </Paper>
            );
          })}
        </div>
      )}

      {/* 分页：极简上下箭头 */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <IconButton
            size="small"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            aria-label="上一页"
          >
            <KeyboardArrowUp fontSize="small" />
          </IconButton>
          <span className="text-sm tabular-nums text-slate-500">
            {page} / {totalPages}
          </span>
          <IconButton
            size="small"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            aria-label="下一页"
          >
            <KeyboardArrowDown fontSize="small" />
          </IconButton>
        </div>
      )}
    </div>
  );
};

// 小字段展示
const Field: React.FC<{ label: string; value: string; mono?: boolean; tip?: boolean; className?: string }> = ({
  label,
  value,
  mono,
  tip,
  className = '',
}) => {
  const valueSpan = (
    <span className={'truncate text-left text-sm text-slate-600 ' + (mono ? 'font-mono' : '')}>{value}</span>
  );

  return (
    <div className={'flex flex-col min-w-0 ' + className}>
      <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      {tip && value ? (
        <Tooltip title={value} arrow placement="top">
          {valueSpan}
        </Tooltip>
      ) : (
        valueSpan
      )}
    </div>
  );
};

export default Electricityoperamanagement;
