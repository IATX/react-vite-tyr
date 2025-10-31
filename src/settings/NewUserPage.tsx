import React from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

// 定义 props 的接口，确保类型安全
interface DialogFormProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DialogForm: React.FC<DialogFormProps> = ({ open, onClose, children }) => {
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
   
  };

  const handleSubmit = () => {
   
    
  };

  return (
    <Dialog open={open} onClose={() => {}}>
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogForm;