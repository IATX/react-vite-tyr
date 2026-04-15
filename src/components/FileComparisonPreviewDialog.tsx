import React, { useState, type ReactNode, useCallback, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent,
    IconButton, Tooltip, Typography, Button, Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import QuickPinchZoom, { make3dTransformValue } from 'react-quick-pinch-zoom';

interface FileComparisonPreviewProps {
    label?: string;
    fileUrl: string;
    title?: string;
    children?: ReactNode;
    // 🌟 新增：受控属性
    open?: boolean;
    onClose?: () => void;
}

const getFileExtension = (url: string): string => {
    if (!url) return '';
    const cleanUrl = url.split('?')[0];
    const parts = cleanUrl.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
};

interface UpdateProps {
    x: number;
    y: number;
    scale: number;
}

const FileComparisonPreviewDialog: React.FC<FileComparisonPreviewProps> = ({fileUrl, title, children, open: externalOpen, onClose
}) => {
    // 🌟 内部状态仅在没有外部 open 传入时生效
    const [internalOpen, setInternalOpen] = useState(false);

    // 决定最终的显示状态
    const isControlled = externalOpen !== undefined;
    const isOpen = isControlled ? externalOpen : internalOpen;

    const imgRef = useRef<HTMLImageElement>(null);
    const fileExt = getFileExtension(fileUrl);
    const displayTitle = title || `数据核对 - ${fileExt.toUpperCase()}`;
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
    const isPdf = fileExt === 'pdf';

    const handleClose = () => {
        if (isControlled && onClose) {
            onClose(); // 调用父组件的关闭逻辑
        } else {
            setInternalOpen(false);
        }
    };

    const onUpdate = useCallback(({ x, y, scale }: UpdateProps) => {
        if (imgRef.current) {
            const value = make3dTransformValue({ x, y, scale });
            imgRef.current.style.setProperty('transform', value);
        }
    }, []);

    const renderFile = () => {
        if (!fileUrl) return <Typography className="p-4">无效的文件路径</Typography>;
        if (isImage) {
            return (
                <QuickPinchZoom
                    onUpdate={onUpdate}
                    wheelScaleFactor={1.1}
                    draggableUnZoomed={false}
                    containerProps={{
                        className: 'w-full h-full cursor-grab active:cursor-grabbing flex justify-center items-start'
                    }}
                >
                    <img
                        ref={imgRef}
                        src={fileUrl}
                        className="max-w-full h-auto object-contain shadow-lg will-change-transform"
                        alt="preview"
                    />
                </QuickPinchZoom>
            );
        }
        if (isPdf) return <iframe src={`${fileUrl}#toolbar=1`} className="w-full h-full border-none p-2" title="pdf" />;
        return <div className="text-center p-10"><InsertDriveFileIcon sx={{ fontSize: 60, color: '#ccc' }} /><p>不支持预览</p></div>;
    };

    return (
        <Box>
            <Dialog
                open={isOpen} // 使用计算后的状态
                onClose={handleClose}
                maxWidth="xl"
                fullWidth
                scroll="paper"
            >
                <DialogTitle className="flex justify-between items-center p-2 px-4 border-b bg-white">
                    <Typography className="text-base font-medium truncate">
                        {displayTitle}
                    </Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </DialogTitle>

                <DialogContent className="p-0 flex h-[85vh] overflow-hidden">
                    <div className="w-[50%] h-full flex flex-col relative border-r overflow-hidden">
                        <div className="flex-1 flex justify-center items-start overflow-hidden">
                            {renderFile()}
                        </div>
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
                            <div className="flex items-center gap-1.5 p-1 px-2 bg-gray-900/80 backdrop-blur-lg rounded-full shadow-2xl border border-white/10">
                                <Tooltip title="下载原始文件" arrow placement="top">
                                    <Button
                                        onClick={() => window.open(fileUrl, '_blank')}
                                        className="min-w-0 px-3 py-1 text-white/80 hover:text-white transition-colors"
                                    >
                                        <GetAppIcon sx={{ fontSize: 18 }} />
                                        <span className="ml-1 text-xs font-medium">下载</span>
                                    </Button>
                                </Tooltip>
                                <div className="w-[1px] h-4 bg-white/20" />
                                <Tooltip title="关闭预览" arrow placement="top">
                                    <Button
                                        onClick={handleClose}
                                        className="min-w-0 px-3 py-1 text-white/80 hover:text-red-400 transition-colors"
                                    >
                                        <CloseIcon sx={{ fontSize: 18 }} />
                                        <span className="ml-1 text-xs font-medium">关闭</span>
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <div className="w-[50%] h-full p-2 bg-white flex flex-col overflow-hidden">
                        {children || <div className="p-10 text-sm text-gray-400 text-center">暂无数据</div>}
                    </div>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default FileComparisonPreviewDialog;