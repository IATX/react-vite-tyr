import React, { useState } from 'react';
import {
    TextField,
    Button,
    RadioGroup,
    FormControlLabel,
    Radio,
    Typography,
    Paper,
    Stack,
    FormControl,
    FormLabel,
    ThemeProvider,
    InputAdornment,
    Tooltip,
} from '@mui/material';

import TextIcon from '@mui/icons-material/ModeEditOutlineRounded';
import TextareaIcon from '@mui/icons-material/EditNoteRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import theme from '../theme/tyr';
import PasswordInput from '../components/PasswordInput';
import SimpleConfirmDialog from '../components/SimpleConfirmDialog';
import axiosRequester, { requesterConfig } from '../components/AxiosRequester';
import { useAlert } from '../components/AlertContext';
import { useSession } from '../authority/SessionContext';

interface ProfileFormProps {
    onSubmit?: () => void;
    onCancel?: () => void;
}

// Define the type of form data
interface FormDataType {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

// Define the type of validation results and provide detailed feedback
interface PasswordValidationResult {
    isValid: boolean;
    minLength: boolean;
    hasNumber: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasSpecial: boolean;
}


// Defines the type of error message
type ErrorsType = Partial<FormDataType>;

const groupCardStyle = "border-b border-gray-900/10 pt-6 pb-12";
const groupTitleStyle = "text-base/7 font-semibold text-gray-900";
const groupDescriptionStyle = "mt-1 text-sm/6 text-gray-600";
const groupContentStyle = "mt-1 grid grid-cols-1 gap-x-6 gap-y-8 grid-cols-12 sm:grid-cols-12";
const oneColumnStyle = "col-span-6 sm:col-span-6";
const oneRowStyle = "col-span-full sm:col-span-12 sm:col-span-12";
const labelStyle = "block text-sm/6 font-medium text-gray-900";
const submitStyle = "rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";
const cancelStyle = "rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold shadow-xs hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600";

const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit, onCancel }) => {
    const bpcApiUrl = import.meta.env.VITE_JET_ASP_BPC_API;

    const { token } = useSession();
    const { showAlert } = useAlert();

    const [formData, setFormData] = useState<FormDataType>({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<ErrorsType>({});
    const [disabledAction, setDisabledAction] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: ErrorsType = {};
        let isValid = true;

        if (!formData.oldPassword) {
            newErrors.oldPassword = 'Field is required.';
            isValid = false;
        } else if (!formData.newPassword) {
            newErrors.newPassword = 'Field is required.';
            isValid = false;
        } else if (formData.oldPassword === formData.newPassword) {
            newErrors.newPassword = 'Same as the old password.';
            isValid = false;
        } else if (formData.newPassword && !validatePassword(formData.newPassword).isValid) {
            newErrors.newPassword = 'Does not meet password strength rules.';
            isValid = false;
        } else if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Field is required.';
            isValid = false;
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'The two new passwords entered are inconsistent.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    /**
     * Verify that the password meets the specified strength rules.
     * More than 8 characters, must contain numbers, English letters and special characters.
     *
     * @param password The password string that needs to be verified.
     * @returns An object containing detailed validation results.
     */
    const validatePassword = (password: string): PasswordValidationResult => {
        // At least 8 digits
        const minLength = password.length >= 8;

        // Must contain at least one number
        const hasNumber = /[0-9]/.test(password);

        // Must contain at least one uppercase letter
        const hasUppercase = /[A-Z]/.test(password);

        // Must contain at least one lowercase letter
        const hasLowercase = /[a-z]/.test(password);

        // Must contain at least one special character
        // Define a set of common special characters
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        const isValid = minLength && hasNumber && hasUppercase && hasLowercase && hasSpecial;

        return {
            isValid,
            minLength,
            hasNumber,
            hasUppercase,
            hasLowercase,
            hasSpecial
        };
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
        // Clear errors related to fields
        if (errors[name as keyof FormDataType]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name as keyof FormDataType]: undefined,
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            setIsConfirmOpen(true);
        }
    };

    const handleUpdatePassword = () => {
        setDisabledAction(true);

        let cfg = requesterConfig(token);

        cfg.useForm();

        const client = axiosRequester(cfg);

        client
            .post(bpcApiUrl + '/password/update', {
                'oldPassword' : formData.oldPassword,
                'newPassword' : formData.newPassword 
            }).then((res) => {
                if (res.data.data) {
                    onSubmit?.();
                } else {
                    showAlert('The old password is incorrect', 'warning');
                }
            }).catch((error) => {
                showAlert('Api service exception.', 'error');
            }).finally(() => {
                setDisabledAction(false);
            });
    }

    return (
        <ThemeProvider theme={theme}>
            <form id="user_password_edit" onSubmit={handleSubmit}>
                <div className="space-y-12" style={{ width: '320px' }}>
                    <div className={groupCardStyle}>
                        <div className={groupContentStyle}>
                            <div className={oneRowStyle}>
                                <label htmlFor="oldPassword" className={labelStyle}>
                                    Old password
                                </label>
                                <div className="mt-2">
                                    <FormControl fullWidth>
                                        <PasswordInput
                                            id="oldPassword"
                                            name="oldPassword"
                                            value={formData.oldPassword || ''}
                                            onChange={handleInputChange}
                                            size="small"
                                            variant="outlined"
                                            error={errors.oldPassword ? true : false}
                                            helperText={errors.oldPassword}
                                        />
                                    </FormControl>
                                </div>
                            </div>
                            <div className={oneRowStyle}>
                                <label htmlFor="newPassword" className={labelStyle}>
                                    New password
                                    <Tooltip title={'More than 8 characters, must contain numbers, uppercase and lowercase English letters and special characters'} arrow>
                                        <InfoOutlinedIcon className='pl-1' sx={{ fontSize: '1.25rem' }}></InfoOutlinedIcon>
                                    </Tooltip>
                                </label>
                                <div className="mt-2">
                                    <FormControl fullWidth>
                                        <PasswordInput
                                            id="newPassword"
                                            name="newPassword"
                                            value={formData.newPassword || ''}
                                            onChange={handleInputChange}
                                            size="small"
                                            variant="outlined"
                                            error={errors.newPassword ? true : false}
                                            helperText={errors.newPassword}
                                        />
                                    </FormControl>
                                </div>
                            </div>
                            <div className={oneRowStyle}>
                                <div className={oneRowStyle}>
                                    <label htmlFor="confirmPassword" className={labelStyle}>
                                        Confirm new password
                                    </label>
                                    <div className="mt-2">
                                        <FormControl fullWidth>
                                            <PasswordInput
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword || ''}
                                                onChange={handleInputChange}
                                                size="small"
                                                variant="outlined"
                                                error={errors.confirmPassword ? true : false}
                                                helperText={errors.confirmPassword}
                                            />
                                        </FormControl>
                                    </div>

                                </div>
                            </div>


                        </div>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button type="button" disabled={disabledAction} className={cancelStyle}
                        onClick={() => {
                            onCancel?.();
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={disabledAction}
                        type="submit"
                        className={submitStyle}>
                        Update
                    </button>
                </div>
            </form>
            <SimpleConfirmDialog open={isConfirmOpen} onConfirm={() => { handleUpdatePassword(); setIsConfirmOpen(false); }} onCancel={() => { setIsConfirmOpen(false) }}>
                Confirm update the password?
            </SimpleConfirmDialog>
        </ThemeProvider>
    );
};

export default ProfileForm;