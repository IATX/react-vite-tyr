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

import { FormControl, FormControlLabel, FormHelperText, MenuItem, Radio, Checkbox, RadioGroup, Select, TextField, type SelectChangeEvent, FormGroup, InputAdornment, Typography, Box, CircularProgress, ButtonGroup, Button } from '@mui/material';

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
	const from = state?.from ?? '/main';
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
			kwotkios: '',
			qyziqspn: '',
			bykrkknf: '',
			listMmpppb: [],
			pkEnpqommq: '',
			tableViewOPTMode: 'submit',
			formDataBin: {}
		}

		// Merge the incoming data with the default data
		return { ...defaultData, ...initialData, ...fromData };
	});

	const [focusedlistMmpppbRowId, setFocusedlistMmpppbRowId] = useState<string | null>(null);
	const [editinglistMmpppbRowId, setEditinglistMmpppbRowId] = useState<string | null>(null);
	const [isConfirmDeletionlistMmpppbRowOpen, setIsConfirmDeletionlistMmpppbRowOpen] = useState(false);

	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const fieldRefs = useRef<Record<string, HTMLElement>>({});

	useEffect(() => {
		// This effect will run whenever initialData changes
		if (formData.pkEnpqommq !== '') {
			axios.post(bpcApiUrl + '/tableview/queryformdata/view_tb_enpqommq_stpinc/' + formData.pkEnpqommq, {}, {
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
		"kwotkios": (value: any) => {
			if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return "Field is required.";

			return '';
		},
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

		axios.post(bpcApiUrl + '/tableview/remixjsondata/view_tb_enpqommq_stpinc', trimObjectValues(formData), {
			headers: {
				'grooveToken': token
			}
		}).then(response => {
			if (response.data && response.data.success) {
				setFormData((prevData: any) => ({
					...prevData,
					pkEnpqommq: response.data.data.pkEnpqommq,
				}));

				const jsonData = { ...formData };

				showAlert('Operation successfully.', 'success');

				onSubmit?.(jsonData);
			} else if (response.data && !response.data.success) {
				showAlert(response.data.message, 'error');
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

		if (validationRules["kwotkios"]) {
			const errorMsg = validationRules["kwotkios"](formData.kwotkios);

			if (errorMsg != '') {
				newErrors["kwotkios"] = errorMsg;
			}
		}

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
				<form id="form_view_tb_enpqommq_stpinc" onSubmit={handleSubmit}>
					<div className="space-y-12">
						<div className={groupCardStyle}>
							<h2 className={groupTitleStyle}>结算单</h2>
							<p className={groupDescriptionStyle}>

							</p>
							<div className={groupContentStyle + ` sm:grid-cols-2`}>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_enpqommq_kwotkios" className={labelStyle}>
										商户
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.kwotkios || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['kwotkios'] = el;
											}}>
												<TextField
													id="tb_enpqommq_kwotkios"
													name="kwotkios"
													value={formData.kwotkios || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.kwotkios ? true : false}
													helperText={errors.kwotkios}
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
									<label htmlFor="tb_enpqommq_qyziqspn" className={labelStyle}>
										结算年
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{new Date(formData.qyziqspn).toLocaleDateString() || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['qyziqspn'] = el;
											}}>
												<DatePicker
													name="qyziqspn"
													format="YYYY-MM-DD"
													value={formData.qyziqspn ? dayjs(formData.qyziqspn) : null}
													views={['year', 'month', 'day']}
													onChange={(newValue: Dayjs | null) => handleDateChange('qyziqspn', newValue)}
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
															id: 'tb_enpqommq_qyziqspn',
															error: !!errors['qyziqspn'],
															helperText: errors['qyziqspn'],
														},
													}}
												/>
											</FormControl>
										)}
									</div>
								</div>
								<div className={oneColumnStyle}>
									<label htmlFor="tb_enpqommq_bykrkknf" className={labelStyle}>
										发电户号
									</label>
									<div className="mt-2">
										{isViewReadOnly ? (
											<Typography variant="body2" gutterBottom>{formData.bykrkknf || ''}</Typography>
										) : (
											<FormControl fullWidth ref={(el) => {
												if (el) fieldRefs.current['bykrkknf'] = el;
											}}>
												<TextField
													id="tb_enpqommq_bykrkknf"
													name="bykrkknf"
													value={formData.bykrkknf || ''}
													onChange={handleInputChange}
													size="small"
													variant="outlined"
													error={errors.bykrkknf ? true : false}
													helperText={errors.bykrkknf}
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
										<h2 className={groupTitleStyle}>详情</h2>

										{!!!isViewReadOnly && (
											<Button
												variant="outlined"
												size="small"
												color="primary"
												startIcon={<AddIcon />}
												onClick={(e) => {
													setFocusedlistMmpppbRowId(null);
													setEditinglistMmpppbRowId(null);

													const newRow: any = {

													};

													setFormData((prevFormData: { listMmpppb: any; }) => ({
														...prevFormData,
														listMmpppb: [
															...prevFormData.listMmpppb,
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
									{/* 第一行：定义跨行的大项和跨列的组标题 */}
									<tr>
										<th className={tableThStyle} rowSpan={2}>所属期</th>
										<th className={tableThStyle} rowSpan={2}>总上网电量</th>
										<th className={tableThStyle} rowSpan={2}>余电上网电量</th>
										<th className={tableThStyle} rowSpan={2}>自发自用用电量</th>
										<th className={tableThStyle} rowSpan={2}>消纳比例</th>
										<th className={tableThStyle} rowSpan={2}>折扣</th>
										<th className={tableThStyle} colSpan={4} style={{ textAlign: 'center' }}>合计</th>
										<th className={tableThStyle} colSpan={4} style={{ textAlign: 'center' }}>余电上网部分</th>
										<th className={tableThStyle} colSpan={4} style={{ textAlign: 'center' }}>自发自用部分</th>
									</tr>

									{/* 第二行：定义所有被包裹的子列标题 */}
									<tr>
										{/* 合计 子项 */}
										<th className={tableThStyle}>结算电价（含税）</th>
										<th className={tableThStyle}>结算电费</th>
										<th className={tableThStyle}>结算收入</th>
										<th className={tableThStyle}>销项税额</th>

										{/* 余电上网部分 子项 */}
										<th className={tableThStyle}>结算电价（含税）</th>
										<th className={tableThStyle}>结算电费</th>
										<th className={tableThStyle}>结算收入</th>
										<th className={tableThStyle}>销项税额</th>

										{/* 自发自用部分 子项 */}
										<th className={tableThStyle}>非分时电度电价</th>
										<th className={tableThStyle}>结算电费</th>
										<th className={tableThStyle}>营业收入</th>
										<th className={tableThStyle}>销项税额</th>
									</tr>
								</thead>
								<tbody className={tableTbodyStyle}>
									{formData.listMmpppb.map((item: any, index: number) => {
										const rowIndex = 'row_' + index;

										const isFocused = rowIndex === focusedlistMmpppbRowId && !isViewReadOnly;
										const isEditing = rowIndex === editinglistMmpppbRowId && !isViewReadOnly;

										return (
											<tr
												key={rowIndex}
												onClick={() => {
													if (!focusedlistMmpppbRowId || editinglistMmpppbRowId !== rowIndex) {
														setFocusedlistMmpppbRowId(rowIndex);
														setEditinglistMmpppbRowId(null);
													}
												}}
												className={[
													'cursor-pointer',
													'transition-colors',
													'relative',
													isFocused ? 'bg-blue-50' : 'hover:bg-gray-50',
												].join(' ')}>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'blpwfphd',
																'header': '总上网电量',
																'type': 'number'
															}}
															value={item.blpwfphd}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['blpwfphd']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.blpwfphd}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'bgbmzbmj',
																'header': '余电上网电量',
																'type': 'number'
															}}
															value={item.bgbmzbmj}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['bgbmzbmj']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.bgbmzbmj}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'qjcendqr',
																'header': '自发自用用电量',
																'type': 'number'
															}}
															value={item.qjcendqr}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['qjcendqr']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.qjcendqr}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'ggincvpc',
																'header': '消纳比例',
																'type': 'number'
															}}
															value={item.ggincvpc}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['ggincvpc']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.ggincvpc}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'nojglnvw',
																'header': '折扣',
																'type': 'number'
															}}
															value={item.nojglnvw}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['nojglnvw']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.nojglnvw}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'umuvkyot',
																'header': '结算电价（含税）（合计）',
																'type': 'money'
															}}
															value={item.umuvkyot}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['umuvkyot']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.umuvkyot}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'spiaexwa',
																'header': '结算电费（合计）',
																'type': 'money'
															}}
															value={item.spiaexwa}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['spiaexwa']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.spiaexwa}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'uqvxnemb',
																'header': '结算收入（合计）',
																'type': 'money'
															}}
															value={item.uqvxnemb}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['uqvxnemb']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.uqvxnemb}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'fkmeyflu',
																'header': '销项税额',
																'type': 'money'
															}}
															value={item.fkmeyflu}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['fkmeyflu']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.fkmeyflu}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'miquhxyq',
																'header': '结算电价（含税）（余电上网部分）',
																'type': 'money'
															}}
															value={item.miquhxyq}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['miquhxyq']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.miquhxyq}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'mpzhyjqp',
																'header': '结算电费（余电上网部分）',
																'type': 'money'
															}}
															value={item.mpzhyjqp}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['mpzhyjqp']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.mpzhyjqp}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'urpukiol',
																'header': '结算收入（余电上网部分）',
																'type': 'money'
															}}
															value={item.urpukiol}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['urpukiol']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.urpukiol}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'ndtxpupf',
																'header': '销项税额（余电上网部分）',
																'type': 'money'
															}}
															value={item.ndtxpupf}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['ndtxpupf']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.ndtxpupf}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'vbzfcepe',
																'header': '非分时电度电价（自发自用部分）',
																'type': 'money'
															}}
															value={item.vbzfcepe}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['vbzfcepe']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.vbzfcepe}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'nopmhtfz',
																'header': '结算电费（自发自用部分）',
																'type': 'money'
															}}
															value={item.nopmhtfz}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['nopmhtfz']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.nopmhtfz}</>
													)}


												</td>
												<td className={tableTdStyle}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'rljwqdas',
																'header': '营业收入（自发自用部分）',
																'type': 'money'
															}}
															value={item.rljwqdas}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['rljwqdas']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.rljwqdas}</>
													)}


												</td>
												<td className={tableTdStyle + ' '}>
													{isEditing ? (
														<RowInputRenderer
															column={{
																'key': 'vcbppsvv',
																'header': '销项税额（自发自用部分）',
																'type': 'money'
															}}
															value={item.vcbppsvv}
															onChange={(newValue) => {
																const updatedList = formData.listMmpppb.map((row: any, idx: number) => {
																	const rindex = 'row_' + idx;

																	if (rindex === rowIndex) {
																		return {
																			...row,
																			['vcbppsvv']: newValue,
																		};
																	}
																	return row;
																});

																setFormData((prevData: any) => {
																	return {
																		...prevData,
																		listMmpppb: updatedList,
																	};
																});
															}}
														/>
													) : (
														<>{item.vcbppsvv}</>
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

																		const currentList = formData.listMmpppb || [];

																		const newRow: any = {
																		};

																		let insertIndex = currentList.findIndex((row: any, idx: number) => ('row_' + idx) === focusedlistMmpppbRowId);

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
																			listMmpppb: updatedList,
																		}));

																		setFocusedlistMmpppbRowId(null);
																		setEditinglistMmpppbRowId(null);
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

																		const currentList = formData.listMmpppb || [];

																		const newRow: any = {
																		};

																		let focusedIndex = currentList.findIndex((row: any, idx: number) => ('row_' + idx) === focusedlistMmpppbRowId);

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
																			listMmpppb: updatedList,
																		}));

																		setFocusedlistMmpppbRowId(null);
																		setEditinglistMmpppbRowId(null);
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

																		setEditinglistMmpppbRowId(rowIndex);
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

																		setEditinglistMmpppbRowId(null);
																		setIsConfirmDeletionlistMmpppbRowOpen(true);
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

																		setFocusedlistMmpppbRowId(null);
																		setEditinglistMmpppbRowId(null);
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
								open={isConfirmDeletionlistMmpppbRowOpen}
								onConfirm={() => {
									setIsConfirmDeletionlistMmpppbRowOpen(false);

									// 1. Find the focused element outside of setFormData.
									const foundElement = formData.listMmpppb.find((row: any, idx: number) => {
										const rindex = 'row_' + idx;

										return rindex == focusedlistMmpppbRowId;
									});

									// 2. Use setFormData uniformly for all immutable state updates.
									setFormData((prevData: any) => {
										// 2a. Filter the new data list array (remove the focused row).
										const newList = prevData.listMmpppb.filter((row: any, idx: number) => {
											const rindex = 'row_' + idx;
											return rindex !== focusedlistMmpppbRowId;
										});

										// 2b. Initialize a new formDataBin structure.
										// Ensure that the old listId array is obtained from prevData; if it does not exist, use an empty array [].
										let discardedDataList = [...(prevData.formDataBin?.listMmpppb || [])];

										// 2c. Handle primary key insertion logic.
										if (foundElement && foundElement['pkLvaqfcvt'] !== null) {
											// The primary key value of the deleted row is added to a new copy of the discardedDataList array.
											discardedDataList.push(foundElement);
										}

										// 2d. Returns a completely new state object.
										return {
											...prevData,
											['listMmpppb']: newList, // Update data list
											formDataBin: {
												...prevData.formDataBin, // Preserve other possible key-value pairs in formDataBin
												listMmpppb: discardedDataList,       // Update the data List array in formDataBin
											},
										};
									});

									setFocusedlistMmpppbRowId(null);
								}
								}
								onCancel={() => {
									setIsConfirmDeletionlistMmpppbRowOpen(false);
								}}>
								{t('page.confirmdelete')}
							</SimpleConfirmDialog>
						</div>
					</div>
					<div className="mt-6 flex items-center justify-end gap-x-6">
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
								{t('page.back')}
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
			</ThemeProvider>
		</>
	)
}