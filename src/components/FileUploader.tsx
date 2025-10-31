import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import axios, { type AxiosProgressEvent, type Canceler } from 'axios';
import {
    Box,
    Button,
    Typography,
    IconButton,
    Paper,
    List,
    ListItem,
    ListItemText,
    LinearProgress,
    Tooltip,
    Link,
    Dialog,
    DialogActions,
    Modal,
    Fade,
    DialogTitle,
    DialogContent,
    DialogContentText,
    Alert,
    FormHelperText,
} from '@mui/material';

import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    InsertDriveFile as InsertDriveFileIcon,
    Stop as StopIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Close as CloseIcon,
    AutoFixHighOutlined
} from '@mui/icons-material';

import { useSession } from '../authority/SessionContext';

import { useAlert } from './AlertContext';
import axiosRequester, { requesterConfig } from './AxiosRequester';

// 定义文件状态和类型
type FileStatus = 'idle' | 'uploading' | 'completed' | 'failed' | 'stopped';

// 自定义的文件类型，明确包含所有必需的属性
interface UploadFile {
    origin: File,
    rtn: string, // Related object name
    rfn: string, // Related object field name
    rfpk: string, // Related object primary id
    cfn: string, // The set file name
    id: string;
    name: string;
    size: number;
    type: string;
    lastModified: number;
    status: FileStatus;
    progress: number;
    uploadController: AbortController | null;
    // 以下是 File 接口的 Blob 方法
    arrayBuffer: () => Promise<ArrayBuffer>;
    slice: (start?: number, end?: number, contentType?: string) => Blob;
    stream: () => ReadableStream<Uint8Array>;
    text: () => Promise<string>;
    annexId?: String;
    previewUrl?: string;
}

interface AnnexFile {
    name: string;
    type: string;
    id: string;
    label: string,
    httpurl: string;
}

// 定义组件 props
interface FileUploaderProps {
    id?: string;
    name: string;
    label?: string;
    maxFiles?: number;
    maxFileSizeMB?: number;
    onChange?: (files: UploadFile[]) => void;
    annexFiles?: AnnexFile[];
    rtn: string;
    rfn: string;
    rfpk: string;
    cfn: string;
}

// 格式化文件大小
const formatFileSize = (bytes: number | undefined | null): string => {
    if (bytes === undefined || bytes === null || bytes === 0) {
        return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export interface FileUploaderHandles {
    validate: () => boolean;
}

const FileUploader = forwardRef<FileUploaderHandles, FileUploaderProps>(({
    id,
    name,
    label = 'File upload',
    maxFiles = 5,
    maxFileSizeMB = 10,
    rtn,
    rfn,
    rfpk,
    cfn,
    onChange,
    annexFiles,
}, ref) => {
    const { token } = useSession();
    const VITE_JET_ASP_FRC_API = import.meta.env.VITE_JET_ASP_FRC_API;

    const { showAlert } = useAlert();

    const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<AnnexFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPreviewImage, setIsPreviewImage] = useState(false);
    const [deleteFileConfirmOpen, setDeleteFileConfirmOpen] = useState(false);
    const [currentFile, setCurrentFile] = useState<UploadFile | null>(null);

    const [deleteAnnexConfirmOpen, setDeleteAnnexConfirmOpen] = useState(false);
    const [currentAnnex, setCurrentAnnex] = useState<AnnexFile | null>(null);

    const [hasError, setHasError] = useState(false);
    const [helperText, setHelperText] = useState('');

    useEffect(() => {
        setUploadedFiles(annexFiles ?? []);
    }, [annexFiles]); 

    const validate = () => {
        // 非空校验：检查 files 数组是否为空
        if (selectedFiles.length === 0) {
            setHasError(true);
            setHelperText('File is required.');
            return false; // 校验失败
        }
        setHasError(false);
        setHelperText('');
        return true; // 校验成功
    };

    useImperativeHandle(ref, () => ({
        validate,
    }));

    // 模拟上传函数
    const simulateUpload = async (file: UploadFile) => {
        const controller = new AbortController();
        const { signal } = controller;

        const formData = new FormData();

        formData.append('object', file.rtn);
        formData.append('objectFieldId', file.rfn);
        formData.append('fkId', file.rfpk);
        formData.append('cName', file.cfn);
        formData.append('file', file.origin);

        // 立即将文件状态更新为 uploading，并存储 controller
        setSelectedFiles(prev =>
            prev.map(f => (f.id === file.id ? { ...f, status: 'uploading', uploadController: controller } : f))
        );

        try {
            const response = await axios.post(VITE_JET_ASP_FRC_API + '/annex/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'grooveToken': token
                },
                signal,
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setSelectedFiles(prev =>
                        prev.map(f => (f.id === file.id ? { ...f, progress: percentCompleted } : f))
                    );
                },
            });

            // 上传成功
            setSelectedFiles(prev =>
                prev.map(f => {
                    if (f.id === file.id) {
                        return {
                            ...f,
                            status: 'completed',
                            progress: 100,
                            annexId: response.data.data.id,
                            previewUrl: response.data.data.previewUrl, // 从后端获取预览 URL
                        };
                    }
                    return f;
                })

            );
        } catch (error) {
            if (axios.isCancel(error)) {
                // console.log('上传已取消', error.message);
                showAlert('File upload Cancelled.', 'info');

                setSelectedFiles(prev =>
                    prev.map(f => (f.id === file.id ? { ...f, status: 'stopped', progress: 0 } : f))
                );
            } else {
                showAlert('File upload failed.', 'error');

                setSelectedFiles(prev =>
                    prev.map(f => (f.id === file.id ? { ...f, status: 'failed' } : f))
                );
            }
        } finally {

        }
    };

    const handleFileChange = (files: FileList | null) => {
        if (!files) return;

        const totalCurrentSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
        const maxTotalSize = maxFileSizeMB * 1024 * 1024;

        if (totalCurrentSize + Array.from(files).reduce((sum, file) => sum + file.size, 0) > maxTotalSize) {
            showAlert('The total file size cannot exceed ${maxFileSizeMB}MB!', 'error');
            return;
        }

        const newFiles: UploadFile[] = [];

        Array.from(files).forEach(file => {
            if (selectedFiles.length + newFiles.length >= maxFiles) {
                showAlert('The maximum number of files has been reached(5 files)', 'error');

                return;
            }

            const isDuplicate = selectedFiles.some(existingFile => existingFile.name === file.name);
            const isTooLarge = file.size > 10 * 1024 * 1024;

            if (!isDuplicate && !isTooLarge) {
                const newFile: UploadFile = {
                    origin: file,
                    id: `${file.name}-${Date.now()}`,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                    status: 'idle',
                    progress: 0,
                    uploadController: null,
                    arrayBuffer: file.arrayBuffer,
                    slice: file.slice,
                    stream: file.stream,
                    text: file.text,
                    rtn: rtn,
                    rfn: rfn,
                    rfpk: rfpk,
                    cfn: cfn
                };
                newFiles.push(newFile);

                setHasError(false);
                setHelperText('');
            }
        });

        if (newFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...newFiles]);
            newFiles.forEach(file => simulateUpload(file));
        }

    };

    const handleDeleteFile = async () => {
        if (currentFile == null) {
            return;
        }

        const fileToDelete = selectedFiles.find(f => f.id === currentFile.id);

        if (!fileToDelete) {
            return;
        }

        if (fileToDelete.status === 'uploading') {
            showAlert('Uploading in progress, please stop uploading before deleting!', 'warning');
            return;
        }

        if (currentFile.annexId) {
            var cfg = requesterConfig(token);

            cfg.useJson();

            const client = axiosRequester(cfg);

            client
                .post(VITE_JET_ASP_FRC_API + '/annex/deletesoftly/' + currentFile.annexId, {}).then((res) => {
                    if (res.status === 200) {
                        if (res.data.data) {
                            const updatedFiles = selectedFiles.filter(file => file.id !== currentFile.id);
                            setSelectedFiles(updatedFiles);
                            if (onChange) onChange(updatedFiles);
                        } else {
                            showAlert('Failed to delete the file, please try again!', 'error');
                        }

                    }
                }).catch((error) => {
                    showAlert('Network service exception.', 'error');
                });
        } else {
            const updatedFiles = selectedFiles.filter(file => file.id !== currentFile.id);
            setSelectedFiles(updatedFiles);
            if (onChange) onChange(updatedFiles);
        }

        setDeleteFileConfirmOpen(false);
        setCurrentFile(null);
    };

    const handleDeleteAnnex = async () => {
        if (currentAnnex == null) {
            return;
        }

        if (currentAnnex.id) {
            var cfg = requesterConfig(token);

            cfg.useJson();

            const client = axiosRequester(cfg);

            client
                .post(VITE_JET_ASP_FRC_API + '/annex/deletesoftly/' + currentAnnex.id, {}).then((res) => {
                    if (res.status === 200) {
                        if (res.data.data) {
                            setUploadedFiles(prevFiles => {
                                return prevFiles.filter(file => file.id !== currentAnnex.id);
                            });
                        } else {
                            showAlert('Failed to delete the annex, please try again!', 'error');
                        }

                    }
                }).catch((error) => {
                    showAlert('Network service exception.', 'error');
                });
        }

        setDeleteAnnexConfirmOpen(false);
        setCurrentAnnex(null);
    };

    const handleStopUpload = (fileId: string) => {
        const fileToStop = selectedFiles.find(f => f.id === fileId);
        if (fileToStop && fileToStop.uploadController) {
            fileToStop.uploadController.abort();
        }
    };

    const handlePreview = (file: UploadFile) => {
        if (file.previewUrl) {
            setPreviewContent(file.previewUrl);
            setPreviewTitle(file.name);
            setPreviewOpen(true);
            setIsPreviewImage(file.type.startsWith('image/'));
        } else {
            showAlert('No preview url.', 'error');
        }
    };

    const handleAnnexPreview = (file: AnnexFile) => {
        if (file.httpurl) {
            setPreviewContent(file.httpurl);
            setPreviewTitle(file.label);
            setPreviewOpen(true);
            setIsPreviewImage(file.type.startsWith('image/'));
        } else {
            showAlert('No preview url.', 'error');
        }
    };

    const handleClosePreview = () => {
        setPreviewOpen(false);
        setPreviewContent(null);
        setPreviewTitle('');
    };


    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileChange(e.dataTransfer.files);
    };

    // 通过 ref 暴露方法给父组件
    useImperativeHandle(ref, () => ({
        getFiles: () => selectedFiles,
        clearFiles: () => setSelectedFiles([]),
        validate: () => validate(),
    }));

    return (
        <>

            <Box className="flex flex-col w-full">
                <input type="hidden" id={id} name={name} value={JSON.stringify(selectedFiles.map(f => f.id))} />
                <Paper
                    variant="outlined"
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    className={`w-full p-12 text-center transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                    ${hasError ? 'border-red-500' : ''}
                    `}
                >
                    <input
                        type="file"
                        hidden
                        multiple
                        ref={fileInputRef}
                        onChange={(e) => {
                            handleFileChange(e.target.files);
                            e.target.value = '';
                        }}
                        accept="*"
                    />
                    <CloudUploadIcon className="text-gray-400 text-6xl mb-4" />
                    <Typography variant="body1" className="text-gray-500">
                        Drag and drop  or
                        <Tooltip title={label} arrow>
                            <Button
                                size="small"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                upload files
                            </Button>
                        </Tooltip>
                    </Typography>
                    <Typography variant="body1" className="text-gray-500">
                        DOC, IMAGE, ZIP up to {maxFileSizeMB}MB, up to {maxFiles} files
                    </Typography>
                </Paper>
                {hasError && <FormHelperText error>{helperText}</FormHelperText>}
                {uploadedFiles && uploadedFiles.length > 0 && (
                    <Box className="w-full">
                        <List>
                            {uploadedFiles.map((file) => (
                                <ListItem key={file.id} className="flex-col items-start mb-2 rounded-md bg-gray-50">
                                    <Box className="flex w-full items-center">
                                        <Box className="flex items-center flex-grow">
                                            <InsertDriveFileIcon className="text-blue-500 mr-2" />
                                            <ListItemText
                                                primary={
                                                    file.httpurl ? (
                                                        <Link
                                                            component="button"
                                                            type="button"
                                                            variant="body1"
                                                            onClick={() => handleAnnexPreview(file)}
                                                            underline="hover"
                                                            sx={{ textTransform: 'none', textAlign: 'left' }}
                                                        >
                                                            <Typography component="span" noWrap>
                                                                {file.label}
                                                            </Typography>
                                                        </Link>
                                                    ) : (
                                                        <Typography component="span" noWrap>
                                                            {file.label}
                                                        </Typography>
                                                    )
                                                }
                                                className="overflow-hidden"
                                            />
                                        </Box>
                                        <Box className="ml-2 flex-shrink-0">
                                            <IconButton edge="end" aria-label="delete" className='ml-1 mr-1' onClick={() => {
                                                setDeleteAnnexConfirmOpen(true);
                                                setCurrentAnnex(file);
                                            }}>
                                                <DeleteIcon className="text-lg text-gray-500 hover:text-red-700" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
                {selectedFiles.length > 0 && (
                    <Box className="w-full">
                        <List>
                            {selectedFiles.map((file) => (
                                <ListItem key={file.id} className="flex-col items-start mb-2 rounded-md bg-gray-50">
                                    <Box className="flex w-full items-center">
                                        <Box className="flex items-center flex-grow">
                                            <InsertDriveFileIcon className="text-blue-500 mr-2" />
                                            <ListItemText
                                                primary={
                                                    // **修改点：根据文件状态和 URL 来渲染 Link 或 Typography**
                                                    file.status === 'completed' && file.previewUrl ? (
                                                        <Link
                                                            component="button"
                                                            type="button"
                                                            variant="body1"
                                                            onClick={() => handlePreview(file)}
                                                            underline="hover"
                                                            sx={{ textTransform: 'none', textAlign: 'left' }}
                                                        >
                                                            <Typography component="span" noWrap>
                                                                {file.name}
                                                            </Typography>
                                                        </Link>
                                                    ) : (
                                                        <Typography component="span" noWrap>
                                                            {file.name}
                                                        </Typography>
                                                    )
                                                }
                                                secondary={formatFileSize(file.size)}
                                                className="overflow-hidden"
                                            />
                                        </Box>
                                        <Box className="ml-2 flex-shrink-0">
                                            {file.status === 'uploading' && (
                                                <IconButton edge="end" aria-label="stop" onClick={() => handleStopUpload(file.id)}>
                                                    <StopIcon className="text-lg text-red-500 hover:text-red-700" />
                                                </IconButton>
                                            )}
                                            {file.status === 'completed' && <CheckCircleIcon className="text-lg text-green-500" />}
                                            {file.status === 'failed' && <Tooltip title="Upload failed" placement="bottom"><ErrorIcon className="text-lg text-red-500" /></Tooltip>}
                                            {file.status === 'stopped' && <Tooltip title="Upload stopped" placement="bottom"><ErrorIcon className="text-lg text-orange-500" /></Tooltip>}
                                            {file.status !== 'uploading' && (
                                                <IconButton edge="end" aria-label="delete" className='ml-1 mr-1' onClick={() => {
                                                    setDeleteAnnexConfirmOpen(true);
                                                    setCurrentFile(file);
                                                }}>
                                                    <DeleteIcon className="text-lg text-gray-500 hover:text-red-700" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Box>
                                    {file.status === 'uploading' && (
                                        <Box className="w-full mt-2">
                                            <LinearProgress variant="determinate" value={file.progress} />
                                        </Box>
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

            </Box>
            {/* File Preview Dialog Box */}
            <Dialog
                open={previewOpen}
                onClose={handleClosePreview}
                slots={{ transition: Fade }}
                slotProps={{
                    paper: {
                        sx: {
                            boxShadow: 'none',
                            borderRadius: '0.375rem',
                            width: isPreviewImage ? 'auto' : '80%',
                            maxWidth: isPreviewImage ? 600 : 'none',
                            height: isPreviewImage ? 'auto' : '80vh',
                        },
                    },
                    transition: {
                        timeout: 400,
                    },
                    backdrop: {
                        sx: {
                            backgroundColor: 'rgba(50 56 62 / 0.25)',
                            backdropFilter: 'blur(8px)',
                        },
                    },
                }}
            >
                <DialogTitle>
                    {previewTitle}

                    <IconButton
                        aria-label="close"
                        onClick={handleClosePreview}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon sx={{ width: '.875rem', height: '.875rem' }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers={true} sx={{
                    borderTop: 'none',
                    borderBottom: 'none',
                    display: 'flex',
                }}>
                    {previewContent && isPreviewImage ? (
                        <img
                            src={previewContent}
                            alt="Preview"
                            style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                        />
                    ) : (
                        <iframe
                            src={previewContent || ''}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title="file-preview"
                        />
                    )}

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePreview} autoFocus>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={deleteFileConfirmOpen}
                onClose={() => { setDeleteFileConfirmOpen(false); setCurrentFile(null); }}
                slots={{ transition: Fade }}
                slotProps={{
                    paper: {
                        sx: {
                            boxShadow: 'none',
                            borderRadius: '0.375rem',
                            width: '80%',
                            maxHeight: 435
                        },
                    },
                    transition: {
                        timeout: 400,
                    },
                    backdrop: {
                        sx: {
                            backgroundColor: 'rgba(50 56 62 / 0.25)',
                            backdropFilter: 'blur(8px)',
                        },
                    },
                }}
                maxWidth="xs"
                keepMounted
            >
                <DialogTitle id="confirm-dialog-title" className='font-semibold'>{'Info'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-dialog-description">
                        {'Confirm to delete the file?'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setDeleteFileConfirmOpen(false); setCurrentFile(null);
                    }} color="inherit">
                        {'Cancel'}
                    </Button>
                    <Button onClick={handleDeleteFile} color="primary" autoFocus>
                        {'Yes'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={deleteAnnexConfirmOpen}
                onClose={() => { setDeleteAnnexConfirmOpen(false); setCurrentAnnex(null); }}
                slots={{ transition: Fade }}
                slotProps={{
                    paper: {
                        sx: {
                            boxShadow: 'none',
                            borderRadius: '0.375rem',
                            width: '80%',
                            maxHeight: 435
                        },
                    },
                    transition: {
                        timeout: 400,
                    },
                    backdrop: {
                        sx: {
                            backgroundColor: 'rgba(50 56 62 / 0.25)',
                            backdropFilter: 'blur(8px)',
                        },
                    },
                }}
                maxWidth="xs"
                keepMounted
            >
                <DialogTitle id="confirm-dialog-title" className='font-semibold'>{'Info'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-dialog-description">
                        {'Confirm to delete the file?'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setDeleteAnnexConfirmOpen(false); setCurrentAnnex(null);
                    }} color="inherit">
                        {'Cancel'}
                    </Button>
                    <Button onClick={handleDeleteAnnex} color="primary" autoFocus>
                        {'Yes'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
});

export default FileUploader;