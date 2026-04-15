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
                '& .MuiInputBase-input': { py: 0.5 } // 压缩垂直高度
            }}
        />
    );
};

export default CodeInput;