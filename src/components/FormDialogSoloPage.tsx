import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  type Breakpoint,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

interface DialogFormProps {
  title: string,
  dialogSize?: Breakpoint | false | 'sm',
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DialogForm: React.FC<DialogFormProps> = ({ title, open, dialogSize, onClose, children }) => {
  
  return (
    <Dialog 
    fullWidth={true} 
    maxWidth={dialogSize}
    open={open} 
    onClose={() => {}}>
      <DialogTitle>{title}
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon sx={{ fontSize: '1rem' }}/>
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default DialogForm;