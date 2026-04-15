import React, { useState, useEffect, useRef, useImperativeHandle, useContext } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Paper,
    Box,
    TextField,
    TablePagination,
    Button,
    Popover,
    Stack,
    LinearProgress,
    Tooltip,
    Chip,
    Grid,
    styled,
    IconButton,
} from '@mui/material';
import type { CSSProperties, ReactNode } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { useTranslation } from 'react-i18next';

import axios from 'axios';
import { useAlert } from '../../../components/AlertContext';
import { useSession } from '../../../authority/SessionContext';
import { WrapSoloFormNode } from '../../../components/WrapNode';
import Parameterization from '../../../components/RenderComponent';
import EditDataDialog from '../../../components/FormDialogSoloPage';
import AddDataDialog from '../../../components/FormDialogSoloPage';
import { useConfirm } from '../../../components/useConfirmDialog';
import { AppContext } from '../../../context/AppContext';

// Tailwind CSS is configured to use !important to override MUI's styles.
// Make sure your tailwind.config.js has `important: true`.
// You will also need to have `faker-js` installed for the mock data.

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    boxShadow: 'unset',
    textAlign: 'center',
    color: (theme.vars ?? theme).palette.text.secondary,
    ...theme.applyStyles('dark', {
        backgroundColor: '#1A2027',
    }),
}));

// --- Data Types and Service APIs ---
// -----------------------------
export interface Data {
    pkWxchezty: number,
			lgourzqr: string,
			kaodyext: string,
			zymjxejd: string,
			nplhjcqw: string,
			gwqejsjc: number,
			iifqgvji: number,
			pcczlucm: number,
			mhqescps: number,
}

export interface ApiResponse<T> {
    data: T[];
    total: number;
}

// --- A component that can be dragged to adjust column width ---
// -----------------------------
interface ResizeHandleProps {
    onMouseDown: (e: React.MouseEvent) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ onMouseDown }) => {
    const handleStyle: CSSProperties = {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '2px',
        height: '100%',
        cursor: 'col-resize',
        zIndex: 1,
    };

    return (
        <Box
            onMouseDown={onMouseDown}
            sx={handleStyle}
            className="bg-gray-200 hover:bg-gray-300"
        />
    );
};

type columnAlign = 'left' | 'center' | 'right';

type DataType = 'string' | 'number' | 'file' | 'sp' | 'autosp';

interface ColumnDataProp {
    id: string,
    label: string,
    minWidth: number,
    align: columnAlign,
    type: DataType;
    truncate: boolean;
    display?:boolean;
    render?: (value: any, rowData: Data, allData: Data[]) => ReactNode;
}

export interface DataTableRef {
    refreshTable: () => void;
}

const DataTable: React.ForwardRefRenderFunction<DataTableRef, {page?: number, pageSize?: number, queryParams?: any}> = (props, ref) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
    const match = useMatch('/main/trays/*');
    const isInMainArea = !!match;

    const { showAlert } = useAlert();
    const { token } = useSession();
    const { confirm } = useConfirm();
    const VITE_JET_ASP_BPC_API = import.meta.env.VITE_JET_ASP_BPC_API;
    const VITE_JET_CURRENCY_CODE = import.meta.env.VITE_JET_CURRENCY_CODE || 'GBP';
    const { setCurrentBayContent } = useContext(AppContext);

    const [loading, setLoading] = useState(true);
    const [tableData, setTableData] = useState<Data[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(props.page ?? 0);
    const [pageSize, setPageSize] = useState(props.pageSize ?? 5);


    const columnData: ColumnDataProp[] = [
    			{
		            id: 'lgourzqr', label: '商户', minWidth: 150, align: 'center', type: 'string', truncate: true, display: true 
		            				},	
    			{
		            id: 'kaodyext', label: '发电户号', minWidth: 150, align: 'center', type: 'string', truncate: true, display: true 
		            				},	
    			{
		            id: 'zymjxejd', label: '发电周期截至', minWidth: 150, align: 'center', type: 'string', truncate: true, display: true 
		            				},	
    			{
		            id: 'nplhjcqw', label: '发电周期起始', minWidth: 150, align: 'center', type: 'string', truncate: true, display: true 
		            				},	
    			{
		            id: 'gwqejsjc', label: '合计收益元', minWidth: 150, align: 'center', type: 'number', truncate: true, display: true 
		            				},	
    			{
		            id: 'iifqgvji', label: '发电量千瓦时', minWidth: 150, align: 'center', type: 'number', truncate: true, display: true 
		            				},	
    			{
		            id: 'pcczlucm', label: '上网电量千瓦时', minWidth: 150, align: 'center', type: 'number', truncate: true, display: true 
		            				},	
    			{
		            id: 'mhqescps', label: '账单金额元', minWidth: 150, align: 'center', type: 'number', truncate: true, display: true 
		            				},	
    			{
		            id: 'autosp', label: '操作', minWidth: 150, align: 'center', type: 'autosp', truncate: false, display: true, render: (val: any, rowData: Data, allData: Data[]) => {
		                return (<>
		                	<Button size='small' onClick={() => {
			                    handleEdit(rowData['pkWxchezty' as keyof Data]);
				        	}}
				        	sx={{
	                            textTransform: 'none',
	                            fontSize: '0.875rem',
	                        }}>{t('page.edit')}</Button>
		                    <Button size='small' color="error" onClick={() => {
		                        handleDelete(rowData['pkWxchezty' as keyof Data]);
		                    }}
		                    sx={{
	                            textTransform: 'none',
	                            fontSize: '0.875rem',
	                        }}>{t('page.delete')}</Button>
		                 </>);
				     }
				},
    ];

    const [queryData, setQueryData] = useState<Record<string, string>>({
    		lgourzqr: props.queryParams?.lgourzqr ?? '',
    		kaodyext: props.queryParams?.kaodyext ?? '',
    });

    const [searchConditions, setSearchConditions] = useState<Record<string, string>>({
    		lgourzqr: props.queryParams?.lgourzqr ?? '',
    		kaodyext: props.queryParams?.kaodyext ?? '',
    });

    // Stores the Chip data to be displayed eventually
    const [displayedChips, setDisplayedChips] = useState<[string, string][]>([]);

    const hasConditions = displayedChips.length > 0;

    // Popover status
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
        columnData.reduce((acc, col) => ({ ...acc, [col.id]: col.minWidth }), {})
    );

    // Manually refresh the table data list
    const refreshTable = () => {
        fetchData();
    };

    // Use useImperativeHandle to expose `refreshTable` method
    useImperativeHandle(ref, () => ({
        refreshTable,
    }));

    const fetchData = async () => {
        setLoading(true);

        const params = {
            ...searchConditions, ...{
                page: page + 1,
                limit: pageSize
            }
        };

        axios.post(VITE_JET_ASP_BPC_API + '/tablequery/listreacttable/query_ofgrem', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'grooveToken': token
            }
        }).then(response => {
            if (response.data && response.data.success) {
                setTableData(Array.isArray(response.data.data) ? response.data.data : []);

                setTotalRows(response.data.totalCount);
            } else {
                showAlert(response.data.message, 'error');
            }
        }).catch(err => {
            showAlert('Network error occurred while fetching data. Please refresh the page or try again later.', 'error');
        }).finally(() => {
            setLoading(false);
        });


    };

    useEffect(() => {
        fetchData();
    }, [page, pageSize, searchConditions]);

    const handleResize = (id: string, e: React.MouseEvent) => {
        const startX = e.clientX;
        const startWidth = columnWidths[id];

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = Math.max(startWidth + (e.clientX - startX), 50);
            setColumnWidths(prev => ({ ...prev, [id]: newWidth }));
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPageSize(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Popover related processing functions
    const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        // Update queryData state, using the immutability principle
        setQueryData(currentData => ({
            ...currentData,
            [name]: value, // Dynamically update the corresponding fields
        }));
    };

    const handleSearchSubmit = () => {
        // Create a new empty object to store the result
        const newConditions: Record<string, string> = {};

        // Iterate over queryData
        Object.entries(queryData).forEach(([key, value]) => {
            // Check if the value is not empty
            if (value) {
                // If the value is not empty, add it to the new object
                newConditions[key] = value;
            }
        });

        // Update Status
        setSearchConditions(newConditions);

        const filteredConditions = Object.entries(queryData).filter(([key, value]) => {
            return value !== null && value !== undefined && value !== '';
        });

        // Update the Chip status to be displayed
        setDisplayedChips(filteredConditions);

        handlePopoverClose();
    };

    // Methods for handling delete query conditions
    const handleDeleteCondition = (keyToRemove: string) => {
        // Create a new array without the item to be deleted
        const updatedChips = displayedChips.filter(([key]) => key !== keyToRemove);

        // Update status to remove Chip
        setDisplayedChips(updatedChips);

        setSearchConditions(currentData => {
            // Using dynamic key destructuring and rest syntax
            // This syntax removes a dynamic key from an object and collects the remainder into a new object.
            const { [keyToRemove]: _, ...updatedData } = currentData;

            // Update the state to this new object
            return updatedData;
        });

        setQueryData(currentData => {
            // Use destructuring syntax to remove the key to be deleted and put the remaining key-value pairs into a new object
            const { [keyToRemove]: _, ...updatedData } = currentData;

            // Return a new object to update the state
            return updatedData;
        });
    };
    
    const handleEdit = (val: any) => {
		if (isInMainArea) {
            setCurrentBayContent({
                title: '固定电价账单表单页面',
                subheader: '固定电价账单表单页面',
                elem: Parameterization('ViewTbWxcheztyNlyrlw', {
                    key: 'ViewTbWxcheztyNlyrlw',
                    initialData: {
                       'pkWxchezty': val
                    },
                    onCancel: (formData: any) => {
                        setCurrentBayContent({
                            title: '固定电价账单列表',
                            subheader: '固定电价账单列表',
                            elem: Parameterization('QueryOfgrem', {
								 page: page,
                                 pageSize: pageSize,
                                 queryParams: queryData
                            }),
                            type: 'query'
                        });

                        navigate('/main/trays');
                    },
                    onSubmit: (formData: any) => {
                        setCurrentBayContent({
                            title: '固定电价账单列表',
                            subheader: '固定电价账单列表',
                            elem: Parameterization('QueryOfgrem', {
								 page: page,
                                 pageSize: pageSize,
                                 queryParams: queryData
                            }),
                            type: 'query'
                        });

                        navigate('/main/trays');
                    }
                }),
                type: 'view'
            });

            navigate('/main/trays');
        } else {
            navigate('app/ilzpxj/view/ViewTbWxcheztyNlyrlw', {
                state: {
                    key: 'ViewTbWxcheztyNlyrlw',
                    initialData: {
                       'pkWxchezty': val
                    },
                    onCancel: (formData: any) => {
                        navigate('app/ilzpxj/query/QueryOfgrem', {
                			state: {
                				page: page,
                                pageSize: pageSize,
                                queryParams: queryData
                			}
                		});
                    },
                    onSubmit: (formData: any) => {
                        navigate('app/ilzpxj/query/QueryOfgrem', {
                			state: {
                				page: page,
                                pageSize: pageSize,
                                queryParams: queryData
                			}
                		});
                    }
                }
            });
        }
    }

    const handleDelete = async (val: any) => {
        const confirmed = await confirm({
            title: 'Prompt',
            message: 'Confirm Deletion?',
            confirmText: 'Yes',
            cancelText: 'Cancel'
        });

        if (confirmed) {
            const formData = new FormData();

            formData.append('pkWxchezty', val);

            axios.post(VITE_JET_ASP_BPC_API + '/tableview/deleteformdata/view_tb_wxchezty_nlyrlw', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'grooveToken': token
                }
            }).then(response => {
                if (response.data && response.data.success) {
                    refreshTable();
                } else {
                    showAlert('Failed to delete data.', 'error');
                }
            }).catch(err => {
            	if(err.status === 401) {
      				showAlert(err.response.data, 'error');
            	} else {
            		showAlert('Network error occurred while deleting data. Please try again later..', 'error');
            	}
                
            }).finally(() => {
            });
        }
    }

    const qbcwjuyHandler = () => {
    		if (isInMainArea) {
	            setCurrentBayContent({
	                title: '固定电价账单表单页面',
	                subheader: '固定电价账单表单页面',
	                elem: Parameterization('ViewTbWxcheztyNlyrlw', {
	                    key: 'ViewTbWxcheztyNlyrlw',
	                    initialData: {
	                    },
	                    onCancel: (formData: any) => {
	                        setCurrentBayContent({
	                            title: '固定电价账单列表',
	                            subheader: '固定电价账单列表',
	                            elem: Parameterization('QueryOfgrem', {
									 page: page,
	                                 pageSize: pageSize,
	                                 queryParams: queryData
	                            }),
	                            type: 'query'
	                        });
	
	                        navigate('/main/trays');
	                    },
	                    onSubmit: (formData: any) => {
	                        setCurrentBayContent({
	                            title: '固定电价账单列表',
	                            subheader: '固定电价账单列表',
	                            elem: Parameterization('QueryOfgrem', {
									 page: page,
	                                 pageSize: pageSize,
	                                 queryParams: queryData
	                            }),
	                            type: 'query'
	                        });
	
	                        navigate('/main/trays');
	                    }
	                }),
	                type: 'view'
	            });
	
	            navigate('/main/trays');
	        } else {
	            navigate('app/ilzpxj/view/ViewTbWxcheztyNlyrlw', {
	                state: {
	                    key: 'ViewTbWxcheztyNlyrlw',
	                    initialData: {
	                    },
	                    onCancel: (formData: any) => {
	                        navigate('app/ilzpxj/query/QueryOfgrem', {
	                			state: {
	                				page: page,
	                                pageSize: pageSize,
	                                queryParams: queryData
	                			}
	                		});
	                    },
	                    onSubmit: (formData: any) => {
	                        navigate('app/ilzpxj/query/QueryOfgrem', {
	                			state: {
	                				page: page,
	                                pageSize: pageSize,
	                                queryParams: queryData
	                			}
	                		});
	                    }
	                }
	            });
	        }
    }

    const open = Boolean(anchorEl);
    const id = open ? 'search-popover' : undefined;

    return (
        <>
            <Box>
                {/* Search button and Popover */}
                <Box className="mb-2" sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box>
                        	<Tooltip title="固定电价账单表单" arrow>
	                            <Button
	                                variant="outlined"
	                                startIcon={<AddIcon sx={{ color: 'hsl(210, 100%, 45%);' }} />}
	                                onClick={qbcwjuyHandler}
	                                aria-describedby={'qbcwjuy'}
	                                size="small"
	                                sx={{
	                                    color: 'hsl(215, 15%, 22%)',
	                                    borderRadius: '12px',
	                                    border: '1px solid hsl(215, 15%, 89%)',
	                                    textTransform: 'capitalize'
	                                }}
	                            >
	                                {t('page.add')}
	                            </Button>
                            </Tooltip>
                        </Box>
                        <Box>
                            <Button
                                variant="outlined"
                                startIcon={<SearchIcon sx={{ color: '#9c27b0;' }} />}
                                onClick={handlePopoverOpen}
                                aria-describedby={id}
                                size="small"
                                sx={{
                                    color: 'hsl(215, 15%, 22%)',
                                    borderRadius: '12px',
                                    border: '1px solid hsl(215, 15%, 89%)',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {t('page.search')}
                            </Button>
                            <Popover
                                id={id}
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handlePopoverClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                className='mt-1'
                            >
                                <Box className="p-4">
                                    <Stack spacing={2} sx={{ width: 400 }}>
                                        <Typography className="!text-sm">Enter query conditions</Typography>
									    	<TextField
	                                            label="商户"
	                                            name="lgourzqr"
	                                            variant="outlined"
	                                            size="small"
	                                            value={queryData.lgourzqr}
	                                            onChange={handleSearchInputChange}
	                                        />
									    	<TextField
	                                            label="发电户号"
	                                            name="kaodyext"
	                                            variant="outlined"
	                                            size="small"
	                                            value={queryData.kaodyext}
	                                            onChange={handleSearchInputChange}
	                                        />
                                        <Box className="flex justify-end mt-4">
                                            <Button size="small"
                                                variant="contained"
                                                startIcon={<SearchIcon />}
                                                onClick={handleSearchSubmit}>
                                                Search
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Popover>
                        </Box>
                        {/* Middle: Query conditions */}
                        <Box>
                            {hasConditions ? (
                                <Grid container spacing={1} sx={{ maxWidth: '100%' }}>
                                    {displayedChips.map(([key, value]) => (
                                        <Chip
                                            key={key}
                                            size="small"
                                            label={value}
                                            onDelete={() => handleDeleteCondition(key)}
                                        />
                                    ))}
                                </Grid>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                   {t('page.noqueryset')}
                                </Typography>
                            )}
                        </Box>
                    </Stack>

                </Box>
                <Paper sx={{ overflowX: 'auto'}} className="grid grid-cols-1">
                    <TableContainer>
                        <Table stickyHeader className={tableData.length > 0 ? '!table-fixed' : '!table-fixed min-h-[200px]'}>
                            <TableHead>
                                <TableRow>
                                    {columnData.filter(col => col.display === true).map((col, index) => (
                                        <TableCell
                                            key={col.id}
                                            style={{ width: columnWidths[col.id] }}
                                            className="!relative !pt-2 !pb-2 !font-semibold !bg-gray-100 hover:!bg-gray-100"
                                            align={col.align as any}
                                        >
                                            {col.label}
                                            {index < columnData.length - 1 && (
                                                <ResizeHandle onMouseDown={(e) => handleResize(col.id, e)} />
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tableData.length > 0 ? (
                                    tableData.map((row) => (
                                        <TableRow key={row['paginationNumber' as keyof Data]} className="!transition-colors !duration-200 !ease-in-out hover:!bg-gray-50">
                                            {columnData.filter(col => col.display === true).map((col) => (
                                                <TableCell
                                                    key={col.id}
                                                    className={col.truncate === true ? '!truncate !py-2' : '!py-2'}
                                                    align={col.align as any}
                                                >
                                                    {/* Check for a custom render function first */}
                                                    {col.render ? (
                                                        col.render(row[col.id as keyof Data], row, tableData)
                                                    ) : (
                                                        // If no custom render function, apply the truncation logic
                                                        col.truncate ? (
                                                            <Tooltip title={row[col.id as keyof Data]} arrow>
                                                                <span>{row[col.id as keyof Data]}</span>
                                                            </Tooltip>
                                                        ) : (
                                                            // If no custom render and no truncation, display the raw data
                                                            row[col.id as keyof Data]
                                                        )
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow key={'row_0'}>
                                        <TableCell colSpan={columnData.length} className="text-center py-4">
                                            {t('page.nodata')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {loading && (
                            <Box className="w-full">
                                <LinearProgress />
                            </Box>
                        )}
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={totalRows}
                        page={page}
                        onPageChange={handlePageChange}
                        rowsPerPage={pageSize}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        rowsPerPageOptions={[5, 10, 25]}
                        labelRowsPerPage={t('page.rowsperpage')}
                    />
                </Paper>
            </Box>
        </>
    );
};

export default React.forwardRef(DataTable);