import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Fade
} from '@mui/material';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
}) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel} // Allows closing via backdrop click or Escape key
            slots={{ transition: Fade }}
            slotProps={{
                paper: {
                    sx: {
                        boxShadow: 'none',
                        borderRadius: '0.375rem',
                        width: '80%',
                        maxHeight: 435,
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
            <DialogTitle id="confirm-dialog-title" className="font-semibold text-sm">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="confirm-dialog-description" className="text-sm">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="inherit" sx={{textTransform: 'none',}} >
                    {cancelText}
                </Button>
                <Button onClick={onConfirm} color="primary" autoFocus sx={{textTransform: 'none',}}>
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;

{/** Usage Examples
// Make sure you have the correct from location.  
import { useConfirm } from '../components/useConfirmDialog';

// Using confirm dialog component
const { confirm } = useConfirm();

const submitFormData = async () => {
    const confirmed = await confirm({
        title: 'Prompt',
        message: 'Comfirm submission?',
        confirmText: 'Yes',
        cancelText: 'Cancel'
    });

    if (confirmed) {
        // Make some API calls
    }
}            
    
*/}