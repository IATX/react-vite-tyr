import React, { createContext, useContext, useState, type ReactNode, useRef } from 'react';
import ConfirmDialog from './ConfirmDialog';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

interface ConfirmDialogProviderProps {
    children: ReactNode;
}

export const ConfirmDialogProvider: React.FC<ConfirmDialogProviderProps> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({
        title: '',
        message: '',
    });
    // Using useRef to hold the resolve function
    const resolveRef = useRef<(value: boolean) => void>(() => {});

    const confirm = (options: ConfirmOptions): Promise<boolean> => {
        return new Promise((res) => {
            setOptions(options);
            setOpen(true);
            resolveRef.current = res;
        });
    };

    const handleConfirm = () => {
        setOpen(false);
        resolveRef.current(true);
    };

    const handleCancel = () => {
        setOpen(false);
        resolveRef.current(false);
    };

    const value = { confirm };

    return (
        <ConfirmContext.Provider value={value}>
            {children}
            <ConfirmDialog
                open={open}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                title={options.title}
                message={options.message}
                confirmText={options.confirmText}
                cancelText={options.cancelText}
            />
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (context === undefined) {
        throw new Error('useConfirm must be used within a ConfirmDialogProvider');
    }
    return context;
};