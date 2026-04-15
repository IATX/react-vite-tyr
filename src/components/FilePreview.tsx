import React, { useState } from 'react';
// MUI 组件
import {
    Dialog, DialogTitle, DialogContent,
    IconButton, Tooltip, Typography, Button,
    Box
} from '@mui/material';
// MUI 图标
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

// 1. 定义 Props 契约
interface FilePreviewProps {
    fileUrl: string;
    title?: string; // 可选的标题
}

// 2. 核心逻辑：获取文件扩展名 (Sampling)
const getFileExtension = (url: string): string => {
    if (!url) return '';
    // 移除 URL 里的查询参数
    const cleanUrl = url.split('?')[0];
    // 移除结尾的斜杠
    const normalizedUrl = cleanUrl.endsWith('/') ? cleanUrl.slice(0, -1) : cleanUrl;
    const parts = normalizedUrl.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
};

// 3. 预览组件实现
const FilePreview: React.FC<FilePreviewProps> = ({ fileUrl, title }) => {
    const [open, setOpen] = useState(false);
    const fileExt = getFileExtension(fileUrl);
    const displayTitle = title || `文件预览 (${fileExt.toUpperCase()})`;

    // 支持预览的类型集合
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileExt);
    const isPdf = fileExt === 'pdf';

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // 4. 预览内容的“混音”逻辑 (根据类型采样)
    const renderPreviewContent = () => {
        if (!fileUrl) return <Typography>文件地址错误。</Typography>;

        if (isImage) {
            // 🌟 TailwindCSS 处理：最大宽高对齐
            return (
                <div className="flex justify-center items-center w-full h-full p-2 bg-gray-50 rounded">
                    <img
                        src={fileUrl}
                        alt={displayTitle}
                        className="max-w-full max-h-[75vh] object-contain shadow-md"
                    />
                </div>
            );
        }

        if (isPdf) {
            // 🌟 TailwindCSS 处理：强制高宽比例
            return (
                <iframe
                    src={`${fileUrl}#toolbar=0`} // #toolbar=0 隐藏 PDF 默认工具栏
                    title={displayTitle}
                    className="w-full h-[75vh] border-none rounded shadow-inner"
                />
            );
        }

        // 其他类型：提供下载
        return (
            <div className="flex flex-col justify-center items-center w-full h-[50vh] p-8 bg-gray-100 rounded border-2 border-dashed border-gray-300">
                <InsertDriveFileIcon className="w-16 h-16 text-gray-400 mb-4" style={{ fontSize: '4rem' }} />
                <Typography variant="body1" className="text-gray-600 mb-4 text-center">
                    此文件类型 ({fileExt.toUpperCase()}) 不支持直接预览，请下载查看。
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<GetAppIcon />}
                    href={fileUrl}
                    download
                    className="shadow"
                >
                    下载文件
                </Button>
            </div>
        );
    };

    return (
        <Box>
            {/* 外部触发器 (MUI 按钮) */}
            <Button
                variant="text"
                onClick={handleClickOpen}
                startIcon={isImage ? <Tooltip title="预览图片"><ImageIcon /></Tooltip> : <Tooltip title="预览文件"><InsertDriveFileIcon /></Tooltip>}
                sx={{
                    textTransform: 'none', // 防止字母自动大写
                    fontSize: '0.875rem',  // 对应 text-sm
                    fontWeight: 500,       // 对应 font-medium
                    padding: '4px 8px',
                    '&:hover': {
                        color: 'primary.main', // 对应 hover:text-blue-600
                        backgroundColor: 'transparent', // 如果是 text 模式不想背景变色
                    },
                    '& .MuiButton-startIcon': {
                        marginRight: '4px', // 对应 gap-1
                        '& svg': { fontSize: 14 } // 图标大小
                    }
                }}
            >
                {isImage ? '预览图片' : '查看文件'}
            </Button>

            {/* 预览 Dialog (MUI 容器) */}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="lg" // 🌟 MUI 控制最大宽度
                fullWidth
                scroll="paper"
                aria-labelledby="file-preview-dialog-title"
                className="backdrop-blur-[1px]" // TailwindCSS 处理背景模糊
            >
                {/* Dialog 标题栏 - 极致压缩版 */}
                <DialogTitle
                    id="file-preview-dialog-title"
                    // p-2 让整个标题栏高度更窄，border-b 控制线条感
                    className="flex justify-between items-center p-3 border-b m-0 bg-white"
                >
                    <Typography
                        component="span"
                        // text-sm 对应 14px，font-normal 减少视觉压迫
                        className="text-base font-normal truncate max-w-[80%] pl-1"
                    >
                        {displayTitle}
                    </Typography>

                    <div className="flex items-center gap-0">
                        
                        {/* 关闭按钮 */}
                        <Tooltip title="关闭预览">
                            <IconButton
                                onClick={handleClose}
                                size="small"
                                className="p-0.5"
                            >
                                <CloseIcon
                                    sx={{ fontSize: 18 }}
                                    className="text-gray-600 hover:text-red-500 transition-colors"
                                />
                            </IconButton>
                        </Tooltip>
                    </div>
                </DialogTitle>

                {/* Dialog 内容区域 */}
                <DialogContent className="p-0 overflow-hidden bg-gray-50 flex justify-center items-center relative">
                    <div className="w-full h-full min-h-[65vh] flex justify-center items-center p-4">
                        {renderPreviewContent()}
                    </div>

                    {/* 3. 右下角微型操作盘 */}
                    {/* 使用 bottom-4 right-4 保持适当边距 */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
                        <div className="flex items-center gap-1 p-1 px-2 bg-gray-900/80 backdrop-blur-lg rounded-full shadow-2xl border border-white/10">
                            <Tooltip title="下载文件" arrow placement="top">
                                <Button
                                    onClick={() => window.open(fileUrl, '_blank')}
                                    className="min-w-0 text-white/80 hover:text-white transition-colors"
                                >
                                    <GetAppIcon sx={{ fontSize: 20 }} />
                                    <span className="ml-1 text-xs">下载</span>
                                </Button>
                            </Tooltip>

                            <div className="w-[1px] h-5 bg-white/20" />

                            <Tooltip title="关闭预览" arrow placement="top">
                                <Button
                                    onClick={handleClose}
                                    className="min-w-0 text-white/80 hover:text-red-400 transition-colors"
                                >
                                    <CloseIcon sx={{ fontSize: 20 }} />
                                    <span className="ml-1 text-xs">关闭</span>
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default FilePreview;