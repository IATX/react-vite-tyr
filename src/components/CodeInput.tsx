import React from 'react';
import {
    TextField,
    InputAdornment,
    type TextFieldProps,
} from '@mui/material';

import CodeIcon from '@mui/icons-material/Code';

type CodeInputProps = Omit<TextFieldProps, 'type'>;

const CodeInput: React.FC<CodeInputProps> = (props) => {
    return (
        <TextField
            {...props}
            type={'text'}
            slotProps={{
                input: {
                    startAdornment: (<InputAdornment position="start">
                        <CodeIcon className='text-sm' />
                    </InputAdornment>),
                    sx: {
                        fontSize: '0.775rem',
                        '&:before': { borderBottom: '1px solid rgba(0,0,0,0.12)' }, // 极浅的底线
                    }
                },
            }}
            sx={{
                // 限制宽度，不要铺满
                position: 'relative', // 让 helperText 绝对定位浮在输入框下方
                '& .MuiFormHelperText-root': {
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    margin: '2px 0 0',
                    lineHeight: 1.2,
                },
                '& .MuiInputBase-input': { py: 0.5 }, // 压缩垂直高度
                '& .MuiOutlinedInput-root': { backgroundColor: '#f9fafb' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db !important' },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8 !important' },
            }}
        />
    );
};

export default CodeInput;