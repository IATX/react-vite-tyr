import React, { useState } from 'react';
import {
    TextField,
    IconButton,
    InputAdornment,
    type TextFieldProps,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import KeyIcon from '@mui/icons-material/Key';

type PasswordInputProps = Omit<TextFieldProps, 'type'>;

const PasswordInput: React.FC<PasswordInputProps> = (props) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        event.preventDefault();
    };

    return (
        <TextField
            {...props}
            type={showPassword ? 'text' : 'password'}
            sx={{
                position: 'relative', // 让 helperText 绝对定位浮在输入框下方
                '& .MuiFormHelperText-root': {
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    margin: '2px 0 0',
                    lineHeight: 1.2,
                },
                '& .MuiOutlinedInput-root': { backgroundColor: '#f9fafb' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db !important' },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8 !important' },
            }}
            slotProps={{
                input: {
                    startAdornment: <InputAdornment position="start">
                        <KeyIcon className='text-sm' />
                    </InputAdornment>,
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                                sx={{
                                    border: '0px', 
                                    '&:hover': {
                                        backgroundColor: 'unset',
                                        border: '0px',
                                    },
                                }}
                            >
                                {showPassword ? <VisibilityOff className='text-sm' /> : <Visibility className='text-sm' />}
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
};

export default PasswordInput;