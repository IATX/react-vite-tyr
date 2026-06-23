import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TablePagination } from '@mui/material';
import { DonutLargeTwoTone } from '@mui/icons-material';
import axios from 'axios';

import { useAlert } from '../../../components/AlertContext';
import { useSession } from '../../../authority/SessionContext';
import { useConfirm } from '../../../components/useConfirmDialog';
import { AppContext } from '../../../context/AppContext';
import { useBreadcrumbs } from '../../../context/BreadcrumbContext';
import { useNavigate } from 'react-router-dom';
import Parameterization from '../../../components/RenderComponent';

// 用电量统计行（字段沿用 Billcenter 的 ConsumptionStatData / query_wnkrtk）
interface ConsumptionStatData {
    pkGvfrokeq: number;
    tjmqxlms: number;   // 结算日期
    ynwjibye: string;   // 发电户号
    tparorbm: string;   // 户名
    ybfzkzts: string;   // 抄表人
    dxxvlgqz: number;   // 上传日期
    vptylsiz: string;   // 确认人
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
            }),
            type: 'view',
        });
        navigate('/main/trays');
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
                                    <th className={`${thStyle} text-center`}>操作</th>
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
                                            <td className="py-5 px-2 text-sm text-gray-900 whitespace-nowrap">{formatDateCN(data.tjmqxlms)}</td>
                                            <td className={tdStyle}>{data.ynwjibye}</td>
                                            <td className={tdStyle}>{data.tparorbm}</td>
                                            <td className={tdStyle}>{data.ybfzkzts}</td>
                                            <td className={tdStyle}>{formatDateCN(data.dxxvlgqz)}</td>
                                            <td className={tdStyle}>{data.vptylsiz}</td>
                                            <td className="py-5 px-2 text-center text-sm font-medium whitespace-nowrap">
                                                <a
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); handleEdit(data); }}
                                                    className="text-blue-600 hover:text-blue-500"
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
        </React.Fragment>
    );
};

export default ConsumptionStatList;
