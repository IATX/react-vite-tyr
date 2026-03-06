import React, { useEffect } from 'react';

import { Typography, Button, Paper } from '@mui/material';
import {
  TrendingUp,
  Bolt,
  Storefront,
  ChevronRight
} from '@mui/icons-material';
import { useBreadcrumbs } from '../context/BreadcrumbContext';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// 1. 模拟数据（TypeScript 接口定义）
interface ChartData {
  name: string;
  usage: number; // 用电量
  cost: number;  // 成本
}

const data: ChartData[] = [
  { name: '02-15', usage: 4000, cost: 2400 },
  { name: '02-16', usage: 3000, cost: 1398 },
  { name: '02-17', usage: 2000, cost: 9800 },
  { name: '02-18', usage: 2780, cost: 3908 },
  { name: '02-19', usage: 1890, cost: 4800 },
  { name: '02-20', usage: 2390, cost: 3800 },
  { name: '02-21', usage: 3490, cost: 4300 },
];

const UsageChart: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {/* 定义渐变颜色，增加高级感 */}
          <defs>
            <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* 只有水平虚线，保持简洁 */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            dy={10}
          />

          <YAxis
            hide // 隐藏 Y 轴线，通过 Tooltip 查看具体数值，更符合 Dashboard 简约风
          />

          {/* 自定义 Tooltip */}
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              fontSize: '12px'
            }}
          />

          <Area
            type="monotone"
            dataKey="usage"
            stroke="#3b82f6"      // blue-500
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorUsage)"
            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export interface StatProps {
  title: string;
  value: string | number;
  trend: string;
  isUp: boolean;
  icon: React.ElementType;
}

const StatWidget: React.FC<StatProps> = ({ title, value, trend, isUp, icon: Icon }: StatProps) => (
  <Paper
    elevation={0}
    // 使用 Tailwind 控制边框、间距和 Hover 效果
    className="p-5 border border-slate-200 rounded-2xl bg-gray-100 hover:shadow-sm transition-shadow group"
  >
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <span className="text-slate-500 text-sm font-medium">{title}</span>
        <Typography variant="h4" className="font-bold text-slate-800">
          {value}
        </Typography>
        <div className="flex items-center gap-1">
          <span className={`text-xs font-semibold ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-slate-400 text-xs">较上周</span>
        </div>
      </div>
      {/* 动态背景色：结合 MUI sx 和 Tailwind 思想 */}
      <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-blue-50 transition-colors">
        <Icon className="text-slate-400 group-hover:text-blue-500 transition-colors" />
      </div>
    </div>
  </Paper>
);

export default function DashboardPage() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{
      name: 'Dashboard',
      url: '/main/dashboard'
    }]);
  }, []);

  return (
    // 使用 Tailwind 控制背景色和最小高度
    <div className="bg-white min-h-screen p-8 font-sans">

      {/* 顶部头部：Tailwind 布局 */}
      <div className="flex justify-between items-end mb-10">
        <div className="space-y-1">
          <h5 className="text-lg font-bold text-slate-900 tracking-tight">
            数据看板
          </h5>
          <p className="text-slate-500 text-sm">
            欢迎回来！这是您今日的商户电价监控摘要。
          </p>
        </div>
        <Button
          variant="contained"
          disableElevation
          className="text-sm bg-blue-500 hover:bg-blue-400 normal-case"
        >
          导出报告
        </Button>
      </div>

      {/* 指标卡片：Grid 响应式布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatWidget title="累计商户" value="2,543" trend="12%" isUp icon={Storefront} />
        <StatWidget title="今日负荷" value="128.4 kW" trend="5.2%" isUp icon={Bolt} />
        <StatWidget title="平均电价" value="¥0.78" trend="3.1%" isUp={false} icon={TrendingUp} />
        <StatWidget title="系统节点" value="42" trend="稳定" isUp icon={TrendingUp} />
      </div>

      {/* 主内容区：MUI Box 结合 Tailwind */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧大图表区域 */}
        <Paper
          elevation={0}
          className="lg:col-span-2 p-6 border border-slate-200 rounded-2xl h-[400px] flex flex-col"
        >
          {/* 顶部标题与图标区 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Bolt className="text-blue-500" fontSize="small" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">用电趋势监控</h3>
                <p className="text-xs text-slate-400">实时更新于 10 分钟前</p>
              </div>
            </div>

            {/* 顺便加个小的状态标签，增加精致感 */}
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Live</span>
            </div>
          </div>

          {/* 图表容器：flex-1 会自动撑满剩余高度 */}
          <div className="flex-1 w-full min-h-0">
            <UsageChart />
          </div>
        </Paper>

        {/* 右侧列表 */}
        <Paper elevation={0} className="p-6 border border-slate-200 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">最近操作</h3>
            <Button size="small" endIcon={<ChevronRight />} className="text-slate-400 normal-case">查看更多</Button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">商户 #4920 完成费率下调</p>
                  <p className="text-xs text-slate-400">2 小时前 · 系统自动触发</p>
                </div>
              </div>
            ))}
          </div>
        </Paper>
      </div>
    </div>
  );

}
