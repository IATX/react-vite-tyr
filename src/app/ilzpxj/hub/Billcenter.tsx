import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Card, Typography, TablePagination, Tooltip } from '@mui/material';

import { useAlert } from '../../../components/AlertContext';
import { useSession } from '../../../authority/SessionContext';
import BillImportDialog from '../../../components/FormDialogSoloPage.tsx';

import {
    AccountBalanceTwoTone,
    StorefrontTwoTone,
    OfflineBoltTwoTone,
    DonutLargeTwoTone,
    ChevronRight,
    InfoOutlined,
    DataUsage,
    VisibilityOutlined
} from '@mui/icons-material';
import { WrapSoloFormNode } from '../../../components/WrapNode';
import Parameterization from '../../../components/RenderComponent';
import axios from 'axios';
import { useBreadcrumbs } from '../../../context/BreadcrumbContext.tsx';
import { AppContext } from '../../../context/AppContext.tsx';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../../../components/useConfirmDialog.tsx';
import FileComparisonPreviewDialog from '../../../components/FileComparisonPreviewDialog.tsx';

interface ManageListProps {
    activeTab: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    bg?: string;
    color?: string;
    borderColor?: string;
}

interface PowerCompanyData {
    pkPiclbkqk: number,
    jchzjhug: number,
    dnsmnqeh: number,
    ythuiqfx: string,
    knhbvtpp: string,
    okmaqgil: string,
    irncwabt: number,
    okfhbplj: number,
    nitcgncr: number,
}

interface MerchantData {
    pkJkywwxtl: number,
    pulfqxdt: number,
    btvttbdp: string,
    snebfkdc: string,
    xwizrffi: string,
    jgeyksaw: number,
    fmjxqxwc: number,
}

interface FixedBillData {
    pkWxchezty: number,
    nplhjcqw: number,
    zymjxejd: number,
    kaodyext: string,
    lgourzqr: string,
    gwqejsjc: number,
    iifqgvji: number,
    pcczlucm: number,
    mhqescps: number,
}

interface ConsumptionRatioData {
    pkWxchezty: number,
    nplhjcqw: number,
    zymjxejd: number,
    kaodyext: string,
    lgourzqr: string,
    gwqejsjc: number,
    iifqgvji: number,
    pcczlucm: number,
    mhqescps: number,
}

interface ConsumptionStatData {
    pkGvfrokeq: number,
    tjmqxlms: number,
    ynwjibye: string,
    tparorbm: string,
    ybfzkzts: string,
    dxxvlgqz: number,
    vptylsiz: string,
}

interface DataClueData {
    fileUrl: string;
    title: string;
    pkId: number;
}

const formatDateCN = (ts: number) => {
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Shanghai'
    }).format(ts).replace(/\//g, '-');
};

// --- 公共分页样式 ---
const paginationSx = {
    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
        fontSize: '0.875rem',
        color: '#64748b',
    },
    '.MuiTablePagination-actions': {
        color: '#4F46E5',
    }
};

// --- 公共图标渲染 ---
const IconBox: React.FC<{ icon: React.ReactNode; bg?: string; color?: string }> = ({ icon, bg, color }) => (
    <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${bg ?? ''} ${color ?? ''}`}>
        {React.isValidElement(icon) &&
            React.cloneElement(icon as React.ReactElement<any>, {
                sx: { fontSize: 18, flexShrink: 0 }
            })
        }
    </div>
);

// --- 公共卡片头部 ---
const ListHeader: React.FC<{
    prop: ManageListProps;
    onImport?: () => void;
    onAdd: () => void;
    showImport?: boolean;
}> = ({ prop, onImport, onAdd, showImport = true }) => (
    <div className="flex justify-between items-start mb-8">
        <div>
            <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-gray-900 tracking-tight">
                    {prop.title}
                </h2>
            </div>
            <p className="mt-2 text-sm text-gray-500">
                {prop.description}
            </p>
        </div>
        <div className="flex items-center gap-3">
            {showImport && (
                <button
                    className="text-pink-600 bg-slate-100 hover:text-pink-500 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
                    onClick={onImport}
                >
                    导入
                </button>
            )}
            <button
                className={`${prop.bg} ${prop.color} hover:opacity-80 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm`}
                onClick={onAdd}
            >
                新增
            </button>
        </div>
    </div>
);

// --- 公共分页组件 ---
const ListPagination: React.FC<{
    totalRows: number;
    page: number;
    pageSize: number;
    onPageChange: (newPage: number) => void;
    onPageSizeChange: (newSize: number) => void;
}> = ({ totalRows, page, pageSize, onPageChange, onPageSizeChange }) => (
    <div className="pt-4">
        <TablePagination
            component="div"
            count={totalRows}
            page={page}
            onPageChange={(_, newPage) => onPageChange(newPage)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => {
                onPageSizeChange(parseInt(e.target.value, 10));
            }}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="每页显示"
            sx={paginationSx}
        />
    </div>
);

// --- 公共加载中 ---
const LoadingBlock = () => (
    <div className="p-20 text-center text-xs text-slate-600 animate-pulse tracking-widest">加载数据...</div>
);

// --- 公共卡片容器 ---
const ListCard: React.FC<{
    prop: ManageListProps;
    children: React.ReactNode;
}> = ({ prop, children }) => (
    <div className="relative">
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
            <IconBox icon={prop.icon} bg={prop.bg} color={prop.color} />
        </div>
        <div className={`max-w-7xl bg-white rounded-xl shadow-sm border ${prop?.borderColor ?? 'border-slate-100'} p-8`}>
            {children}
        </div>
    </div>
);

// --- 公共导航回调生成器 ---
const makeNavBack = (
    activeTab: string,
    setCurrentBayContent: (c: any) => void,
    navigate: (path: string) => void
) => () => {
    setCurrentBayContent({
        title: '电费账单管理',
        subheader: '电费账单管理',
        elem: Parameterization('Billcenter', { defaultActiveTab: activeTab }),
        type: 'hub'
    });
    navigate('/main/trays');
};

// =====================================================================
// 子组件：公司电费账单
// =====================================================================
const RenderPowerCompanyList: React.FC<ManageListProps> = (prop) => {
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [tableData, setTableData] = useState<PowerCompanyData[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [initialData, setInitialData] = useState<object>({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dataClue, setDataClue] = useState<DataClueData | null>(null);

    const { token } = useSession();
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();
    const { setCurrentBayContent } = useContext(AppContext);
    const navigate = useNavigate();
    const { setBreadcrumbs } = useBreadcrumbs();

    // 用 ref 保存最新的 page/pageSize，避免 loadData 闭包陈旧
    const pageRef = useRef(page);
    const pageSizeRef = useRef(pageSize);
    pageRef.current = page;
    pageSizeRef.current = pageSize;

    const loadData = useCallback(() => {
        const params = {
            page: pageRef.current + 1,
            limit: pageSizeRef.current,
        };
        axios.post(
            import.meta.env.VITE_JET_ASP_BPC_API + '/tablequery/listreacttable/query_xwztav',
            params,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'grooveToken': token } }
        ).then(response => {
            if (response.data?.success) {
                setTableData(Array.isArray(response.data.data) ? response.data.data : []);
                setTotalRows(response.data.totalCount ?? 0);
            } else {
                showAlert(response.data?.message ?? '请求失败', 'error');
            }
        }).catch(err => {
            const status = err.response?.status;
            if (status === 401) {
                showAlert(err.response?.data ?? '未授权', 'error');
            } else {
                showAlert('Network error occurred. Please try again later.', 'error');
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [token, showAlert]);

    useEffect(() => {
        setLoading(true);
        loadData();
    }, [prop.activeTab, page, pageSize, loadData]);

    const navBack = makeNavBack(prop.activeTab, setCurrentBayContent, navigate);

    const handleAdd = () => {
        setBreadcrumbs([
            { name: '电费账单管理', url: '/main/trays' },
            { name: '电力公司电费账单', url: '/main/trays' },
        ]);
        setCurrentBayContent({
            title: '电力公司电费账单',
            subheader: '电力公司电费账单',
            elem: Parameterization('ViewTbPiclbkqkIsjbmb', {
                key: 'ViewTbPiclbkqkIsjbmb',
                initialData: {},
                onCancel: navBack,
                onSubmit: navBack,
            }),
            type: 'view'
        });
        navigate('/main/trays');
    };

    const handleEdit = (data: PowerCompanyData) => {
        setBreadcrumbs([
            { name: '电费账单管理', url: '/main/trays' },
            { name: '电力公司电费账单', url: '/main/trays' },
        ]);
        setCurrentBayContent({
            title: '电力公司电费账单',
            subheader: '电力公司电费账单',
            elem: Parameterization('ViewTbPiclbkqkIsjbmb', {
                key: 'ViewTbPiclbkqkIsjbmb',
                initialData: { pkPiclbkqk: data.pkPiclbkqk },
                onCancel: navBack,
                onSubmit: navBack,
            }),
            type: 'view'
        });
        navigate('/main/trays');
    };

    const handleDelete = async (data: PowerCompanyData) => {
        const confirmed = await confirm({
            title: '提示', message: '确定删除该条数据吗？', confirmText: '确定', cancelText: '取消'
        });
        if (!confirmed) return;
        const formData = new FormData();
        formData.append('pkPiclbkqk', data.pkPiclbkqk.toString());
        axios.post(
            import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/deleteformdata/view_tb_piclbkqk_isjbmb',
            formData,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'grooveToken': token } }
        ).then(response => {
            if (response.data?.success) {
                loadData();
            } else {
                showAlert('Failed to delete data.', 'error');
            }
        }).catch(() => {
            showAlert('Delete data exception.', 'error');
        });
    };

    const getSourceFileUrl = (id: number, title: string) => {
        axios.post(
            import.meta.env.VITE_JET_ASP_BPC_API + `/billedelectricity/companybillsourcefileurl/${id}`,
            {},
            { headers: { 'Content-Type': 'application/json', 'grooveToken': token } }
        ).then(response => {
            if (response.data) {
                setDataClue({
                    fileUrl: response.data,
                    title: title,
                    pkId: id
                });
            } else {
                showAlert('Failed to get source file URL.', 'error');
            }
        }).catch(() => {
            showAlert('Failed to get source file URL.', 'error');
        });
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
                            readOnly: false,
                            initialData: { pkPiclbkqk: dataClue.pkId },
                            onCancel: () => setDataClue(null),
                        })}
                    </div>
                </FileComparisonPreviewDialog>
            )}

            {loading ? <LoadingBlock /> : (
                <ListCard prop={prop}>
                    <ListHeader
                        prop={prop}
                        onImport={() => { setDialogOpen(true); setInitialData({}); }}
                        onAdd={handleAdd}
                    />
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">账单周期</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">发电户号</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">户名</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">发电量</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">上网电量</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">结算金额</th>
                                    <th className="py-4 px-2 text-center text-sm font-semibold text-gray-900">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tableData.map((data, index) => (
                                    <tr key={data.pkPiclbkqk ?? index} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="py-5 px-2 text-sm text-gray-900 whitespace-nowrap">
                                            <Tooltip title="查看数据和源文件" arrow>
                                                <a href="#" className='underline underline-offset-2 decoration-blue-500 hover:decoration-blue-600 hover:decoration-2'
                                                    onClick={(e) => {
                                                        e.preventDefault();

                                                        getSourceFileUrl(data.pkPiclbkqk, `账单周期：${formatDateCN(data.jchzjhug)} ~ ${formatDateCN(data.dnsmnqeh)}`);

                                                    }}
                                                >
                                                    {formatDateCN(data.jchzjhug)} ~ {formatDateCN(data.dnsmnqeh)}
                                                    <VisibilityOutlined sx={{ fontSize: 16, color: '#4F46E5', marginLeft: 0.5 }} />
                                                </a>
                                            </Tooltip>
                                        </td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.ythuiqfx}</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.knhbvtpp}</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.irncwabt}</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.okfhbplj}</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.nitcgncr}</td>
                                        <td className="py-5 px-2 text-center text-sm font-medium whitespace-nowrap">
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleEdit(data); }}
                                                className="text-blue-600 hover:text-blue-500">编辑</a>
                                            <a href="#" onClick={async (e) => { e.preventDefault(); await handleDelete(data); }}
                                                className="pl-2 text-slate-500 hover:text-slate-400">删除</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <ListPagination
                        totalRows={totalRows}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
                    />
                </ListCard>
            )}

            <BillImportDialog
                title={'账单导入'}
                dialogSize={'sm'}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                children={WrapSoloFormNode(Parameterization('ViewTbStybmjgdRuiowc', {
                    initialData,
                    onCancel: () => setDialogOpen(false),
                    onSubmit: () => setDialogOpen(false),
                }))}
            />
        </React.Fragment>
    );
};

// =====================================================================
// 子组件：商户电费账单
// =====================================================================
const RenderMerchantList: React.FC<ManageListProps> = (prop) => {
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [tableData, setTableData] = useState<MerchantData[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [initialData, setInitialData] = useState<object>({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dataClue, setDataClue] = useState<DataClueData | null>(null);

    const { token } = useSession();
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();
    const { setCurrentBayContent } = useContext(AppContext);
    const navigate = useNavigate();
    const { setBreadcrumbs } = useBreadcrumbs();

    const pageRef = useRef(page);
    const pageSizeRef = useRef(pageSize);
    pageRef.current = page;
    pageSizeRef.current = pageSize;

    const loadData = useCallback(() => {
        const params = { page: pageRef.current + 1, limit: pageSizeRef.current };
        axios.post(
            import.meta.env.VITE_JET_ASP_BPC_API + '/tablequery/listreacttable/query_kaeany',
            params,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'grooveToken': token } }
        ).then(response => {
            if (response.data?.success) {
                setTableData(Array.isArray(response.data.data) ? response.data.data : []);
                setTotalRows(response.data.totalCount ?? 0);
            } else {
                showAlert(response.data?.message ?? '请求失败', 'error');
            }
        }).catch(err => {
            const status = err.response?.status;
            if (status === 401) {
                showAlert(err.response?.data ?? '未授权', 'error');
            } else {
                showAlert('Network error occurred. Please try again later.', 'error');
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [token, showAlert]);

    useEffect(() => {
        setLoading(true);
        loadData();
    }, [prop.activeTab, page, pageSize, loadData]);

    const navBack = makeNavBack(prop.activeTab, setCurrentBayContent, navigate);

    const handleAdd = () => {
        setBreadcrumbs([
            { name: '电费账单管理', url: '/main/trays' },
            { name: '商户电费账单', url: '/main/trays' },
        ]);
        setCurrentBayContent({
            title: '商户电费账单',
            subheader: '商户电费账单',
            elem: Parameterization('ViewTbJkywwxtlMsurqp', {
                key: 'ViewTbJkywwxtlMsurqp',
                initialData: {},
                onCancel: navBack,
                onSubmit: navBack,
            }),
            type: 'view'
        });
        navigate('/main/trays');
    };

    const handleEdit = (data: MerchantData) => {
        setBreadcrumbs([
            { name: '电费账单管理', url: '/main/trays' },
            { name: '商户电费账单', url: '/main/trays' },
        ]);
        setCurrentBayContent({
            title: '商户电费账单',
            subheader: '商户电费账单',
            elem: Parameterization('ViewTbJkywwxtlMsurqp', {
                key: 'ViewTbJkywwxtlMsurqp',
                initialData: { pkJkywwxtl: data.pkJkywwxtl },
                onCancel: navBack,
                onSubmit: navBack,
            }),
            type: 'view'
        });
        navigate('/main/trays');
    };

    const handleDelete = async (data: MerchantData) => {
        const confirmed = await confirm({
            title: '提示', message: '确定删除该条数据吗？', confirmText: '确定', cancelText: '取消'
        });
        if (!confirmed) return;
        const formData = new FormData();
        formData.append('pkJkywwxtl', data.pkJkywwxtl.toString());
        axios.post(
            import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/deleteformdata/view_tb_jkywwxtl_msurqp',
            formData,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'grooveToken': token } }
        ).then(response => {
            if (response.data?.success) {
                loadData();
            } else {
                showAlert('Failed to delete data.', 'error');
            }
        }).catch(() => {
            showAlert('Delete data exception.', 'error');
        });
    };

    const getSourceFileUrl = (id: number, title: string) => {
        axios.post(
            import.meta.env.VITE_JET_ASP_BPC_API + `/billedelectricity/merchantbillsourcefileurl/${id}`,
            {},
            { headers: { 'Content-Type': 'application/json', 'grooveToken': token } }
        ).then(response => {
            if (response.data) {
                setDataClue({
                    fileUrl: response.data,
                    title: title,
                    pkId: id
                });
            } else {
                showAlert('Failed to get source file URL.', 'error');
            }
        }).catch(() => {
            showAlert('Failed to get source file URL.', 'error');
        });
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
                        {Parameterization('ViewTbJkywwxtlMsurqp', {
                            key: 'ViewTbJkywwxtlMsurqp',
                            readOnly: false,
                            initialData: { pkJkywwxtl: dataClue.pkId },
                            onCancel: () => setDataClue(null),
                        })}
                    </div>
                </FileComparisonPreviewDialog>
            )}
            {loading ? <LoadingBlock /> : (
                <ListCard prop={prop}>
                    <ListHeader
                        prop={prop}
                        onImport={() => { setDialogOpen(true); setInitialData({}); }}
                        onAdd={handleAdd}
                    />
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">账单日期</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">发电户号</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">户名</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">供电服务单位</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">本期电量</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">本期电费</th>
                                    <th className="py-4 px-2 text-center text-sm font-semibold text-gray-900">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tableData.map((data, index) => (
                                    <tr key={data.pkJkywwxtl ?? index} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="py-5 px-2 text-sm text-gray-900 whitespace-nowrap">
                                            <Tooltip title="查看数据和源文件" arrow>
                                                <a href="#" className='underline underline-offset-2 decoration-blue-500 hover:decoration-blue-600 hover:decoration-2'
                                                    onClick={(e) => {
                                                        e.preventDefault();

                                                        getSourceFileUrl(data.pkJkywwxtl, `账单周期：${formatDateCN(data.pulfqxdt)}`);
                                                    }}
                                                >
                                                    {formatDateCN(data.pulfqxdt)}
                                                    <VisibilityOutlined sx={{ fontSize: 16, color: '#4F46E5', marginLeft: 0.5 }} />
                                                </a>
                                            </Tooltip>
                                        </td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.btvttbdp}</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.snebfkdc}</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.xwizrffi}</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.jgeyksaw}</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.fmjxqxwc}</td>
                                        <td className="py-5 px-2 text-right text-sm font-medium whitespace-nowrap">
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleEdit(data); }}
                                                className="text-blue-600 hover:text-blue-500">编辑</a>
                                            <a href="#" onClick={async (e) => { e.preventDefault(); await handleDelete(data); }}
                                                className="pl-2 text-slate-500 hover:text-slate-400">删除</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <ListPagination
                        totalRows={totalRows}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
                    />
                </ListCard>
            )}

            <BillImportDialog
                title={'账单导入'}
                dialogSize={'sm'}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                children={WrapSoloFormNode(Parameterization('ViewTbYrnfwwvyQfxmub', {
                    initialData,
                    onCancel: () => setDialogOpen(false),
                    onSubmit: () => setDialogOpen(false),
                }))}
            />
        </React.Fragment>
    );
};

// =====================================================================
// 子组件：固定电价电费账单
// =====================================================================
const RenderFixedBillList: React.FC<ManageListProps> = (prop) => {
    const { token } = useSession();
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [tableData, setTableData] = useState<FixedBillData[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [initialData, setInitialData] = useState<object>({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dataClue, setDataClue] = useState<DataClueData | null>(null);

    const { setCurrentBayContent } = useContext(AppContext);
    const navigate = useNavigate();
    const { setBreadcrumbs } = useBreadcrumbs();

    const pageRef = useRef(page);
    const pageSizeRef = useRef(pageSize);
    pageRef.current = page;
    pageSizeRef.current = pageSize;

    const loadData = useCallback(() => {
        const params = { page: pageRef.current + 1, limit: pageSizeRef.current };
        axios.post(
            import.meta.env.VITE_JET_ASP_BPC_API + '/tablequery/listreacttable/query_ofgrem',
            params,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'grooveToken': token } }
        ).then(response => {
            if (response.data?.success) {
                setTableData(Array.isArray(response.data.data) ? response.data.data : []);
                setTotalRows(response.data.totalCount ?? 0);
            } else {
                showAlert(response.data?.message ?? '请求失败', 'error');
            }
        }).catch(err => {
            const status = err.response?.status;
            if (status === 401) {
                showAlert(err.response?.data ?? '未授权', 'error');
            } else {
                showAlert('Network error occurred. Please try again later.', 'error');
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [token, showAlert]);

    useEffect(() => {
        setLoading(true);
        loadData();
    }, [prop.activeTab, page, pageSize, loadData]);

    const navBack = makeNavBack(prop.activeTab, setCurrentBayContent, navigate);

    const handleAdd = () => {
        setBreadcrumbs([
            { name: '电费账单管理', url: '/main/trays' },
            { name: '固定电价电费账单', url: '/main/trays' },
        ]);
        setCurrentBayContent({
            title: '固定电价电费账单',
            subheader: '固定电价电费账单',
            elem: Parameterization('ViewTbWxcheztyNlyrlw', {
                key: 'ViewTbWxcheztyNlyrlw',
                initialData: { tattbjbi: 'FixedPrice' },
                onCancel: navBack,
                onSubmit: navBack,
            }),
            type: 'view'
        });
        navigate('/main/trays');
    };

    const handleEdit = (data: FixedBillData) => {
        setBreadcrumbs([
            { name: '电费账单管理', url: '/main/trays' },
            { name: '商户电费账单', url: '/main/trays' },
        ]);
        setCurrentBayContent({
            title: '商户电费账单',
            subheader: '商户电费账单',
            elem: Parameterization('ViewTbWxcheztyNlyrlw', {
                key: 'ViewTbWxcheztyNlyrlw',
                initialData: { pkWxchezty: data.pkWxchezty },
                onCancel: navBack,
                onSubmit: navBack,
            }),
            type: 'view'
        });
        navigate('/main/trays');
    };

    const handleDelete = async (data: FixedBillData) => {
        const confirmed = await confirm({
            title: '提示', message: '确定删除该条数据吗？', confirmText: '确定', cancelText: '取消'
        });
        if (!confirmed) return;
        const formData = new FormData();
        formData.append('pkWxchezty', data.pkWxchezty.toString());
        axios.post(
            import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/deleteformdata/view_tb_wxchezty_nlyrlw',
            formData,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'grooveToken': token } }
        ).then(response => {
            if (response.data?.success) {
                loadData();
            } else {
                showAlert('Failed to delete data.', 'error');
            }
        }).catch(() => {
            showAlert('Delete data exception.', 'error');
        });
    };

    const getSourceFileUrl = (id: number, title: string) => {
        axios.post(
            import.meta.env.VITE_JET_ASP_BPC_API + `/billedelectricity/fixedpricebillsourcefileurl/${id}`,
            {},
            { headers: { 'Content-Type': 'application/json', 'grooveToken': token } }
        ).then(response => {
            if (response.data) {
                setDataClue({
                    fileUrl: response.data,
                    title: title,
                    pkId: id
                });
            } else {
                showAlert('Failed to get source file URL.', 'error');
            }
        }).catch(() => {
            showAlert('Failed to get source file URL.', 'error');
        });
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
                        {Parameterization('ViewTbWxcheztyNlyrlw', {
                            key: 'ViewTbWxcheztyNlyrlw',
                            initialData: { pkWxchezty: dataClue.pkId },
                            onCancel: () => setDataClue(null),
                        })}
                    </div>
                </FileComparisonPreviewDialog>
            )}
            {loading ? <LoadingBlock /> : (
                <ListCard prop={prop}>
                    <ListHeader
                        prop={prop}
                        onImport={() => { setDialogOpen(true); setInitialData({}); }}
                        onAdd={handleAdd}
                    />
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">账单周期</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">发电户号</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">户名</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">合计收益</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">发电量</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">上网电量</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">账单金额</th>
                                    <th className="py-4 px-2 text-center text-sm font-semibold text-gray-900">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tableData.map((data, index) => (
                                    <tr key={data.pkWxchezty ?? index} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="py-5 px-2 text-sm text-gray-900 whitespace-nowrap">
                                            <Tooltip title="查看数据和源文件" arrow>
                                                <a href="#" className='underline underline-offset-2 decoration-blue-500 hover:decoration-blue-600 hover:decoration-2'
                                                    onClick={(e) => {
                                                        e.preventDefault();

                                                        getSourceFileUrl(data.pkWxchezty, `账单周期：${formatDateCN(data.nplhjcqw)} ~ ${formatDateCN(data.zymjxejd)}`);
                                                    }}
                                                >
                                                    {formatDateCN(data.nplhjcqw)} ~ {formatDateCN(data.zymjxejd)}
                                                    <VisibilityOutlined sx={{ fontSize: 16, color: '#4F46E5', marginLeft: 0.5 }} />
                                                </a>
                                            </Tooltip>

                                        </td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.kaodyext}</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.lgourzqr}</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.gwqejsjc} 元</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.iifqgvji} 千瓦时</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.pcczlucm} 千瓦时</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.mhqescps} 元</td>
                                        <td className="py-5 px-2 text-center text-sm font-medium whitespace-nowrap">
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleEdit(data); }}
                                                className="text-blue-600 hover:text-blue-500">编辑</a>
                                            <a href="#" onClick={async (e) => { e.preventDefault(); await handleDelete(data); }}
                                                className="pl-2 text-slate-500 hover:text-slate-400">删除</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <ListPagination
                        totalRows={totalRows}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
                    />
                </ListCard>
            )}

            <BillImportDialog
                title={'固定电价账单导入'}
                dialogSize={'sm'}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                children={WrapSoloFormNode(Parameterization('ViewTbWzbgmxdiKoossp', {
                    initialData,
                    onCancel: () => setDialogOpen(false),
                    onSubmit: () => setDialogOpen(false),
                }))}
            />
        </React.Fragment>
    );
};

// =====================================================================
// 子组件：消纳比电费账单
// =====================================================================
const RenderConsumptionRatioList: React.FC<ManageListProps> = (prop) => {
    const { token } = useSession();
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [tableData, setTableData] = useState<ConsumptionRatioData[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [initialData, setInitialData] = useState<object>({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dataClue, setDataClue] = useState<DataClueData | null>(null);

    const { setCurrentBayContent } = useContext(AppContext);
    const navigate = useNavigate();
    const { setBreadcrumbs } = useBreadcrumbs();

    const pageRef = useRef(page);
    const pageSizeRef = useRef(pageSize);
    pageRef.current = page;
    pageSizeRef.current = pageSize;

    const loadData = useCallback(() => {
        const params = { page: pageRef.current + 1, limit: pageSizeRef.current };
        axios.post(
            import.meta.env.VITE_JET_ASP_BPC_API + '/tablequery/listreacttable/query_tgtnvf',
            params,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'grooveToken': token } }
        ).then(response => {
            if (response.data?.success) {
                setTableData(Array.isArray(response.data.data) ? response.data.data : []);
                setTotalRows(response.data.totalCount ?? 0);
            } else {
                showAlert(response.data?.message ?? '请求失败', 'error');
            }
        }).catch(err => {
            const status = err.response?.status;
            if (status === 401) {
                showAlert(err.response?.data ?? '未授权', 'error');
            } else {
                showAlert('Network error occurred. Please try again later.', 'error');
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [token, showAlert]);

    useEffect(() => {
        setLoading(true);
        loadData();
    }, [prop.activeTab, page, pageSize, loadData]);

    const navBack = makeNavBack(prop.activeTab, setCurrentBayContent, navigate);

    const handleAdd = () => {
        setBreadcrumbs([
            { name: '电费账单管理', url: '/main/trays' },
            { name: '消纳比电费账单', url: '/main/trays' },
        ]);
        setCurrentBayContent({
            title: '消纳比电费账单',
            subheader: '消纳比电费账单',
            elem: Parameterization('ViewTbWxcheztyNlyrlw', {
                key: 'ViewTbWxcheztyNlyrlw',
                initialData: { tattbjbi: 'ConsumptionRatio' },
                onCancel: navBack,
                onSubmit: navBack,
            }),
            type: 'view'
        });
        navigate('/main/trays');
    };

    const handleEdit = (data: ConsumptionRatioData) => {
        setBreadcrumbs([
            { name: '电费账单管理', url: '/main/trays' },
            { name: '消纳比电费账单', url: '/main/trays' },
        ]);
        setCurrentBayContent({
            title: '消纳比电费账单',
            subheader: '消纳比电费账单',
            elem: Parameterization('ViewTbWxcheztyNlyrlw', {
                key: 'ViewTbWxcheztyNlyrlw',
                initialData: { pkWxchezty: data.pkWxchezty },
                onCancel: navBack,
                onSubmit: navBack,
            }),
            type: 'view'
        });
        navigate('/main/trays');
    };

    const handleDelete = async (data: ConsumptionRatioData) => {
        const confirmed = await confirm({
            title: '提示', message: '确定删除该条数据吗？', confirmText: '确定', cancelText: '取消'
        });
        if (!confirmed) return;
        const formData = new FormData();
        formData.append('pkWxchezty', data.pkWxchezty.toString());
        axios.post(
            import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/deleteformdata/view_tb_wxchezty_nlyrlw',
            formData,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'grooveToken': token } }
        ).then(response => {
            if (response.data?.success) {
                loadData();
            } else {
                showAlert('Failed to delete data.', 'error');
            }
        }).catch(() => {
            showAlert('Delete data exception.', 'error');
        });
    };

    const getSourceFileUrl = (id: number, title: string) => {
        axios.post(
            import.meta.env.VITE_JET_ASP_BPC_API + `/billedelectricity/fixedpricebillsourcefileurl/${id}`,
            {},
            { headers: { 'Content-Type': 'application/json', 'grooveToken': token } }
        ).then(response => {
            if (response.data) {
                setDataClue({
                    fileUrl: response.data,
                    title: title,
                    pkId: id
                });
            } else {
                showAlert('Failed to get source file URL.', 'error');
            }
        }).catch(() => {
            showAlert('Failed to get source file URL.', 'error');
        });
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
                        {Parameterization('ViewTbWxcheztyNlyrlw', {
                            key: 'ViewTbWxcheztyNlyrlw',
                            initialData: { pkWxchezty: dataClue.pkId },
                            onCancel: () => setDataClue(null),
                        })}
                    </div>
                </FileComparisonPreviewDialog>
            )}
            {loading ? <LoadingBlock /> : (
                <ListCard prop={prop}>
                    <ListHeader
                        prop={prop}
                        onImport={() => { setDialogOpen(true); setInitialData({}); }}
                        onAdd={handleAdd}
                    />
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">账单周期</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">发电户号</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">户名</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">合计收益</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">发电量</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">上网电量</th>
                                    <th className="py-4 px-2 text-sm font-semibold text-gray-900">账单金额</th>
                                    <th className="py-4 px-2 text-center text-sm font-semibold text-gray-900">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tableData.map((data, index) => (
                                    <tr key={data.pkWxchezty ?? index} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="py-5 px-2 text-sm text-gray-900 whitespace-nowrap">
                                            <a href="#" className='underline underline-offset-2 decoration-blue-500 hover:decoration-blue-600 hover:decoration-2'
                                                onClick={(e) => {
                                                    e.preventDefault();

                                                    getSourceFileUrl(data.pkWxchezty, `账单周期：${formatDateCN(data.nplhjcqw)} ~ ${formatDateCN(data.zymjxejd)}`);
                                                }}
                                            >
                                                {formatDateCN(data.nplhjcqw)} ~ {formatDateCN(data.zymjxejd)}
                                                <VisibilityOutlined sx={{ fontSize: 16, color: '#4F46E5', marginLeft: 0.5 }} />
                                            </a>
                                        </td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.kaodyext}</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.lgourzqr}</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.gwqejsjc} 元</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.iifqgvji} 千瓦时</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.pcczlucm} 千瓦时</td>
                                        <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.mhqescps} 元</td>
                                        <td className="py-5 px-2 text-center text-sm font-medium whitespace-nowrap">
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleEdit(data); }}
                                                className="text-blue-600 hover:text-blue-500">编辑</a>
                                            <a href="#" onClick={async (e) => { e.preventDefault(); await handleDelete(data); }}
                                                className="pl-2 text-slate-500 hover:text-slate-400">删除</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <ListPagination
                        totalRows={totalRows}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
                    />
                </ListCard>
            )}
            <BillImportDialog
                title={'消纳比账单导入'}
                dialogSize={'sm'}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                children={WrapSoloFormNode(Parameterization('ViewTbJpercefrEmaqau', {
                    initialData,
                    onCancel: () => setDialogOpen(false),
                    onSubmit: () => setDialogOpen(false),
                }))}
            />
        </React.Fragment>
    );
};

// =====================================================================
// 子组件：用电量统计
// =====================================================================
const RenderConsumptionStatList: React.FC<ManageListProps> = (prop) => {
    const { token } = useSession();
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [tableData, setTableData] = useState<ConsumptionStatData[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [initialData, setInitialData] = useState<object>({});
    const [dialogOpen, setDialogOpen] = useState(false);

    const { setCurrentBayContent } = useContext(AppContext);
    const navigate = useNavigate();
    const { setBreadcrumbs } = useBreadcrumbs();

    const pageRef = useRef(page);
    const pageSizeRef = useRef(pageSize);
    pageRef.current = page;
    pageSizeRef.current = pageSize;

    const loadData = useCallback(() => {
        const params = { page: pageRef.current + 1, limit: pageSizeRef.current };
        axios.post(
            import.meta.env.VITE_JET_ASP_BPC_API + '/tablequery/listreacttable/query_wnkrtk',
            params,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'grooveToken': token } }
        ).then(response => {
            if (response.data?.success) {
                setTableData(Array.isArray(response.data.data) ? response.data.data : []);
                setTotalRows(response.data.totalCount ?? 0);
            } else {
                showAlert(response.data?.message ?? '请求失败', 'error');
            }
        }).catch(err => {
            const status = err.response?.status;
            if (status === 401) {
                showAlert(err.response?.data ?? '未授权', 'error');
            } else {
                showAlert('Network error occurred. Please try again later.', 'error');
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [token, showAlert]);

    useEffect(() => {
        setLoading(true);
        loadData();
    }, [prop.activeTab, page, pageSize, loadData]);

    const navBack = makeNavBack(prop.activeTab, setCurrentBayContent, navigate);

    const handleAdd = () => {
        setBreadcrumbs([
            { name: '电费账单管理', url: '/main/trays' },
            { name: '电量统计表', url: '/main/trays' },
        ]);
        setCurrentBayContent({
            title: '电量统计表',
            subheader: '电量统计表',
            elem: Parameterization('ViewTbGvfrokeqSfidnf', {
                key: 'ViewTbGvfrokeqSfidnf',
                initialData: {},
                onCancel: navBack,
                onSubmit: navBack,
            }),
            type: 'view'
        });
        navigate('/main/trays');
    };

    const handleEdit = (data: ConsumptionStatData) => {
        setBreadcrumbs([
            { name: '电费账单管理', url: '/main/trays' },
            { name: '电量统计', url: '/main/trays' },
        ]);
        setCurrentBayContent({
            title: '电量统计表',
            subheader: '电量统计表',
            elem: Parameterization('ViewTbGvfrokeqSfidnf', {
                key: 'ViewTbGvfrokeqSfidnf',
                initialData: { pkGvfrokeq: data.pkGvfrokeq },
                onCancel: navBack,
                onSubmit: navBack,
            }),
            type: 'view'
        });
        navigate('/main/trays');
    };

    const handleDelete = async (data: ConsumptionStatData) => {
        const confirmed = await confirm({
            title: '提示', message: '确定删除该条数据吗？', confirmText: '确定', cancelText: '取消'
        });
        if (!confirmed) return;
        const formData = new FormData();
        formData.append('pkGvfrokeq', data.pkGvfrokeq.toString());
        axios.post(
            import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/deleteformdata/view_tb_gvfrokeq_sfidnf',
            formData,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'grooveToken': token } }
        ).then(response => {
            if (response.data?.success) {
                loadData();
            } else {
                showAlert('Failed to delete data.', 'error');
            }
        }).catch(() => {
            showAlert('Delete data exception.', 'error');
        });
    };

    if (loading) return <LoadingBlock />;

    return (
        <React.Fragment>
            <ListCard prop={prop}>
                <ListHeader
                    prop={prop}
                    onAdd={handleAdd}
                    showImport={false}
                />
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-4 px-2 text-sm font-semibold text-gray-900">结算日期</th>
                                <th className="py-4 px-2 text-sm font-semibold text-gray-900">发电户号</th>
                                <th className="py-4 px-2 text-sm font-semibold text-gray-900">户名</th>
                                <th className="py-4 px-2 text-sm font-semibold text-gray-900">抄表人</th>
                                <th className="py-4 px-2 text-sm font-semibold text-gray-900">上传日期</th>
                                <th className="py-4 px-2 text-sm font-semibold text-gray-900">确认人</th>
                                <th className="py-4 px-2 text-center text-sm font-semibold text-gray-900">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tableData.map((data, index) => (
                                <tr key={data.pkGvfrokeq ?? index} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="py-5 px-2 text-sm text-gray-900 whitespace-nowrap">{formatDateCN(data.tjmqxlms)}</td>
                                    <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.ynwjibye}</td>
                                    <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.tparorbm}</td>
                                    <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.ybfzkzts}</td>
                                    <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{formatDateCN(data.dxxvlgqz)}</td>
                                    <td className="py-5 px-2 text-sm text-gray-500 whitespace-nowrap">{data.vptylsiz}</td>
                                    <td className="py-5 px-2 text-center text-sm font-medium whitespace-nowrap">
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleEdit(data); }}
                                            className="text-blue-600 hover:text-blue-500">编辑</a>
                                        <a href="#" onClick={async (e) => { e.preventDefault(); await handleDelete(data); }}
                                            className="pl-2 text-slate-500 hover:text-slate-400">删除</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ListPagination
                    totalRows={totalRows}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
                />
            </ListCard>

        </React.Fragment>
    );
};

// =====================================================================
// 主组件
// =====================================================================
const BillingMuiPro = (props: any) => {
    const { defaultActiveTab, ...other } = props;

    const { setBreadcrumbs } = useBreadcrumbs();

    const [activeTab, setActiveTab] = useState<string>(defaultActiveTab || 'P0001');

    const configs = [
        { id: 'P0001', name: '余电上网电费账单', title: 'Surplus Power Grid Injection', listTitle: '余电上网电费账单列表', listDescription: '余电上网电费账单文件导入，账单数据维护', icon: <AccountBalanceTwoTone />, color: 'text-blue-600', bg: 'bg-blue-50', borderColor: 'border-blue-200/80' },
        { id: 'P0002', name: '自用电费账单', title: 'Self-Consumption Bill', listTitle: '自用电费账单列表', listDescription: '自用电费账单文件导入，账单数据维护', icon: <StorefrontTwoTone />, color: 'text-indigo-600', bg: 'bg-indigo-50', borderColor: 'border-indigo-200/80' },
        // { id: 'P0003', name: '固定电价电费账单', title: 'Fixed Price Bill', listTitle: '固定电价电费账单列表', listDescription: '固定电价电费账单文件导入，账单数据维护', icon: <OfflineBoltTwoTone />, color: 'text-amber-600', bg: 'bg-amber-50', borderColor: 'border-amber-200/80' },
        // { id: 'P0004', name: '消纳比电费账单', title: 'Consumption Ratio Bill', listTitle: '消纳比电费账单列表', listDescription: '消纳比电费账单文件导入，账单数据维护', icon: <DataUsage />, color: 'text-rose-600', bg: 'bg-rose-50', borderColor: 'border-rose-200/80' },
        { id: 'T0001', name: '用电量统计', title: 'Consumption Statistics', listTitle: '用电量统计列表', listDescription: '商户用电量统计数据维护', icon: <DonutLargeTwoTone />, color: 'text-emerald-600', bg: 'bg-emerald-50', borderColor: 'border-emerald-200/80' },
    ];

    useEffect(() => {
        setBreadcrumbs([{ name: '电费账单管理', url: '/main/trays' }]);
    }, [activeTab]);

    const activeConfig = configs.find(c => c.id === activeTab);

    const sharedProps: ManageListProps = {
        activeTab,
        icon: activeConfig?.icon ?? <AccountBalanceTwoTone />,
        title: activeConfig?.listTitle ?? '',
        description: activeConfig?.listDescription ?? '',
        bg: activeConfig?.bg,
        color: activeConfig?.color,
        borderColor: activeConfig?.borderColor,
    };

    return (
        <div className='p-5'>
            <div className="flex justify-between items-end mb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-base font-bold text-slate-900 tracking-tight">电费账单管理</h1>
                    </div>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                        <InfoOutlined fontSize="small" /> 点击下方卡片导入账单数据并切换明细表，实时核对数据
                    </p>
                </div>
            </div>

            {/* 功能按钮卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {configs.map((item) => (
                    <Card
                        key={item.id}
                        elevation={0}
                        className={`
                            group relative p-4 rounded-xl border transition-all duration-500 cursor-pointer backdrop-blur-sm
                            ${activeTab === item.id
                                ? `${item.borderColor} bg-white shadow-md scale-[1.02]`
                                : 'border-transparent bg-white/60 hover:border-slate-200 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]'
                            }
                        `}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <div className="flex flex-col h-full">
                            <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
                                {React.isValidElement(item.icon) &&
                                    React.cloneElement(item.icon as React.ReactElement<any>, {
                                        sx: { fontSize: 32 },
                                    })
                                }
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <Typography className="text-slate-600 text-xs tracking-widest mb-1">
                                        {item.title}
                                    </Typography>
                                    <Typography className="text-base">
                                        {item.name}
                                    </Typography>
                                </div>

                                <div className={`
                                        flex items-center justify-center
                                        w-8 h-8
                                        flex-shrink-0
                                        rounded-full ${item.bg} ${item.color} 
                                        transition-all duration-500
                                        ${activeTab === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0'}
                                    `}>
                                    <ChevronRight sx={{
                                        width: 16,
                                        height: 16,
                                        fontSize: 16,
                                        flexShrink: 0
                                    }} />
                                </div>
                            </div>
                        </div>

                        {activeTab === item.id && (
                            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${item.bg}`}></div>
                        )}
                    </Card>
                ))}
            </div>

            {/* 数据维护表格区 */}
            <div className="py-5 overflow-hidden">
                <div className="min-h-[400px]">
                    {activeTab === 'P0001' && <RenderPowerCompanyList {...sharedProps} />}
                    {activeTab === 'P0002' && <RenderMerchantList {...sharedProps} />}
                    {activeTab === 'P0003' && <RenderFixedBillList {...sharedProps} />}
                    {activeTab === 'P0004' && <RenderConsumptionRatioList {...sharedProps} />}
                    {activeTab === 'T0001' && <RenderConsumptionStatList {...sharedProps} />}
                </div>
            </div>
        </div>
    );
};

export default BillingMuiPro;