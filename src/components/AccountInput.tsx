import React from 'react';
import {
    TextField,
    InputAdornment,
    type TextFieldProps,
} from '@mui/material';

import PersonIcon from '@mui/icons-material/Person';

type AccountInputProps = Omit<TextFieldProps, 'type'>;

const AccountInput: React.FC<AccountInputProps> = (props) => {
    return (
        <TextField
            {...props}
            type={'text'}
            slotProps={{
                input: {
                    startAdornment: <InputAdornment position="start">
                        <PersonIcon className='text-base' />
                    </InputAdornment>
                },
            }}
        />
    );
};

export default AccountInput;