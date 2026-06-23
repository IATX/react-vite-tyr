import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TablePagination, Tooltip } from '@mui/material';
import { VisibilityOutlined, AccountBalanceTwoTone } from '@mui/icons-material';
import axios from 'axios';

import { useAlert } from '../../../components/AlertContext';
import { useSession } from '../../../authority/SessionContext';
import { useConfirm } from '../../../components/useConfirmDialog';
import { AppContext } from '../../../context/AppContext';
import { useBreadcrumbs } from '../../../context/BreadcrumbContext';
import { useNavigate } from 'react-router-dom';
import Parameterization from '../../../components/RenderComponent';
import { WrapSoloFormNode } from '../../../components/WrapNode';
import BillImportDialog from '../../../components/FormDialogSoloPage';
import FileComparisonPreviewDialog from '../../../components/FileComparisonPreviewDialog';

// 电力公司电费账单行（字段沿用 Billcenter 的 PowerCompanyData / query_xwztav）
interface PowerCompanyData {
    pkPiclbkqk: number;
    jchzjhug: number;   // 账单周期开始
    dnsmnqeh: number;   // 账单周期结束
    ythuiqfx: string;   // 发电户号
    knhbvtpp: string;   // 户名
    irncwabt: number;   // 发电量
    okfhbplj: number;   // 上网电量
    nitcgncr: number;   // 结算金额
}

interface DataClue {
    fileUrl: string;
    title: string;
    pkId: number;
}

interface PowerCompanyBillListProps {
    projectName: string;
    generationAccount: string; // 发电户号，用于过滤当前项目的账单
    merchant: string;          // 商户
    modeLabel: string;         // 业务标签：全额上网 / 余电上网
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

const PowerCompanyBillList: React.FC<PowerCompanyBillListProps> = ({ projectName, generationAccount, merchant, modeLabel }) => {
    const { token } = useSession();
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();
    const { setCurrentBayContent } = useContext(AppContext);
    const { setBreadcrumbs } = useBreadcrumbs();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [tableData, setTableData] = useState<PowerCompanyData[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dataClue, setDataClue] = useState<DataClue | null>(null);

    const pageRef = useRef(page);
    const pageSizeRef = useRef(pageSize);
    pageRef.current = page;
    pageSizeRef.current = pageSize;

    const billCrumbs = [
        { name: '电费账单管理', url: '/main/trays' },
        { name: `${projectName} · ${generationAccount}`, url: '/main/trays' },
    ];

    const loadData = useCallback(() => {
        const params = {
            page: pageRef.current + 1,
            limit: pageSizeRef.current,
            ythuiqfx: generationAccount, // 按当前项目发电户号过滤
        };
        axios
            .post(import.meta.env.VITE_JET_ASP_BPC_API + '/tablequery/listreacttable/query_xwztav', params, {
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
    }, [token, showAlert, generationAccount, merchant]);

    useEffect(() => {
        setLoading(true);
        loadData();
    }, [page, pageSize, loadData]);

    // 返回账单列表（表单 onCancel / onSubmit 用）
    const backToList = () => {
        setBreadcrumbs(billCrumbs);
        setCurrentBayContent({
            title: `${modeLabel}账单`,
            subheader: projectName,
            elem: <PowerCompanyBillList projectName={projectName} generationAccount={generationAccount} merchant={merchant} modeLabel={modeLabel} />,
            type: 'hub',
        });
        navigate('/main/trays');
    };

    // 返回电费账单管理首页
    const backToHub = () => {
        setBreadcrumbs([{ name: '电费账单管理', url: '/main/trays' }]);
        setCurrentBayContent({
            title: '电费账单管理',
            subheader: '电费账单管理',
            elem: Parameterization('Electricitybillmanagement', {}),
            type: 'hub',
        });
        navigate('/main/trays');
    };

    const handleAdd = () => {
        setBreadcrumbs(billCrumbs);
        setCurrentBayContent({
            title: `${modeLabel}账单`,
            subheader: projectName,
            elem: Parameterization('ViewTbPiclbkqkIsjbmb', {
                key: 'ViewTbPiclbkqkIsjbmb',
                initialData: {
                    'ythuiqfx': generationAccount, // 发电户号
                    'knhbvtpp': merchant, // 户名
                },
                onCancel: backToList,
                onSubmit: backToList,
            }),
            type: 'view',
        });
        navigate('/main/trays');
    };

    const handleEdit = (data: PowerCompanyData) => {
        setBreadcrumbs(billCrumbs);
        setCurrentBayContent({
            title: `${modeLabel}账单`,
            subheader: projectName,
            elem: Parameterization('ViewTbPiclbkqkIsjbmb', {
                key: 'ViewTbPiclbkqkIsjbmb',
                initialData: { pkPiclbkqk: data.pkPiclbkqk },
                onCancel: backToList,
                onSubmit: backToList,
            }),
            type: 'view',
        });
        navigate('/main/trays');
    };

    const handleDelete = async (data: PowerCompanyData) => {
        const confirmed = await confirm({
            title: '提示',
            message: '确定删除该条数据吗？',
            confirmText: '确定',
            cancelText: '取消',
        });
        if (!confirmed) return;
        const formData = new FormData();
        formData.append('pkPiclbkqk', data.pkPiclbkqk.toString());
        axios
            .post(
                import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/deleteformdata/view_tb_piclbkqk_isjbmb',
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

    const getSourceFileUrl = (id: number, title: string) => {
        axios
            .post(
                import.meta.env.VITE_JET_ASP_BPC_API + `/billedelectricity/companybillsourcefileurl/${id}`,
                {},
                { headers: { 'Content-Type': 'application/json', grooveToken: token } }
            )
            .then((response) => {
                if (response.data) {
                    setDataClue({ fileUrl: response.data, title, pkId: id });
                } else {
                    showAlert('获取源文件地址失败。', 'error');
                }
            })
            .catch(() => showAlert('获取源文件地址失败。', 'error'));
    };

    return (
        <React.Fragment>
            {dataClue && (
                <FileComparisonPreviewDialog
                    open={true}
                    onClose={() => setDataClue(null)}
                    fileUrl={dataClue.fileUrl}
                    title={dataClue.title}
                >
                    <div className="flex flex-col h-full overflow-y-auto p-2">
                        {Parameterization('ViewTbPiclbkqkIsjbmb', {
                            key: 'ViewTbPiclbkqkIsjbmb',
                            initialData: { pkPiclbkqk: dataClue.pkId },
                            onCancel: () => setDataClue(null),
                        })}
                    </div>
                </FileComparisonPreviewDialog>
            )}

            {loading ? (
                <div className="p-20 text-center text-xs text-slate-600 animate-pulse tracking-widest">加载数据...</div>
            ) : (
                <div className="max-w-7xl bg-white rounded-xl shadow-sm border border-slate-100 p-8">
                    {/* 头部 */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-2">
                                <AccountBalanceTwoTone sx={{ fontSize: 20, color: '#2563eb' }} />
                                <h2 className="text-base font-bold text-gray-900 tracking-tight">{modeLabel}账单</h2>
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
                                className="text-pink-600 bg-slate-100 hover:text-pink-500 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
                                onClick={() => setDialogOpen(true)}
                            >
                                导入
                            </button>
                            <button
                                className="text-blue-600 bg-blue-50 hover:opacity-80 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
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
                                    <th className={thStyle}>账单周期</th>
                                    <th className={thStyle}>发电户号</th>
                                    <th className={thStyle}>户名</th>
                                    <th className={thStyle}>发电量</th>
                                    <th className={thStyle}>上网电量</th>
                                    <th className={thStyle}>结算金额</th>
                                    <th className={`${thStyle} text-center`}>操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tableData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                                            暂无账单记录
                                        </td>
                                    </tr>
                                ) : (
                                    tableData.map((data, index) => (
                                        <tr key={data.pkPiclbkqk ?? index} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="py-5 px-2 text-sm text-gray-900 whitespace-nowrap">
                                                <Tooltip title="查看数据和源文件" arrow>
                                                    <a
                                                        href="#"
                                                        className="underline underline-offset-2 decoration-blue-500 hover:decoration-blue-600 hover:decoration-2"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            getSourceFileUrl(
                                                                data.pkPiclbkqk,
                                                                `账单周期：${formatDateCN(data.jchzjhug)} ~ ${formatDateCN(data.dnsmnqeh)}`
                                                            );
                                                        }}
                                                    >
                                                        {formatDateCN(data.jchzjhug)} ~ {formatDateCN(data.dnsmnqeh)}
                                                        <VisibilityOutlined sx={{ fontSize: 16, color: '#2563eb', marginLeft: 0.5 }} />
                                                    </a>
                                                </Tooltip>
                                            </td>
                                            <td className={tdStyle}>{data.ythuiqfx}</td>
                                            <td className={tdStyle}>{data.knhbvtpp}</td>
                                            <td className={tdStyle}>{data.irncwabt} 千瓦时</td>
                                            <td className={tdStyle}>{data.okfhbplj} 千瓦时</td>
                                            <td className={tdStyle}>{data.nitcgncr} 元</td>
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

            {/* 导入弹窗（复用电力公司账单导入表单 ViewTbStybmjgdRuiowc） */}
            <BillImportDialog
                title={projectName}
                subtitle={`${modeLabel} · 发电户号：${generationAccount}`}
                dialogSize={'sm'}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                children={WrapSoloFormNode(
                    Parameterization('ViewTbStybmjgdRuiowc', {
                        initialData: {},
                        onCancel: () => setDialogOpen(false),
                        onSubmit: () => { setDialogOpen(false); setLoading(true); loadData(); },
                    })
                )}
            />
        </React.Fragment>
    );
};

export default PowerCompanyBillList;
