import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, Button, IconButton,
    Drawer, Divider,
    RadioGroup,
    Radio,
    FormControlLabel,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Business, ArrowForwardIos, Add, Close,
    InfoOutlined, FilterList
} from '@mui/icons-material';

import axios from 'axios';

import { useAlert } from '../../../components/AlertContext.tsx';
import { useSession } from '../../../authority/SessionContext.tsx';

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
    { id: 'P0004', name: '消纳比' }
];

const MerchantElectricityManager: React.FC = () => {
    const { showAlert } = useAlert();
    const { token } = useSession();
    const { setBreadcrumbs } = useBreadcrumbs();

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
    type SearchConditionKey = 'mrvqpphi' | 'bwblkhay' | 'fpllerek';
    type SearchConditions = Record<SearchConditionKey, string>;

    const INITIAL_SEARCH_CONDITIONS: SearchConditions = {
        mrvqpphi: '',
        bwblkhay: '',
        fpllerek: '',
    };

    const [loading, setLoading] = useState(true);
    const [tableData, setTableData] = useState<Data[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(15);
    const [searchConditions, setSearchConditions] = useState<SearchConditions>(INITIAL_SEARCH_CONDITIONS);

    // 用 useCallback 避免每次渲染都生成新函数引用
    const fetchData = useCallback(async () => {
        setLoading(true);

        const queryParams = {
            ...searchConditions,
            page: page + 1,
            limit: pageSize,
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
        setBreadcrumbs([{ name: '商户电价管理', url: '/main/trays' }]);
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

    const handleFilterChange = (newId: string) => {
        setFilterId(newId);
        // 这里调用你原本用于查询列表的函数，传入新的 ID
        // fetchList({ priceType: newId }); 
        setSearchConditions(prev => ({
            ...prev,       // 1. 保留现有的所有属性（如日期、关键词等）
            'fpllerek': newId // 2. 增加或覆盖新的参数
        }));
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

                {/* 响应式 Grid 布局 */}
                <div className="grid grid-cols-4 gap-3">
                    {tableData.map((m) => (
                        <Card
                            key={m.paginationNumber}

                            sx={{
                                border: '1px solid',
                                borderColor: '#f1f5f9',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                            }}
                            className={`group relative transition-all duration-300 bg-white cursor-pointer rounded-lg ${selectedMchantPricing?.mchId == m.pkXbbyezwt
                                ? 'border-2 border-blue-500'
                                : 'border-2 border-gray-100 hover:border-blue-500'
                                }`}
                        >
                            <CardContent className="p-4" sx={{
                                '&:last-child': {
                                    paddingBottom: '16px' // 专门覆盖 MUI 默认的 last-child 样式
                                }
                            }}>
                                <div className="flex justify-between items-center mb-5">
                                    {/* 左侧：图标容器，保持固定宽高更精致 */}
                                    <div className={`
                                        flex items-center justify-center w-9 h-9 rounded-xl transition-colors
                                        ${m.columnBirp === '已设置' ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-400'}
                                    `}>
                                        <Business style={{ fontSize: '1.2rem' }} />
                                    </div>

                                    {/* 右侧：文字置底，去掉多余行高 */}
                                    <div className={`
                                        text-xs leading-tight pb-1
                                        flex flex-col gap-0.5  {/* 🌟 核心：设为 Flex 列布局，并加一点点间距 */}
                                        ${m.columnBirp === '已设置' ? 'text-slate-900' : 'text-slate-400'}
                                    `}>
                                        <span className='font-medium'>{m.columnBirp === '已设置' ? '电价计算依据：' : '未设置'}</span>
                                        <span className="text-blue-600/80">{m.xjegvvik}</span> {/* 🌟 第二行可以微调透明度增强层次感 */}
                                    </div>
                                </div>

                                <Typography className={`text-base mt-1 mb-4 line-clamp-1 group-hover:text-blue-600 transition-colors ${m.gwsnkwpp ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                                    <a href={`#`} onClick={(e) => {
                                        e.preventDefault();

                                        setMerchantNewDialogTitle('商户信息编辑');
                                        setMerchantNewDialogOpen(true);

                                        setMerchantPkId(m.pkXbbyezwt);
                                    }} >
                                        {m.gwsnkwpp ?? '未命名项目'}
                                    </a>
                                </Typography>
                                <Typography className="text-slate-800 text-sm flex items-center gap-1 font-mono">
                                    {m.mrvqpphi}
                                </Typography>
                                <Typography className="text-slate-800 text-sm mt-1 flex items-center gap-1 font-mono">
                                    {m.bwblkhay}
                                </Typography>
                                <Typography className={`text-sm mt-1 mb-4 flex items-center gap-1 font-mono ${m.deimigjs ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                                    {m.deimigjs ?? '-'}
                                </Typography>

                                <div className={`flex items-center gap-2 text-sm mb-4 ${m.deimigjs ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                                    <span className="truncate">{m.pwayuydj ?? '-'}</span>
                                </div>

                                <Divider className="mb-4 opacity-50" />
                                <div className="flex justify-between items-center" onClick={() => handleOpenEdit({
                                    id: m.pkWzghpmog,
                                    name: m.mrvqpphi,
                                    code: m.bwblkhay,
                                    mchId: m.pkXbbyezwt
                                })}>
                                    <span className="text-sm font-semibold">电价配置</span>
                                    <ArrowForwardIos className="text-slate-600 text-xs" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
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
                            发电户号: {selectedMchantPricing?.code}
                        </div>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded text-sm ${selectedMchantPricing && selectedMchantPricing.id > 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
                            <span className={`w-1 h-1 rounded-full ${selectedMchantPricing && selectedMchantPricing.id > 0 ? 'bg-emerald-500 mr-1.5' : 'bg-slate-400 mr-1.5'}`} />
                            {selectedMchantPricing && selectedMchantPricing.id > 0 ? '已配置电价' : '未配置电价'}
                        </div>
                    </div>

                    {/* 表单主体：增加呼吸感 */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
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