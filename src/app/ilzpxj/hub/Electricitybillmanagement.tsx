import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Paper, Button, IconButton, TextField, InputAdornment, Tooltip, Collapse, CircularProgress } from '@mui/material';
import {
  Search,
  CloudUploadOutlined,
  SolarPower,
  ElectricBolt,
  KeyboardArrowUp,
  KeyboardArrowDown,
  VisibilityOutlined,
  QueryStatsOutlined,
} from '@mui/icons-material';

import axios from 'axios';

import { useNavigate } from 'react-router-dom';

import { useAlert } from '../../../components/AlertContext';
import { useSession } from '../../../authority/SessionContext';
import Parameterization from '../../../components/RenderComponent';
import { useBreadcrumbs } from '../../../context/BreadcrumbContext';
import { AppContext } from '../../../context/AppContext';
import BillImportDialog from '../../../components/FormDialogSoloPage';
import { WrapSoloFormNode } from '../../../components/WrapNode';
import SelfUseBillList from './SelfUseBillList';
import PowerCompanyBillList from './PowerCompanyBillList';
import ConsumptionStatPriceList from './ConsumptionStatPriceList';

// 账单类别：全额上网 / 自发自用 / 余电上网
// 业务类型一：全额上网
// 业务类型二：自发自用余电上网（含 自发自用、余电上网 两类账单）
type FeedMode = 'whole' | 'selfuse' | 'surplus';

const MODE_LABEL: Record<FeedMode, string> = {
  whole: '全额上网',
  selfuse: '自发自用',
  surplus: '余电上网',
};

interface Project {
  id: number;
  projectName: string;       // 项目名称
  generationAccount: string; // 发电户号
  merchant: string;          // 商户
  pwayuydj: string;          // 发电类型
  pricingBasis: string;      // 电价计算依据
  columnBirp: string; // 电价设置状态
  zxfodonb: string;
}

// 接口原始返回行（字段沿用商户电价管理 query_yagetq 列表）
interface ProjectRow {
  pkXbbyezwt: number;
  gwsnkwpp: string;  // 项目名称
  bwblkhay: string;  // 发电户号
  mrvqpphi: string;  // 商户
  pwayuydj: string;  // 发电类型
  xjegvvik: string;  // 电价计算依据
  columnBirp: string; // 电价设置状态
  zxfodonb: string; // 业务类型：00 全额上网；01 自发自用余电上网
}

// 将接口原始行映射为页面展示用的 Project
const mapRowToProject = (row: ProjectRow): Project => ({
  id: row.pkXbbyezwt,
  projectName: row.gwsnkwpp ?? '未命名项目',
  generationAccount: row.bwblkhay ?? '',
  merchant: row.mrvqpphi ?? '',
  pwayuydj: row.pwayuydj ?? '',
  pricingBasis: row.xjegvvik ?? '',
  columnBirp: row.columnBirp,
  zxfodonb: row.zxfodonb ?? '',
});

const PAGE_SIZE = 6;

// 列表页状态持久化：用于「查阅」跳转到详情页、再返回时恢复之前的页面状态
// （搜索关键字、当前页、展开的卡片）。详情页返回时会重新挂载本组件，
// 故用 sessionStorage 在挂载时读取、状态变化时写入。
const LIST_STATE_KEY = 'ebm:list-state';

interface PersistedListState {
  keyword: string;
  searchTerm: string;
  page: number;
  selectedId: number | null;
}

const loadListState = (): Partial<PersistedListState> => {
  try {
    const raw = sessionStorage.getItem(LIST_STATE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedListState>) : {};
  } catch {
    return {};
  }
};

const Electricitybillmanagement: React.FC = () => {
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

  // 拉取项目列表（参考 商户电价管理 Mchelecprice.tsx 的 fetchData）
  const fetchData = useCallback(async () => {
    setLoading(true);

    const params = {
      page,
      limit: PAGE_SIZE,
      mrvqpphi: searchTerm, // 按商户名称查询
      bwblkhay: searchTerm, // 按发电户号查询
      gwsnkwpp: searchTerm, // 按项目名称查询
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

  // 初始打开时设置面包屑为「电费账单管理」
  useEffect(() => {
    setBreadcrumbs([{ name: '电费账单管理', url: '/main/trays' }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 上传 / 查询 弹窗状态
  const [dialogOpen, setDialogOpen] = useState(false); // 上传弹窗
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeMode, setActiveMode] = useState<FeedMode | null>(null);

  // 当前展开（选中）的卡片，单选：选中一个会收起其它
  const [selectedId, setSelectedId] = useState<number | null>(persisted.selectedId ?? null);

  // 状态变化时写入 sessionStorage，供从详情页返回时恢复
  useEffect(() => {
    const state: PersistedListState = { keyword, searchTerm, page, selectedId };
    try {
      sessionStorage.setItem(LIST_STATE_KEY, JSON.stringify(state));
    } catch {
      /* 忽略持久化失败（如隐私模式） */
    }
  }, [keyword, searchTerm, page, selectedId]);

  // “自发自用”账单导入弹窗（复用商户账单导入表单 ViewTbYrnfwwvyQfxmub）
  const [selfuseImportOpen, setSelfuseImportOpen] = useState(false);

  // 失焦时提交查询：更新 searchTerm 并回到第一页，fetchData 会随之自动重新拉取
  const commitSearch = () => {
    const next = keyword.trim();
    if (next === searchTerm) return; // 查询值无变化时不重复请求
    setSearchTerm(next);
    setPage(1);
  };

  // 上传账单：打开「全额上网 / 余电上网」账单导入弹窗
  const openImport = (project: Project, mode: FeedMode) => {
    setActiveProject(project);
    setActiveMode(mode);
    setDialogOpen(true);
  };

  const closeImport = () => setDialogOpen(false);


  // 查阅时若发电户号为空，使用默认值「000」
  const resolveAccount = (account: string) => account.trim() || '000';

  // “自发自用”查阅：整页切换到该项目的自发自用账单列表
  const openSelfuseList = (project: Project) => {
    const generationAccount = resolveAccount(project.generationAccount);
    setBreadcrumbs([
      { name: '电费账单管理', url: '/main/trays' },
      { name: `${project.projectName} · ${generationAccount}`, url: '/main/trays' },
    ]);
    setCurrentBayContent({
      title: '自发自用账单',
      subheader: project.projectName,
      elem: <SelfUseBillList projectName={project.projectName} generationAccount={generationAccount} merchantId={project.id} merchant={project.merchant} />,
      type: 'hub',
    });
    navigate('/main/trays');
  };

  // “全额上网” / “余电上网”查阅：整页切换到该项目的电力公司账单列表
  const openPowerList = (project: Project, modeLabel: string) => {
    const generationAccount = resolveAccount(project.generationAccount);
    setBreadcrumbs([
      { name: '电费账单管理', url: '/main/trays' },
      { name: `${project.projectName} · ${generationAccount}`, url: '/main/trays' },
    ]);
    setCurrentBayContent({
      title: `${modeLabel}账单`,
      subheader: project.projectName,
      elem: <PowerCompanyBillList projectName={project.projectName} generationAccount={generationAccount} merchant={project.merchant} modeLabel={modeLabel} />,
      type: 'hub',
    });
    navigate('/main/trays');
  };

  // “电价设置”查阅：整页切换到该项目的用电量统计列表（逐条进入设置尖峰平谷电价）
  const openPriceSettingList = (project: Project) => {
    const generationAccount = resolveAccount(project.generationAccount);
    setBreadcrumbs([
      { name: '电费账单管理', url: '/main/trays' },
      { name: `${project.projectName} · ${generationAccount}`, url: '/main/trays' },
    ]);
    setCurrentBayContent({
      title: '用电量统计',
      subheader: project.projectName,
      elem: <ConsumptionStatPriceList projectName={project.projectName} generationAccount={generationAccount} merchant={project.merchant} merchantId={project.id} />,
      type: 'hub',
    });
    navigate('/main/trays');
  };

  // 返回本页（电费账单管理）
  const navBack = () => {
    setCurrentBayContent({
      title: '电费账单管理',
      subheader: '电费账单管理',
      elem: Parameterization('Electricitybillmanagement', {}),
      type: 'hub',
    });
    navigate('/main/trays');
  };

  // “自发自用”上传：复用 Billcenter -> RenderMerchantList 的 handleAdd 逻辑，
  // 打开「商户电费账单」新增表单（ViewTbJkywwxtlMsurqp）
  const handleSelfuseAdd = () => {
    setBreadcrumbs([
      { name: '电费账单管理', url: '/main/trays' },
      { name: '商户电费账单', url: '/main/trays' },
    ]);
    setCurrentBayContent({
      title: '商户电费账单',
      subheader: '商户电费账单',
      elem: Parameterization('ViewTbJkywwxtlMsurqp', {
        key: 'ViewTbJkywwxtlMsurqp',
        initialData: {
          
        },
        onCancel: navBack,
        onSubmit: navBack,
      }),
      type: 'view',
    });
    navigate('/main/trays');
  };

  // 保留 handleSelfuseAdd 供后续“打开新增表单”方式使用（当前上传走 BillImportDialog）
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  void handleSelfuseAdd;

  return (
    <div className="p-5 min-h-screen">
      {/* 头部 + 右上角搜索 */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900">
          电费账单管理
        </h1>
        <p className="text-sm text-slate-500">
          请在目标项目中选择“余电上网”或“自发自用”，并上传相关账单文件。
        </p>
      </header>

      {/* 搜索：右上角 */}
      <div className="w-full max-w-xs shrink-0">
        <TextField
          fullWidth
          size="small"
          placeholder="搜索项目名称 / 商户名称 / 发电户号"
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
          {projects.map((project) => (
            <Paper
              key={project.id}
              elevation={0}
              onClick={() => {
                if (!project.generationAccount) return;
                setSelectedId((prev) => (prev === project.id ? null : project.id));
              }}
              className={
                'relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all ' +
                (!project.generationAccount
                  ? 'border-dashed border-red-300 cursor-not-allowed opacity-60'
                  : selectedId === project.id
                  ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-md cursor-pointer hover:shadow-md'
                  : 'border-slate-200 cursor-pointer hover:shadow-md')
              }
            >
              {/* 电价设置状态：右上角徽标 */}
              <span
                className={
                  'absolute right-3 top-3 z-10 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                  (project.columnBirp === 'Yes'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-red-50 text-red-600')
                }
              >
                {project.columnBirp === 'Yes' ? '已设置' : '未设置'}
              </span>

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
                      (project.generationAccount ? 'text-slate-600' : 'font-semibold text-red-500')
                    }>
                      发电户号：{project.generationAccount || '缺少户号'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 border-t border-slate-100 pt-4">
                  <Field label="商户" value={project.merchant} tip className="col-span-2" />
                  <Field label="电价计算依据" value={project.pricingBasis || '-'} />
                  <Field label="发电类型" value={project.pwayuydj} />
                </div>
              </div>

              {/* 两种业务类型；选中卡片后平滑展开，取消选中时平滑收缩 */}
              <Collapse in={selectedId === project.id} timeout="auto" unmountOnExit>
                <div
                  className="divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/60"
                  onClick={(e) => e.stopPropagation()}
                >
                {/* 业务一：全额上网 */}
                {project.zxfodonb === '00' && (
                  <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                      <ElectricBolt fontSize="small" />
                      全额上网
                    </span>
                    <BillActions
                      onUpload={() => openImport(project, 'whole')}
                      onView={() => openPowerList(project, '全额上网')}
                    />
                  </div>
                )}

                {/* 业务二：自发自用余电上网 */}
                {project.generationAccount !== '' && project.zxfodonb === '01' && (
                  <div className="px-4 py-2.5">
                    <span className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                      <SolarPower fontSize="small" />
                      自发自用余电上网
                    </span>
                    <div className="mt-1 pl-2">
                      {/* 自发自用（树状节点，连接线向下延伸 ├） */}
                      <div className="relative flex items-center justify-between gap-2 py-1 pl-6
                        before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-emerald-200
                        after:absolute after:left-0 after:top-1/2 after:h-px after:w-4 after:bg-emerald-200">
                        <span className="text-sm text-slate-600">自发自用</span>
                        <BillActions
                          onUpload={() => { setActiveProject(project); setSelfuseImportOpen(true); }}
                          onView={() => openSelfuseList(project)}
                        />
                      </div>
                      {/* 余电上网（树状末节点，连接线只到中部 └） */}
                      <div className="relative flex items-center justify-between gap-2 py-1 pl-6
                        before:absolute before:left-0 before:top-0 before:bottom-1/2 before:w-px before:bg-emerald-200
                        after:absolute after:left-0 after:top-1/2 after:h-px after:w-4 after:bg-emerald-200">
                        <span className="text-sm text-slate-600">余电上网</span>
                        <BillActions
                          onUpload={() => openImport(project, 'surplus')}
                          onView={() => openPowerList(project, '余电上网')}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 用电量统计 */}
                {project.generationAccount !== '' && project.zxfodonb === '01' && (
                  <div className="px-4 py-2.5">
                    <span className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-violet-600">
                      <QueryStatsOutlined fontSize="small" />
                      用电量统计
                    </span>
                    <div className="mt-1 pl-2">
                      {/* 电价设置（树状末节点，连接线只到中部 └） */}
                      <div className="relative flex items-center justify-between gap-2 py-1 pl-6
                        before:absolute before:left-0 before:top-0 before:bottom-1/2 before:w-px before:bg-violet-200
                        after:absolute after:left-0 after:top-1/2 after:h-px after:w-4 after:bg-violet-200">
                        <span className="text-sm text-slate-600">电价设置</span>
                        <Button
                          size="small"
                          startIcon={<VisibilityOutlined fontSize="small" />}
                          onClick={() => openPriceSettingList(project)}
                          sx={{ minWidth: 0, color: '#475569', '&:hover': { backgroundColor: '#f1f5f9' } }}
                        >
                          查询
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              </Collapse>
            </Paper>
          ))}
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

      {/* “全额上网” / “余电上网”账单导入弹窗：复用电力公司账单导入表单 ViewTbStybmjgdRuiowc */}
      <BillImportDialog
        title={activeProject ? activeProject.projectName : '账单导入'}
        subtitle={activeProject && activeMode ? `${MODE_LABEL[activeMode]} · 发电户号：${activeProject.generationAccount}` : undefined}
        dialogSize={'sm'}
        open={dialogOpen}
        onClose={closeImport}
        children={WrapSoloFormNode(Parameterization('ViewTbStybmjgdRuiowc', {
          initialData: {},
          onCancel: closeImport,
          onSubmit: closeImport,
        }))}
      />


      {/* “自发自用”账单导入弹窗：复用商户账单导入表单 ViewTbYrnfwwvyQfxmub */}
      <BillImportDialog
        title={activeProject ? activeProject.projectName : '账单导入'}
        subtitle={activeProject ? `发电户号：${activeProject.generationAccount}` : undefined}
        dialogSize={'sm'}
        open={selfuseImportOpen}
        onClose={() => setSelfuseImportOpen(false)}
        children={WrapSoloFormNode(Parameterization('ViewTbYrnfwwvyQfxmub', {
          initialData: {
            merchantId: activeProject?.id
          },
          onCancel: () => setSelfuseImportOpen(false),
          onSubmit: () => setSelfuseImportOpen(false),
        }))}
      />
    </div>
  );
};

// 每个账单类别的「上传 / 查询」操作
const BillActions: React.FC<{ onUpload: () => void; onView: () => void }> = ({ onUpload, onView }) => (
  <div className="flex flex-shrink-0 gap-1">
    <Button
      size="small"
      startIcon={<CloudUploadOutlined fontSize="small" />}
      onClick={onUpload}
      sx={{ minWidth: 0, color: '#2563eb', '&:hover': { backgroundColor: '#eff6ff' } }}
    >
      上传
    </Button>
    <Button
      size="small"
      startIcon={<VisibilityOutlined fontSize="small" />}
      onClick={onView}
      sx={{ minWidth: 0, color: '#475569', '&:hover': { backgroundColor: '#f1f5f9' } }}
    >
      查询
    </Button>
  </div>
);

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

export default Electricitybillmanagement;
