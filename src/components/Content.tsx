import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import epbpLogo from '../assets/images/epbp-logo.png';

const items = [
  {
    icon: <BoltRoundedIcon />,
    title: '灵活合规的定价引擎',
    description:
      '支持分时电价、尖峰平谷、阶梯电价与容量电费等多种组合，规则引擎驱动并保留历史版本。',
  },
  {
    icon: <InsightsRoundedIcon />,
    title: '精确高效的电量处理',
    description:
      '多渠道实时导入计量数据，内置强大校验逻辑，自动识别并修复缺失、异常或错误的电量。',
  },
  {
    icon: <ReceiptLongRoundedIcon />,
    title: '自动化结算与发票',
    description:
      '按结算周期自动触发计费流程，生成结算金额并输出电子与纸质发票。',
  },
  {
    icon: <VerifiedRoundedIcon />,
    title: '透明可追溯',
    description:
      '每一度电的计费过程清晰留痕，账单明细可逐项核对，让计费精准、透明、可信赖。',
  },
];

export default function Content() {
  return (
    <Stack
      sx={{
        flexDirection: 'column',
        alignSelf: 'center',
        gap: 4,
        maxWidth: 460,
        display: { xs: 'none', md: 'flex' },
      }}
    >
      {/* 品牌头部 */}
      <Box>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            component="img"
            src={epbpLogo}
            alt="EPBP"
            sx={{ height: 44, width: 'auto' }}
          />
        </Stack>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, lineHeight: 1.3, color: 'text.primary' }}
        >
          电新能源电力电费
          <br />
          管理与计算系统
        </Typography>
        <Typography
          variant="body1"
          sx={{ mt: 1.5, color: 'text.secondary', maxWidth: 420 }}
        >
          一站式电力计量、定价、结算与发票管理平台，让每一度电的计费都精准、透明、可追溯。
        </Typography>
      </Box>

      {/* 功能亮点 */}
      <Stack sx={{ gap: 3 }}>
        {items.map((item, index) => (
          <Stack key={index} direction="row" sx={{ gap: 2 }}>
            <Box
              sx={{
                flexShrink: 0,
                width: 44,
                height: 44,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
                background:
                  'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(16,185,129,0.12))',
              }}
            >
              {item.icon}
            </Box>
            <div>
              <Typography gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                {item.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {item.description}
              </Typography>
            </div>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
