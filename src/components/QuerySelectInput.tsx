import React, { useState, useRef, useEffect } from 'react';
import {
    TextField,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Checkbox,
    CircularProgress,
    Grid,
    Button,
} from '@mui/material';

import { Dropdown } from 'antd';

import '../assets/css/AntdTree.css';

import { useAlert } from '../components/AlertContext';
import { useSession } from '../authority/SessionContext';

// --- 1. Custom Hook: Data Fetching ---
interface FetchedData {
    key: string;
    name: string;
}

interface FetchState<T> {
    data: T[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
}

const useFetchData = <T extends FetchedData>(url: string | null, page: number, pageSize: number, pointId: string, pointName: string): FetchState<T> => {
    const { showAlert } = useAlert();
    const { token } = useSession();

    const [state, setState] = useState<FetchState<T>>({
        data: [],
        loading: false,
        error: null,
        hasMore: true,
    });

    useEffect(() => {
        if (!url) {
            return;
        }

        const fetchData = async () => {
            setState(prevState => ({ ...prevState, loading: true, error: null }));
            try {
                const isFirstPage = page === 1;

                const formData = new URLSearchParams();

                formData.append('page', page.toString());
                formData.append('limit', pageSize.toString());

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'grooveToken': token
                    },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                if (!data.success) {
                    showAlert('Failed to load list data.', 'error');
                } else {
                    const formattedData: T[] = data.data.map((item: any) => ({
                        key: item[pointId] + '',
                        name: item[pointName] + '',
                    }));

                    const totalCount = data.totalCount;
                    const hasMore = (page * pageSize) < totalCount;

                    setState(prevState => ({
                        ...prevState,
                        data: isFirstPage ? formattedData : [...prevState.data, ...formattedData],
                        loading: false,
                        hasMore: hasMore
                    }));
                }
            } catch (e: any) {
                setState(prevState => ({ ...prevState, loading: false, error: e.message }));
            }
        };

        fetchData();
    }, [url, page, pageSize]);

    return state;
};

// --- 2. MyDataList Component (Placeholder) ---
interface MyDataListProps<T> {
    dataKey: string;
    isMultiSelect: boolean;
    selectedKeys: string[];
    onItemClick: (key: string) => void;
    loading: boolean;
    error: string | null;
    data: T[] | null;
    hasMore: boolean;
    onLoadMore: () => void;
}

const MyDataList: React.FC<MyDataListProps<any>> = ({
    isMultiSelect,
    selectedKeys,
    onItemClick,
    loading,
    error,
    data,
    hasMore,
    onLoadMore
}) => {
    const renderListItems = () => {
        if (loading) {
            return (
                <Box sx={{ padding: '4px', display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={20} />
                </Box>
            );
        }

        if (error) {
            return (
                <Box sx={{ padding: '4px', textAlign: 'center', color: 'error.main' }}>
                    Failed to load data: {error}
                </Box>
            );
        }

        if (!data || data.length === 0) {
            return (
                <Box sx={{ padding: '4px', textAlign: 'center', color: 'text.secondary' }}>
                    No data
                </Box>
            );
        }

        return (
            <Box>
                <List dense>
                    {data.map((item) => (
                        <ListItem
                            key={item.key}
                            disablePadding
                            sx={{
                                backgroundColor: !isMultiSelect && selectedKeys.includes(item.key) ? 'oklch(96.7% 0.003 264.542)' : 'transparent',
                            }}
                        >
                            <ListItemButton onClick={() => onItemClick(item.key)}>
                                {isMultiSelect && (
                                    <Checkbox
                                        edge="start"
                                        checked={selectedKeys.includes(item.key)}
                                        tabIndex={-1}
                                        disableRipple
                                        sx={{ p: '4px' }}
                                    />
                                )}
                                <ListItemText primary={item.name} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        );
    };

    return (
        <Box>
            {renderListItems()}
            {hasMore && (
                <Grid container justifyContent="center" sx={{ padding:'0px' }}>
                    <Button onClick={onLoadMore} disabled={loading} size="small">
                        {loading ? <CircularProgress size={16} /> : 'Load more data'}
                    </Button>
                </Grid>
            )}
        </Box>
    );
};

// --- 3. InputWithList Main Component ---
const InputWithList: React.FC<any> = ({
    dataKey,
    isMultiSelect = false,
    selectedKeys,
    onChange,
    pointId,
    pointName,
    ...rest
}) => {
    const bpcApiUrl = import.meta.env.VITE_JET_ASP_BPC_API;
    const pageSize = 5;
    const [page, setPage] = useState(1);

    const [open, setOpen] = useState(false);

    const { data, loading, error, hasMore } = useFetchData(`${bpcApiUrl}/tablequery/listreacttable/${dataKey}`, page, pageSize, pointId, pointName);

    const handleItemClick = (key: string) => {
        let newSelectedKeys: string[] = [];

        if (isMultiSelect) {
            if (selectedKeys.includes(key)) {
                newSelectedKeys = selectedKeys.filter((k: string) => k !== key);
            } else {
                newSelectedKeys = [...selectedKeys, key];
            }
        } else {
            newSelectedKeys = [key];
            setOpen(false);
        }

        const newSelectedNames = newSelectedKeys.map(k => {
            const item = data?.find(d => d.key === k);
            return item ? item.name : '';
        }).filter(Boolean);

        onChange(newSelectedKeys, newSelectedNames);
    };

    const handleLoadMore = () => {
        if (!loading) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const displayNames = selectedKeys.map((key: string) => {
        const item = data?.find(d => d.key === key);
        return item ? item.name.trim() : '';
    }).filter(Boolean).join(', ');

    return (
        <Dropdown
            open={open}
            onOpenChange={setOpen}
            trigger={['click']}
            overlayStyle={{ maxHeight: 300, overflow: 'auto', zIndex: 99999999, border: '1px solid #e5e7eb', borderRadius: '0.375rem', backgroundColor: '#fff' }}
            getPopupContainer={() => document.body}
            popupRender={(menu) => (
                <div className="custom-tree-dropdown">
                    <MyDataList
                        dataKey={dataKey}
                        isMultiSelect={isMultiSelect}
                        selectedKeys={selectedKeys}
                        onItemClick={handleItemClick}
                        loading={loading}
                        error={error}
                        data={data}
                        hasMore={hasMore}
                        onLoadMore={handleLoadMore}
                    />
                </div>
            )}
        >
            <TextField
                value={displayNames}
                fullWidth
                readOnly
                sx={{ cursor: 'pointer' }}
                {...rest}
                slotProps={{
                    input: {
                        readOnly: true,
                        ...rest.slotProps?.input
                    }
                }}
            />
        </Dropdown>
    );
};

export default InputWithList;