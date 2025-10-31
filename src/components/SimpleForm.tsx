// src/components/SimpleForm.tsx

import React from 'react';
import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'tailwindcss/tailwind.css';

// 定义简化的表单项类型
export interface WordbookItem {
    id: string;
    name: string;
}

export interface FormItem {
    columnName: string;
    label: string;
    inputType: 'input' | 'select' | 'number' | 'date' | 'textarea';
    wordbook?: WordbookItem[];
    options?: WordbookItem[];
    required: boolean;
    validationRules: [{
        type: string,
        message: string
    }]
}

export interface FormGroup {
    groupTitle: string;
    formItems: FormItem[];
}

export interface PageSchema {
    tableName: string;
    pageTitle: string;
    pageDescription: string;
    formGroups: FormGroup[];
}

interface SimpleFormProps {
    schema: PageSchema;
}

const SimpleForm: React.FC<SimpleFormProps> = ({ schema }) => {

    const renderFormItem = (item: FormItem) => {
        const { columnName, label, inputType, wordbook, options } = item;
        const selectOptions = wordbook || options || [];

        switch (inputType) {
            case 'select':
                return (
                    <FormControl fullWidth margin="normal">
                        <InputLabel>{label}</InputLabel>
                        <Select label={label} defaultValue="">
                            {selectOptions.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 'date':
                return (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label={label}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    margin: "normal",
                                },
                            }}
                        />
                    </LocalizationProvider>
                );
            case 'textarea':
                return (
                    <TextField
                        fullWidth
                        margin="normal"
                        label={label}
                        multiline
                        rows={4}
                    />
                );
            case 'number':
                return (
                    <TextField
                        fullWidth
                        margin="normal"
                        label={label}
                        type="number"
                    />
                );
            default:
                // 默认为 'input'
                return (
                    <TextField
                        fullWidth
                        margin="normal"
                        label={label}
                    />
                );
        }
    };

    return (
        <Box className="p-8 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
            <Typography variant="h4" component="h1" className="text-center mb-2 font-bold text-gray-800">
                {schema.pageTitle}
            </Typography>
            <Typography variant="body1" className="text-center text-gray-600 mb-6">
                {schema.pageDescription}
            </Typography>

            <form>
                {schema.formGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-8">
                        <Typography variant="h5" className="mb-4 pb-2 border-b-2 border-gray-200">
                            {group.groupTitle}
                        </Typography>
                        <Grid container spacing={4}>
                            {group.formItems.map((item, itemIndex) => (
                                <Grid container columns={{ xs: 12, sm: 6, md: 12 }} key={itemIndex} component="div">
                                    {renderFormItem(item)}
                                </Grid>
                            ))}
                        </Grid>
                    </div>
                ))}
                <div className="flex justify-end mt-6">
                    <Button variant="contained" color="primary" size="large">
                        提交
                    </Button>
                </div>
            </form>
        </Box>
    );
};

export default SimpleForm;