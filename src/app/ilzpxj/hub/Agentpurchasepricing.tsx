import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
    Chip,
    Divider,
    Badge,
    CircularProgress,
    Grid,
    Collapse,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    Button,
    Popover,
    Tabs,
    Tab
} from '@mui/material';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { Add, Edit, Delete, ExpandMore, ExpandLess, FilterList, Category, Bolt, Link, CloudUpload, SettingsCellRounded, DeleteSweep, } from '@mui/icons-material';

import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn'; // 加载中文日历语言包
import { grey } from '@mui/material/colors';

import axios from 'axios';

import { useAlert } from '../../../components/AlertContext.tsx';
import { useConfirm } from '../../../components/useConfirmDialog.tsx';
import { useSession } from '../../../authority/SessionContext.tsx';
import { WrapSoloFormNode } from '../../../components/WrapNode.tsx';
import PriceNewDialog from '../../../components/FormDialogSoloPage.tsx';
import PriceImportDialog from '../../../components/FormDialogSoloPage.tsx';
import Parameterization from '../../../components/RenderComponent.tsx';
import { useBreadcrumbs } from '../../../context/BreadcrumbContext.tsx';
import FileComparisonPreview from '../../../components/FileComparisonPreview.tsx';
import { useTranslation } from 'react-i18next';

const monthMap: Record<string, string> = {
    '1月': '01', '2月': '02', '3月': '03', '4月': '04', '5月': '05', '6月': '06',
    '7月': '07', '8月': '08', '9月': '09', '10月': '10', '11月': '11', '12月': '12',
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
    'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
};

// 定义结构化数据接口
interface PricingData {
    id: number;
    category: string;      // 用电分类
    voltage: string;       // 电压等级
    nonTimePrice: string;  // 非分时电价汇总
    // 其中明细
    breakdown: {
        agent: string;       // 代理购电
        online: string;      // 上网环节线损
        transmission: string;// 电度输配
        system: string;      // 系统运行
        fund: string;        // 政府性基金
    };
    // 分时段
    tou: {
        sharp: string;       // 尖峰
        peak: string;        // 高峰
        flat: string;        // 平时
        low: string;         // 低谷
    };
    // 容量/需量
    capacity: {
        demand: string;      // 最大需量
        transformer: string; // 变压器容量
    };
}

const displayDateFormat = 'YYYY年M月D日';
const queryDateFormat = 'YYYY-MM-DD';

interface AgentPriceClueProps {
    startDate: string;
    endDate: string;
    fileUrl: string;
}

interface RegularPricingListProps {
    title: string;
    color: string;
    isEditable: boolean;
    defaultOpen: boolean;
    searchConditions: Record<string, string>;
    selectedDate: Dayjs | null;           // 新增
    markMonthsWithData: Record<string, number>; // 新增
    foreignKey: number;                          // 省市（area 查询参数）
}

interface SourceFileItemProps {
    searchNormalPricingConditions: Record<string, string>;
    searchCalculationFormulaConditions: Record<string, string>;
    search1d5PricingConditions: Record<string, string>;
    searchConditions: Record<string, string>;
    selectedDate: Dayjs | null;           // 新增
    markData: Record<string, number>; // 新增
    setMarkData: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    clueId: number;                          // 省市（area 查询参数）
}


const SourceFileItems = ({ searchNormalPricingConditions, searchCalculationFormulaConditions, search1d5PricingConditions, searchConditions, selectedDate, markData, setMarkData, clueId }: SourceFileItemProps) => {
    const { showAlert } = useAlert();
    const { token } = useSession();
    const { confirm } = useConfirm();

    const [agentPriceClue, setAgentPriceClue] = useState<AgentPriceClueProps | null>(null);

    const fetchClue = async () => {
        axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/apprice/clue', {
            pkId: clueId,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'grooveToken': token
            }
        }).then(response => {
            if (response.data) {
                setAgentPriceClue(response.data);
            } else {
                setAgentPriceClue(null);
            }
        }).catch(err => {
            showAlert('Query data exception: ' + err.message, 'error');
        }).finally(() => {
        });
    };

    useEffect(() => {
        // 1. 获取当前格式化的年月
        const currentYearMonth = selectedDate?.format('YYYY-MM') ?? '0000';

        // 2. 检查该月份是否有数据
        const hasData = markData[currentYearMonth] > 0;

        // 3. 只有有数据时才去获取详细列表
        if (hasData) {
            fetchClue();
        } else {
            setAgentPriceClue(null);
        }
    }, [searchConditions, markData, clueId]);

    const  handleCleanUp = async () => {
        const confirmed = await confirm({
            title: '提示',  
            message: '确定删除当前所有电价数据？您可以重新上传电价表文件恢复数据，请谨慎操作！',
            confirmText: '确定',
            cancelText: '取消'    

        });

        if (confirmed) {
            axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/apprice/cleanup', {
                pkId: clueId,
            }, {
                headers: {
                    'Content-Type': 'application/json', 
                    'grooveToken': token
                }
            }).then(response => {
                if (response.data) {       
                    showAlert('Data cleanup successful.', 'success');

                    setAgentPriceClue(null); // 清除线索，回到初始状态

                    setMarkData(prev => { 
                        const updated = { ...prev };
                        const currentYearMonth = selectedDate?.format('YYYY-MM') ?? '0000';
                        delete updated[currentYearMonth]; // 删除当前月份的数据标记

                        return updated;
                    });
                } else {
                    showAlert('Failed to clean up data.', 'error');
                }           

            }).catch(err => {       
                if (err.status === 401) {
                    showAlert(err.response.data, 'error');
                }

                showAlert('Network error occurred while cleaning up data. Please try again later..', 'error');
                
            }).finally(() => {
                
            });
        }
    };

    return (
        <>
            {/* 有数据时显示文件对比预览，无数据来源时显示占位提示 */}
            {agentPriceClue ? (
                <FileComparisonPreview
                    fileUrl={agentPriceClue.fileUrl}
                    title={`代理购电工商业用户电价表（执行时间：${dayjs(agentPriceClue.startDate).format(displayDateFormat)} - ${dayjs(agentPriceClue.endDate).format(displayDateFormat)}）`}
                >
                    {/* 右侧：三个上下排列的列表 */}
                    <div className="flex flex-col h-full overflow-hidden gap-2">
                        <RegularPricingList title="电价表" color="primary" isEditable={false} defaultOpen={true} searchConditions={searchNormalPricingConditions} selectedDate={selectedDate} markMonthsWithData={markData} foreignKey={clueId} />
                        <CalculationFormulaList title="计算公式表" color="warning" isEditable={false} defaultOpen={false} searchConditions={searchCalculationFormulaConditions} selectedDate={selectedDate} markMonthsWithData={markData} foreignKey={clueId} />
                        <RegularPricingList title="1.5倍电价表" color="secondary" isEditable={false} defaultOpen={false} searchConditions={search1d5PricingConditions} selectedDate={selectedDate} markMonthsWithData={markData} foreignKey={clueId} />
                    </div>
                </FileComparisonPreview>
            ) : (
                <Box
                    sx={{
                        py: 1,
                        textAlign: 'center',
                        color: 'text.disabled',
                    }}
                >
                    <Typography variant="body2" className="text-xs">无电价数据</Typography>
                </Box>
            )}

            {/* 操作区：有数据时显示清除数据（文件上传已移动到页面右上角） */}
            {agentPriceClue && (
                <div className="flex items-center gap-2">
                    <Button
                        variant="text"
                        startIcon={<DeleteSweep />}
                        onClick={handleCleanUp}
                        sx={{
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            // 🌟 1. 默认颜色改为系统错误色 (红色)
                            color: 'error.main',
                            fontWeight: 500,
                            padding: '4px 8px',
                            '&:hover': {
                                // 🌟 2. 悬停时加深背景或文字颜色，增加视觉反馈
                                color: 'error.dark',
                                backgroundColor: '#fef2f2', // 极浅的红底
                            },
                            '& .MuiButton-startIcon': {
                                marginRight: '4px',
                                '& svg': { fontSize: 16 } // 稍微调大一点点，警示图标要醒目
                            }
                        }}
                    >
                        清除数据
                    </Button>
                </div>
            )}
        </>

    );

}

const RegularPricingList = ({ title, color, isEditable, defaultOpen, searchConditions, selectedDate, markMonthsWithData, foreignKey }: RegularPricingListProps) => {
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();
    const { token } = useSession();

    const [items, setItems] = useState<PricingData[]>([]);
    const [loading, setLoading] = useState(false);

    const onEdit = (item: any) => {
        setPriceNewDialogOpen(true);
        setPriceNewDialogTitle("代理购电工商业用户电价维护");

        setPriceInitialData({
            'pkXntlcwoh': item.id
        });
    };

    const onDelete = async (item: any) => {
        const confirmed = await confirm({
            title: 'Prompt',
            message: 'Confirm Deletion?',
            confirmText: 'Yes',
            cancelText: 'Cancel'
        });

        if (confirmed) {
            const formData = new FormData();

            formData.append('pkXntlcwoh', item.id);

            axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/deleteformdata/view_tb_xntlcwoh_uzlwbg', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'grooveToken': token
                }
            }).then(response => {
                if (response.data && response.data.success) {
                    refreshTable();
                } else {
                    showAlert('Failed to delete data.', 'error');
                }
            }).catch(err => {
                if (err.status === 401) {
                    showAlert(err.response.data, 'error');
                } else {
                    showAlert('Network error occurred while deleting data. Please try again later..', 'error');
                }

            }).finally(() => {
            });
        }

    };

    interface CatOptions {
        cat0?: string[];
        cat1?: string[];
        vol?: string[];
    }

    interface NormalPricingData {
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

    const pricingTypeMap: Record<string, string> = {
        '1': '普通',
        '1.5': '1.5倍'
    };

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(15);
    const [totalRows, setTotalRows] = useState(0);

    const [tableData, setTableData] = useState<NormalPricingData[]>([]);

    const [filterOptions, setFilterOptions] = useState<CatOptions>({
        cat0: [],
        cat1: [],
        vol: []
    });

    const queryParams = {
        ...searchConditions, ...{
            page: page + 1,
            limit: pageSize,
            foreignKey: foreignKey,
        }
    };

    const fetchData = async () => {
        setLoading(true);

        axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/tablequery/listreacttable/query_zqqxdz', queryParams, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'grooveToken': token
            }
        }).then(response => {
            if (response.data && response.data.success) {
                setTableData(Array.isArray(response.data.data) ? response.data.data : []);

                const categories = {
                    cat0: [...new Set<string>(response.data.data.map((item: any) => item.uxmevhzr))].filter(Boolean),
                    cat1: [...new Set<string>(response.data.data.map((item: any) => item.tgfmfgug))].filter(Boolean),
                    vol: [...new Set<string>(response.data.data.map((item: any) => item.vjtwicby))].filter(Boolean),
                };

                setFilterOptions(categories);
            } else {
                showAlert(response.data.message, 'error');
            }
        }).catch(err => {
            showAlert('Query data exception: ' + err.message, 'error');
        }).finally(() => {
            setLoading(false);
        });
    };

    const refreshTable = () => {
        setTempFilters({
            cat0: '', cat1: '', vol: ''
        });
        fetchData();
    };

    useEffect(() => {
        // 1. 获取当前格式化的年月
        const currentYearMonth = selectedDate?.format('YYYY-MM') ?? '0000';

        // 2. 检查该月份是否有数据
        const hasData = markMonthsWithData[currentYearMonth] > 0;

        // 3. 只有有数据时才去获取详细列表
        if (hasData) {
            fetchData();
        } else {
            // 可选：如果没有数据，是否需要清空当前列表？
            setTableData([]);

            const categories = {
                cat0: [],
                cat1: [],
                vol: [],
            };

            setFilterOptions(categories);
        }
    }, [searchConditions, markMonthsWithData, foreignKey]);


    const PricingItem = ({ item }: { item: PricingData }) => {
        const [expanded, setExpanded] = useState(true);

        return (
            <ListItem disableGutters sx={{ p: 1.5, flexDirection: 'column', alignItems: 'flex-start', mb: 3 }}
                className={`bg-white rounded-md border border-blue-100/50`}
            >
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    width="100%"
                    sx={{ mb: 2 }}
                >
                    {/* 左侧文字信息 */}
                    <Box display="flex" flexDirection="column">
                        <Typography
                            variant="body2"
                            className="text-base font-semibold"
                            sx={{ mb: 0.5 }}
                        >
                            {item.category}
                        </Typography>

                        <Box display="flex" flexDirection="row" sx={{ gap: 0.2 }}>
                            <Typography variant="body2" className="text-sm">
                                <Box component="span" sx={{ fontWeight: 600 }}>电压等级：</Box>
                                {item.voltage}
                            </Typography>
                            <Divider
                                orientation="vertical"
                                flexItem
                                sx={{ height: '12px', alignSelf: 'center', mx: 1, borderColor: grey[800] }}
                            />
                            <Typography variant="body2" className="text-sm">
                                <Box component="span" sx={{ fontWeight: 600 }}>非分时电价：</Box>
                                <strong>{item.nonTimePrice}</strong> <small> 元/千瓦时</small>
                            </Typography>
                        </Box>
                    </Box>


                    <Box display="flex" alignItems="center">
                        {isEditable && (
                            <React.Fragment>
                                <IconButton color="primary" onClick={() => onEdit(item)}>
                                    <Edit sx={{ fontSize: '0.875rem' }} />
                                </IconButton>
                                <IconButton color="error" onClick={() => onDelete(item)}>
                                    <Delete sx={{ fontSize: '0.875rem' }} />
                                </IconButton>
                            </React.Fragment>
                        )}
                        <IconButton onClick={() => setExpanded(!expanded)}>
                            {expanded ? <ExpandLess sx={{ fontSize: '0.875rem' }} /> : <ExpandMore sx={{ fontSize: '0.875rem' }} />}
                        </IconButton>
                    </Box>

                </Box>

                <Collapse in={expanded} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
                    {/* 3. 费用构成明细 (二级详情) */}
                    <Box sx={{ width: '100%', p: 1.5, mb: 2 }}>
                        <Grid container spacing={1}>
                            {/* 第一行：居中的“其中” */}
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 0.5 }}>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{
                                            position: 'relative',
                                            // 装饰线
                                            '&::before, &::after': {
                                                content: '""',
                                                position: 'absolute',
                                                top: '50%',
                                                width: '15px',
                                                height: '1px',
                                                bgcolor: '#bdbdbd',
                                            },
                                            '&::before': { left: -20 },
                                            '&::after': { right: -20 }
                                        }}
                                    >
                                        其中
                                    </Typography>
                                </Box>
                            </Grid>

                            {/* 第二行：五项内容的横向流式布局 */}
                            <Grid size={{ xs: 12 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap', // 自动换行防止溢出
                                        justifyContent: 'space-between',
                                        gap: 1,
                                        px: 0.5
                                    }}
                                >
                                    {[
                                        { l: '代理购电', v: item.breakdown.agent },
                                        { l: '线损电价', v: item.breakdown.transmission },
                                        { l: '输配电价', v: item.breakdown.online },
                                        { l: '系统运行', v: item.breakdown.fund },
                                        { l: '政府基金', v: item.breakdown.fund },
                                    ].map((detail, index, arr) => (
                                        <React.Fragment key={index}>
                                            <Box
                                                sx={{
                                                    textAlign: 'center',
                                                    flex: '1 1 auto', // 自动伸缩
                                                    minWidth: '60px'
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    color="text.primary"
                                                    sx={{
                                                        display: 'block',
                                                        lineHeight: 1.2
                                                    }}
                                                >
                                                    {detail.l}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {detail.v}
                                                </Typography>
                                            </Box>

                                            {index < arr.length - 1 && (
                                                <Divider
                                                    orientation="vertical"
                                                    flexItem
                                                    sx={{ height: '12px', alignSelf: 'center', mx: 1, borderColor: grey[400] }}
                                                />
                                            )}
                                        </React.Fragment>



                                    ))}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ borderColor: 'grey.200' }}></Divider>

                    {/* 合并区域：分时电价(左) + 容量费率(右) */}
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <Grid container spacing={2} alignItems="stretch">

                            {/* --- 左侧：分时电价区块 --- */}
                            <Grid size={{ xs: 7 }}>
                                <Box sx={{ p: 1.5, height: '100%' }}>
                                    <Grid container spacing={1}>
                                        <Grid size={{ xs: 12 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                                <Typography variant="body2" fontWeight={600}
                                                    sx={{ position: 'relative', '&::before, &::after': { content: '""', position: 'absolute', top: '50%', width: '10px', height: '1px', bgcolor: '#bdbdbd' }, '&::before': { left: -15 }, '&::after': { right: -15 } }}
                                                >
                                                    分时电度电价
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        {[
                                            { label: '尖峰时段', val: item.tou.sharp, bg: '#fff1f2', text: '#e11d48' },
                                            { label: '高峰时段', val: item.tou.peak, bg: '#fff7ed', text: '#ea580c' },
                                            { label: '平时段', val: item.tou.flat, bg: '#f0f9ff', text: '#0284c7' },
                                            { label: '低谷时段', val: item.tou.low, bg: '#f0fdf4', text: '#16a34a' },
                                        ].map((cell) => (
                                            <Grid size={{ xs: 3 }} key={cell.label}>
                                                <Box sx={{ bgcolor: cell.bg, textAlign: 'center', py: 0.5, borderRadius: 1.5 }}>
                                                    <Typography variant="body2" sx={{ color: cell.text }}>{cell.label}</Typography>
                                                    <Typography variant="body2" fontWeight={700} sx={{ color: cell.text }}>{cell.val}</Typography>
                                                    <Typography variant="body2"><small>元/千瓦时</small></Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </Grid>

                            {/* --- 右侧：容量费率区块 --- */}
                            <Grid size={{ xs: 5 }}>
                                <Box sx={{
                                    p: 1.5,
                                    height: '100%',
                                }}>
                                    {/* 上部分：标题 */}
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                        <Typography variant="body2" fontWeight={600}
                                            sx={{ position: 'relative', '&::before, &::after': { content: '""', position: 'absolute', top: '50%', width: '10px', height: '1px', bgcolor: '#bdbdbd' }, '&::before': { left: -15 }, '&::after': { right: -15 } }}>
                                            容（需）量用电价
                                        </Typography>
                                    </Box>

                                    {/* 下部分：需量与容量左右排列 */}
                                    <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', gap: 1 }}>
                                        {/* 需量 */}
                                        <Box sx={{ textAlign: 'center', flex: 1, bgcolor: '#f0f9ff', p: 1 }}>
                                            <Typography variant="body2">最大需量</Typography>
                                            <Typography variant="body2" fontWeight={700}>{item.capacity.demand}</Typography>
                                            <Typography variant="body2"><small>元/瓦·月</small></Typography>
                                        </Box>

                                        {/* 容量 */}
                                        <Box sx={{ textAlign: 'center', flex: 1, bgcolor: '#f0f9ff', p: 1 }}>
                                            <Typography variant="body2">变压器容量</Typography>
                                            <Typography variant="body2" fontWeight={700}>{item.capacity.transformer}</Typography>
                                            <Typography variant="body2"><small>元/千伏安·月</small></Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                </Collapse>
            </ListItem>
        )
    }

    const [open, setOpen] = useState(defaultOpen);

    // 过滤弹窗的锚点
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    // 暂存的选中状态（点击“确定”前不影响列表）
    const [tempFilters, setTempFilters] = useState({ cat0: '', cat1: '', vol: '' });

    const handleOpenFilterDialog = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => setAnchorEl(null);

    // 1. 使用 useMemo 仅负责计算过滤后的结果
    const filteredItems = useMemo(() => {
        // 如果 tableData 还没加载出来，返回空数组
        if (!tableData) return [];

        return tableData
            .filter((item: any) => {
                // 正确逻辑：未选（为空）则不扣分，已选则必须相等
                const matchCat0 = tempFilters.cat0 === '' || item.uxmevhzr === tempFilters.cat0;
                const matchCat1 = tempFilters.cat1 === '' || item.tgfmfgug === tempFilters.cat1;
                const matchVol = tempFilters.vol === '' || item.vjtwicby === tempFilters.vol;

                return matchCat0 && matchCat1 && matchVol;
            })
            .map((item: any) => ({
                id: item.pkXntlcwoh,
                category: `${item.uxmevhzr || ''} ${item.tgfmfgug || ''}`.trim(),
                voltage: item.vjtwicby,
                nonTimePrice: item.ppleoliy,
                breakdown: {
                    agent: item.yqjhrqpv,
                    online: item.dbjcahum,
                    transmission: item.stmwshrs,
                    system: item.shwsiwey,
                    fund: item.ppleoliy
                },
                tou: {
                    sharp: item.batuyfhf || '/',
                    peak: item.zaftbdnw || '/',
                    flat: item.lhlvljqd || '/',
                    low: item.tzikxfvh || '/',
                },
                capacity: {
                    demand: item.xkatnuim || '/',
                    transformer: item.zmvivlpk || '/',
                }
            }));
    }, [tableData, tempFilters]);

    // 2. 只有当结果变化时，才同步总数（如果 UI 其他地方需要用到 totalRows）
    useEffect(() => {
        setTotalRows(filteredItems.length);
        // 如果你之前的逻辑是把过滤后的数据传给 setItems，
        // 在这里同步，或者干脆直接在页面循环渲染 filteredItems
        setItems(filteredItems);
    }, [filteredItems]);

    const [priceNewDialogOpen, setPriceNewDialogOpen] = useState<boolean>(false);
    const [priceDialogTitle, setPriceNewDialogTitle] = useState<string>('');
    const [priceInitialData, setPriceInitialData] = useState<object>({});

    return (<>
        <Paper elevation={0} className='rounded-md border'
            variant="outlined" sx={{ borderColor: 'divider' }}>
            <div className="px-4 py-2 flex justify-between items-center">
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1, cursor: 'pointer', }}
                    onClick={() => setOpen(!open)}
                >
                    <Tooltip title={open ? "收缩列表" : "展开列表"} arrow placement="left">
                        <Box sx={{
                            width: 20,           // 关键：固定一个大于图标最大宽度的值
                            display: 'flex',
                            justifyContent: 'center', // 水平居中
                            alignItems: 'center'      // 垂直居中
                        }}>
                            {/* 左侧装饰小色条 */}
                            <Box sx={{
                                width: open ? 3 : 14,
                                height: open ? 14 : 3, bgcolor: `${color}.main`, borderRadius: 1,
                            }}
                            />
                        </Box>
                    </Tooltip>
                    <Typography variant="subtitle2" fontWeight="700">
                        {title}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                    {/* 筛选触发按钮 */}
                    <Button
                        size="small"
                        startIcon={<FilterList sx={{ fontSize: '12px' }} />}
                        disabled={totalRows === 0}
                        onClick={handleOpenFilterDialog}
                        sx={{ height: 25, fontSize: '12px', textTransform: 'none' }}
                    >
                        {totalRows} 条数据
                    </Button>
                    {/* 新增按钮暂时不用，先注释掉
                    {isEditable && (
                        <Button
                            size="small"
                            startIcon={<Add sx={{ fontSize: '12px' }} />}
                            onClick={() => {
                                setPriceNewDialogOpen(true);
                                setPriceNewDialogTitle('新增电价明细');
                                setPriceInitialData({
                                    'jtenztaq': searchConditions.jtenztaq,
                                    'odrfnzvo': pricingTypeMap[searchConditions.jtenztaq],
                                    'cdtylzeq': selectedDate?.startOf('month').valueOf(),
                                    'dmnbozws': selectedDate?.endOf('month').valueOf()
                                });
                            }}
                            sx={{ height: 25, fontSize: '12px', textTransform: 'none' }}
                        >
                            增加
                        </Button>
                    )}
                    */}

                </Stack>
            </div>

            <Collapse in={open} timeout="auto" unmountOnExit>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}><CircularProgress size={24} /></Box>
                ) : (
                    <List disablePadding sx={{
                        maxHeight: 'calc(100vh - 340px)', // 自适应视口高度，列表内部滚动，避免浏览器出现滚动条
                        overflowY: 'auto',      // 纵向溢出时显示滚动条
                        width: '100%',
                        padding: 2,
                        // 可选：美化滚动条（针对 Webkit 浏览器如 Chrome/Edge）
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: grey[500],
                            borderRadius: '10px',
                        },
                    }}>
                        {items.map((item, index) => (
                            <React.Fragment key={index}>
                                <PricingItem item={item}></PricingItem>
                            </React.Fragment>
                        ))}

                        {items.length === 0 && (
                            <Box sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>
                                <Typography variant="body2" className='text-xs'>无数据</Typography>
                            </Box>
                        )}
                    </List>
                )}
            </Collapse>
        </Paper>
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
                paper: {
                    sx: {
                        p: 2,
                        mt: '5px',
                        width: 400,
                        boxShadow: '0px 4px 20px rgba(0,0,0,0.1)', borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                    }
                }
            }}
        >
            <Stack spacing={2.5}>
                {/* 区域一：用电分类 (包含 cat0 和 cat1) */}
                <Box sx={{ p: 1.5, }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Category sx={{ fontSize: 14 }} /> 用电分类
                    </Typography>

                    <Stack spacing={2}>
                        {(['cat0', 'cat1'] as const).map((key) => (
                            <Box key={key}>
                                {/* 子标题，区分维度0和1 */}
                                <Typography variant="caption" sx={{ color: 'text.disabled', mb: 0.5, display: 'block' }}>
                                    {key === 'cat0' ? '分类一' : '分类二'}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    <Chip
                                        label="全部"
                                        size="small"
                                        onClick={() => setTempFilters(prev => ({ ...prev, [key]: '' }))}
                                        color={tempFilters[key] === '' ? "primary" : "default"}
                                        variant={tempFilters[key] === '' ? "filled" : "outlined"}
                                    />
                                    {filterOptions[key]?.map(opt => (
                                        <Chip
                                            key={opt}
                                            label={opt}
                                            size="small"
                                            onClick={() => setTempFilters(prev => ({ ...prev, [key]: opt }))}
                                            color={tempFilters[key] === opt ? "primary" : "default"}
                                            variant={tempFilters[key] === opt ? "filled" : "outlined"}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                </Box>

                {/* 区域二：电压等级 (vol) */}
                <Box sx={{ p: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Bolt sx={{ fontSize: 14 }} /> 电压等级
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                            label="全部"
                            size="small"
                            onClick={() => setTempFilters(prev => ({ ...prev, vol: '' }))}
                            color={tempFilters.vol === '' ? "primary" : "default"}
                            variant={tempFilters.vol === '' ? "filled" : "outlined"}
                        />
                        {filterOptions.vol?.map(opt => (
                            <Chip
                                key={opt}
                                label={opt}
                                size="small"
                                onClick={() => setTempFilters(prev => ({ ...prev, vol: opt }))}
                                color={tempFilters.vol === opt ? "primary" : "default"}
                                variant={tempFilters.vol === opt ? "filled" : "outlined"}
                            />
                        ))}
                    </Box>
                </Box>
            </Stack>
        </Popover>
        <PriceNewDialog
            title={priceDialogTitle}
            dialogSize={'sm'}
            open={priceNewDialogOpen}
            onClose={() => {
                setPriceNewDialogOpen(false);
            }}
            children={WrapSoloFormNode(Parameterization('ViewTbXntlcwohUzlwbg', {
                initialData: priceInitialData,
                onCancel: (formData: any) => {
                    setPriceNewDialogOpen(false);
                },
                onSubmit: (formData: any) => {
                    setPriceNewDialogOpen(false);

                    refreshTable();
                },
            }))}
        />
    </>
    );
};

interface CalculationFormulaProps {
    title: string;
    color: string;
    defaultOpen: boolean;
    isEditable: boolean;
    searchConditions: Record<string, string>;
    selectedDate: Dayjs | null;           // 新增
    markMonthsWithData: Record<string, number>; // 新增
    foreignKey: number;                          // 省市（area 查询参数）
}

const CalculationFormulaList = ({ title, color, isEditable, defaultOpen, searchConditions, selectedDate, markMonthsWithData, foreignKey }: CalculationFormulaProps) => {
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();
    const { token } = useSession();

    const [items, setItems] = useState<PricingData[]>([]);
    const [loading, setLoading] = useState(false);

    const [open, setOpen] = useState(defaultOpen);

    interface CalFormulaData {
        "paginationNumber": number,
        "pkIfsxuxei": number,
        "zonfitbq": string,
        "fauaqxnr": string,
        "bpyigirl": string,
        "wdqoejrk": string,
        "cuiwtgyv": string,
        "vasfizlg": string,
        "zvhavftu": number
    }

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(15);

    const [tableData, setTableData] = useState<CalFormulaData[]>([]);

    const queryParams = {
        ...searchConditions, ...{
            page: page + 1,
            limit: pageSize,
            foreignKey: foreignKey
        }
    };

    const fetchData = async () => {
        setLoading(true);

        axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/tablequery/listreacttable/query_oldktk', queryParams, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'grooveToken': token
            }
        }).then(response => {
            if (response.data && response.data.success) {
                setTableData(Array.isArray(response.data.data) ? response.data.data : []);
            } else {
                showAlert(response.data.message, 'error');
            }
        }).catch(err => {
            showAlert('Query data exception: ' + err.message, 'error');
        }).finally(() => {
            setLoading(false);
        });
    };

    const refreshTable = () => {
        fetchData();
    };

    useEffect(() => {
        // 1. 获取当前格式化的年月
        const currentYearMonth = selectedDate?.format('YYYY-MM') ?? '0000';

        // 2. 检查该月份是否有数据
        const hasData = markMonthsWithData[currentYearMonth] > 0;

        // 3. 只有有数据时才去获取详细列表
        if (hasData) {
            fetchData();
        } else {
            // 可选：如果没有数据，是否需要清空当前列表？
            setTableData([]);
        }
    }, [searchConditions, markMonthsWithData, foreignKey]);

    const [formulaNewDialogOpen, setFormulaNewDialogOpen] = useState<boolean>(false);
    const [formulaDialogTitle, setFormulaNewDialogTitle] = useState<string>('');
    const [formulaInitialData, setFormulaInitialData] = useState<object>({});

    const handleEdit = (item: any) => {
        setFormulaNewDialogOpen(true);
        setFormulaNewDialogTitle("电价计算公式维护");

        setFormulaInitialData({
            'pkIfsxuxei': item.pkIfsxuxei
        });
    };

    const handleDelete = async (item: any) => {
        const confirmed = await confirm({
            title: 'Prompt',
            message: 'Confirm Deletion?',
            confirmText: 'Yes',
            cancelText: 'Cancel'
        });

        if (confirmed) {
            const formData = new FormData();

            formData.append('pkIfsxuxei', item.pkIfsxuxei);

            axios.post(import.meta.env.VITE_JET_ASP_BPC_API + '/tableview/deleteformdata/view_tb_ifsxuxei_liyiee', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'grooveToken': token
                }
            }).then(response => {
                if (response.data && response.data.success) {
                    refreshTable();
                } else {
                    showAlert('Failed to delete data.', 'error');
                }
            }).catch(err => {
                if (err.status === 401) {
                    showAlert(err.response.data, 'error');
                } else {
                    showAlert('Network error occurred while deleting data. Please try again later..', 'error');
                }

            }).finally(() => {
            });
        }

    };

    return (<>
        <Paper
            elevation={0}
            variant="outlined"
            sx={{ borderColor: 'divider' }}
            className="rounded-md border"
        >
            <div className="px-4 py-3 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1, cursor: 'pointer', }}
                    onClick={() => setOpen(!open)}>
                    <Tooltip title={open ? "收缩列表" : "展开列表"} arrow placement="left">
                        <Box sx={{
                            width: 20,           // 关键：固定一个大于图标最大宽度的值
                            display: 'flex',
                            justifyContent: 'center', // 水平居中
                            alignItems: 'center'      // 垂直居中
                        }}>
                            {/* 左侧装饰小色条 */}
                            <Box sx={{
                                width: open ? 3 : 14,
                                height: open ? 14 : 3, bgcolor: `${color}.main`, borderRadius: 1,
                            }}
                            />
                        </Box>
                    </Tooltip>
                    <Typography variant="subtitle2" fontWeight="700">
                        {title}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                        label={tableData.length + ` 条数据`}
                        size="small"
                        sx={{ fontSize: '12px', height: '20px', bgcolor: 'white' }}
                        variant="outlined"
                    />
                    {/* 新增按钮暂时不用，先注释掉
                    {isEditable && (
                        <Button
                            size="small"
                            startIcon={<Add sx={{ fontSize: '12px' }} />}
                            onClick={() => {
                                setFormulaNewDialogOpen(true);
                                setFormulaNewDialogTitle('新增计算公式');
                                setFormulaInitialData({
                                    'zonfitbq': selectedDate?.startOf('month').valueOf(),
                                    'fauaqxnr': selectedDate?.endOf('month').valueOf()
                                });
                            }}
                            sx={{ height: 25, fontSize: '12px', textTransform: 'none' }}
                        >
                            增加
                        </Button>
                    )}
                    */}
                </Stack>
            </div>
            <Collapse in={open} timeout="auto" unmountOnExit>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}><CircularProgress size={24} /></Box>
                ) : (
                    <List className="overflow-y-auto" sx={{
                        maxHeight: 'calc(100vh - 340px)', // 自适应视口高度，列表内部滚动，避免浏览器出现滚动条
                        overflowY: 'auto',      // 纵向溢出时显示滚动条
                        width: '100%',
                        padding: 2,
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: grey[500],
                            borderRadius: '10px',
                        },
                    }}>

                        {tableData.length === 0 ? (
                            <Box sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>
                                <Typography variant="body2" className='text-xs'>无数据</Typography>
                            </Box>
                        ) : (
                            <>
                                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align='center'>名称</TableCell>
                                            <TableCell align='center'>序号</TableCell>
                                            <TableCell align='left'>明细</TableCell>
                                            <TableCell align='left'>计算关系</TableCell>
                                            <TableCell align='center'>数值</TableCell>
                                            <TableCell align='center'>&nbsp;</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tableData.map((item: CalFormulaData, index: number) => (
                                            <TableRow
                                                key={item.pkIfsxuxei}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                {index === 0 ? (
                                                    // 第一行：显示单元格并设置跨 3 行
                                                    <TableCell component="th" scope="row" align='center' rowSpan={3}>
                                                        {item.wdqoejrk}
                                                    </TableCell>
                                                ) : index === 3 ? (
                                                    // 第二行和第三行：直接不渲染这个单元格，它会被第一行的 rowSpan 占据
                                                    <TableCell component="th" scope="row" align='center' rowSpan={tableData.length - 3}>
                                                        {item.wdqoejrk}
                                                    </TableCell>
                                                ) : (
                                                    // 第四行及以后：正常渲染
                                                    null
                                                )}
                                                <TableCell align='center'>{item.bpyigirl}</TableCell>
                                                <TableCell>{item.cuiwtgyv}</TableCell>
                                                <TableCell>{item.vasfizlg}</TableCell>
                                                <TableCell align='center'>{item.zvhavftu}</TableCell>
                                                <TableCell align='center'>
                                                    {isEditable ? (
                                                        <Stack direction="row" spacing={1} justifyContent="center">

                                                            {/* 编辑按钮 */}
                                                            <Tooltip title="编辑" arrow>
                                                                <IconButton color="primary" onClick={() => handleEdit(item)}>
                                                                    <Edit sx={{ fontSize: '0.875rem' }} />
                                                                </IconButton>
                                                            </Tooltip>

                                                            {/* 删除按钮 */}
                                                            <Tooltip title="删除" arrow>
                                                                <IconButton color="error" onClick={() => handleDelete(item)}>
                                                                    <Delete sx={{ fontSize: '0.875rem' }} />
                                                                </IconButton>
                                                            </Tooltip>

                                                        </Stack>
                                                    ) : (<>&nbsp;</>)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </>
                        )}

                    </List>
                )}
            </Collapse>
        </Paper>
        <PriceImportDialog
            title={formulaDialogTitle}
            dialogSize={'sm'}
            open={formulaNewDialogOpen}
            onClose={() => {
                setFormulaNewDialogOpen(false);
            }}
            children={WrapSoloFormNode(Parameterization('ViewTbIfsxuxeiLiyiee', {
                initialData: formulaInitialData,
                onCancel: (formData: any) => {
                    setFormulaNewDialogOpen(false);
                },
                onSubmit: (formData: any) => {
                    setFormulaNewDialogOpen(false);
                },
            }))}
        />
    </>)

};

const AgentPurchasePricingForm = () => {
    const { showAlert } = useAlert();
    const { token } = useSession();
    const { setBreadcrumbs } = useBreadcrumbs();
    const { i18n } = useTranslation();

    // 日历语言跟随系统国际化设置：中文用 zh-cn，其它用 en
    const adapterLocale = i18n.language?.startsWith('zh') ? 'zh-cn' : 'en';

    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

    // 省市选择（默认上海市），作为 area 参数随查询下发
    const [area, setArea] = useState<string>('Shanghai');

    const [foreignKey, setForeignKey] = useState<number>(0); // 省市对应的外键 ID，初始为 0 或者 null，根据实际情况调整

    const [markMonthsWithData, setMarkMonthsWithData] = useState<Record<string, number>>({});

    // 右侧三个列表的 tab 切换（0:电价表 1:计算公式表 2:1.5倍电价表）
    const [activeTab, setActiveTab] = useState<number>(0);

    // 文件上传弹窗（移动到页面右上角，随时可点击）
    const [priceImportDialogOpen, setPriceImportDialogOpen] = useState<boolean>(false);
    const [priceImportTitle, setPriceImportDialogTitle] = useState<string>('');

    useEffect(() => {
        setBreadcrumbs([{
            name: '电价管理',
            url: '/main/trays'
        },{
            name: '代购电价导入',
            url: '/main/trays'
        }]);
    }, []);


    const fetchmMarkData = async (currentDate: Dayjs) => {
        axios.post(import.meta.env.VITE_JET_ASP_BPC_API + `/apprice/normal/mark/${area}/${currentDate.year()}`, {}, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'grooveToken': token
            }
        }).then(response => {
            if (response.data) {
                setMarkMonthsWithData(response.data);
                setForeignKey(response.data[currentDate.format('YYYY-MM')] ?? 0); // 假设接口返回的结构中包含 foreignKey 字段
            }
        }).catch(err => {
            showAlert('Query data exception: ' + err.message, 'error');
        }).finally(() => {
        });
    };

    useEffect(() => {
        fetchmMarkData(selectedDate ?? dayjs());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [area]);

    const [searchClueConditions, setSearchClueConditions] = useState<Record<string, string>>({
        startDate: dayjs().startOf('month').format(queryDateFormat) + ' 00:00:00', // Start date
        endDate: dayjs().endOf('month').format(queryDateFormat) + ' 23:23:59', // End date
    });

    const [searchNormalPricingConditions, setSearchNormalPricingConditions] = useState<Record<string, string>>({
        cdtylzeq: dayjs().startOf('month').format(queryDateFormat) + ' 00:00:00', // Start date
        dmnbozws: dayjs().endOf('month').format(queryDateFormat) + ' 23:23:59', // End date
        jtenztaq: '1',
        queryMode: 'AND'
    });

    const [search1d5PricingConditions, setSearch1d5PricingConditions] = useState<Record<string, string>>({
        cdtylzeq: dayjs().startOf('month').format(queryDateFormat) + ' 00:00:00', // Start date
        dmnbozws: dayjs().endOf('month').format(queryDateFormat) + ' 23:23:59', // End date
        jtenztaq: '1.5',
        queryMode: 'AND'
    });

    const [searchCalculationFormulaConditions, setSearchCalculationFormulaConditions] = useState<Record<string, string>>({
        cdtylzeq: dayjs().startOf('month').format(queryDateFormat) + ' 00:00:00', // Start date
        dmnbozws: dayjs().endOf('month').format(queryDateFormat) + ' 23:23:59', // End date
        jtenztaq: '1',
        queryMode: 'AND'
    });

    // 1. 在组件顶部定义一个 ref 用来记录上一次的日期
    const prevDateRef = useRef<Dayjs | null>(selectedDate);

    // 2. 修改日期组件的 onChange 逻辑
    const handleDateChange = (newDate: Dayjs | null) => {
        if (!newDate) return;

        // 获取旧的年份和新的年份
        const prevYear = prevDateRef.current?.year();
        const currentYear = newDate.year();

        // 判断逻辑：只有年份真正改变时，才调用 fetchmMarkData（其内部会基于最新返回设置 foreignKey）
        if (prevYear !== currentYear) {
            fetchmMarkData(newDate);
        } else {
            // 同年内仅切换月份：markMonthsWithData 已是最新，直接根据所选年月更新外键
            setForeignKey(markMonthsWithData[newDate.format('YYYY-MM')] ?? 0);
        }

        // 更新状态和 Ref
        setSelectedDate(newDate);
        prevDateRef.current = newDate;

        // 同步搜索条件（无论年月变动都需要同步，因为查询范围变了）
        setSearchNormalPricingConditions({
            cdtylzeq: newDate.startOf('month').format(queryDateFormat) + ' 00:00:00',
            dmnbozws: newDate.endOf('month').format(queryDateFormat) + ' 23:23:59',
            jtenztaq: '1',
            queryMode: 'AND'
        });

        setSearch1d5PricingConditions({
            cdtylzeq: newDate.startOf('month').format(queryDateFormat) + ' 00:00:00',
            dmnbozws: newDate.endOf('month').format(queryDateFormat) + ' 23:23:59',
            jtenztaq: '1.5',
            queryMode: 'AND'
        });

        setSearchCalculationFormulaConditions({
            zonfitbq: newDate.startOf('month').format(queryDateFormat) + ' 00:00:00',
            fauaqxnr: newDate.endOf('month').format(queryDateFormat) + ' 23:23:59',
            queryMode: 'AND'
        });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={adapterLocale}>
            <Box className="flex flex-col p-5 gap-6">
                {/* 第一行：全宽标题行 */}
                <Box className="w-full flex justify-between items-center px-1">
                    <Typography variant="h6" className="text-base font-semibold" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                        国网
                        <Select
                            variant="standard"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            disableUnderline
                            sx={{
                                mx: 0.5,
                                fontSize: 'inherit',
                                fontWeight: 'inherit',
                                color: 'primary.main',
                                '& .MuiSelect-select': { py: 0, pr: '20px !important' },
                            }}
                        >
                            <MenuItem value="Shanghai">上海市</MenuItem>
                            <MenuItem value="Jiangsu">江苏省</MenuItem>
                            <MenuItem value="Zhejiang">浙江省</MenuItem>
                            <MenuItem value="Guangdong">广东省</MenuItem>
                            <MenuItem value="Jiangxi">江西省</MenuItem>
                        </Select>
                        电力公司代理购电工商业用户电价表
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{}} className="px-2 py-1 rounded-md">
                            <Box component="span" sx={{ fontWeight: 600 }}>执行时间：</Box>{selectedDate?.startOf('month').format(displayDateFormat)} — {selectedDate?.endOf('month').format(displayDateFormat)}
                        </Typography>
                        {/* 文件上传按钮：右上角，随时可点击，不受是否有数据控制 */}
                        <Button
                            variant="text"
                            size="small"
                            startIcon={<CloudUpload />}
                            onClick={() => {
                                setPriceImportDialogOpen(true);
                                setPriceImportDialogTitle('上传价格表');
                            }}
                            sx={{
                                textTransform: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                '& .MuiButton-startIcon': {
                                    marginRight: '4px',
                                    '& svg': { fontSize: 16 }
                                }
                            }}
                        >
                            文件上传
                        </Button>
                    </Box>
                </Box>

                {/* 第二行：左右排列的容器 */}
                <Box className="flex flex-1 gap-6">

                    {/* --- 左侧：日历区域 --- */}
                    <div className="w-[340px] flex-shrink-0 flex flex-col gap-6">
                        <Paper
                            elevation={0}
                            sx={{ bgcolor: 'transparent', border: 'none' }}
                            className="flex-1"
                        >
                            <StaticDatePicker
                                displayStaticWrapperAs="desktop"
                                value={selectedDate}
                                openTo="month"
                                views={['year', 'month']}
                                maxDate={dayjs()}
                                onMonthChange={handleDateChange}
                                onChange={handleDateChange}
                                className={`rounded-md border border-slate-400/50`}
                                slots={{
                                    monthButton: (props: any) => {
                                        const currentYear = selectedDate?.year();

                                        const label = props.children || '';

                                        const currentYearMonth = currentYear + '-' + monthMap[label];

                                        const { month, selected, disabled, onSelect, ownerState, ...other } = props;

                                        // 2. 获取月份数字 (1-12)
                                        // 这里的 month 通常是一个 dayjs 对象
                                        const hasData = (markMonthsWithData[currentYearMonth] != null && markMonthsWithData[currentYearMonth] > 0);

                                        return (
                                            <Badge
                                                key={label}
                                                color="error"
                                                variant="dot"
                                                invisible={!hasData}
                                                sx={{
                                                    '& .MuiBadge-badge': {
                                                        right: 2,
                                                        top: 2,
                                                        zIndex: 1,
                                                    }
                                                }}
                                            >
                                                <Box
                                                    component="button"
                                                    {...other} // 注入 MUI 默认的点击和交互事件
                                                    onClick={(event: React.MouseEvent) => !disabled && props?.onClick(event)} // 确保点击生效
                                                    sx={{
                                                        // 模拟 MUI 默认的月份按钮样式
                                                        width: 60,
                                                        height: 36,
                                                        borderRadius: '18px',
                                                        border: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.875rem',
                                                        cursor: disabled ? 'not-allowed' : 'pointer',
                                                        bgcolor: selected ? 'primary.main' : 'transparent',
                                                        color: selected ? 'white' : (disabled ? 'text.disabled' : 'text.primary'),
                                                        '&:hover': {
                                                            bgcolor: selected ? 'primary.dark' : (disabled ? 'transparent' : 'action.hover'),
                                                        },
                                                        transition: 'all 0.2s',
                                                        // 之前的禁用样式逻辑
                                                        ...(disabled && {
                                                            opacity: 0.4,
                                                            pointerEvents: 'auto !important',
                                                        })
                                                    }}
                                                >
                                                    {label}
                                                </Box>
                                            </Badge>
                                        );
                                    }
                                }}
                                slotProps={{
                                    actionBar: {
                                        actions: [],
                                    },
                                }}
                                sx={{
                                    // 1. 基础容器高度自适应
                                    '& .MuiPickersLayout-root': {
                                        height: 'auto',
                                        minHeight: '0 !important',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    },
                                    '& .MuiDateCalendar-root': {
                                        height: 'auto !important',
                                        maxHeight: 'none !important',
                                        minHeight: 'unset !important',
                                        padding: '16px 0px', // 减少左右内边距
                                    },
                                    '& .MuiPickersLayout-contentWrapper': {
                                        height: 'auto',
                                        flexGrow: 1,
                                        display: 'block',
                                        overflow: 'visible !important',
                                    },
                                    // 2. 移除底部按钮占位
                                    '& .MuiPickersLayout-actionBar': { display: 'none' },
                                    // 3. 样式美化：让禁用的月份看起来更明显（可选）
                                    '& .MuiPickersMonth-monthButton.Mui-disabled': {
                                        opacity: 0.3,
                                        cursor: 'not-allowed'
                                    },
                                    // 重点：调整禁用月份的样式
                                    '& .MuiMonthCalendar-button.Mui-disabled': {
                                        color: 'text.disabled',      // 变成淡灰色
                                        opacity: 0.4,                // 增加透明度
                                        backgroundColor: 'transparent !important', // 确保没有背景色
                                        cursor: 'not-allowed',       // 鼠标悬停显示禁止图标
                                        pointerEvents: 'auto',       // 必须设为 auto，否则鼠标指针样式 (not-allowed) 不会生效

                                        // 移除禁用状态下的点击波纹效果
                                        '& .MuiTouchRipple-root': { display: 'none' },

                                        // 悬停时也不要任何变色
                                        '&:hover': {
                                            backgroundColor: 'transparent',
                                        }
                                    },

                                    // 可选：让选中的月份更突出
                                    '& .MuiMonthCalendar-button.Mui-selected': {
                                        fontWeight: 'bold',
                                        backgroundColor: 'primary.main',
                                        color: '#fff',
                                    },
                                    '& .MuiPickersArrowSwitcher-root': {
                                        display: 'inline-flex !important', // 确保它是显示的
                                        visibility: 'visible !important',   // 去掉可能存在的 hidden
                                        opacity: '1 !important',            // 去掉所有的透明度渐变
                                    },

                                    // 针对内部的左右按钮，防止它们在某些状态下变透明
                                    '& .MuiPickersArrowSwitcher-button': {
                                        visibility: 'visible !important',
                                        opacity: '1 !important',
                                        color: 'primary.main', // 改成主题蓝色
                                        '& svg': {
                                            fontSize: '1rem', // 调大箭头尺寸
                                        }
                                    },

                                    // 特别注意：针对“禁用”状态（比如 maxDate 限制），
                                    // 如果你想让禁用的按钮也完全不透明（虽然不推荐，因为误导用户），可以加这行：
                                    '& .MuiPickersArrowSwitcher-button.Mui-disabled': {
                                        opacity: '0.3 !important', // 建议保留一点透明度区分禁用感，或者设为 1
                                    },
                                }}
                            />

                            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

                            <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm space-y-5">
                                {/* 1. 执行周期部分 */}
                                <div>
                                    <Typography variant="caption" className="font-semibold text-sm block mb-2">
                                        当前执行周期
                                    </Typography>
                                    <Typography className="text-sm ml-5.5">
                                        {selectedDate?.format('YYYY年MM月')}
                                    </Typography>
                                </div>

                                {/* 分割线 */}
                                <div className="h-px bg-slate-100 w-full" />

                                {/* 2. 数据来源部分 */}
                                <div>
                                    <Typography variant="caption" className="font-semibold text-sm block mb-2">
                                        数据来源
                                    </Typography>

                                    <div className="flex items-center gap-4 ml-5.5">
                                        <SourceFileItems
                                            searchNormalPricingConditions={searchNormalPricingConditions}
                                            searchCalculationFormulaConditions={searchCalculationFormulaConditions}
                                            search1d5PricingConditions={search1d5PricingConditions}
                                            searchConditions={searchNormalPricingConditions}
                                            selectedDate={selectedDate}
                                            markData={markMonthsWithData}
                                            setMarkData={setMarkMonthsWithData}
                                            clueId={foreignKey}
                                            ></SourceFileItems>
                                    </div>
                                </div>
                            </div>
                        </Paper>
                    </div>

                    {/* --- 右侧：Tab 切换的三段式列表区域 --- */}
                    <div className="flex-1 flex flex-col gap-5">
                        <Tabs
                            value={activeTab}
                            onChange={(_, v) => setActiveTab(v)}
                            sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600 } }}
                        >
                            <Tab label="电价表" />
                            <Tab label="计算公式表" />
                            <Tab label="1.5倍电价表" />
                        </Tabs>

                        {/* 三个列表均保持挂载，仅切换可见性，以保留各自的数据与过滤状态 */}
                        <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
                            <RegularPricingList title="电价表" color="primary" isEditable={true} defaultOpen={true} searchConditions={searchNormalPricingConditions} selectedDate={selectedDate} markMonthsWithData={markMonthsWithData} foreignKey={foreignKey} />
                        </Box>
                        <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
                            <CalculationFormulaList title="计算公式表" color="warning" isEditable={true} defaultOpen={true} searchConditions={searchCalculationFormulaConditions} selectedDate={selectedDate} markMonthsWithData={markMonthsWithData} foreignKey={foreignKey} />
                        </Box>
                        <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
                            <RegularPricingList title="1.5倍电价表" color="secondary" isEditable={true} defaultOpen={true} searchConditions={search1d5PricingConditions} selectedDate={selectedDate} markMonthsWithData={markMonthsWithData} foreignKey={foreignKey} />
                        </Box>
                    </div>

                </Box>
            </Box >

            {/* 文件上传弹窗（右上角按钮触发） */}
            <PriceImportDialog
                title={priceImportTitle}
                dialogSize={'sm'}
                open={priceImportDialogOpen}
                onClose={() => {
                    setPriceImportDialogOpen(false);
                }}
                children={WrapSoloFormNode(Parameterization('ViewTbDhnkqhqgNmiwkj', {
                    initialData: {},
                    onCancel: () => {
                        setPriceImportDialogOpen(false);
                    },
                    onSubmit: () => {
                        setPriceImportDialogOpen(false);
                        // 上传完成后刷新当前年份的数据标记
                        fetchmMarkData(selectedDate ?? dayjs());
                    },
                }))}
            />
        </LocalizationProvider >
    );
};

export default AgentPurchasePricingForm;