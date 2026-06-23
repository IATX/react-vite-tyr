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
  subtitle?: React.ReactNode,
  dialogSize?: Breakpoint | false | 'sm',
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DialogForm: React.FC<DialogFormProps> = ({ title, subtitle, open, dialogSize, onClose, children }) => {

  return (
    <Dialog
    fullWidth={true}
    maxWidth={dialogSize}
    open={open}
    onClose={() => {}}>
      <DialogTitle sx={{ pr: 6 }}>
        <span className="block text-md font-semibold text-slate-800">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block text-xs font-normal text-slate-500">{subtitle}</span>
        ) : null}
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