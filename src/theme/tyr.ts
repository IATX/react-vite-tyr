import { alpha, createTheme, getContrastRatio } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import type getFontSizes from 'antd/es/theme/themes/shared/genFontSizes';
import { Padding } from '@mui/icons-material';

declare module '@mui/material/styles' {
  interface Palette {
    violet: Palette['primary'];
  }

  interface PaletteOptions {
    violet?: PaletteOptions['primary'];
  }
}

// Update the Button's color options to include a violet option
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    violet: true;
  }
}

const violetBase = '#7F00FF';
const violetMain = alpha(violetBase, 0.7);

const theme = createTheme({
  palette: {
    violet: {
      main: violetMain,
      light: alpha(violetBase, 0.5),
      dark: alpha(violetBase, 0.9),
      contrastText: getContrastRatio(violetMain, '#fff') > 4.5 ? '#fff' : '#111',
    },
  },
  typography: {
    // 统一设置按钮的 textTransform 属性
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiInputAdornment: {
      styleOverrides: {
        // 修改根元素样式
        root: {
          color: 'gray', // 设置默认颜色
        },
        // 修改 startAdornment 的样式
        positionStart: {
          paddingLeft: '10px',
        },
        // 修改 endAdornment 的样式
        positionEnd: {
         
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1rem', // 标题字体大小
          fontWeight: 600, // 可选：设置字体粗细以增加辨识度
        },
      },
    },
    // 设置 DialogContentText 的样式
    MuiDialogContentText: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem', // 内容字体大小
        },
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          
        },
      },
    },
    // 基础输入框组件，同时应用于 TextField 和 Select
    MuiInputBase: {
      styleOverrides: {
        root: {
          // 精确地选择非多行输入框，以排除 textarea
          '&:not(.MuiInputBase-multiline)': {
            height: 36, // 设置高度
            borderRadius: '0.375rem',
            paddingLeft: '0px', // 重置容器 padding
          },
          '&.MuiInputBase-multiline': {
            borderRadius: '0.375rem', // 只为 textarea 设置圆角
            padding: '8.5px 0px'
          },
        },
        input: {
          // 为所有输入框设置内边距和字体大小
          padding: '6px 12px',
          fontSize: '0.875rem', // 新增：设置字体大小
        },
      },
    },
    // 为 Select 组件设置高度，确保其垂直居中
    MuiSelect: {
      styleOverrides: {
        select: {
          minHeight: 'unset', // 重置默认的最小高度
          height: 36, // 设置高度
          lineHeight: '36px', // 确保文本垂直居中
          paddingTop: 0,
          paddingBottom: 0,
          borderRadius: '0.375rem',
        },
      },
    },
    // 设置 MuiOutlinedInput 的边框样式
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'oklch(70.7% 0.022 261.325) !important', // 悬浮边框颜色
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'oklch(54.6% 0.245 262.881) !important', // 聚焦边框颜色
          },
        },
        notchedOutline: {
          borderColor: 'oklch(87.2% 0.01 258.338)', // 默认边框颜色
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          '&.Mui-selected': {
            backgroundColor: 'oklch(93.2% 0.032 255.585)',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: 'oklch(93.2% 0.032 255.585)',
            }
          }
        }
      }
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          '&.Mui-error': {
            color: 'red',
            marginLeft: '0px !important'
          },
        }
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: 'oklch(54.6% 0.245 262.881)',
          },
          fontSize: '0.875rem',
        }
      },
    },

  },
});

export default theme;