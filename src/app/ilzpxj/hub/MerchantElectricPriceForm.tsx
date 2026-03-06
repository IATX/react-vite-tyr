import React, { useContext, useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, Button, IconButton,
    Drawer, Divider, TextField, InputAdornment, Chip, Tooltip,
    Fade
} from '@mui/material';
import {
    FlashOn, Business, ArrowForwardIos, Add, Close,
    History, InfoOutlined, Save
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
interface Merchant {
    id: string;
    name: string;
    code: string;
    address: string;
    currentPrice?: number;
    status: 'active' | 'pending';
}

interface CurrentMchPricing {
    id: number;
    name: string;
    code: string;
    mchId: number;
}

// --- 2. 模拟数据 ---
const MOCK_MERCHANTS: Merchant[] = [
    { id: '1', name: '万达广场（中心店）', code: 'Wanda-001', address: '北京市朝阳区建国路 93 号', currentPrice: 1.25, status: 'active' },
    { id: '2', name: '极速冷链物流园', code: 'Logi-X', address: '上海市青浦区普洛斯物流园', currentPrice: 0.98, status: 'active' },
    { id: '3', name: '智汇科技创业港', code: 'Tech-Hub', address: '深圳市南山区科技园', currentPrice: 1.10, status: 'active' },
    { id: '4', name: '阳光花园物业', code: 'Prop-Sun', address: '广州市天河区珠江新城', status: 'pending' },
    { id: '5', name: '红星美凯龙旗舰店', code: 'RedStar-99', address: '成都市武侯区二环路', currentPrice: 1.35, status: 'active' },
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
        "pkWzghpmog": number
    }

    interface ApiResponse<T> {
        data: T[];
        total: number;
    }

    const [loading, setLoading] = useState(true);
    const [tableData, setTableData] = useState<Data[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(15);

    const [searchConditions, setSearchConditions] = useState<Record<string, string>>({
        mrvqpphi: '',
        bwblkhay: '',
    });

    const refreshTable = () => {
        fetchData();
    };

    const queryParams = {
        ...searchConditions, ...{
            page: page + 1,
            limit: pageSize
        }
    };

    const fetchData = async () => {
        setLoading(true);

        axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/tablequery/listreacttable/query_yagetq', queryParams, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'grooveToken': token
            }
        }).then(response => {
            if (response.data && response.data.success) {
                setTableData(Array.isArray(response.data.data) ? response.data.data : []);

                setTotalRows(response.data.totalCount);
            } else {
                showAlert(response.data.message, 'error');
            }
        }).catch(err => {
            showAlert('Query data exception: ' + err.message, 'error');
        }).finally(() => {
            setLoading(false);
        });


    };

    useEffect(() => {
        setBreadcrumbs([{
            name: '商户电价管理',
            url: '/main/trays'
        }]);

        fetchData();
    }, [page, pageSize, searchConditions]);

    const { setCurrentBayContent } = useContext(AppContext);

    const [merchantNewDialogOpen, setMerchantNewDialogOpen] = useState<boolean>(false);
    const [merchantNewDialogTitle, setMerchantNewDialogTitle] = useState<string>('');

    const getInitialData = (data: CurrentMchPricing | null) => {
        if (!data) return null;
        return data.id > 0
            ? { pkWzghpmog: data.id }
            : { qepibxbv: data.mchId, xdsjflqz: data.name, imxdflym: data.code };
    };

    return (
        <div className="min-h-screen flex">
            {/* --- 左侧主列表区域 --- */}
            <main className="flex-1 p-5 transition-all duration-500">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h5 className="text-lg font-bold text-slate-900 tracking-tight">
                            商户电价管理系统
                        </h5>
                        <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                            <InfoOutlined fontSize="small" /> 统一管理各区域商户能耗费率与计费规则
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outlined"
                            startIcon={<History />}
                            size="small"
                        >
                            调价历史
                        </Button>
                        <Button
                            variant="contained"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                        text-[12px] font-medium leading-none pb-1
                                        ${m.columnBirp === '已设置' ? 'text-blue-600/80' : 'text-slate-400'}
                                    `}>
                                        {m.columnBirp}
                                    </div>
                                </div>

                                <Typography className="text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {m.mrvqpphi}
                                </Typography>
                                <Typography className="text-slate-800 text-sm mt-1 mb-4 flex items-center gap-1 font-mono">
                                    CODE: {m.bwblkhay}
                                </Typography>

                                <div className="flex items-center gap-2 text-slate-800 text-sm mb-4">
                                    <span className="truncate">{m.deimigjs} &nbsp;</span>
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
                        className: "w-full sm:w-[480px] border-none shadow-2xl rounded-l-2xl overflow-hidden",
                    }
                }}
            >
                <div className="flex flex-col h-full bg-slate-50/30">
                    {/* 顶部标题栏：改为白色沉浸式设计 */}
                    <div className="relative px-6 py-5 bg-white border-b border-slate-100">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-base font-semibold text-slate-800 tracking-tight">
                                商户电价管理
                            </h2>
                        </div>

                        {/* 精致的关闭按钮 */}
                        <div className="absolute top-5 right-4">
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
                    <div className="px-6 py-3 flex gap-2 bg-white/50">
                        <div className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-slate-100 border border-slate-200">
                            商户号: {selectedMchantPricing?.code}
                        </div>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium ${selectedMchantPricing && selectedMchantPricing.id > 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
                            <span className={`w-1 h-1 rounded-full ${selectedMchantPricing && selectedMchantPricing.id > 0 ? 'bg-emerald-500 mr-1.5' : 'bg-slate-400 mr-1.5'}`} />
                            {selectedMchantPricing && selectedMchantPricing.id > 0 ? '已配置电价' : '未配置电价'}
                        </div>
                    </div>

                    {/* 表单主体：增加呼吸感 */}
                    <div className="flex-1 px-6 overflow-y-auto">
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
                    initialData: {},
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