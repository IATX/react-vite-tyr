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
            slotProps={{
                input: {
                    startAdornment: <InputAdornment position="start">
                        <KeyIcon className='text-base' />
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
                                {showPassword ? <VisibilityOff sx={{ fontSize: '1.25rem' }} /> : <Visibility sx={{ fontSize: '1.25rem' }} />}
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
};

export default PasswordInput;