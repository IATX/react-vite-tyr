import React, { useState, useEffect } from 'react';
import { Dropdown, Tree } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import {
    TextField,
} from '@mui/material';

import '../assets/css/AntdTree.css';

// Define the component's Props type, compatible with MUI and Antd properties
interface TreeSelectInputProps {
    // Antd Tree properties passed in by the parent component
    treeData: DataNode[];
    loadData?: (node: DataNode) => Promise<void>;
    multiple?: boolean;
    onChange?: (value: string[], keys: string[]) => void;
    value?: React.Key[] | React.Key;
    title?: string;

    // MUI TextField properties passed in by the parent component
    id?: string;
    name?: string;
    placeholder?: string;
    size?: 'small' | 'medium';
    variant?: 'outlined' | 'filled' | 'standard';
    error?: boolean;
    helperText?: string;
    slotProps?: {
        input?: {
            startAdornment?: React.ReactNode;
            endAdornment?: React.ReactNode;
        };
    };
}

// Auxiliary function: find the corresponding title according to keys
const getTitlesFromKeys = (keys: React.Key[], treeData: DataNode[]): string[] => {
    const titles: string[] = [];
    const findTitles = (nodes: DataNode[]) => {
        nodes.forEach(node => {
            if (keys.includes(node.key as React.Key)) {
                titles.push(node.title as string);
            }
            if (node.children) {
                findTitles(node.children);
            }
        });
    };
    findTitles(treeData);
    return titles;
};

const TreeSelectInput: React.FC<TreeSelectInputProps> = ({
    // Antd props
    treeData,
    loadData,
    multiple = false,
    onChange,
    value,
    title,

    // MUI props
    id,
    name,
    placeholder,
    size,
    variant,
    error,
    helperText,
    slotProps,
}) => {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState(title || '');
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

    // Synchronize external value to internal state
    useEffect(() => {
        const normalizedValue = Array.isArray(value) ? value : (value ? [value] : []);
        setSelectedKeys(normalizedValue);
    }, [value]);

    // Update the value of the input box according to the selected keys
    useEffect(() => {
        if (Array.isArray(treeData) && treeData.length === 1 && treeData[0].key === 'root') {
            setInputValue(title || '');
        } else {
            const titles = getTitlesFromKeys(selectedKeys, treeData);
            setInputValue(titles.join(', '));
        }
    }, [selectedKeys, treeData]);

    const handleKeysChange = (keys: React.Key[]) => {
        const selectedTitles = getTitlesFromKeys(keys, treeData);
        if (onChange) {
            onChange(selectedTitles, keys.map(key => key.toString()));
        }
    };

    const onSelect: TreeProps['onSelect'] = (newSelectedKeys) => {
        // Skip root node 
        if (newSelectedKeys.length > 0 && newSelectedKeys[0] === 'root') {
            return;
        }

        const finalKeys = newSelectedKeys.length > 0 ? [newSelectedKeys[0]] : [];
        handleKeysChange(finalKeys);
        setOpen(false);
    };

    const onCheck: TreeProps['onCheck'] = (checked) => {
        const newCheckedKeys = Array.isArray(checked) ? checked : checked.checked;
        handleKeysChange(newCheckedKeys);
    };

    return (
        <Dropdown
            open={open}
            onOpenChange={setOpen}
            trigger={['click']}
            overlayStyle={{ maxHeight: 300, overflow: 'auto', zIndex: 99999999, border: '1px solid #e5e7eb', borderRadius: '0.375rem', backgroundColor: '#fff' }}
            popupRender={(menu) => (
                <div className="custom-tree-dropdown">
                    <Tree
                        checkable={multiple}
                        onSelect={onSelect}
                        onCheck={onCheck}
                        treeData={treeData}
                        selectedKeys={selectedKeys}
                        checkedKeys={selectedKeys}
                        expandedKeys={expandedKeys}
                        onExpand={setExpandedKeys}
                        loadData={loadData}
                        style={{}} />
                </div>
            )}
            getPopupContainer={() => document.body}
        >
            <TextField
                id={id}
                name={name}
                placeholder={placeholder}
                value={inputValue}
                size={size}
                variant={variant}
                error={error}
                helperText={helperText}
                slotProps={{
                    input: {
                        readOnly: true,
                        ...slotProps?.input,
                    },
                }}
                onClick={() => { setOpen(true); }}
            />
        </Dropdown>
    );
};

export default TreeSelectInput;