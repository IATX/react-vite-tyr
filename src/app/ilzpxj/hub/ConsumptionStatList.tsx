import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TablePagination, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { DonutLargeTwoTone, KeyboardArrowDown, ReceiptLongOutlined, DescriptionOutlined } from '@mui/icons-material';
import axios from 'axios';

import { useAlert } from '../../../components/AlertContext';
import { useSession } from '../../../authority/SessionContext';
import { useConfirm } from '../../../components/useConfirmDialog';
import { AppContext } from '../../../context/AppContext';
import { useBreadcrumbs } from '../../../context/BreadcrumbContext';
import { useNavigate } from 'react-router-dom';
import Parameterization from '../../../components/RenderComponent';
import BillImportDialog from '../../../components/FormDialogSoloPage';
import { WrapSoloFormNode } from '../../../components/WrapNode';

// 用电量统计行（字段沿用 Billcenter 的 ConsumptionStatData / query_wnkrtk）
interface ConsumptionStatData {
    pkGvfrokeq: number;
    tjmqxlms: number;   // 结算日期
    ynwjibye: string;   // 发电户号
    tparorbm: string;   // 户名
    ybfzkzts: string;   // 抄表人
    dxxvlgqz: number;   // 上传日期
    vptylsiz: string;   // 确认人
    columnLkps?: string; // 是否有明细数据（非空表示有明细，可导出）
}

interface ConsumptionStatListProps {
    projectName: string;
    generationAccount: string; // 发电户号，用于过滤当前项目的用电量统计
    merchant: string;          // 商户（户名，仅用于显示）
    merchantId: number;        // 商户 id（pkXbbyezwt），新增时作为商户字段 gfumgrlg 的默认值
}

const formatDateCN = (ts: number) =>
    new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' })
        .format(ts)
        .replace(/\//g, '-');

// 结算日期仅显示到月（yyyy-MM）
const formatMonthCN = (ts: number) =>
    new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', timeZone: 'Asia/Shanghai' })
        .format(ts)
        .replace(/\//g, '-');

// 结算月份格式化为 yyyy-MM（用 en-CA 保证连字符输出，避免 zh-CN 在部分环境输出「年/月」）
const formatYearMonth = (ts: number) =>
    new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', timeZone: 'Asia/Shanghai' })
        .format(ts);

const paginationSx = {
    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '0.875rem', color: '#64748b' },
    '.MuiTablePagination-actions': { color: '#2563eb' },
};

const thStyle = 'py-4 px-2 text-sm font-semibold text-gray-900';
const tdStyle = 'py-5 px-2 text-sm text-gray-500 whitespace-nowrap';

const ConsumptionStatList: React.FC<ConsumptionStatListProps> = ({ projectName, generationAccount, merchant, merchantId }) => {
    const { token } = useSession();
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();
    const { setCurrentBayContent } = useContext(AppContext);
    const { setBreadcrumbs } = useBreadcrumbs();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [tableData, setTableData] = useState<ConsumptionStatData[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    // 「导入」下拉子菜单锚点
    const [importAnchorEl, setImportAnchorEl] = useState<null | HTMLElement>(null);
    const importMenuOpen = Boolean(importAnchorEl);
    const openImportMenu = (e: React.MouseEvent<HTMLButtonElement>) => setImportAnchorEl(e.currentTarget);
    const closeImportMenu = () => setImportAnchorEl(null);
    // 「电费账单」导入弹窗（复用电力公司账单导入表单 ViewTbStybmjgdRuiowc）
    const [billImportOpen, setBillImportOpen] = useState(false);
    const closeBillImport = () => setBillImportOpen(false);
    const handleImportBill = () => { closeImportMenu(); setBillImportOpen(true); };
    // Excel 导入：隐藏 file input，点击菜单项后触发文件选择
    const excelInputRef = useRef<HTMLInputElement>(null);
    const handleImportExcel = () => { closeImportMenu(); excelInputRef.current?.click(); };
    const onExcelSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ''; // 清空以允许重复选择同一文件
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            // 不手动设 Content-Type，交由 axios 自动带上含 boundary 的 multipart/form-data，
            // 否则 Spring 端 @RequestParam MultipartFile 会因缺少 boundary 解析失败
            const response = await axios.post(
                import.meta.env.VITE_JET_ASP_BPC_API + '/surplustogrid/elecdetails/import',
                formData,
                { headers: { grooveToken: token } }
            );
            if (response.data?.success) {
                showAlert('Excel导入成功', 'success');
                setLoading(true);
                loadData();
            } else {
                showAlert(response.data?.message ?? 'Excel导入失败', 'error');
            }
        } catch {
            showAlert('Excel导入异常，请稍后重试。', 'error');
        }
    };

    const pageRef = useRef(page);
    const pageSizeRef = useRef(pageSize);
    pageRef.current = page;
    pageSizeRef.current = pageSize;

    const listCrumbs = [
        { name: '运维管理', url: '/main/trays' },
        { name: `${projectName} · ${generationAccount}`, url: '/main/trays' },
    ];

    const loadData = useCallback(() => {
        const params = {
            page: pageRef.current + 1,
            limit: pageSizeRef.current,
            ynwjibye: generationAccount, // 按当前项目发电户号过滤
        };
        axios
            .post(import.meta.env.VITE_JET_ASP_BPC_API + '/tablequery/listreacttable/query_wnkrtk', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', grooveToken: token },
            })
            .then((response) => {
                if (response.data?.success) {
                    setTableData(Array.isArray(response.data.data) ? response.data.data : []);
                    setTotalRows(response.data.totalCount ?? 0);
                } else {
                    showAlert(response.data?.message ?? '请求失败', 'error');
                }
            })
            .catch((err) => {
                const status = err.response?.status;
                showAlert(status === 401 ? err.response?.data ?? '未授权' : '网络服务异常，请稍后重试。', 'error');
            })
            .finally(() => setLoading(false));
    }, [token, showAlert, generationAccount]);

    useEffect(() => {
        setLoading(true);
        loadData();
    }, [page, pageSize, loadData]);

    // 返回用电量统计列表（表单 onCancel / onSubmit 用）
    const backToList = () => {
        setBreadcrumbs(listCrumbs);
        setCurrentBayContent({
            title: '用电量统计',
            subheader: projectName,
            elem: <ConsumptionStatList projectName={projectName} generationAccount={generationAccount} merchant={merchant} merchantId={merchantId} />,
            type: 'hub',
        });
        navigate('/main/trays');
    };

    // 返回运维管理首页
    const backToHub = () => {
        setBreadcrumbs([{ name: '运维管理', url: '/main/trays' }]);
        setCurrentBayContent({
            title: '运维管理',
            subheader: '运维管理',
            elem: Parameterization('Electricityoperamanagement', {}),
            type: 'hub',
        });
        navigate('/main/trays');
    };

    const handleAdd = () => {
        setBreadcrumbs(listCrumbs);
        setCurrentBayContent({
            title: '用电量统计',
            subheader: projectName,
            elem: Parameterization('ViewTbGvfrokeqZlvans', {
                key: 'ViewTbGvfrokeqZlvans',
                initialData: {
                    gfumgrlg: merchantId ? String(merchantId) : '', // 商户 id，校验/提交字段
                    ynwjibye: generationAccount, // 发电户号
                    tparorbm: merchant, // 户名（显示）
                },
                onCancel: backToList,
                onSubmit: backToList,
            }),
            type: 'view',
        });
        navigate('/main/trays');
    };

    const handleEdit = (data: ConsumptionStatData) => {
        setBreadcrumbs(listCrumbs);
        setCurrentBayContent({
            title: '用电量统计',
            subheader: projectName,
            elem: Parameterization('ViewTbGvfrokeqZlvans', {
                key: 'ViewTbGvfrokeqZlvans',
                initialData: { pkGvfrokeq: data.pkGvfrokeq },
                onCancel: backToList,
                onSubmit: backToList,
                showParsedCompare: true,
            }),
            type: 'view',
        });
        navigate('/main/trays');
    };

    // 导出该结算月份的用电量明细（xlsx，按 发电户号 + 结算月份 调后端导出接口）
    const handleExport = async (data: ConsumptionStatData) => {
        const yearMonth = formatYearMonth(data.tjmqxlms); // yyyy-MM
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_JET_ASP_BPC_API}/surplustogrid/exportelecdetails/${generationAccount}/${yearMonth}`,
                {},
                { headers: { grooveToken: token }, responseType: 'blob' }
            );

            // 文件名优先取后端 Content-Disposition，回退到默认命名
            const disposition = response.headers['content-disposition'] as string | undefined;
            const match = disposition?.match(/filename\*?=(?:utf-8'')?["']?([^"';]+)/i);
            const filename = match ? decodeURIComponent(match[1]) : `用电量统计_${generationAccount}_${yearMonth}.xlsx`;

            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            showAlert('导出失败，请稍后重试。', 'error');
        }
    };

    const handleDelete = async (data: ConsumptionStatData) => {
        const confirmed = await confirm({
            title: '提示',
            message: '确定删除该条数据吗？',
            confirmText: '确定',
            cancelText: '取消',
        });
        if (!confirmed) return;
        const formData = new FormData();
        formData.append('pkGvfrokeq', data.pkGvfrokeq.toString());
        axios
            .post(
                import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/deleteformdata/view_tb_gvfrokeq_zlvans',
                formData,
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded', grooveToken: token } }
            )
            .then((response) => {
                if (response.data?.success) {
                    loadData();
                } else {
                    showAlert('删除数据失败。', 'error');
                }
            })
            .catch(() => showAlert('删除数据异常。', 'error'));
    };

    return (
        <React.Fragment>
            {loading ? (
                <div className="p-20 text-center text-xs text-slate-600 animate-pulse tracking-widest">加载数据...</div>
            ) : (
                <div className="max-w-7xl bg-white rounded-xl shadow-sm border border-slate-100 p-8">
                    {/* 头部 */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-2">
                                <DonutLargeTwoTone sx={{ fontSize: 20, color: '#059669' }} />
                                <h2 className="text-base font-bold text-gray-900 tracking-tight">用电量统计</h2>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                {projectName} · 发电户号：{generationAccount}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                className="text-slate-600 bg-slate-100 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
                                onClick={backToHub}
                            >
                                返回
                            </button>
                            <button
                                className="flex items-center gap-1 text-pink-600 bg-slate-100 hover:text-pink-500 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
                                onClick={openImportMenu}
                                aria-haspopup="true"
                                aria-expanded={importMenuOpen ? 'true' : undefined}
                            >
                                导入
                                <KeyboardArrowDown
                                    sx={{ fontSize: 18, transition: 'transform .2s ease', transform: importMenuOpen ? 'rotate(180deg)' : 'none' }}
                                />
                            </button>
                            <Menu
                                anchorEl={importAnchorEl}
                                open={importMenuOpen}
                                onClose={closeImportMenu}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                slotProps={{
                                    paper: {
                                        elevation: 0,
                                        sx: {
                                            mt: 1,
                                            minWidth: 220,
                                            borderRadius: 2.5,
                                            border: '1px solid rgba(15,23,42,0.08)',
                                            boxShadow: '0 12px 32px -12px rgba(15,23,42,0.28)',
                                            overflow: 'hidden',
                                            '& .MuiList-root': { py: 0.75 },
                                            '& .MuiMenuItem-root': {
                                                mx: 1,
                                                my: 0.25,
                                                px: 1.25,
                                                py: 1,
                                                borderRadius: 2,
                                                alignItems: 'flex-start',
                                                transition: 'background-color .15s ease',
                                            },
                                            '& .MuiMenuItem-root:hover': { backgroundColor: 'rgba(236,72,153,0.08)' },
                                            '& .MuiListItemIcon-root': {
                                                minWidth: 34,
                                                mt: '2px',
                                                color: '#db2777',
                                            },
                                            '& .MuiListItemText-primary': { fontSize: 14, fontWeight: 600, color: '#0f172a' },
                                            '& .MuiListItemText-secondary': { fontSize: 12, color: '#94a3b8', mt: '1px' },
                                        },
                                    },
                                }}
                            >
                                <div className="px-4 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    选择导入方式
                                </div>
                                <MenuItem onClick={handleImportBill}>
                                    <ListItemIcon><ReceiptLongOutlined sx={{ fontSize: 20 }} /></ListItemIcon>
                                    <ListItemText primary="电费账单" secondary="国网电费账单" />
                                </MenuItem>
                                <MenuItem onClick={handleImportExcel}>
                                    <ListItemIcon><DescriptionOutlined sx={{ fontSize: 20 }} /></ListItemIcon>
                                    <ListItemText primary="Excel文件" secondary="手工统计表格" />
                                </MenuItem>
                            </Menu>
                            <button
                                className="text-emerald-600 bg-emerald-50 hover:opacity-80 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
                                onClick={handleAdd}
                            >
                                新增
                            </button>
                            <button
                                className="text-indigo-600 hover:text-indigo-500 hover:opacity-80 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
                                onClick={() => { setLoading(true); loadData(); }}
                            >
                                刷新
                            </button>
                        </div>
                    </div>

                    {/* 表格 */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className={thStyle}>结算日期</th>
                                    <th className={thStyle}>发电户号</th>
                                    <th className={thStyle}>户名</th>
                                    <th className={thStyle}>抄表人</th>
                                    <th className={thStyle}>上传日期</th>
                                    <th className={thStyle}>确认人</th>
                                    <th className={`${thStyle} text-right`}>运维操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tableData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                                            暂无用电量统计记录
                                        </td>
                                    </tr>
                                ) : (
                                    tableData.map((data, index) => (
                                        <tr key={data.pkGvfrokeq ?? index} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="py-5 px-2 text-sm text-gray-900 whitespace-nowrap">{formatMonthCN(data.tjmqxlms)}</td>
                                            <td className={tdStyle}>{data.ynwjibye}</td>
                                            <td className={tdStyle}>{data.tparorbm}</td>
                                            <td className={tdStyle}>{data.ybfzkzts}</td>
                                            <td className={tdStyle}>{formatDateCN(data.dxxvlgqz)}</td>
                                            <td className={tdStyle}>{data.vptylsiz}</td>
                                            <td className="py-5 px-2 text-right text-sm font-medium whitespace-nowrap">
                                                {data.columnLkps && (
                                                    <a
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); handleExport(data); }}
                                                        className="text-blue-600 hover:text-blue-500"
                                                    >
                                                        导出
                                                    </a>
                                                )}
                                                <a
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); handleEdit(data); }}
                                                    className="pl-2 text-blue-600 hover:text-blue-500"
                                                >
                                                    编辑
                                                </a>
                                                <a
                                                    href="#"
                                                    onClick={async (e) => { e.preventDefault(); await handleDelete(data); }}
                                                    className="pl-2 text-slate-500 hover:text-slate-400"
                                                >
                                                    删除
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 分页 */}
                    <div className="pt-4">
                        <TablePagination
                            component="div"
                            count={totalRows}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            rowsPerPage={pageSize}
                            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0); }}
                            rowsPerPageOptions={[10, 20, 50]}
                            labelRowsPerPage="每页显示"
                            sx={paginationSx}
                        />
                    </div>
                </div>
            )}

            {/* 「电费账单」导入弹窗：复用电力公司账单导入表单 ViewTbStybmjgdRuiowc */}
            <BillImportDialog
                title={projectName}
                subtitle={`发电户号：${generationAccount}`}
                dialogSize={'sm'}
                open={billImportOpen}
                onClose={closeBillImport}
                children={WrapSoloFormNode(Parameterization('ViewTbStybmjgdRuiowc', {
                    initialData: {},
                    onCancel: closeBillImport,
                    onSubmit: () => { closeBillImport(); loadData(); },
                }))}
            />

            {/* Excel 导入：隐藏 file input，由「导入 → Excel文件」菜单项触发 */}
            <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={onExcelSelected}
            />
        </React.Fragment>
    );
};

export default ConsumptionStatList;
