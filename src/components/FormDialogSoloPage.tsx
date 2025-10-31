import React from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

interface DialogFormProps {
  title: string,
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DialogForm: React.FC<DialogFormProps> = ({ title, open, onClose, children }) => {
  
  return (
    <Dialog open={open} onClose={() => {}}>
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