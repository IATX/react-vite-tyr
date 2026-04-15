import React, { useEffect, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import FileUploader, { type FileUploaderHandles } from '../../../components/FileUploader';
import { FetchPreloadPkId } from '../../../components/FilePreloadPkId';
import { useAlert } from '../../../components/AlertContext';
import { useSession } from '../../../authority/SessionContext';
import SimpleConfirmDialog from '../../../components/SimpleConfirmDialog';
import { useTranslation } from 'react-i18next';
import theme from '../../../theme/tyr';

import { ThemeProvider } from '@mui/material/styles';

import { FormControl, FormControlLabel, FormHelperText, MenuItem, Radio, Checkbox, RadioGroup, Select, TextField, type SelectChangeEvent, FormGroup, InputAdornment, Typography, Box, CircularProgress, ButtonGroup, Button, Tooltip } from '@mui/material';

import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { DateValidationError } from '@mui/x-date-pickers/models';

import axios from 'axios';

import InsertBeforeIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import InsertNextIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import AddIcon from '@mui/icons-material/AddCircleRounded';
import EditIcon from '@mui/icons-material/EditRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import CancelIcon from '@mui/icons-material/CancelRounded';
import PhoneIcon from '@mui/icons-material/LocalPhoneRounded';
import CurrencyPoundRounded from '@mui/icons-material/CurrencyPoundRounded';
import CurrencyYenOutlinedIcon from '@mui/icons-material/CurrencyYenOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import TextIcon from '@mui/icons-material/ModeEditOutlineRounded';
import TextareaIcon from '@mui/icons-material/EditNoteRounded';
import NumberIcon from '@mui/icons-material/Filter9PlusRounded';
import MailIcon from '@mui/icons-material/MailOutlineRounded';
import SearchIcon from '@mui/icons-material/SearchRounded';
import ListIcon from '@mui/icons-material/ListRounded';
import TreeIcon from '@mui/icons-material/AccountTreeOutlined';
import TreeSelectInput from '../../../components/TreeSelectInput';
import type { DataNode } from 'antd/es/tree';
import InputWithList from '../../../components/QuerySelectInput';
import { RowInputRenderer, type ColumnConfig } from '../../../components/RowInputRenderer';

import { WrapSoloFormNode } from '../../../components/WrapNode';
import Parameterization from '../../../components/RenderComponent';
import SettlementStatementDialog from '../../../components/FormDialogSoloPage';
import ElectricityStatisticsDialog from '../../../components/FormDialogSoloPage';
import SyncMerchantDialog from '../../../components/FormDialogSoloPage';
import BillingStandardDialog from '../../../components/FormDialogSoloPage';
import AgentPurchasedDialog from '../../../components/FormDialogSoloPage';

import { useInitialActions } from '../js/view_tb_jkywwxt_msurqp';

// Update your component props type to use this interface.
interface ViewPageProps<T> {
	readOnly?: boolean;
	initialData?: T;
	onSave?: (data: any) => void;
	onSubmit?: (data: any) => void;
	onCancel?: (data: any) => void;
}

export default function ViewPage<T extends object = { [key: string]: any }>({ readOnly, initialData, onSave, onSubmit, onCancel }: ViewPageProps<T>) {
	const { t } = useTranslation();
	const location = useLocation();
	const { state } = location;
	const navigate = useNavigate();

	const isViewReadOnly = readOnly ?? false;
	const from = state?.from;
	const fromData = state?.initialData;

	const { showAlert } = useAlert();
	const { token, isAuthenticated } = useSession();
	const bpcApiUrl = import.meta.env.VITE_JET_ASP_BPC_API;
	const VITE_JET_CURRENCY_CODE = import.meta.env.VITE_JET_CURRENCY_CODE || 'GBP';
	const [disabledAction, setDisabledAction] = useState(false);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);

	// Defines style constants for all form items
	const inputStyle = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-blue-600 sm:text-sm/6 h-9";
	const groupCardStyle = "border-b border-gray-900/10 pb-12 mx-auto max-w-2xl";
	const groupTitleStyle = "text-base/7 font-semibold text-gray-900";
	const groupDescriptionStyle = "mt-1 text-sm/6 text-gray-600";
	const groupContentStyle = "mt-6 grid grid-cols-1 gap-x-6 gap-y-8";
	const listFitCardStyle = "border-b border-gray-900/10 pb-12 mx-auto w-fit";
	const listCardStyle = "border-b border-gray-900/10 pb-12 mx-auto max-w-2xl";
	const tableStyle = "w-full table-fixed border-collapse text-sm";
	const tableCaptionStyle = "caption-top text-left pb-6 text-base/7 font-semibold text-gray-900";
	const tableThStyle = "border border-gray-200 bg-gray-50 h-[53px] text-center font-medium currentColor dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200";
	const tableTbodyStyle = "bg-white dark:bg-gray-800";
	const tableTdStyle = "border border-gray-200 h-[53px] text-center text-gray-900 dark:border-gray-600 dark:text-gray-400";
	const oneColumnStyle = "";
	const oneRowStyle = "col-span-full";
	const labelStyle = "block text-sm/6 font-medium text-gray-900";
	const uploadStyle = "mt-2 flex justify-center";
	const errorStyle = "mt-2 text-sm text-red-600";
	const submitStyle = "rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";
	const cancelStyle = "rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold shadow-xs hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600";


	// Managing form data and validation errors with useState
	const [formData, setFormData] = useState(() => {
		const defaultData = {
			pulfqxdt: '',
			jjgjedyi: '',
			bzdalzts: '',
			ldgwxltt: '',
			btvttbdp: '',
			snebfkdc: '',
			bpmyzkau: '',
			vuakirfk: '',
			fpojjtxx: '',
			ttwqults: '',
			xwizrffi: '',
			khopyxpu: '',
			csixjnag: '',
			jgeyksaw: '',
			fmjxqxwc: '',
			vjaoboid: '',
			mrpxwcnt: '',
			listNksmxs: [],
			pairhtex: '',
			pjgkgiux: '',
			enpycfbg: '',
			xfztelqt: '',
			ksrgzovo: '',
			qxjdttpx: '',
			extvgtsx: '',
			listWwgmiy: [],
			listQkhnbb: [],
			listPfovyb: [],
			pkJkywwxtl: '',
			pkEvtupesq: '',
			tableViewOPTMode: 'submit',
			formDataBin: {}
		}

		// Merge the incoming data with the default data
		return { ...defaultData, ...initialData, ...fromData };
	});

	const [focusedlistNksmxsRowId, setFocusedlistNksmxsRowId] = useState<string | null>(null);
	const [editinglistNksmxsRowId, setEditinglistNksmxsRowId] = useState<string | null>(null);
	const [isConfirmDeletionlistNksmxsRowOpen, setIsConfirmDeletionlistNksmxsRowOpen] = useState(false);
	const [focusedlistWwgmiyRowId, setFocusedlistWwgmiyRowId] = useState<string | null>(null);
	const [editinglistWwgmiyRowId, setEditinglistWwgmiyRowId] = useState<string | null>(null);
	const [isConfirmDeletionlistWwgmiyRowOpen, setIsConfirmDeletionlistWwgmiyRowOpen] = useState(false);
	const [focusedlistQkhnbbRowId, setFocusedlistQkhnbbRowId] = useState<string | null>(null);
	const [editinglistQkhnbbRowId, setEditinglistQkhnbbRowId] = useState<string | null>(null);
	const [isConfirmDeletionlistQkhnbbRowOpen, setIsConfirmDeletionlistQkhnbbRowOpen] = useState(false);
	const [focusedlistPfovybRowId, setFocusedlistPfovybRowId] = useState<string | null>(null);
	const [editinglistPfovybRowId, setEditinglistPfovybRowId] = useState<string | null>(null);
	const [isConfirmDeletionlistPfovybRowOpen, setIsConfirmDeletionlistPfovybRowOpen] = useState(false);

	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const fieldRefs = useRef<Record<string, HTMLElement>>({});

	const { defaultInitialData, isSettlementStatementDialogOpen, setIsSettlementStatementDialogOpen, settlementStatementDialogTitle, 
		presettlementStatementData, generateSettlementStatement, electricityStatisticsDialogTitle, isElectricityStatisticsDialogOpen, 
		setIsElectricityStatisticsDialogOpen, electricityStatisticsInitialData, syncMerchantDialogTitle, isSyncMerchantDialogOpen, 
		setIsSyncMerchantDialogOpen, syncMerchantInitialData, billingStandardDialogTitle, isBillingStandardDialogOpen, 
		setIsBillingStandardDialogOpen, billingStandardInitialData, agentPurchasedDialogTitle,
		isAgentPurchasedDialogOpen,
		setIsAgentPurchasedDialogOpen,
		agentPurchasedInitialData } = useInitialActions();

	useEffect(() => {
		// This effect will run whenever initialData changes
		if (formData.pkJkywwxtl !== '') {
			axios.post(bpcApiUrl + '/tableview/queryformdata/view_tb_jkywwxtl_msurqp/' + formData.pkJkywwxtl, {}, {
				headers: {
					'Content-Type': 'application/json',
					'grooveToken': token
				}
			}).then(response => {
				if (response.data && response.data.success) {
					setFormData((prevData: any) => ({
						...prevData,
						...response.data.data
					}));
				} else {
					showAlert('Server returned invalid data.', 'error');
				}
			}).catch(error => {
				if (error instanceof Error) {
					const wrapError = error as { response?: { status: number, data: any } };
					if (wrapError.response?.status == 400) {
						showAlert('Bad format request', 'error');
					} else if (wrapError.response?.status == 401) {
						showAlert(wrapError.response?.data, 'error');
					} else {
						showAlert('Load view data exception.', 'error');
					}
				}
			}).finally(() => {

			});
		} else {
			setFormData((prevData: any) => ({
				...prevData,
				...defaultInitialData
			}));
		}


	}, []);

	const handleDateError = (itemName: string, dateError: DateValidationError) => {
		switch (dateError) {
			case 'maxDate': {
				setErrors(prevErrors => ({ ...prevErrors, [itemName]: 'Please select a date in the first quarter of 2022' }));
			}
			case 'minDate': {
				setErrors(prevErrors => ({ ...prevErrors, [itemName]: 'Please select a date in the first quarter of 2022' }));
			}
			case 'invalidDate': {

				setErrors(prevErrors => ({ ...prevErrors, [itemName]: 'Your date is not valid' }));
			}

			default: {
				setErrors(prevErrors => {
					const { [itemName]: removeValue, ...newErrors } = prevErrors;

					return newErrors;
				});
			}
		}
	};

	// Unified input processing function
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prevData: any) => ({ ...prevData, [name]: value }));
		// Clear errors for the field while the user is typing
		// setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
		setErrors(prevErrors => {
			const { [name]: removeValue, ...newErrors } = prevErrors;

			return newErrors;
		});
	};

	const handleSelectChange = (e: SelectChangeEvent, options: { id: string, name: string }[], targetItemName?: string) => {
		const { name, value } = e.target;
		setFormData((prevData: any) => ({ ...prevData, [name]: value }));
		setErrors(prevErrors => {
			const { [name]: removeValue, ...newErrors } = prevErrors;

			return newErrors;
		});

		if (targetItemName) {
			const selectedOption = options.find(option => option.id === value);

			if (selectedOption) {
				setFormData((prevData: any) => ({ ...prevData, [targetItemName]: selectedOption.name }));
			}
		}
	};

	const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>, options: { id: string, name: string }[], targetItemName?: string) => {
		const { name, value } = e.target;

		setFormData((prevData: any) => ({ ...prevData, [name]: value }));
		setErrors(prevErrors => {
			const { [name]: removeValue, ...newErrors } = prevErrors;

			return newErrors;
		});

		if (targetItemName) {
			const selectedOption = options.find(option => option.id === value);

			if (selectedOption) {
				setFormData((prevData: any) => ({ ...prevData, [targetItemName]: selectedOption.name }));
			}
		}

	};

	// Unified tree input processing function
	const handleTreeInputChange = (e: any) => {
		const { idName, idValue } = e.idsTarget;
		const { nameName, nameValue } = e.namesTarget;
		setFormData((prevData: any) => ({ ...prevData, [idName]: idValue }));
		setFormData((prevData: any) => ({ ...prevData, [nameName]: nameValue }));
		// Clear errors for the field while the user is typing
		// setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
		setErrors(prevErrors => {
			const { [idName]: removeValue, ...newErrors } = prevErrors;

			return newErrors;
		});

		setErrors(prevErrors => {
			const { [nameName]: nameValue, ...newErrors } = prevErrors;

			return newErrors;
		});
	};

	const handleListInputChange = (e: any) => {
		const { idName, idValue } = e.idsTarget;
		const { nameName, nameValue } = e.namesTarget;
		setFormData((prevData: any) => ({ ...prevData, [idName]: idValue }));
		setFormData((prevData: any) => ({ ...prevData, [nameName]: nameValue }));
		// Clear errors for the field while the user is typing
		// setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
		setErrors(prevErrors => {
			const { [idName]: removeValue, ...newErrors } = prevErrors;

			return newErrors;
		});

		setErrors(prevErrors => {
			const { [nameName]: nameValue, ...newErrors } = prevErrors;

			return newErrors;
		});
	};

	/**
	 * Checks whether a comma-delimited string contains a value.
	 * @param {string | undefined | null} sourceString - Comma-delimited string, such as "apple,banana,cherry"
	 * @param {string} targetValue - The value to search for, such as "banana"
	 * @returns {boolean} - If found, returns true; otherwise returns false.
	 */
	const hasValue = (sourceString: string | null | undefined, targetValue: string): boolean => {
		// 1. Handle the case where sourceString is null or undefined
		if (sourceString === null || sourceString === undefined) {
			return false;
		}

		// 2. Split the string into an array and remove the spaces before and after each element
		const valuesArray = sourceString.split(',').map(item => item.trim());

		// 3. Check if the array contains the target value
		return valuesArray.includes(targetValue);
	};

	/**
	 * Checks if a comma-delimited string contains a value, and if so, removes it.
	 * @param {string | null | undefined} sourceString - Comma-delimited source string
	 * @param {string} targetValue - The value to find and remove
	 * @returns {string} - The new string after removing the value, or an empty string if the source string is empty.
	 */
	const removeValue = (sourceString: string | null | undefined, targetValue: string): string => {
		if (sourceString === null || sourceString === undefined || sourceString.trim() === '') {
			return '';
		}

		// 1. Split the string into an array and remove the spaces before and after each element.
		const valuesArray = sourceString.split(',').map(item => item.trim());

		// 2. Use the filter method to create a new array that does not contain the target value.
		const newArray = valuesArray.filter(item => item !== targetValue);

		// 3. Use join(',') to reassemble the new array into a comma-delimited string.
		return newArray.join(',');
	};

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, checkedObj: { id: string, name: string }, targetItemName?: string) => {
		const { name, checked } = e.target;

		if (checked) {
			let formDataVal = formData[name as keyof typeof formData].trim();

			if (!hasValue(formDataVal, checkedObj.id)) {
				setFormData((prevData: any) => ({ ...prevData, [name]: (formDataVal === '' ? checkedObj.id : (formDataVal + ',' + checkedObj.id)) }));

				if (targetItemName) {
					let targetFormDataVal = removeValue(formData[targetItemName as keyof typeof formData], checkedObj.name);

					setFormData((prevData: any) => ({ ...prevData, [targetItemName]: (targetFormDataVal === '' ? checkedObj.name : (targetFormDataVal + ',' + checkedObj.name)) }));
				}

			}
		} else {
			let formDataVal = removeValue(formData[name as keyof typeof formData], checkedObj.id);

			setFormData((prevData: any) => ({ ...prevData, [name]: formDataVal }));

			if (targetItemName) {
				let targetFormDataVal = removeValue(formData[targetItemName as keyof typeof formData], checkedObj.name);

				setFormData((prevData: any) => ({ ...prevData, [targetItemName]: (targetFormDataVal === '' ? checkedObj.name : (targetFormDataVal + ',' + checkedObj.name)) }));
			}
		}

		setErrors(prevErrors => {
			const { [name]: removeValue, ...newErrors } = prevErrors;

			return newErrors;
		});
	};

	const isEmpty = (value: any, zeroIsEmpty: boolean): boolean => {
		if (value === null || value === undefined) {
			return true;
		}

		// If it is an empty string.
		if (typeof value === 'string' && value.trim() === '') {
			return true;
		}

		// If the value is 0 and can be considered empty, return true.
		if (typeof value === 'number' && value === 0 && zeroIsEmpty) {
			return true;
		}

		return false;
	};


	const handleDateChange = (name: string, value: any) => {
		const newTimestamp = value.valueOf();

		setFormData((prevData: any) => ({
			...prevData,
			[name]: newTimestamp,
		}));

		setErrors(prevErrors => {
			const { [name]: removeValue, ...newErrors } = prevErrors;

			return newErrors;
		});
	}

	const validationRules = {
	}

	/**
	  * Recursively iterate over an object or array and trim all string property values.
	  * @param obj The object or array to trim.
	  * @returns A new object with all string attributes trimmed.
	  */
	const trimObjectValues = (obj: any): any => {
		if (obj === null || typeof obj !== 'object') {
			return obj;
		}

		if (Array.isArray(obj)) {
			return obj.map(item => trimObjectValues(item));
		}

		const trimmedObj: Record<string, any> = {};
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				const value = obj[key];
				if (typeof value === 'string') {
					trimmedObj[key] = value.trim();
				} else if (typeof value === 'object') {
					trimmedObj[key] = trimObjectValues(value);
				} else {
					trimmedObj[key] = value;
				}
			}
		}

		return trimmedObj;
	};

	const [isLoading, setIsLoading] = useState(false);
	const submitFormData = () => {
		setDisabledAction(true);
		setIsLoading(true);

		axios.post(bpcApiUrl + '/tableview/remixjsondata/view_tb_jkywwxtl_msurqp', trimObjectValues(formData), {
			headers: {
				'grooveToken': token
			}
		}).then(response => {
			if (response.data && response.data.success) {
				setFormData((prevData: any) => ({
					...prevData,
					pkJkywwxtl: response.data.data.pkJkywwxtl,
					pkEvtupesq: response.data.data.pkEvtupesq,
				}));

				const jsonData = { ...formData };

				showAlert('Operation successfully.', 'success');

				onSubmit?.(jsonData);
			} else {
				showAlert('Server returned invalid data.', 'error');
			}
		}).catch(error => {
			if (error instanceof Error) {
				const wrapError = error as { response?: { status: number, data: any } };
				if (wrapError.response?.status == 400) {
					showAlert('Bad format request', 'error');
				} else if (wrapError.response?.status == 401) {
					showAlert(wrapError.response?.data, 'error');
				} else {
					showAlert('Submit operation exception.', 'error');
				}
			}
		}).finally(() => {
			setDisabledAction(false);
			setIsLoading(false);
		});
	};

	// Submit processing function
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const newErrors: { [key: string]: string } = {};


		// update error state
		setErrors(newErrors);

		// If there is no error, execute the submission logic
		if (Object.keys(newErrors).length === 0) {
			setIsConfirmOpen(true);
		} else {
			const firstError = Object.keys(newErrors).find((key) => newErrors[key]);

			if (firstError) {
				const errorElement = fieldRefs.current[firstError];

				if (errorElement) {
					errorElement.scrollIntoView({
						behavior: 'smooth',
						block: 'center',
					});

					// errorElement.focus();
				}
			}
		}
	}



	return (
		<>
			{/* Main Content */}
			<ThemeProvider theme={theme}>
				<form id="form_view_tb_jkywwxtl_msurqp" onSubmit={handleSubmit}>
					<div className="space-y-12">
						<div className={groupCardStyle}>
							<h2 className={groupTitleStyle}>基本信息</h2>
							<p className={groupDescriptionStyle}>

							</p>
							<div className={groupContentStyle + ` sm:grid-cols-2`}>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_pulfqxdt" className={labelStyle}>
										账单年月
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{new Date(formData.pulfqxdt).toLocaleDateString() || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['pulfqxdt'] = el;
											}}>
												<DatePicker
													name="pulfqxdt"
													format="YYYY-MM-DD"
													value={formData.pulfqxdt ? dayjs(formData.pulfqxdt) : null}
													views={['year', 'month', 'day']}
													onChange={(newValue: Dayjs | null) => handleDateChange('pulfqxdt', newValue)}
													sx={{
														'.Mui-focused': {
															borderColor: 'oklch(54.6% 0.245 262.881) !important',
														},
														'& .Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
															borderColor: 'oklch(54.6% 0.245 262.881) !important',
														},
														'& .MuiPickersOutlinedInput-notchedOutline': {
															borderRadius: '.375rem',
															borderColor: 'oklch(87.2% 0.01 258.338)'
														},
														'&:hover .MuiPickersOutlinedInput-notchedOutline': {
															borderColor: 'oklch(70.7% 0.022 261.325) !important',
														},
														'& .MuiPickersSectionList-root': {
															padding: '8px 0',
															height: '35px'
														},
														'& .MuiSvgIcon-root': {
															height: '18px',
															width: '18px'
														}
													}}
													onError={(newError) => handleDateError('transactionDate', newError)}
													slotProps={{
														popper: {
															sx: {
																backgroundColor: 'rgba(255, 255, 255, 0.9)',
																boxShadow: 'unset !important',
																marginTop: '5px !important',
																'& .MuiPaper-root': {
																	boxShadow: 'unset !important',
																	border: '1px solid oklch(87.2% 0.01 258.338)'
																},
															},
														},
														textField: {
															id: 'tb_jkywwxtl_pulfqxdt',
															error: !!errors['pulfqxdt'],
															helperText: errors['pulfqxdt'],
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_jjgjedyi" className={labelStyle}>
										抄表包
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.jjgjedyi || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['jjgjedyi'] = el;
											}}>
												<TextField
													id="tb_jkywwxtl_jjgjedyi"
													name="jjgjedyi"
													value={formData.jjgjedyi || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.jjgjedyi ? true : false}
													helperText={errors.jjgjedyi}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start">
																<TextIcon className='text-base' />
															</InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_bzdalzts" className={labelStyle}>
										账单周期（从）
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{new Date(formData.bzdalzts).toLocaleDateString() || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['bzdalzts'] = el;
											}}>
												<DatePicker
													name="bzdalzts"
													format="YYYY-MM-DD"
													value={formData.bzdalzts ? dayjs(formData.bzdalzts) : null}
													views={['year', 'month', 'day']}
													onChange={(newValue: Dayjs | null) => handleDateChange('bzdalzts', newValue)}
													sx={{
														'.Mui-focused': {
															borderColor: 'oklch(54.6% 0.245 262.881) !important',
														},
														'& .Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
															borderColor: 'oklch(54.6% 0.245 262.881) !important',
														},
														'& .MuiPickersOutlinedInput-notchedOutline': {
															borderRadius: '.375rem',
															borderColor: 'oklch(87.2% 0.01 258.338)'
														},
														'&:hover .MuiPickersOutlinedInput-notchedOutline': {
															borderColor: 'oklch(70.7% 0.022 261.325) !important',
														},
														'& .MuiPickersSectionList-root': {
															padding: '8px 0',
															height: '35px'
														},
														'& .MuiSvgIcon-root': {
															height: '18px',
															width: '18px'
														}
													}}
													onError={(newError) => handleDateError('transactionDate', newError)}
													slotProps={{
														popper: {
															sx: {
																backgroundColor: 'rgba(255, 255, 255, 0.9)',
																boxShadow: 'unset !important',
																marginTop: '5px !important',
																'& .MuiPaper-root': {
																	boxShadow: 'unset !important',
																	border: '1px solid oklch(87.2% 0.01 258.338)'
																},
															},
														},
														textField: {
															id: 'tb_jkywwxtl_bzdalzts',
															error: !!errors['bzdalzts'],
															helperText: errors['bzdalzts'],
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_ldgwxltt" className={labelStyle}>
										账单周期（至）
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{new Date(formData.ldgwxltt).toLocaleDateString() || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['ldgwxltt'] = el;
											}}>
												<DatePicker
													name="ldgwxltt"
													format="YYYY-MM-DD"
													value={formData.ldgwxltt ? dayjs(formData.ldgwxltt) : null}
													views={['year', 'month', 'day']}
													onChange={(newValue: Dayjs | null) => handleDateChange('ldgwxltt', newValue)}
													sx={{
														'.Mui-focused': {
															borderColor: 'oklch(54.6% 0.245 262.881) !important',
														},
														'& .Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
															borderColor: 'oklch(54.6% 0.245 262.881) !important',
														},
														'& .MuiPickersOutlinedInput-notchedOutline': {
															borderRadius: '.375rem',
															borderColor: 'oklch(87.2% 0.01 258.338)'
														},
														'&:hover .MuiPickersOutlinedInput-notchedOutline': {
															borderColor: 'oklch(70.7% 0.022 261.325) !important',
														},
														'& .MuiPickersSectionList-root': {
															padding: '8px 0',
															height: '35px'
														},
														'& .MuiSvgIcon-root': {
															height: '18px',
															width: '18px'
														}
													}}
													onError={(newError) => handleDateError('transactionDate', newError)}
													slotProps={{
														popper: {
															sx: {
																backgroundColor: 'rgba(255, 255, 255, 0.9)',
																boxShadow: 'unset !important',
																marginTop: '5px !important',
																'& .MuiPaper-root': {
																	boxShadow: 'unset !important',
																	border: '1px solid oklch(87.2% 0.01 258.338)'
																},
															},
														},
														textField: {
															id: 'tb_jkywwxtl_ldgwxltt',
															error: !!errors['ldgwxltt'],
															helperText: errors['ldgwxltt'],
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_btvttbdp" className={labelStyle}>
										户号
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.btvttbdp || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['btvttbdp'] = el;
											}}>
												<TextField
													id="tb_jkywwxtl_btvttbdp"
													name="btvttbdp"
													value={formData.btvttbdp || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.btvttbdp ? true : false}
													helperText={errors.btvttbdp}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start">
																<TextIcon className='text-base' />
															</InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_snebfkdc" className={labelStyle}>
										户名
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.snebfkdc || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['snebfkdc'] = el;
											}}>
												<TextField
													id="tb_jkywwxtl_snebfkdc"
													name="snebfkdc"
													value={formData.snebfkdc || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.snebfkdc ? true : false}
													helperText={errors.snebfkdc}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start">
																<TextIcon className='text-base' />
															</InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_bpmyzkau" className={labelStyle}>
										特邮地址
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.bpmyzkau || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['bpmyzkau'] = el;
											}}>
												<TextField
													multiline
													rows={4}
													id="tb_jkywwxtl_bpmyzkau"
													name="bpmyzkau"
													value={formData.bpmyzkau || ''}
													onChange={handleInputChange}
													size="small"
													fullWidth
													variant="outlined"
													error={errors.bpmyzkau ? true : false}
													helperText={errors.bpmyzkau}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start"><TextareaIcon /></InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_vuakirfk" className={labelStyle}>
										用电类别
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.fpojjtxx || ''}</Typography>
										) : (
											<FormControl fullWidth size="small"
												error={!!errors['vuakirfk']}
												ref={(el) => {
													if (el) fieldRefs.current['vuakirfk'] = el;
												}}
											>
												<Select
													id="tb_jkywwxtl_vuakirfk"
													name='vuakirfk'
													value={formData.vuakirfk || ''}
													onChange={(e) => handleSelectChange(e, [{ 'id': '01', 'name': '一般工商业用电' }, { 'id': '02', 'name': '大工业用电' },], 'fpojjtxx')}
													inputProps={{ 'aria-label': 'Without label' }}
													MenuProps={{
														PaperProps: {
															style: {
																marginTop: '5px',
																boxShadow: 'none',
																border: '1px solid oklch(87.2% 0.01 258.338)',
															},
														},
													}}
												>
													<MenuItem value="">
														<em>&nbsp;</em>
													</MenuItem>

													<MenuItem value='01'>一般工商业用电</MenuItem>
													<MenuItem value='02'>大工业用电</MenuItem>
												</Select>
												<FormHelperText>{errors['vuakirfk']}</FormHelperText>
											</FormControl>
										)}
									</div>
								</div>
								<input type="hidden" name="fpojjtxx" placeholder="" value={formData.fpojjtxx || ''} />
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_ttwqults" className={labelStyle}>
										电压等级
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.ttwqults || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['ttwqults'] = el;
											}}>
												<TextField
													id="tb_jkywwxtl_ttwqults"
													name="ttwqults"
													value={formData.ttwqults || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.ttwqults ? true : false}
													helperText={errors.ttwqults}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start">
																<TextIcon className='text-base' />
															</InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_xwizrffi" className={labelStyle}>
										供电服务单位
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.xwizrffi || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['xwizrffi'] = el;
											}}>
												<TextField
													id="tb_jkywwxtl_xwizrffi"
													name="xwizrffi"
													value={formData.xwizrffi || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.xwizrffi ? true : false}
													helperText={errors.xwizrffi}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start">
																<TextIcon className='text-base' />
															</InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_khopyxpu" className={labelStyle}>
										市场化属性
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.khopyxpu || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['khopyxpu'] = el;
											}}>
												<TextField
													id="tb_jkywwxtl_khopyxpu"
													name="khopyxpu"
													value={formData.khopyxpu || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.khopyxpu ? true : false}
													helperText={errors.khopyxpu}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start">
																<TextIcon className='text-base' />
															</InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_csixjnag" className={labelStyle}>
										用电地址
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.csixjnag || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['csixjnag'] = el;
											}}>
												<TextField
													multiline
													rows={4}
													id="tb_jkywwxtl_csixjnag"
													name="csixjnag"
													value={formData.csixjnag || ''}
													onChange={handleInputChange}
													size="small"
													fullWidth
													variant="outlined"
													error={errors.csixjnag ? true : false}
													helperText={errors.csixjnag}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start"><TextareaIcon /></InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
							</div>
						</div>
						<div className={groupCardStyle}>
							<h2 className={groupTitleStyle}>本期合计</h2>
							<p className={groupDescriptionStyle}>

							</p>
							<div className={groupContentStyle + ` sm:grid-cols-2`}>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_jgeyksaw" className={labelStyle}>
										本期电量
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.jgeyksaw || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['jgeyksaw'] = el;
											}}>
												<TextField
													type="number"
													id="tb_jkywwxtl_jgeyksaw"
													name="jgeyksaw"
													value={formData.jgeyksaw || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.jgeyksaw ? true : false}
													helperText={errors.jgeyksaw}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start"><NumberIcon className='text-base' /></InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_fmjxqxwc" className={labelStyle}>
										本期电费
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.fmjxqxwc || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['fmjxqxwc'] = el;
											}}>
												<TextField
													type="number"
													id="tb_jkywwxtl_fmjxqxwc"
													name="fmjxqxwc"
													value={formData.fmjxqxwc || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.fmjxqxwc ? true : false}
													helperText={errors.fmjxqxwc}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start">
																{
																	VITE_JET_CURRENCY_CODE === 'GBP' ? (
																		<CurrencyPoundRounded className='text-base' />
																	) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
																		<CurrencyYenOutlinedIcon className='text-base' />
																	) : VITE_JET_CURRENCY_CODE === 'USD' ? (
																		<AttachMoneyOutlinedIcon className='text-base' />
																	) : (
																		<CurrencyPoundRounded className='text-base' />
																	)
																}
															</InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_vjaoboid" className={labelStyle}>
										交费截止日期
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.vjaoboid || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['vjaoboid'] = el;
											}}>
												<TextField
													id="tb_jkywwxtl_vjaoboid"
													name="vjaoboid"
													value={formData.vjaoboid || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.vjaoboid ? true : false}
													helperText={errors.vjaoboid}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start">
																<TextIcon className='text-base' />
															</InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_mrpxwcnt" className={labelStyle}>
										备注
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.mrpxwcnt || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['mrpxwcnt'] = el;
											}}>
												<TextField
													multiline
													rows={4}
													id="tb_jkywwxtl_mrpxwcnt"
													name="mrpxwcnt"
													value={formData.mrpxwcnt || ''}
													onChange={handleInputChange}
													size="small"
													fullWidth
													variant="outlined"
													error={errors.mrpxwcnt ? true : false}
													helperText={errors.mrpxwcnt}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start"><TextareaIcon /></InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
							</div>
						</div>
						<div className={listCardStyle}>
							<table className={tableStyle}>
								<caption className={tableCaptionStyle}>
									<div className="flex justify-between items-center w-full">
										<h2 className={groupTitleStyle}>账单概况</h2>

										{!!!isViewReadOnly && (
											<Button
												variant="outlined"
												size="small"
												color="primary"
												startIcon={<AddIcon />}
												onClick={(e) => {
													setFocusedlistNksmxsRowId(null);
													setEditinglistNksmxsRowId(null);

													const newRow: any = {

													};

													setFormData((prevFormData: { listNksmxs: any; }) => ({
														...prevFormData,
														listNksmxs: [
															...prevFormData.listNksmxs,
															newRow,
														],
													}));
												}}
											>
												{t('page.addnew')}
											</Button>
										)}
									</div>
								</caption>
								<thead>
									<tr>
										<th className={tableThStyle}>费用组成</th>
										<th className={tableThStyle}>计收数量</th>
										<th className={tableThStyle}>电费</th>
									</tr>
								</thead>
								<tbody className={tableTbodyStyle}>
									{formData.listNksmxs.map((item: any, index: number) => {
										const rowIndex = 'row_' + index;

										const isFocused = rowIndex === focusedlistNksmxsRowId && !isViewReadOnly;
										const isEditing = rowIndex === editinglistNksmxsRowId && !isViewReadOnly;

										return (
											<tr
												key={rowIndex}
												onClick={() => {
													if (!focusedlistNksmxsRowId || editinglistNksmxsRowId !== rowIndex) {
														setFocusedlistNksmxsRowId(rowIndex);
														setEditinglistNksmxsRowId(null);
													}
												}}
												className={[
													'cursor-pointer',
													'transition-colors',
													isFocused ? 'bg-blue-50' : 'hover:bg-gray-50',
												].join(' ')}>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'fpqojirt',
																'header': '费用组成',
																'type': 'input'
															}}
															value={item.fpqojirt}
															onChange={(newValue) => {
																const updatedList = formData.listNksmxs.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['fpqojirt']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listNksmxs: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.fpqojirt}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'mvlsoxll',
																'header': '计收数量',
																'type': 'number'
															}}
															value={item.mvlsoxll}
															onChange={(newValue) => {
																const updatedList = formData.listNksmxs.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['mvlsoxll']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listNksmxs: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.mvlsoxll}</>
													)}


												</td>
												<td className={tableTdStyle + ' relative'}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'fohyfwyj',
																'header': '电费',
																'type': 'money'
															}}
															value={item.fohyfwyj}
															onChange={(newValue) => {
																const updatedList = formData.listNksmxs.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['fohyfwyj']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listNksmxs: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.fohyfwyj}</>
													)}

													{isFocused && (
														<div
															className="absolute right-0 top-0 mr-[-110px]"
														>
															<ButtonGroup size="small" color="primary" orientation="vertical">
																<Button startIcon={<InsertBeforeIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();

																		const currentList = formData.listNksmxs || [];

																		const newRow: any = {
																		};

																		let insertIndex = currentList.findIndex((row: any, idx: number) => ('row_' + idx) === focusedlistNksmxsRowId);

																		if (insertIndex === -1) {
																			insertIndex = currentList.length;
																		}


																		const updatedList = [
																			...currentList.slice(0, insertIndex),
																			newRow,
																			...currentList.slice(insertIndex),
																		];

																		setFormData((prevFormData: any) => ({
																			...prevFormData,
																			listNksmxs: updatedList,
																		}));

																		setFocusedlistNksmxsRowId(null);
																		setEditinglistNksmxsRowId(null);
																	}}
																	sx={{
																		justifyContent: 'flex-start'
																	}}
																>
																	{t('page.insertbefore')}
																</Button>
																<Button startIcon={<EditIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();

																		setEditinglistNksmxsRowId(rowIndex);
																	}}
																	sx={{
																		justifyContent: 'flex-start'
																	}}
																>
																	{t('page.edit')}
																</Button>
																<Button startIcon={<DeleteIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();

																		setEditinglistNksmxsRowId(null);
																		setIsConfirmDeletionlistNksmxsRowOpen(true);
																	}}
																	sx={{
																		justifyContent: 'flex-start'
																	}}
																>
																	{t('page.delete')}
																</Button>
																<Button startIcon={<InsertNextIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();

																		const currentList = formData.listNksmxs || [];

																		const newRow: any = {
																		};

																		let focusedIndex = currentList.findIndex((row: any, idx: number) => ('row_' + idx) === focusedlistNksmxsRowId);

																		let insertIndex;

																		if (focusedIndex >= 0) {
																			insertIndex = focusedIndex + 1;
																		} else {
																			insertIndex = currentList.length;
																		}

																		const updatedList = [
																			...currentList.slice(0, insertIndex),
																			newRow,
																			...currentList.slice(insertIndex),
																		];

																		setFormData((prevFormData: any) => ({
																			...prevFormData,
																			listNksmxs: updatedList,
																		}));

																		setFocusedlistNksmxsRowId(null);
																		setEditinglistNksmxsRowId(null);
																	}}
																	sx={{
																		justifyContent: 'flex-start',
																	}}
																>
																	{t('page.insertnext')}
																</Button>
																<Button startIcon={<CancelIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();

																		setFocusedlistNksmxsRowId(null);
																		setEditinglistNksmxsRowId(null);
																	}}
																	sx={{
																		justifyContent: 'flex-start'
																	}}
																>
																	{t('page.close')}
																</Button>
															</ButtonGroup>
														</div>
													)}

												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
							<SimpleConfirmDialog
								open={isConfirmDeletionlistNksmxsRowOpen}
								onConfirm={() => {
									setIsConfirmDeletionlistNksmxsRowOpen(false);

									// 1. Find the focused element outside of setFormData.
									const foundElement = formData.listNksmxs.find((row: any, idx: number) => {
										const rindex = 'row_' + idx;

										return rindex == focusedlistNksmxsRowId;
									});

									// 2. Use setFormData uniformly for all immutable state updates.
									setFormData((prevData: any) => {
										// 2a. Filter the new data list array (remove the focused row).
										const newList = prevData.listNksmxs.filter((row: any, idx: number) => {
											const rindex = 'row_' + idx;
											return rindex !== focusedlistNksmxsRowId;
										});

										// 2b. Initialize a new formDataBin structure.
										// Ensure that the old listId array is obtained from prevData; if it does not exist, use an empty array [].
										let discardedDataList = [...(prevData.formDataBin?.listNksmxs || [])];

										// 2c. Handle primary key insertion logic.
										if (foundElement && foundElement['pkWtfsrzaf'] !== null) {
											// The primary key value of the deleted row is added to a new copy of the discardedDataList array.
											discardedDataList.push(foundElement);
										}

										// 2d. Returns a completely new state object.
										return {
											...prevData,
											['listNksmxs']: newList, // Update data list
											formDataBin: {
												...prevData.formDataBin, // Preserve other possible key-value pairs in formDataBin
												listNksmxs: discardedDataList,       // Update the data List array in formDataBin
											},
										};
									});

									setFocusedlistNksmxsRowId(null);
								}
								}
								onCancel={() => {
									setIsConfirmDeletionlistNksmxsRowOpen(false);
								}}>
								{t('page.confirmdelete')}
							</SimpleConfirmDialog>
						</div>
						<div className={groupCardStyle}>
							<h2 className={groupTitleStyle}>账单详情</h2>
							<p className={groupDescriptionStyle}>

							</p>
							<div className={groupContentStyle + ` sm:grid-cols-2`}>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_jkywwxtl_pairhtex" className={labelStyle}>
										电源编号
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.pairhtex || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['pairhtex'] = el;
											}}>
												<TextField
													id="tb_jkywwxtl_pairhtex"
													name="pairhtex"
													value={formData.pairhtex || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.pairhtex ? true : false}
													helperText={errors.pairhtex}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start">
																<TextIcon className='text-base' />
															</InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_evtupesq_pjgkgiux" className={labelStyle}>
										合同容量
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.pjgkgiux || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['pjgkgiux'] = el;
											}}>
												<TextField
													type="number"
													id="tb_evtupesq_pjgkgiux"
													name="pjgkgiux"
													value={formData.pjgkgiux || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.pjgkgiux ? true : false}
													helperText={errors.pjgkgiux}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start"><NumberIcon className='text-base' /></InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_evtupesq_enpycfbg" className={labelStyle}>
										有功
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.enpycfbg || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['enpycfbg'] = el;
											}}>
												<TextField
													type="number"
													id="tb_evtupesq_enpycfbg"
													name="enpycfbg"
													value={formData.enpycfbg || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.enpycfbg ? true : false}
													helperText={errors.enpycfbg}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start"><NumberIcon className='text-base' /></InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_evtupesq_xfztelqt" className={labelStyle}>
										无功
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.xfztelqt || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['xfztelqt'] = el;
											}}>
												<TextField
													type="number"
													id="tb_evtupesq_xfztelqt"
													name="xfztelqt"
													value={formData.xfztelqt || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.xfztelqt ? true : false}
													helperText={errors.xfztelqt}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start"><NumberIcon className='text-base' /></InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_evtupesq_ksrgzovo" className={labelStyle}>
										平均电价
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.ksrgzovo || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['ksrgzovo'] = el;
											}}>
												<TextField
													type="number"
													id="tb_evtupesq_ksrgzovo"
													name="ksrgzovo"
													value={formData.ksrgzovo || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.ksrgzovo ? true : false}
													helperText={errors.ksrgzovo}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start">
																{
																	VITE_JET_CURRENCY_CODE === 'GBP' ? (
																		<CurrencyPoundRounded className='text-base' />
																	) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
																		<CurrencyYenOutlinedIcon className='text-base' />
																	) : VITE_JET_CURRENCY_CODE === 'USD' ? (
																		<AttachMoneyOutlinedIcon className='text-base' />
																	) : (
																		<CurrencyPoundRounded className='text-base' />
																	)
																}
															</InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_evtupesq_qxjdttpx" className={labelStyle}>
										电能表编号
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.qxjdttpx || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['qxjdttpx'] = el;
											}}>
												<TextField
													id="tb_evtupesq_qxjdttpx"
													name="qxjdttpx"
													value={formData.qxjdttpx || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.qxjdttpx ? true : false}
													helperText={errors.qxjdttpx}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start">
																<TextIcon className='text-base' />
															</InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_evtupesq_extvgtsx" className={labelStyle}>
										电价
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.extvgtsx || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['extvgtsx'] = el;
											}}>
												<TextField
													id="tb_evtupesq_extvgtsx"
													name="extvgtsx"
													value={formData.extvgtsx || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.extvgtsx ? true : false}
													helperText={errors.extvgtsx}
													slotProps={{
														input: {

															startAdornment: <InputAdornment position="start">
																<TextIcon className='text-base' />
															</InputAdornment>
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
							</div>
						</div>
						<div className={listFitCardStyle}>
							<table className={tableStyle}>
	      					    		<caption className={tableCaptionStyle}>
	      					    		<div className="flex justify-between items-center w-full">
	      					    			<h2 className={groupTitleStyle}>账单明细</h2>
	      					    			
		      					    		{!!!isViewReadOnly && (
												<Button
													variant="outlined"
													size="small"
													color="primary"
													startIcon={<AddIcon />}
													onClick={(e) => {
														setFocusedlistWwgmiyRowId(null);
														setEditinglistWwgmiyRowId(null);
	
														const newRow: any = {
	
														};
	
														setFormData((prevFormData: { listWwgmiy: any; }) => ({
															...prevFormData,
															listWwgmiy: [
																...prevFormData.listWwgmiy,
																newRow,
															],
														}));
													}}
												>
													{t('page.addnew')}
												</Button>
											)}
										</div>
	      					    		</caption>
	      					    		<thead>
	      					    			<tr>
	      					    				<th className={tableThStyle}>示数类型</th>
	      					    				<th className={tableThStyle}>上期示数</th>
	      					    				<th className={tableThStyle}>本期示数</th>
	      					    				<th className={tableThStyle}>倍率</th>
	      					    				<th className={tableThStyle}>抄见量</th>
	      					    				<th className={tableThStyle}>变损</th>
	      					    				<th className={tableThStyle}>分表加减</th>
	      					    				<th className={tableThStyle}>计费电量</th>
	      					    			 </tr>
	      					    		</thead>
	      					    		<tbody className={tableTbodyStyle}>
											{formData.listWwgmiy.map((item: any, index: number) => {
												const rowIndex = 'row_' + index;
												
												const isFocused = rowIndex === focusedlistWwgmiyRowId && !isViewReadOnly;
												const isEditing = rowIndex === editinglistWwgmiyRowId && !isViewReadOnly;
												
												return (
													<tr 
													key={rowIndex}
													onClick={() => {
														if (!focusedlistWwgmiyRowId || editinglistWwgmiyRowId !== rowIndex) {
															setFocusedlistWwgmiyRowId(rowIndex);
															setEditinglistWwgmiyRowId(null);
														}
													}}
													className={[
														'cursor-pointer',
														'transition-colors',
														'relative',
														isFocused ? 'bg-blue-50' : 'hover:bg-gray-50',
													].join(' ')}>
			      					    				<td className={tableTdStyle }>
			      					    				{isEditing ? (
															<RowInputRenderer
																column={{
																	'key': 'ccnpnuoj',
																	'header': '示数类型',
																	'type': 'input'
																}}
																value={item.ccnpnuoj}
																onChange={(newValue) => {
																	const updatedList = formData.listWwgmiy.map((row: any, idx: number) => {
																		const rindex = 'row_' + idx;

																		if (rindex === rowIndex) {
																			return {
																				...row,
																				['ccnpnuoj']: newValue,
																			};
																		}
																		return row;
																	});

																	setFormData((prevData: any) => {
																		return {
																			...prevData,
																			listWwgmiy: updatedList,
																		};
																	});
																}}
															/>
														) : (
															<>{item.ccnpnuoj}</>
														)}
														
														
			      					    				</td>
			      					    				<td className={tableTdStyle }>
			      					    				{isEditing ? (
															<RowInputRenderer
																column={{
																	'key': 'pljympde',
																	'header': '上期示数',
																	'type': 'number'
																}}
																value={item.pljympde}
																onChange={(newValue) => {
																	const updatedList = formData.listWwgmiy.map((row: any, idx: number) => {
																		const rindex = 'row_' + idx;

																		if (rindex === rowIndex) {
																			return {
																				...row,
																				['pljympde']: newValue,
																			};
																		}
																		return row;
																	});

																	setFormData((prevData: any) => {
																		return {
																			...prevData,
																			listWwgmiy: updatedList,
																		};
																	});
																}}
															/>
														) : (
															<>{item.pljympde}</>
														)}
														
														
			      					    				</td>
			      					    				<td className={tableTdStyle }>
			      					    				{isEditing ? (
															<RowInputRenderer
																column={{
																	'key': 'effsxgfx',
																	'header': '本期示数',
																	'type': 'number'
																}}
																value={item.effsxgfx}
																onChange={(newValue) => {
																	const updatedList = formData.listWwgmiy.map((row: any, idx: number) => {
																		const rindex = 'row_' + idx;

																		if (rindex === rowIndex) {
																			return {
																				...row,
																				['effsxgfx']: newValue,
																			};
																		}
																		return row;
																	});

																	setFormData((prevData: any) => {
																		return {
																			...prevData,
																			listWwgmiy: updatedList,
																		};
																	});
																}}
															/>
														) : (
															<>{item.effsxgfx}</>
														)}
														
														
			      					    				</td>
			      					    				<td className={tableTdStyle }>
			      					    				{isEditing ? (
															<RowInputRenderer
																column={{
																	'key': 'msmtipaj',
																	'header': '倍率',
																	'type': 'number'
																}}
																value={item.msmtipaj}
																onChange={(newValue) => {
																	const updatedList = formData.listWwgmiy.map((row: any, idx: number) => {
																		const rindex = 'row_' + idx;

																		if (rindex === rowIndex) {
																			return {
																				...row,
																				['msmtipaj']: newValue,
																			};
																		}
																		return row;
																	});

																	setFormData((prevData: any) => {
																		return {
																			...prevData,
																			listWwgmiy: updatedList,
																		};
																	});
																}}
															/>
														) : (
															<>{item.msmtipaj}</>
														)}
														
														
			      					    				</td>
			      					    				<td className={tableTdStyle }>
			      					    				{isEditing ? (
															<RowInputRenderer
																column={{
																	'key': 'wgblewhr',
																	'header': '抄见量',
																	'type': 'number'
																}}
																value={item.wgblewhr}
																onChange={(newValue) => {
																	const updatedList = formData.listWwgmiy.map((row: any, idx: number) => {
																		const rindex = 'row_' + idx;

																		if (rindex === rowIndex) {
																			return {
																				...row,
																				['wgblewhr']: newValue,
																			};
																		}
																		return row;
																	});

																	setFormData((prevData: any) => {
																		return {
																			...prevData,
																			listWwgmiy: updatedList,
																		};
																	});
																}}
															/>
														) : (
															<>{item.wgblewhr}</>
														)}
														
														
			      					    				</td>
			      					    				<td className={tableTdStyle }>
			      					    				{isEditing ? (
															<RowInputRenderer
																column={{
																	'key': 'mfdytujp',
																	'header': '变损',
																	'type': 'number'
																}}
																value={item.mfdytujp}
																onChange={(newValue) => {
																	const updatedList = formData.listWwgmiy.map((row: any, idx: number) => {
																		const rindex = 'row_' + idx;

																		if (rindex === rowIndex) {
																			return {
																				...row,
																				['mfdytujp']: newValue,
																			};
																		}
																		return row;
																	});

																	setFormData((prevData: any) => {
																		return {
																			...prevData,
																			listWwgmiy: updatedList,
																		};
																	});
																}}
															/>
														) : (
															<>{item.mfdytujp}</>
														)}
														
														
			      					    				</td>
			      					    				<td className={tableTdStyle }>
			      					    				{isEditing ? (
															<RowInputRenderer
																column={{
																	'key': 'jrnizrfa',
																	'header': '分表加减',
																	'type': 'number'
																}}
																value={item.jrnizrfa}
																onChange={(newValue) => {
																	const updatedList = formData.listWwgmiy.map((row: any, idx: number) => {
																		const rindex = 'row_' + idx;

																		if (rindex === rowIndex) {
																			return {
																				...row,
																				['jrnizrfa']: newValue,
																			};
																		}
																		return row;
																	});

																	setFormData((prevData: any) => {
																		return {
																			...prevData,
																			listWwgmiy: updatedList,
																		};
																	});
																}}
															/>
														) : (
															<>{item.jrnizrfa}</>
														)}
														
														
			      					    				</td>
			      					    				<td className={tableTdStyle + ' '}>
			      					    				{isEditing ? (
															<RowInputRenderer
																column={{
																	'key': 'ogmipjlp',
																	'header': '计费电量',
																	'type': 'number'
																}}
																value={item.ogmipjlp}
																onChange={(newValue) => {
																	const updatedList = formData.listWwgmiy.map((row: any, idx: number) => {
																		const rindex = 'row_' + idx;

																		if (rindex === rowIndex) {
																			return {
																				...row,
																				['ogmipjlp']: newValue,
																			};
																		}
																		return row;
																	});

																	setFormData((prevData: any) => {
																		return {
																			...prevData,
																			listWwgmiy: updatedList,
																		};
																	});
																}}
															/>
														) : (
															<>{item.ogmipjlp}</>
														)}
														
													        {isFocused && (
																<div
																	className="absolute left-1/2 top-[110%] -translate-x-1/2 z-[999] w-64 bg-white/90 border border-gray-200 shadow-xl rounded-lg p-2
																	before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 
             														before:border-[8px] before:border-transparent before:border-b-gray-300"
																>
																	<ButtonGroup size="small" color="primary" orientation="vertical" sx={{ 
																					display: 'grid', 
																					gridTemplateColumns: 'repeat(2, 1fr)', 
																					width: '100%',
																					'& .MuiButton-root': {
																					backgroundColor: 'none',
																					border: '1px solid #fff !important',
																					borderRadius: '4px', 
																					margin: '2px'
																					}
																				}}>
																		<Button startIcon={<InsertBeforeIcon />}
																			size="small"
																			onClick={(e) => {
																				e.stopPropagation();
		
																				const currentList = formData.listWwgmiy || [];
		
																				const newRow: any = {
																				};
		
																				let insertIndex = currentList.findIndex((row: any, idx: number) => ('row_' + idx) === focusedlistWwgmiyRowId);
		
																				if (insertIndex === -1) {
																					insertIndex = currentList.length;
																				}
		
		
																				const updatedList = [
																					...currentList.slice(0, insertIndex),
																					newRow,
																					...currentList.slice(insertIndex),
																				];
		
																				setFormData((prevFormData: any) => ({
																					...prevFormData,
																					listWwgmiy: updatedList,
																				}));
		
																				setFocusedlistWwgmiyRowId(null);
																				setEditinglistWwgmiyRowId(null);
																			}}
																			sx={{
																				justifyContent: 'flex-start'
																			}}
																		>
																			{t('page.insertbefore')}
																		</Button>
																		<Button startIcon={<InsertNextIcon />}
																			size="small"
																			onClick={(e) => {
																				e.stopPropagation();
		
																				const currentList = formData.listWwgmiy || [];
		
																				const newRow: any = {
																				};
		
																				let focusedIndex = currentList.findIndex((row: any, idx: number) => ('row_' + idx) === focusedlistWwgmiyRowId);
		
																				let insertIndex;
		
																				if (focusedIndex >= 0) {
																					insertIndex = focusedIndex + 1;
																				} else {
																					insertIndex = currentList.length;
																				}
		
																				const updatedList = [
																					...currentList.slice(0, insertIndex),
																					newRow,
																					...currentList.slice(insertIndex),
																				];
		
																				setFormData((prevFormData: any) => ({
																					...prevFormData,
																					listWwgmiy: updatedList,
																				}));
		
																				setFocusedlistWwgmiyRowId(null);
																				setEditinglistWwgmiyRowId(null);
																			}}
																			sx={{
																				justifyContent: 'flex-start',
																			}}
																		>
																			{t('page.insertnext')}
																		</Button>
																		<Button startIcon={<EditIcon />}
																			size="small"
																			onClick={(e) => {
																				e.stopPropagation();
																				
																				setEditinglistWwgmiyRowId(rowIndex);
																			}}
																			sx={{
																				justifyContent: 'flex-start'
																			}}
																		>
																			{t('page.edit')}
																		</Button>
																		<Button startIcon={<DeleteIcon />}
																			size="small"
																			onClick={(e) => {
																				e.stopPropagation();
	
																				setEditinglistWwgmiyRowId(null);
																				setIsConfirmDeletionlistWwgmiyRowOpen(true);
																			}}
																			sx={{
																				justifyContent: 'flex-start'
																			}}
																		>
																			{t('page.delete')}
																		</Button>
																		<Button startIcon={<CancelIcon />}
																			size="small"
																			onClick={(e) => {
																				e.stopPropagation();
																				
																				setFocusedlistWwgmiyRowId(null);
																				setEditinglistWwgmiyRowId(null);
																			}}
																			sx={{
																				justifyContent: 'flex-start'
																			}}
																		>
																			{t('page.close')}
																		</Button>
																	</ButtonGroup>
																</div>
															)}
														
			      					    				</td>
													</tr>
												)
											})}
										</tbody>
	      					    	</table>
							<SimpleConfirmDialog
								open={isConfirmDeletionlistWwgmiyRowOpen}
								onConfirm={() => {
									setIsConfirmDeletionlistWwgmiyRowOpen(false);

									// 1. Find the focused element outside of setFormData.
									const foundElement = formData.listWwgmiy.find((row: any, idx: number) => {
										const rindex = 'row_' + idx;

										return rindex == focusedlistWwgmiyRowId;
									});

									// 2. Use setFormData uniformly for all immutable state updates.
									setFormData((prevData: any) => {
										// 2a. Filter the new data list array (remove the focused row).
										const newList = prevData.listWwgmiy.filter((row: any, idx: number) => {
											const rindex = 'row_' + idx;
											return rindex !== focusedlistWwgmiyRowId;
										});

										// 2b. Initialize a new formDataBin structure.
										// Ensure that the old listId array is obtained from prevData; if it does not exist, use an empty array [].
										let discardedDataList = [...(prevData.formDataBin?.listWwgmiy || [])];

										// 2c. Handle primary key insertion logic.
										if (foundElement && foundElement['pkPqteiehy'] !== null) {
											// The primary key value of the deleted row is added to a new copy of the discardedDataList array.
											discardedDataList.push(foundElement);
										}

										// 2d. Returns a completely new state object.
										return {
											...prevData,
											['listWwgmiy']: newList, // Update data list
											formDataBin: {
												...prevData.formDataBin, // Preserve other possible key-value pairs in formDataBin
												listWwgmiy: discardedDataList,       // Update the data List array in formDataBin
											},
										};
									});

									setFocusedlistWwgmiyRowId(null);
								}
								}
								onCancel={() => {
									setIsConfirmDeletionlistWwgmiyRowOpen(false);
								}}>
								{t('page.confirmdelete')}
							</SimpleConfirmDialog>
						</div>
						<div className={listCardStyle}>
							<table className={tableStyle}>
								<caption className={tableCaptionStyle}>
									<div className="flex justify-between items-center w-full">
										<h2 className={groupTitleStyle}>工商业电费-大工业,两部制分时,电压35kV</h2>

										{!!!isViewReadOnly && (
											<Button
												variant="outlined"
												size="small"
												color="primary"
												startIcon={<AddIcon />}
												onClick={(e) => {
													setFocusedlistQkhnbbRowId(null);
													setEditinglistQkhnbbRowId(null);

													const newRow: any = {

													};

													setFormData((prevFormData: { listQkhnbb: any; }) => ({
														...prevFormData,
														listQkhnbb: [
															...prevFormData.listQkhnbb,
															newRow,
														],
													}));
												}}
											>
												{t('page.addnew')}
											</Button>
										)}
									</div>
								</caption>
								<thead>
									<tr>
										<th className={tableThStyle}>费用类别</th>
										<th className={tableThStyle}>费用组成</th>
										<th className={tableThStyle}>分时时段</th>
										<th className={tableThStyle}>计费电量</th>
										<th className={tableThStyle}>计费标准</th>
										<th className={tableThStyle}>电费</th>
									</tr>
								</thead>
								<tbody className={tableTbodyStyle}>
									{formData.listQkhnbb.map((item: any, index: number) => {
										const rowIndex = 'row_' + index;

										const isFocused = rowIndex === focusedlistQkhnbbRowId && !isViewReadOnly;
										const isEditing = rowIndex === editinglistQkhnbbRowId && !isViewReadOnly;

										return (
											<tr
												key={rowIndex}
												onClick={() => {
													if (!focusedlistQkhnbbRowId || editinglistQkhnbbRowId !== rowIndex) {
														setFocusedlistQkhnbbRowId(rowIndex);
														setEditinglistQkhnbbRowId(null);
													}
												}}
												className={[
													'cursor-pointer',
													'transition-colors',
													isFocused ? 'bg-blue-50' : 'hover:bg-gray-50',
												].join(' ')}>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'qqaalnhy',
																'header': '费用类别',
																'type': 'input'
															}}
															value={item.qqaalnhy}
															onChange={(newValue) => {
																const updatedList = formData.listQkhnbb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['qqaalnhy']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listQkhnbb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.qqaalnhy}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'puuyqzgp',
																'header': '费用组成',
																'type': 'input'
															}}
															value={item.puuyqzgp}
															onChange={(newValue) => {
																const updatedList = formData.listQkhnbb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['puuyqzgp']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listQkhnbb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.puuyqzgp}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'rvztincv',
																'header': '分时时段',
																'type': 'input'
															}}
															value={item.rvztincv}
															onChange={(newValue) => {
																const updatedList = formData.listQkhnbb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['rvztincv']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listQkhnbb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.rvztincv}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'qoxzkzva',
																'header': '计费电量',
																'type': 'number'
															}}
															value={item.qoxzkzva}
															onChange={(newValue) => {
																const updatedList = formData.listQkhnbb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['qoxzkzva']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listQkhnbb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.qoxzkzva}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'gbtaojoz',
																'header': '计费标准',
																'type': 'number'
															}}
															value={item.gbtaojoz}
															onChange={(newValue) => {
																const updatedList = formData.listQkhnbb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['gbtaojoz']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listQkhnbb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.gbtaojoz}</>
													)}


												</td>
												<td className={tableTdStyle + ' relative'}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'dfvmwkqi',
																'header': '电费',
																'type': 'money'
															}}
															value={item.dfvmwkqi}
															onChange={(newValue) => {
																const updatedList = formData.listQkhnbb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['dfvmwkqi']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listQkhnbb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.dfvmwkqi}</>
													)}

													{isFocused && (
														<div
															className="absolute right-0 top-0 mr-[-110px]"
														>
															<ButtonGroup size="small" color="primary" orientation="vertical">
																<Button startIcon={<InsertBeforeIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();

																		const currentList = formData.listQkhnbb || [];

																		const newRow: any = {
																		};

																		let insertIndex = currentList.findIndex((row: any, idx: number) => ('row_' + idx) === focusedlistQkhnbbRowId);

																		if (insertIndex === -1) {
																			insertIndex = currentList.length;
																		}


																		const updatedList = [
																			...currentList.slice(0, insertIndex),
																			newRow,
																			...currentList.slice(insertIndex),
																		];

																		setFormData((prevFormData: any) => ({
																			...prevFormData,
																			listQkhnbb: updatedList,
																		}));

																		setFocusedlistQkhnbbRowId(null);
																		setEditinglistQkhnbbRowId(null);
																	}}
																	sx={{
																		justifyContent: 'flex-start'
																	}}
																>
																	{t('page.insertbefore')}
																</Button>
																<Button startIcon={<EditIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();

																		setEditinglistQkhnbbRowId(rowIndex);
																	}}
																	sx={{
																		justifyContent: 'flex-start'
																	}}
																>
																	{t('page.edit')}
																</Button>
																<Button startIcon={<DeleteIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();

																		setEditinglistQkhnbbRowId(null);
																		setIsConfirmDeletionlistQkhnbbRowOpen(true);
																	}}
																	sx={{
																		justifyContent: 'flex-start'
																	}}
																>
																	{t('page.delete')}
																</Button>
																<Button startIcon={<InsertNextIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();

																		const currentList = formData.listQkhnbb || [];

																		const newRow: any = {
																		};

																		let focusedIndex = currentList.findIndex((row: any, idx: number) => ('row_' + idx) === focusedlistQkhnbbRowId);

																		let insertIndex;

																		if (focusedIndex >= 0) {
																			insertIndex = focusedIndex + 1;
																		} else {
																			insertIndex = currentList.length;
																		}

																		const updatedList = [
																			...currentList.slice(0, insertIndex),
																			newRow,
																			...currentList.slice(insertIndex),
																		];

																		setFormData((prevFormData: any) => ({
																			...prevFormData,
																			listQkhnbb: updatedList,
																		}));

																		setFocusedlistQkhnbbRowId(null);
																		setEditinglistQkhnbbRowId(null);
																	}}
																	sx={{
																		justifyContent: 'flex-start',
																	}}
																>
																	{t('page.insertnext')}
																</Button>
																<Button startIcon={<CancelIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();

																		setFocusedlistQkhnbbRowId(null);
																		setEditinglistQkhnbbRowId(null);
																	}}
																	sx={{
																		justifyContent: 'flex-start'
																	}}
																>
																	{t('page.close')}
																</Button>
															</ButtonGroup>
														</div>
													)}

												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
							<SimpleConfirmDialog
								open={isConfirmDeletionlistQkhnbbRowOpen}
								onConfirm={() => {
									setIsConfirmDeletionlistQkhnbbRowOpen(false);

									// 1. Find the focused element outside of setFormData.
									const foundElement = formData.listQkhnbb.find((row: any, idx: number) => {
										const rindex = 'row_' + idx;

										return rindex == focusedlistQkhnbbRowId;
									});

									// 2. Use setFormData uniformly for all immutable state updates.
									setFormData((prevData: any) => {
										// 2a. Filter the new data list array (remove the focused row).
										const newList = prevData.listQkhnbb.filter((row: any, idx: number) => {
											const rindex = 'row_' + idx;
											return rindex !== focusedlistQkhnbbRowId;
										});

										// 2b. Initialize a new formDataBin structure.
										// Ensure that the old listId array is obtained from prevData; if it does not exist, use an empty array [].
										let discardedDataList = [...(prevData.formDataBin?.listQkhnbb || [])];

										// 2c. Handle primary key insertion logic.
										if (foundElement && foundElement['pkBiankxkt'] !== null) {
											// The primary key value of the deleted row is added to a new copy of the discardedDataList array.
											discardedDataList.push(foundElement);
										}

										// 2d. Returns a completely new state object.
										return {
											...prevData,
											['listQkhnbb']: newList, // Update data list
											formDataBin: {
												...prevData.formDataBin, // Preserve other possible key-value pairs in formDataBin
												listQkhnbb: discardedDataList,       // Update the data List array in formDataBin
											},
										};
									});

									setFocusedlistQkhnbbRowId(null);
								}
								}
								onCancel={() => {
									setIsConfirmDeletionlistQkhnbbRowOpen(false);
								}}>
								{t('page.confirmdelete')}
							</SimpleConfirmDialog>
						</div>
						<div className={listCardStyle}>
							<table className={tableStyle}>
								<caption className={tableCaptionStyle}>
									<div className="flex justify-between items-center w-full">
										<h2 className={groupTitleStyle}>市场化电费</h2>

										{!!!isViewReadOnly && (
											<Button
												variant="outlined"
												size="small"
												color="primary"
												startIcon={<AddIcon />}
												onClick={(e) => {
													setFocusedlistPfovybRowId(null);
													setEditinglistPfovybRowId(null);

													const newRow: any = {

													};

													setFormData((prevFormData: { listPfovyb: any; }) => ({
														...prevFormData,
														listPfovyb: [
															...prevFormData.listPfovyb,
															newRow,
														],
													}));
												}}
											>
												{t('page.addnew')}
											</Button>
										)}
									</div>
								</caption>
								<thead>
									<tr>
										<th className={tableThStyle}>费用类别</th>
										<th className={tableThStyle}>金额</th>
									</tr>
								</thead>
								<tbody className={tableTbodyStyle}>
									{formData.listPfovyb.map((item: any, index: number) => {
										const rowIndex = 'row_' + index;

										const isFocused = rowIndex === focusedlistPfovybRowId && !isViewReadOnly;
										const isEditing = rowIndex === editinglistPfovybRowId && !isViewReadOnly;

										return (
											<tr
												key={rowIndex}
												onClick={() => {
													if (!focusedlistPfovybRowId || editinglistPfovybRowId !== rowIndex) {
														setFocusedlistPfovybRowId(rowIndex);
														setEditinglistPfovybRowId(null);
													}
												}}
												className={[
													'cursor-pointer',
													'transition-colors',
													isFocused ? 'bg-blue-50' : 'hover:bg-gray-50',
												].join(' ')}>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'vhcridlv',
																'header': '费用类别',
																'type': 'input'
															}}
															value={item.vhcridlv}
															onChange={(newValue) => {
																const updatedList = formData.listPfovyb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['vhcridlv']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listPfovyb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.vhcridlv}</>
													)}


												</td>
												<td className={tableTdStyle + ' relative'}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'jvjdjgcc',
																'header': '金额',
																'type': 'money'
															}}
															value={item.jvjdjgcc}
															onChange={(newValue) => {
																const updatedList = formData.listPfovyb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['jvjdjgcc']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listPfovyb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.jvjdjgcc}</>
													)}

													{isFocused && (
														<div
															className="absolute right-0 top-0 mr-[-110px]"
														>
															<ButtonGroup size="small" color="primary" orientation="vertical">
																<Button startIcon={<InsertBeforeIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();

																		const currentList = formData.listPfovyb || [];

																		const newRow: any = {
																		};

																		let insertIndex = currentList.findIndex((row: any, idx: number) => ('row_' + idx) === focusedlistPfovybRowId);

																		if (insertIndex === -1) {
																			insertIndex = currentList.length;
																		}


																		const updatedList = [
																			...currentList.slice(0, insertIndex),
																			newRow,
																			...currentList.slice(insertIndex),
																		];

																		setFormData((prevFormData: any) => ({
																			...prevFormData,
																			listPfovyb: updatedList,
																		}));

																		setFocusedlistPfovybRowId(null);
																		setEditinglistPfovybRowId(null);
																	}}
																	sx={{
																		justifyContent: 'flex-start'
																	}}
																>
																	{t('page.insertbefore')}
																</Button>
																<Button startIcon={<EditIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();

																		setEditinglistPfovybRowId(rowIndex);
																	}}
																	sx={{
																		justifyContent: 'flex-start'
																	}}
																>
																	{t('page.edit')}
																</Button>
																<Button startIcon={<DeleteIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();

																		setEditinglistPfovybRowId(null);
																		setIsConfirmDeletionlistPfovybRowOpen(true);
																	}}
																	sx={{
																		justifyContent: 'flex-start'
																	}}
																>
																	{t('page.delete')}
																</Button>
																<Button startIcon={<InsertNextIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();

																		const currentList = formData.listPfovyb || [];

																		const newRow: any = {
																		};

																		let focusedIndex = currentList.findIndex((row: any, idx: number) => ('row_' + idx) === focusedlistPfovybRowId);

																		let insertIndex;

																		if (focusedIndex >= 0) {
																			insertIndex = focusedIndex + 1;
																		} else {
																			insertIndex = currentList.length;
																		}

																		const updatedList = [
																			...currentList.slice(0, insertIndex),
																			newRow,
																			...currentList.slice(insertIndex),
																		];

																		setFormData((prevFormData: any) => ({
																			...prevFormData,
																			listPfovyb: updatedList,
																		}));

																		setFocusedlistPfovybRowId(null);
																		setEditinglistPfovybRowId(null);
																	}}
																	sx={{
																		justifyContent: 'flex-start',
																	}}
																>
																	{t('page.insertnext')}
																</Button>
																<Button startIcon={<CancelIcon />}
																	size="small"
																	onClick={(e) => {
																		e.stopPropagation();

																		setFocusedlistPfovybRowId(null);
																		setEditinglistPfovybRowId(null);
																	}}
																	sx={{
																		justifyContent: 'flex-start'
																	}}
																>
																	{t('page.close')}
																</Button>
															</ButtonGroup>
														</div>
													)}

												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
							<SimpleConfirmDialog
								open={isConfirmDeletionlistPfovybRowOpen}
								onConfirm={() => {
									setIsConfirmDeletionlistPfovybRowOpen(false);

									// 1. Find the focused element outside of setFormData.
									const foundElement = formData.listPfovyb.find((row: any, idx: number) => {
										const rindex = 'row_' + idx;

										return rindex == focusedlistPfovybRowId;
									});

									// 2. Use setFormData uniformly for all immutable state updates.
									setFormData((prevData: any) => {
										// 2a. Filter the new data list array (remove the focused row).
										const newList = prevData.listPfovyb.filter((row: any, idx: number) => {
											const rindex = 'row_' + idx;
											return rindex !== focusedlistPfovybRowId;
										});

										// 2b. Initialize a new formDataBin structure.
										// Ensure that the old listId array is obtained from prevData; if it does not exist, use an empty array [].
										let discardedDataList = [...(prevData.formDataBin?.listPfovyb || [])];

										// 2c. Handle primary key insertion logic.
										if (foundElement && foundElement['pkExmloogy'] !== null) {
											// The primary key value of the deleted row is added to a new copy of the discardedDataList array.
											discardedDataList.push(foundElement);
										}

										// 2d. Returns a completely new state object.
										return {
											...prevData,
											['listPfovyb']: newList, // Update data list
											formDataBin: {
												...prevData.formDataBin, // Preserve other possible key-value pairs in formDataBin
												listPfovyb: discardedDataList,       // Update the data List array in formDataBin
											},
										};
									});

									setFocusedlistPfovybRowId(null);
								}
								}
								onCancel={() => {
									setIsConfirmDeletionlistPfovybRowOpen(false);
								}}>
								{t('page.confirmdelete')}
							</SimpleConfirmDialog>
						</div>
					</div>
					<div className="mt-12 flex items-center justify-end gap-x-6">
						{isViewReadOnly ? (
							<button type="button" disabled={disabledAction} className={cancelStyle}
								onClick={() => {
									if (from) {
										navigate(from);
									} else {
										const jsonData = { ...formData };

										onCancel?.(jsonData);
									}
								}}
							>
								Close
							</button>
						) : (
							<>
								<button type="button" disabled={disabledAction} className={cancelStyle}
									onClick={() => {
										if (from) {
											navigate(from);
										} else {
											const jsonData = { ...formData };

											onCancel?.(jsonData);
										}
									}}
								>
									{t('page.cancel')}
								</button>
								<button
									disabled={disabledAction}
									type="submit"
									className={submitStyle}>
									{t('page.submit')}
								</button>
								{/*formData.pkJkywwxtl !== '' && (
									<Tooltip title="数据如有修改，请先提交表单后再生成结算单！" arrow placement="top-start">
										<button
											disabled={disabledAction}
											type="button"
											className={"rounded-md bg-pink-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-pink-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"}
											onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
												generateSettlementStatement(formData);
											}}
										>
											生成结算单
										</button>
									</Tooltip>
								)*/}
							</>
						)}
					</div>
					{isLoading && (
						<Box
							className="absolute inset-0 flex justify-center items-center bg-black/50 z-20 rounded-xl"
						>
							<CircularProgress disableShrink color="inherit" />
						</Box>
					)}
				</form>
				<SimpleConfirmDialog open={isConfirmOpen} onConfirm={() => { submitFormData(); setIsConfirmOpen(false); }} onCancel={() => { setIsConfirmOpen(false) }}>
					{t('page.confirmsubmit')}
				</SimpleConfirmDialog>
				<SettlementStatementDialog
					title={settlementStatementDialogTitle}
					dialogSize={'lg'}
					open={isSettlementStatementDialogOpen}
					onClose={() => {
						setIsSettlementStatementDialogOpen(false);
					}}
					children={WrapSoloFormNode(Parameterization('ViewTbLgtnnfggBdonpj', {
						key: 'ViewTbLgtnnfggBdonpj',
						readOnly: false,
						initialData: presettlementStatementData,
						onCancel: (formData: any) => {
							setIsSettlementStatementDialogOpen(false);
						},
						onSubmit: (formData: any) => {
							setIsSettlementStatementDialogOpen(false);
						},
					}))}
				/>
				<ElectricityStatisticsDialog
					title={electricityStatisticsDialogTitle}
					dialogSize={'lg'}
					open={isElectricityStatisticsDialogOpen}
					onClose={() => {
						setIsElectricityStatisticsDialogOpen(false);
					}}
					children={WrapSoloFormNode(Parameterization('ViewTbGvfrokeqSfidnf', {
						key: 'ViewTbGvfrokeqSfidnf',
						initialData: electricityStatisticsInitialData,
						onCancel: (formData: any) => {
							setIsElectricityStatisticsDialogOpen(false);
						},
						onSubmit: (formData: any) => {
							setIsElectricityStatisticsDialogOpen(false);
						},
					}))}
				/>
				<SyncMerchantDialog
					title={syncMerchantDialogTitle}
					dialogSize={'lg'}
					open={isSyncMerchantDialogOpen}
					onClose={() => {
						setIsSyncMerchantDialogOpen(false);
					}}
					children={WrapSoloFormNode(Parameterization('ViewTbXbbyezwtMugqix', {
						initialData: syncMerchantInitialData,
						onCancel: (formData: any) => {
							setIsSyncMerchantDialogOpen(false);
						},
						onSubmit: (formData: any) => {
							setIsSyncMerchantDialogOpen(false);
						},
					}))}
				/>
				<SyncMerchantDialog
					title={syncMerchantDialogTitle}
					dialogSize={'lg'}
					open={isSyncMerchantDialogOpen}
					onClose={() => {
						setIsSyncMerchantDialogOpen(false);
					}}
					children={WrapSoloFormNode(Parameterization('ViewTbWzghpmogSemlgb', {
						initialData: syncMerchantInitialData,
						onCancel: (formData: any) => {
							setIsSyncMerchantDialogOpen(false);
						},
						onSubmit: (formData: any) => {
							setIsSyncMerchantDialogOpen(false);
						},
					}))}
				/>
				<BillingStandardDialog
					title={billingStandardDialogTitle}
					dialogSize={'lg'}
					open={isBillingStandardDialogOpen}
					onClose={() => {
						setIsBillingStandardDialogOpen(false);
					}}
					children={WrapSoloFormNode(Parameterization('ViewTbWzghpmogVxpfmm', {
						initialData: billingStandardInitialData,
						onCancel: (formData: any) => {
							setIsBillingStandardDialogOpen(false);
						},
						onSubmit: (formData: any) => {
							setIsBillingStandardDialogOpen(false);
						},
					}))}
				/>
				<AgentPurchasedDialog
					title={agentPurchasedDialogTitle}
					dialogSize={'lg'}
					open={isAgentPurchasedDialogOpen}
					onClose={() => {
						setIsAgentPurchasedDialogOpen(false);
					}}
					children={WrapSoloFormNode(Parameterization('ViewTbXntlcwohUzlwbg', {
						initialData: agentPurchasedInitialData,
						onCancel: (formData: any) => {
							setIsAgentPurchasedDialogOpen(false);
						},
						onSubmit: (formData: any) => {
							setIsAgentPurchasedDialogOpen(false);
						},
					}))}
				/>
			</ThemeProvider>
		</>
	)
}