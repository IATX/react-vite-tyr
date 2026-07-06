import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    Box, Button, IconButton,
    Drawer,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    InputAdornment,
    Tooltip
} from '@mui/material';
import {
    Business, ArrowForwardIos, Add, Close,
    InfoOutlined, FilterList,
    KeyboardArrowUp, KeyboardArrowDown, KeyboardArrowLeft,
    DeleteOutline
} from '@mui/icons-material';

import axios from 'axios';

import { useAlert } from '../../../components/AlertContext.tsx';
import { useSession } from '../../../authority/SessionContext.tsx';
import { useConfirm } from '../../../components/useConfirmDialog';

import Parameterization from '../../../components/RenderComponent.tsx';
import { AppContext } from '../../../context/AppContext.tsx';
import { useBreadcrumbs } from '../../../context/BreadcrumbContext.tsx';

import { WrapSoloFormNode } from '../../../components/WrapNode.tsx';
import MerchantNewDialog from '../../../components/FormDialogSoloPage.tsx';

// --- 1. 类型定义 ---
interface CurrentMchPricing {
    id: number;
    name: string;
    code: string;
    mchId: number;
}

// --- 2. 电价计算依据筛选条件 ---
const filterOptions = [
    { id: 'P0001', name: '代理购电电价' }, // 简写名称以适应布局
    { id: 'P0002', name: '商户电费单' },
    { id: 'P0003', name: '固定电价' },
];

const MerchantElectricityManager: React.FC = () => {
    const { showAlert } = useAlert();
    const { token } = useSession();
    const { setBreadcrumbs } = useBreadcrumbs();
    const { confirm } = useConfirm();

    // --- 3. 状态管理 ---
    const [selectedMchantPricing, setSelectedMchPricing] = useState<CurrentMchPricing | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // 表单状态管理
    const [basePrice, setBasePrice] = useState<string>('');
    const [serviceFee, setServiceFee] = useState<string>('');

    const handleOpenEdit = (m: CurrentMchPricing) => {
        setSelectedMchPricing(m);
        setIsDrawerOpen(true);
    };

    const handleClose = () => {
        setSelectedMchPricing(null);
        setIsDrawerOpen(false);
    };

    // 计算总价
    const totalPrice = (parseFloat(basePrice) || 0) + (parseFloat(serviceFee) || 0);

    interface Data {
        "paginationNumber": number,
        "pkXbbyezwt": number,
        "bwblkhay": string,
        "mrvqpphi": string,
        "deimigjs": string,
        "ptkfgasa": string,
        "armiyjlh": string,
        "eznomrac": string,
        "columnBirp": string,
        "xjegvvik": string,
        "gwsnkwpp": string,
        "pwayuydj": string,
        "pkWzghpmog": number
    }

    interface ApiResponse<T> {
        data: T[];
        total: number;
    }

    // 搜索条件的 key 类型收窄，避免用宽泛的 string
    type SearchConditionKey = 'gwsnkwpp' | 'mrvqpphi' | 'bwblkhay' | 'fpllerek';
    type SearchConditions = Record<SearchConditionKey, string>;

    const INITIAL_SEARCH_CONDITIONS: SearchConditions = {
        gwsnkwpp: '',
        mrvqpphi: '',
        bwblkhay: '',
        fpllerek: '',
    };

    const [loading, setLoading] = useState(true);
    const [tableData, setTableData] = useState<Data[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(12);
    const [searchConditions, setSearchConditions] = useState<SearchConditions>(INITIAL_SEARCH_CONDITIONS);

    // 总页数（服务端分页，page 从 0 开始）
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

    // 用 useCallback 避免每次渲染都生成新函数引用
    const fetchData = useCallback(async () => {
        setLoading(true);

        // 关键字（项目名 / 商户名 / 发电户号）同时下发到 gwsnkwpp、mrvqpphi、bwblkhay，用 or 模式取并集
        const hasKeyword = !!(searchConditions.gwsnkwpp || searchConditions.mrvqpphi || searchConditions.bwblkhay);
        const queryParams = {
            ...searchConditions,
            page: page + 1,
            limit: pageSize,
            ...(hasKeyword ? { queryMode: 'or' } : {}),
        };

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_JET_ASP_BPC_API}/tablequery/listreacttable/query_yagetq`,
                queryParams,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        grooveToken: token,
                    },
                }
            );

            if (data?.success) {
                setTableData(Array.isArray(data.data) ? data.data : []);
                setTotalRows(data.totalCount ?? 0);
            } else {
                showAlert(data?.message ?? '请求失败', 'error');
            }
        } catch (err) {
            // 收窄 err 类型，避免直接断言
            const message = err instanceof Error ? err.message : String(err);
            showAlert(`查询数据异常：${message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, searchConditions, token]);

    // refreshTable 直接等于 fetchData，不需要再包一层
    const refreshTable = fetchData;

    useEffect(() => {
        setBreadcrumbs([{ name: '电价管理', url: '/main/trays' }, { name: '商户电价设置', url: '/main/trays' }]);
    }, []); // 面包屑只需设置一次，从 fetchData 的依赖中分离出去

    useEffect(() => {
        fetchData();
    }, [fetchData]); // fetchData 已经通过 useCallback 管理依赖，这里不用重复列举

    const [merchantNewDialogOpen, setMerchantNewDialogOpen] = useState<boolean>(false);
    const [merchantNewDialogTitle, setMerchantNewDialogTitle] = useState<string>('');

    const [merchantPkId, setMerchantPkId] = useState<number | null>(null);

    const getInitialData = (data: CurrentMchPricing | null) => {
        if (!data) return null;
        return data.id > 0
            ? { pkWzghpmog: data.id }
            : { qepibxbv: data.mchId, xdsjflqz: data.name, imxdflym: data.code };
    };

    const [filterId, setFilterId] = React.useState('');

    // 关键字查询输入框（商户名 / 发电户号，受控），失去焦点时自动提交查询
    const [keywordInput, setKeywordInput] = useState('');

    // 提交查询条件并回到第一页（关键字、电价筛选为两个独立条件）
    const commitSearch = (next: Partial<SearchConditions>) => {
        setPage(0);
        setSearchConditions(prev => ({ ...prev, ...next }));
    };

    // 关键字：失去焦点时触发查询，同时按项目名(gwsnkwpp)、商户名(mrvqpphi)与发电户号(bwblkhay)查询
    const handleKeywordBlur = () => {
        const value = keywordInput.trim();
        if (value !== searchConditions.bwblkhay) {
            commitSearch({ gwsnkwpp: value, mrvqpphi: value, bwblkhay: value });
        }
    };

    // 电价筛选：选择后触发查询，同时带上输入框里当前的关键字（项目名 / 商户名 / 发电户号）
    const handleFilterChange = (newId: string) => {
        setFilterId(newId);
        const value = keywordInput.trim();
        commitSearch({ fpllerek: newId, gwsnkwpp: value, mrvqpphi: value, bwblkhay: value });
    };

    // 删除当前商户（确认后调用删除接口，成功后刷新列表）
    const handleDeleteMerchant = async (m: Data) => {
        const confirmed = await confirm({
            title: '删除商户',
            message: `确定删除商户「${m.mrvqpphi || m.gwsnkwpp || '该商户'}」吗？此操作不可恢复。`,
            confirmText: '删除',
            cancelText: '取消',
        });
        if (!confirmed) return;

        const formData = new FormData();
        formData.append('pkXbbyezwt', String(m.pkXbbyezwt));
        axios
            .post(
                `${import.meta.env.VITE_JET_ASP_BPC_API}/tableview/deleteformdata/view_tb_xbbyezwt_kxchdy`,
                formData,
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded', grooveToken: token } }
            )
            .then((res) => {
                if (res.data?.success) {
                    showAlert('删除成功', 'success');
                    refreshTable();
                } else {
                    showAlert(res.data?.message ?? '删除失败', 'error');
                }
            })
            .catch(() => showAlert('删除数据异常，请稍后重试', 'error'));
    };

    // 单个商户条目（看板列与单列列表共用）
    const renderMerchantItem = (m: Data, isSet: boolean) => {
        const isSelected = selectedMchantPricing?.mchId == m.pkXbbyezwt;
        const subParts: string[] = [];
        subParts.push(m.bwblkhay || '无发电户号');
        if (isSet) {
            if (m.xjegvvik) subParts.push(m.xjegvvik);
            if (m.pwayuydj === 'Yes') subParts.push('上网');
        } else {
            subParts.push('未配置电价');
        }
        const subtitle = subParts.join('  ·  ');

        return (
            <div
                key={m.paginationNumber}
                onClick={() => handleOpenEdit({
                    id: m.pkWzghpmog,
                    name: m.mrvqpphi,
                    code: m.bwblkhay,
                    mchId: m.pkXbbyezwt,
                })}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl border bg-white cursor-pointer transition-all duration-200 ${isSelected
                    ? 'border-blue-500 ring-1 ring-blue-200'
                    : `border-slate-100 hover:shadow-sm ${isSet ? 'hover:border-emerald-300' : 'hover:border-slate-300'}`
                    }`}
            >
                <div className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${isSet ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-400'
                    }`}>
                    <Business style={{ fontSize: '1.2rem' }} />
                </div>

                <div className="min-w-0 flex-1">
                    {/* 项目名称（可点击编辑项目详情，空值默认未命名项目）；悬浮时右侧出现提示 */}
                    <div className="flex items-center gap-1 min-w-0">
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMerchantNewDialogTitle('商户信息编辑');
                                setMerchantNewDialogOpen(true);
                                setMerchantPkId(m.pkXbbyezwt);
                            }}
                            className="group/name flex items-center gap-1.5 min-w-0"
                        >
                            <span className={`text-sm font-medium leading-tight truncate transition-colors group-hover/name:text-blue-600 ${isSet ? 'text-slate-800' : 'text-slate-400 italic'
                                }`}>
                                {m.gwsnkwpp || '未命名项目'}
                            </span>
                            <span className="shrink-0 flex items-center text-[10px] text-slate-600 whitespace-nowrap opacity-0 -translate-x-1 transition-all duration-200 group-hover/name:opacity-100 group-hover/name:translate-x-0">
                                <KeyboardArrowLeft style={{ fontSize: '0.8rem' }} />
                                编辑详情
                            </span>
                        </a>
                        {/* 删除商户：悬浮条目时浮现，点击确认后删除 */}
                        <Tooltip title="删除商户" arrow>
                            <button
                                type="button"
                                aria-label="删除商户"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteMerchant(m);
                                }}
                                className="shrink-0 flex items-center justify-center w-6 h-6 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <DeleteOutline style={{ fontSize: '0.95rem' }} />
                            </button>
                        </Tooltip>
                    </div>
                    {/* 商户名称 */}
                    <p className="mt-0.5 text-xs text-slate-600 truncate" title={m.mrvqpphi}>
                        {m.mrvqpphi}
                    </p>
                    {/* 最下行：户号 · 依据 · 上网 */}
                    <p className={`mt-0.5 text-xs truncate font-mono ${isSet ? 'text-slate-500' : 'text-slate-400'
                        }`} title={subtitle}>
                        {subtitle}
                    </p>
                </div>

                {/* 状态标签：单网格混排时用于一眼区分已设置 / 未设置 */}
                <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${isSet ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSet ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {isSet ? '已设置' : '未设置'}
                </span>

                {/* 右侧箭头；悬浮箭头区域时切换为左箭头并浮现提示 */}
                <div className="group/arrow shrink-0 flex items-center text-slate-300 hover:text-blue-500 transition-colors">
                    <ArrowForwardIos className="group-hover/arrow:hidden" style={{ fontSize: '0.8rem' }} />
                    <KeyboardArrowLeft className="hidden group-hover/arrow:inline-block" style={{ fontSize: '0.9rem' }} />
                    <span className="text-[10px] text-slate-600 whitespace-nowrap overflow-hidden max-w-0 opacity-0 transition-all duration-200 group-hover/arrow:max-w-[72px] group-hover/arrow:opacity-100 group-hover/arrow:ml-1">
                        设置电价依据
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex">
            {/* --- 左侧主列表区域 --- */}
            <main className="flex-1 p-5 transition-all duration-500">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h5 className="text-base font-bold text-slate-900 tracking-tight">
                            商户电价管理
                        </h5>
                        <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                            <InfoOutlined fontSize="small" /> 统一管理商户信息与计费规则
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {/* 关键字查询（商户名 / 发电户号）：放在电价筛选左侧，失焦时触发查询 */}
                        <Box sx={{ minWidth: 220 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="项目名称 / 发电户号 / 商户名"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onBlur={handleKeywordBlur}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        (e.target as HTMLInputElement).blur();
                                    }
                                }}
                                sx={{ '.MuiInputBase-input': { fontSize: '0.875rem' } }}
                            />
                        </Box>
                        <Box sx={{ minWidth: 200 }}>
                            <FormControl fullWidth size="small">
                                {/* 使用 InputLabel 配合 Select 展示，比普通按钮更具引导性 */}
                                <InputLabel id="price-filter-label">
                                    电价筛选
                                </InputLabel>
                                <Select
                                    labelId="price-filter-label"
                                    value={filterId}
                                    label="电价筛选"
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                    startAdornment={<FilterList sx={{ fontSize: 18, ml: 1, mr: 1, color: 'text.secondary' }} />}
                                    sx={{
                                        fontSize: '0.875rem',
                                        '.MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(0, 0, 0, 0.12)',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'primary.main',
                                        },
                                    }}
                                >
                                    {/* 默认项，用于清除筛选 */}
                                    <MenuItem value="" sx={{ fontSize: '0.875rem' }}>
                                        <em>全部类型</em>
                                    </MenuItem>

                                    {filterOptions.map((opt) => (
                                        <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: '0.875rem' }}>
                                            {opt.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Button
                            variant="text"
                            startIcon={<Add />}
                            size="small"
                            onClick={() => {
                                setMerchantNewDialogTitle('新增商户');
                                setMerchantNewDialogOpen(true);
                            }}
                        >
                            新增商户
                        </Button>
                    </div>
                </header>

                {/* 统一为单个响应式网格：已设置在前、未设置在后，避免两列看板出现空列 */}
                {(() => {
                    // 已设置优先排序，方便扫读；状态由每个条目的徽标标识
                    const sorted = [...tableData].sort(
                        (a, b) => Number(b.pkWzghpmog > 0) - Number(a.pkWzghpmog > 0)
                    );
                    const setCount = tableData.filter((m) => m.pkWzghpmog > 0).length;
                    const unsetCount = tableData.length - setCount;

                    if (tableData.length === 0) {
                        return (
                            <p className="text-sm text-slate-300 italic px-1 py-4">
                                {searchConditions.fpllerek ? '暂无匹配该电价的商户' : '暂无商户'}
                            </p>
                        );
                    }

                    return (
                        <>
                            {/* 数量概览：保留「已设置 / 未设置」的一眼信息 */}
                            <div className="flex items-center gap-3 px-1 pb-3 mb-3 border-b border-slate-100 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    已设置 <strong className="text-slate-700">{setCount}</strong>
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                                    未设置 <strong className="text-slate-700">{unsetCount}</strong>
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {sorted.map((m) => renderMerchantItem(m, m.pkWzghpmog > 0))}
                            </div>
                        </>
                    );
                })()}

                {/* 分页：极简上下箭头 */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <IconButton
                            size="small"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page <= 0 || loading}
                            aria-label="上一页"
                        >
                            <KeyboardArrowUp fontSize="small" />
                        </IconButton>
                        <span className="text-sm tabular-nums text-slate-500">
                            {page + 1} / {totalPages}
                        </span>
                        <IconButton
                            size="small"
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1 || loading}
                            aria-label="下一页"
                        >
                            <KeyboardArrowDown fontSize="small" />
                        </IconButton>
                    </div>
                )}
            </main>

            {/* --- 右侧悬浮抽屉 (Overlay Drawer) --- */}
            <Drawer
                anchor="right"
                open={isDrawerOpen}
                onClose={handleClose}
                variant="temporary"
                slotProps={{
                    backdrop: {
                        // 降低遮罩层浓度，强化模糊感
                        className: "bg-slate-900/10 backdrop-blur-sm",
                    },
                    paper: {
                        // 宽度微调，增加圆角边缘
                        className: "w-full sm:w-[520px] border-none shadow-xl rounded-l-xl overflow-hidden",
                    }
                }}
            >
                <div className="flex flex-col h-full bg-slate-50/30">
                    {/* 顶部标题栏：改为白色沉浸式设计 */}
                    <div className="relative p-4 bg-white border-b border-slate-100">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-base font-semibold text-slate-800 tracking-tight">
                                商户电价管理
                            </h2>
                        </div>

                        {/* 精致的关闭按钮 */}
                        <div className="absolute top-4 right-4">
                            <IconButton
                                onClick={handleClose}
                                size="small"
                                className="group transition-all duration-300 hover:bg-slate-100"
                            >
                                <Close className="text-slate-400 group-hover:text-slate-600 w-5 h-5" />
                            </IconButton>
                        </div>
                    </div>

                    {/* 状态标签区：更加小巧秀气 */}
                    <div className="px-4 py-3 flex gap-2 bg-white/50">
                        <div className="inline-flex items-center px-2 py-0.5 rounded text-sm bg-slate-100 border border-slate-200">
                            发电户号: {selectedMchantPricing?.code || '无发电户号'}
                        </div>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded text-sm ${selectedMchantPricing && selectedMchantPricing.id > 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
                            <span className={`w-1 h-1 rounded-full ${selectedMchantPricing && selectedMchantPricing.id > 0 ? 'bg-emerald-500 mr-1.5' : 'bg-slate-400 mr-1.5'}`} />
                            {selectedMchantPricing && selectedMchantPricing.id > 0 ? '已配置电价' : '未配置电价'}
                        </div>
                    </div>

                    {/* 表单主体：增加呼吸感 */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        {Parameterization('ViewTbWzghpmogVxpfmm', {
                            key: 'ViewTbWzghpmogVxpfmm',
                            initialData: getInitialData(selectedMchantPricing),
                            onCancel: (formData: any) => {
                                handleClose();
                            },
                            onSubmit: () => {
                                refreshTable();
                                handleClose();
                            }
                        })}
                    </div>
                </div>
            </Drawer>

            <MerchantNewDialog
                title={merchantNewDialogTitle}
                dialogSize={'sm'}
                open={merchantNewDialogOpen}
                onClose={() => {
                    setMerchantNewDialogOpen(false);
                }}
                children={WrapSoloFormNode(Parameterization('ViewTbXbbyezwtKxchdy', {
                    initialData: merchantPkId != null && merchantPkId > 0 ? {
                        'pkXbbyezwt': merchantPkId
                    } : {},
                    onCancel: (formData: any) => {
                        setMerchantNewDialogOpen(false);
                    },
                    onSubmit: (formData: any) => {
                        setMerchantNewDialogOpen(false);

                        refreshTable();
                    },
                }))}
            />
        </div>

    );
};

export default MerchantElectricityManager;