import { TextField, Select, MenuItem } from '@mui/material';

export type ColumnType = 'input' | 'text' | 'number' | 'money' | 'select' | 'date';

export interface ColumnConfig {
    key: string;
    header: string;
    type: ColumnType;
    options?: { value: string; label: string }[];
}

// 2. 数据行类型
interface DataRow {
    id: string; // 唯一标识符
    [key: string]: any; // 其他数据字段
}

export const RowInputRenderer: React.FC<{ column: ColumnConfig; value: any; onChange: (v: any) => void }> = ({ column, value, onChange }) => {

    switch (column.type) {
        case 'number':
            return (
                <TextField
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    size="small"
                    sx={{
                        backgroundColor: 'white',
                        minWidth: 0,
                        width: '90%'
                    }}
                />
            );
        case 'money':
            return (
                <TextField
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    size="small"
                    sx={{
                        backgroundColor: 'white',
                        minWidth: 0,
                        width: '90%'
                    }}
                />
            );    
        case 'select':
            return (
                <Select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    size="small"
                    sx={{
                        backgroundColor: 'white',
                        minWidth: 0,
                        width: '90%'
                    }}
                >
                    {column.options?.map(option => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </Select>
            );
        case 'input':
            return (
                <TextField
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    size="small"
                    sx={{
                        backgroundColor: 'white',
                        minWidth: 0,
                        width: '90%'
                    }}
                />
            );
        case 'text':
        default:
            return (
                <TextField
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    size="small"
                    sx={{
                        backgroundColor: 'white',
                        minWidth: 0,
                        width: '90%'
                    }}
                />
            );

    }
};