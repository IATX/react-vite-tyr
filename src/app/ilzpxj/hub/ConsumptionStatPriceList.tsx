import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TablePagination, Collapse } from '@mui/material';
import { ElectricMeterTwoTone } from '@mui/icons-material';
import axios from 'axios';

import { useAlert } from '../../../components/AlertContext';
import { useSession } from '../../../authority/SessionContext';
import { AppContext } from '../../../context/AppContext';
import { useBreadcrumbs } from '../../../context/BreadcrumbContext';
import { useNavigate } from 'react-router-dom';
import Parameterization from '../../../components/RenderComponent';
import ConsumptionPriceSetting from './ConsumptionPriceSetting';

// 用电量统计行（字段沿用 ConsumptionStatList / query_wnkrtk）
interface ConsumptionStatData {
    pkGvfrokeq: number;
    tjmqxlms: number;   // 结算日期
    ynwjibye: string;   // 发电户号
    tparorbm: string;   // 户名
    ybfzkzts: string;   // 抄表人
    dxxvlgqz: number;   // 上传日期
    vptylsiz: string;   // 确认人
}

interface ConsumptionStatPriceListProps {
    projectName: string;
    generationAccount: string; // 发电户号，用于过滤当前项目的用电量统计
    merchant: string;          // 商户（户名，仅用于显示）
    merchantId: number;           // 商户 ID（仅用于显示）
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
const tdStyle = 'py-5 px-2 text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis';

const ConsumptionStatPriceList: React.FC<ConsumptionStatPriceListProps> = ({ projectName, generationAccount, merchant, merchantId }) => {
    const { token } = useSession();
    const { showAlert } = useAlert();
    const { setCurrentBayContent } = useContext(AppContext);
    const { setBreadcrumbs } = useBreadcrumbs();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [tableData, setTableData] = useState<ConsumptionStatData[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    // 当前内联展开（设置电价）的记录 id，单选
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const pageRef = useRef(page);
    const pageSizeRef = useRef(pageSize);
    pageRef.current = page;
    pageSizeRef.current = pageSize;

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

    // 切换某条记录的内联电价设置面板
    const toggleExpand = (id: number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <React.Fragment>
            {loading ? (
                <div className="p-20 text-center text-xs text-slate-600 animate-pulse tracking-widest">加载数据...</div>
            ) : (
                <div className="w-full bg-white rounded-xl shadow-sm p-8">
                    {/* 头部 */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-2">
                                <ElectricMeterTwoTone sx={{ fontSize: 20, color: '#7c3aed' }} />
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
                                className="text-indigo-600 hover:text-indigo-500 hover:opacity-80 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
                                onClick={() => { setLoading(true); loadData(); }}
                            >
                                刷新
                            </button>
                        </div>
                    </div>

                    {/* 表格：table-fixed 固定列宽，避免内联展开电价设置时整表列宽重排（窜动） */}
                    <div>
                        <table className="w-full table-fixed text-left border-collapse">
                            <colgroup>
                                <col style={{ width: '12%' }} />
                                <col style={{ width: '16%' }} />
                                <col style={{ width: '24%' }} />
                                <col style={{ width: '13%' }} />
                                <col style={{ width: '14%' }} />
                                <col style={{ width: '13%' }} />
                                <col style={{ width: '8%' }} />
                            </colgroup>
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
                                    tableData.map((data, index) => {
                                        const isExpanded = expandedId === data.pkGvfrokeq;
                                        return (
                                            <React.Fragment key={data.pkGvfrokeq ?? index}>
                                                <tr className={'transition-colors group ' + (isExpanded ? 'bg-violet-50/40' : 'hover:bg-gray-50/50')}>
                                                    <td className="py-5 px-2 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{formatDateCN(data.tjmqxlms)}</td>
                                                    <td className={tdStyle}>{data.ynwjibye}</td>
                                                    <td className={tdStyle}>{data.tparorbm}</td>
                                                    <td className={tdStyle}>{data.ybfzkzts}</td>
                                                    <td className={tdStyle}>{formatDateCN(data.dxxvlgqz)}</td>
                                                    <td className={tdStyle}>{data.vptylsiz}</td>
                                                    <td className="py-5 px-2 text-center text-sm font-medium whitespace-nowrap">
                                                        <a
                                                            href="#"
                                                            onClick={(e) => { e.preventDefault(); toggleExpand(data.pkGvfrokeq); }}
                                                            className="text-violet-600 hover:text-violet-500"
                                                        >
                                                            {isExpanded ? '收起' : '电价设置'}
                                                        </a>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={7} className="p-0 border-0">
                                                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                            <div className="border-b border-gray-100 bg-violet-50/30">
                                                                <ConsumptionPriceSetting
                                                                    generationAccount={generationAccount}
                                                                    recordId={data.pkGvfrokeq}
                                                                    settlementDate={formatDateCN(data.tjmqxlms)}
                                                                    onClose={() => setExpandedId(null)}
                                                                />
                                                            </div>
                                                        </Collapse>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })
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

export default ConsumptionStatPriceList;
