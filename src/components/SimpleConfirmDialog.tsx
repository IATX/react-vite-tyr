import React from 'react';
import { Button, Box, Collapse, Typography, Slide, Modal, Stack } from '@mui/material';

import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';

// 定义 props 的接口，确保类型安全
interface ConfirmProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    children: React.ReactNode;
}

const Confirm: React.FC<ConfirmProps> = ({ open, onConfirm, onCancel, children }) => {
    if (!open) {
        return null;
    }

    return (
        // 使用一个 Box 作为 Confirm 组件的根容器
        <Modal
      open={open}
      onClose={onCancel}
      // 关键：隐藏背景遮罩
      
      slotProps={{
        backdrop: {
          
        },
      }}
    >
            <Slide direction="up" in={open} mountOnEnter unmountOnExit>
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 10,
                        left: 'calc((100% - 40%) / 2)',
                        width: '40%',
                        maxWidth: '600px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: '#fff',
                        boxShadow: 3,
                        zIndex: 9999,
                        borderRadius: '4px',
                        padding: '6px 16px',
                        height: '48px'
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <ContactSupportOutlinedIcon color="primary" className='text-blue-500' />
                        <Typography variant="body2">{children}</Typography>
                    </Stack>
                    {/* 右侧：按钮 */}
                    <Stack direction="row" spacing={1}>
                        <Button size="small" color="primary" onClick={onConfirm}>
                            Confirm
                        </Button>
                        <Button size="small" color="inherit" onClick={onCancel}>
                            Cancel
                        </Button>
                    </Stack>

                </Box>
            </Slide>
        </Modal>
    );
};

export default Confirm;