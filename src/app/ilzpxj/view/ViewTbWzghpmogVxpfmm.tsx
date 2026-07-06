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
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
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
	const groupCardStyle = "relative rounded-2xl bg-white ring-1 ring-gray-900/5 shadow-sm hover:shadow-md transition-shadow duration-300 p-4 sm:p-5 mx-auto max-w-3xl";
	const groupTitleStyle = "flex items-center gap-2.5 text-sm font-semibold tracking-tight text-gray-900";
	const groupDescriptionStyle = "mt-1.5 ml-10 text-xs/5 text-gray-500";
	const groupContentStyle = "mt-6 grid grid-cols-1 gap-x-6 gap-y-7";
	const listFitCardStyle = "border-b border-gray-900/10 pb-12 mx-auto w-fit";
	const listCardStyle = "border-b border-gray-900/10 pb-12 mx-auto max-w-2xl";
	const tableStyle = "w-full table-fixed border-collapse text-sm";
	const tableCaptionStyle = "caption-top text-left pb-6 text-base/7 font-semibold text-gray-900";
	const tableThStyle = "border border-gray-200 bg-gray-50 h-[53px] text-center font-medium currentColor dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200";
	const tableTbodyStyle = "bg-white dark:bg-gray-800";
	const tableTdStyle = "border border-gray-200 h-[53px] text-center text-gray-900 dark:border-gray-600 dark:text-gray-400";
	const oneColumnStyle = "";
	const oneRowStyle = "col-span-full";
	const labelStyle = "block text-xs font-medium text-gray-700 mb-1";
	const uploadStyle = "mt-2 flex justify-center";
	const errorStyle = "mt-2 text-sm text-red-600";
	const submitStyle = "inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-md";
	const cancelStyle = "inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 disabled:opacity-60 disabled:cursor-not-allowed";


	// Managing form data and validation errors with useState
	const [formData, setFormData] = useState(() => {
		const defaultData = {
			xdsjflqz: '',
			imxdflym: '',
			qepibxbv: '',
			fpllerek: '',
			xjegvvik: '',
			colPrice: '',
			elacpixp: '',
			zdwotikn: '',
			zrahdrwh: '',
			xntauybt: '',
			bwvcrcnt: '',
			cvbvwepx: '',
			qnttkoss: '',
			anycondsId: '',
			anycondsName: '',
			kpmrawic: '',
			colPhzrfx: '',
			trdeksdd: '',
			colZrubxi: '',
			olsmhynx: '',
			olmzmqkw: '',
			colCzxxiv: '',
			zbcfxeps: '',
			onrhzypc: '',
			pkWzghpmog: '',
			pkFpbztytz: '',
			tableViewOPTMode: 'submit',
			formDataBin: {}
		}

		// Merge the incoming data with the default data
		return { ...defaultData, ...initialData, ...fromData };
	});


	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const fieldRefs = useRef<Record<string, HTMLElement>>({});

	useEffect(() => {
		// This effect will run whenever initialData changes
		if (formData.pkWzghpmog !== '') {
			axios.post(bpcApiUrl + '/tableview/queryformdata/view_tb_wzghpmog_vxpfmm/' + formData.pkWzghpmog, {}, {
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

					setDisplayPriceDetails(response.data.data.fpllerek === 'P0001' || response.data.data.fpllerek === 'P0004');

					setDisplayPrice(response.data.data.fpllerek === 'P0003');

					setDisplayConsumptionRatio(String(response.data.data.zbcfxeps) === '1');
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
				setErrors(prevErrors => ({ ...prevErrors, [itemName]: t('validation.dateRange') }));
			}
			case 'minDate': {
				setErrors(prevErrors => ({ ...prevErrors, [itemName]: t('validation.dateRange') }));
			}
			case 'invalidDate': {

				setErrors(prevErrors => ({ ...prevErrors, [itemName]: t('validation.dateInvalid') }));
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

	const [displayPriceDetails, setDisplayPriceDetails] = useState<Boolean>(false);

	const [displayPrice, setDisplayPrice] = useState<Boolean>(false);

	const [displayConsumptionRatio, setDisplayConsumptionRatio] = useState<Boolean>(false);

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

		if (targetItemName === 'xjegvvik') {
			const selectedOption = options.find(option => option.id === value);

			if (selectedOption) {
				setFormData((prevData: any) => ({ ...prevData, [targetItemName]: selectedOption.name }));
			}

			setDisplayPriceDetails(value === 'P0001' || value === 'P0004');

			setDisplayPrice(value === 'P0003');
		}

		if (targetItemName === 'onrhzypc') {
			const selectedOption = options.find(option => option.id === value);

			if (selectedOption) {
				setFormData((prevData: any) => ({ ...prevData, [targetItemName]: selectedOption.name }));
			}

			setDisplayConsumptionRatio(value === '1');
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
			let formDataVal = (formData[name as keyof typeof formData] ?? '').trim();

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
		"fpllerek": (value: any) => {
			if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');

			return '';
		},
		"colPrice": (value: any) => {
			if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');

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

		axios.post(bpcApiUrl + '/tableview/remixjsondata/view_tb_wzghpmog_vxpfmm', trimObjectValues(formData), {
			headers: {
				'grooveToken': token
			}
		}).then(response => {
			if (response.data && response.data.success) {
				setFormData((prevData: any) => ({
					...prevData,
					pkWzghpmog: response.data.data.pkWzghpmog,
				}));

				const jsonData = { ...formData };

				showAlert(t('message.operationSuccess'), 'success');

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

		if (validationRules["fpllerek"]) {
			const errorMsg = validationRules["fpllerek"](formData.fpllerek);

			if (errorMsg != '') {
				newErrors["fpllerek"] = errorMsg;
			}
		}

		// When 电价计算依据 is 固定电价 ('P0003'), 电价 is required
		if (formData.fpllerek === 'P0003') {
			const colPriceErrorMsg = validationRules["colPrice"](formData.colPrice);

			if (colPriceErrorMsg != '') {
				newErrors["colPrice"] = colPriceErrorMsg;
			}
		}

		// Helper: mark the given fields as required when empty
		const requireFields = (fields: string[]) => {
			fields.forEach((field) => {
				if (isEmpty((formData as any)[field], false)) {
					newErrors[field] = t('validation.required');
				}
			});
		};

		// When 电价计算依据 is 代理购电工商业用户电价表 ('P0001'), 电价分类 fields are required
		if (formData.fpllerek === 'P0001') {
			requireFields(['elacpixp', 'zrahdrwh', 'bwvcrcnt']);
		}

		// When 消纳比 is 是 ('1'), the three rows below are required
		if (formData.zbcfxeps === '1') {
			requireFields(['kpmrawic', 'colPhzrfx', 'trdeksdd', 'colZrubxi', 'olsmhynx', 'olmzmqkw', 'colCzxxiv']);
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
				<div className="min-h-full bg-gradient-to-b from-slate-50 via-white to-blue-50/30 py-4 px-3 sm:px-4">
					<form id="form_view_tb_wzghpmog_vxpfmm" onSubmit={handleSubmit} className="relative mx-auto max-w-3xl">
						{/* Hero header */}
						<div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 sm:px-5 shadow-lg shadow-blue-600/25">
							<h1 className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-white">
								<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-inset ring-white/25">
									<BoltRoundedIcon fontSize="small" />
								</span>
								商户电价配置
							</h1>
							<p className="mt-1.5 text-xs text-blue-100/90">设置电价计算依据、用电分类与消纳比规则，完善商户的电费核算配置。</p>
						</div>
						<div className="space-y-4">
							<div className={groupCardStyle}>
								<h2 className={groupTitleStyle}>
									<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
										<BoltRoundedIcon fontSize="small" />
									</span>
									电价设置
								</h2>
								<p className={groupDescriptionStyle}>选择电价计算依据，并按需填写固定电价。</p>
								<div className={groupContentStyle + ` sm:grid-cols-2`}>
									<div className={oneRowStyle}>
										<label htmlFor="tb_wzghpmog_xdsjflqz" className={labelStyle}>
											商户
										</label>
										<div className="mt-2">
											{isViewReadOnly ? (
												<Typography variant="body2" gutterBottom>{formData.xdsjflqz || ''}</Typography>
											) : (
												<FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['xdsjflqz'] = el;
												}}>
													<TextField
														id="tb_wzghpmog_xdsjflqz"
														name="xdsjflqz"
														value={formData.xdsjflqz || ''}
														onChange={handleInputChange}
														size="small"
														variant="outlined"
														error={errors.xdsjflqz ? true : false}
														helperText={errors.xdsjflqz}
														slotProps={{
															input: {
																readOnly: true,
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
									<div className={oneRowStyle + ` hidden`}>
										<label htmlFor="tb_wzghpmog_imxdflym" className={labelStyle}>
											户号
										</label>
										<div className="mt-2">
											{isViewReadOnly ? (
												<Typography variant="body2" gutterBottom>{formData.imxdflym || ''}</Typography>
											) : (
												<FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['imxdflym'] = el;
												}}>
													<TextField
														id="tb_wzghpmog_imxdflym"
														name="imxdflym"
														value={formData.imxdflym || ''}
														onChange={handleInputChange}
														size="small"
														variant="outlined"
														error={errors.imxdflym ? true : false}
														helperText={errors.imxdflym}
														slotProps={{
															input: {
																readOnly: true,
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
									<input type="hidden" name="qepibxbv" placeholder="" value={formData.qepibxbv || ''} />
									<div className={oneRowStyle}>
										<label htmlFor="tb_wzghpmog_fpllerek" className={labelStyle}>
											电价计算依据
										</label>
										<div className="mt-2">
											{isViewReadOnly ? (
												<Typography variant="body2" gutterBottom>{formData.xjegvvik || ''}</Typography>
											) : (
												<FormControl fullWidth size="small"
													error={!!errors['fpllerek']}
													ref={(el) => {
														if (el) fieldRefs.current['fpllerek'] = el;
													}}
												>
													<RadioGroup
														row
														aria-labelledby="fpllerek-row-radio-buttons-group-label"
														name="fpllerek"
														value={formData.fpllerek}
														onChange={(e) => { handleRadioChange(e, [{ 'id': 'P0001', 'name': '代理购电工商业用户电价表' }, { 'id': 'P0002', 'name': '电费单电价' }, { 'id': 'P0003', 'name': '固定电价' }], 'xjegvvik') }}
													>
														<FormControlLabel value="P0001" control={<Radio />} label="代理购电工商业用户电价表" />
														<FormControlLabel value="P0002" control={<Radio />} label="电费单电价" />
														<FormControlLabel value="P0003" control={<Radio />} label="固定电价" />
													</RadioGroup>
													<FormHelperText>{errors['fpllerek']}</FormHelperText>
												</FormControl>
											)}
										</div>
									</div>
									<input type="hidden" name="xjegvvik" placeholder="" value={formData.xjegvvik || ''} />
									<div className={`${oneColumnStyle} ${!displayPrice ? 'hidden' : ''}`}>
										<label htmlFor="tb_wzghpmog_colPrice" className={labelStyle}>
											电价
										</label>
										<div className="mt-2">
											{isViewReadOnly ? (
												<Typography variant="body2" gutterBottom>{formData.colPrice || ''}</Typography>
											) : (
												<FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['colPrice'] = el;
												}}>
													<TextField
														type="number"
														id="tb_wzghpmog_colPrice"
														name="colPrice"
														value={formData.colPrice || ''}
														onChange={handleInputChange}
														size="small"
														variant="outlined"
														error={errors.colPrice ? true : false}
														helperText={errors.colPrice}
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
										<label htmlFor="tb_wzghpmog_qnttkoss" className={labelStyle}>
											电价优惠
										</label>
										<div className="mt-2">
											{isViewReadOnly ? (
												<Typography variant="body2" gutterBottom>{formData.qnttkoss || ''}</Typography>
											) : (
												<FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['qnttkoss'] = el;
												}}>
													<TextField
														type="number"
														id="tb_wzghpmog_qnttkoss"
														name="qnttkoss"
														value={formData.qnttkoss || ''}
														onChange={handleInputChange}
														size="small"
														variant="outlined"
														error={errors.qnttkoss ? true : false}
														helperText={errors.qnttkoss}
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
									
								</div>
							</div>
							<div className={`${groupCardStyle} ${!displayPriceDetails ? 'hidden' : ''}`}>
								<h2 className={groupTitleStyle}>
									<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
										<CategoryRoundedIcon fontSize="small" />
									</span>
									电价分类
								</h2>
								<p className={groupDescriptionStyle}>明确用电分类、用电制度与电压等级。</p>
								<div className={groupContentStyle + ` sm:grid-cols-2`}>
									<div className={oneColumnStyle}>
										<label htmlFor="tb_wzghpmog_elacpixp" className={labelStyle}>
											用电分类
										</label>
										<div className="mt-2">
											{isViewReadOnly ? (
												<Typography variant="body2" gutterBottom>{formData.zdwotikn || ''}</Typography>
											) : (
												<FormControl fullWidth size="small"
													error={!!errors['elacpixp']}
													ref={(el) => {
														if (el) fieldRefs.current['elacpixp'] = el;
													}}
												>
													<Select
														id="tb_wzghpmog_elacpixp"
														name='elacpixp'
														value={formData.elacpixp || ''}
														onChange={(e) => handleSelectChange(e, [{ 'id': '01', 'name': '一般工商业用电' }, { 'id': '02', 'name': '大工业用电' },], 'zdwotikn')}
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
													<FormHelperText>{errors['elacpixp']}</FormHelperText>
												</FormControl>
											)}
										</div>
									</div>
									<input type="hidden" name="zdwotikn" placeholder="" value={formData.zdwotikn || ''} />
									<div className={oneColumnStyle}>
										<label htmlFor="tb_wzghpmog_zrahdrwh" className={labelStyle}>
											用电制度
										</label>
										<div className="mt-2">
											{isViewReadOnly ? (
												<Typography variant="body2" gutterBottom>{formData.xntauybt || ''}</Typography>
											) : (
												<FormControl fullWidth size="small"
													error={!!errors['zrahdrwh']}
													ref={(el) => {
														if (el) fieldRefs.current['zrahdrwh'] = el;
													}}
												>
													<Select
														id="tb_wzghpmog_zrahdrwh"
														name='zrahdrwh'
														value={formData.zrahdrwh || ''}
														onChange={(e) => handleSelectChange(e, [{ 'id': '1', 'name': '单一制' }, { 'id': '2', 'name': '两部制' },], 'xntauybt')}
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

														<MenuItem value='1'>单一制</MenuItem>
														<MenuItem value='2'>两部制</MenuItem>
													</Select>
													<FormHelperText>{errors['zrahdrwh']}</FormHelperText>
												</FormControl>
											)}
										</div>
									</div>
									<input type="hidden" name="xntauybt" placeholder="" value={formData.xntauybt || ''} />
									<div className={oneColumnStyle}>
										<label htmlFor="tb_wzghpmog_bwvcrcnt" className={labelStyle}>
											电压等级
										</label>
										<div className="mt-2">
											{isViewReadOnly ? (
												<Typography variant="body2" gutterBottom>{formData.cvbvwepx || ''}</Typography>
											) : (
												<FormControl fullWidth size="small"
													error={!!errors['bwvcrcnt']}
													ref={(el) => {
														if (el) fieldRefs.current['bwvcrcnt'] = el;
													}}
												>
													<Select
														id="tb_wzghpmog_bwvcrcnt"
														name='bwvcrcnt'
														value={formData.bwvcrcnt || ''}
														onChange={(e) => handleSelectChange(e, [{ 'id': '1', 'name': '不满1千' }, { 'id': '10', 'name': '10千伏' }, { 'id': '35', 'name': '35千伏' }, { 'id': '110', 'name': '110千伏' }, { 'id': '220', 'name': '220千伏' },], 'cvbvwepx')}
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

														<MenuItem value='1'>不满1千</MenuItem>
														<MenuItem value='10'>10千伏</MenuItem>
														<MenuItem value='35'>35千伏</MenuItem>
														<MenuItem value='110'>110千伏</MenuItem>
														<MenuItem value='220'>220千伏</MenuItem>
													</Select>
													<FormHelperText>{errors['bwvcrcnt']}</FormHelperText>
												</FormControl>
											)}
										</div>
									</div>
									<input type="hidden" name="cvbvwepx" placeholder="" value={formData.cvbvwepx || ''} />
									<div className={oneRowStyle}>
										<label htmlFor="tb_wzghpmog_anycondsId" className={labelStyle}>
											附加条件
										</label>
										<div className="mt-2">
											{isViewReadOnly ? (
												<Typography variant="body2" gutterBottom>{formData.anycondsId || ''}</Typography>
											) : (
												<FormControl fullWidth size="small"
													error={!!errors['anycondsId']}
													ref={(el) => {
														if (el) fieldRefs.current['anycondsId'] = el;
													}}
												>
													<FormGroup
														row
														aria-labelledby="anycondsId-row-checkbox-buttons-group-label"
													>
														<FormControlLabel control={<Checkbox checked={hasValue(formData.anycondsId, '01')}
															onChange={(e) => {
																handleCheckboxChange(e, {
																	'id': '01',
																	'name': '上网环节线损电价'
																}, 'anycondsName')
															}}
															name="anycondsId"

														/>} label="上网环节线损电价" />
														<FormControlLabel control={<Checkbox checked={hasValue(formData.anycondsId, '02')}
															onChange={(e) => {
																handleCheckboxChange(e, {
																	'id': '02',
																	'name': '系统运行费折价'
																}, 'anycondsName')
															}}
															name="anycondsId"

														/>} label="系统运行费折价" />
														<FormControlLabel control={<Checkbox checked={hasValue(formData.anycondsId, '03')}
															onChange={(e) => {
																handleCheckboxChange(e, {
																	'id': '03',
																	'name': '政府性基金及附加'
																}, 'anycondsName')
															}}
															name="anycondsId"

														/>} label="政府性基金及附加" />
													</FormGroup>
													<FormHelperText>{errors['anycondsId']}</FormHelperText>
												</FormControl>
											)}
										</div>
									</div>
									<input type="hidden" name="anycondsName" placeholder="" value={formData.anycondsName || ''} />
								</div>
							</div>
							<div className={groupCardStyle}>
								<h2 className={groupTitleStyle}>
									<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100">
										<TuneRoundedIcon fontSize="small" />
									</span>
									消纳比设置
								</h2>
								<p className={groupDescriptionStyle}>配置消纳比区间及对应的电价优惠规则。</p>
								<div className={groupContentStyle + ` sm:grid-cols-2`}>
									<div className={oneRowStyle}>
										<label htmlFor="tb_wzghpmog_zbcfxeps" className={labelStyle}>
											消纳比
										</label>
										<div className="mt-2">
											{isViewReadOnly ? (
												<Typography variant="body2" gutterBottom>{formData.onrhzypc || ''}</Typography>
											) : (
												<FormControl fullWidth size="small"
													error={!!errors['zbcfxeps']}
													ref={(el) => {
														if (el) fieldRefs.current['zbcfxeps'] = el;
													}}
												>
													<RadioGroup
														row
														aria-labelledby="zbcfxeps-row-radio-buttons-group-label"
														name="zbcfxeps"
														value={formData.zbcfxeps}
														onChange={(e) => { handleRadioChange(e, [{ 'id': '0', 'name': '否' }, { 'id': '1', 'name': '是' },], 'onrhzypc') }}
													>
														<FormControlLabel value="0" control={<Radio />} label="否" />
														<FormControlLabel value="1" control={<Radio />} label="是" />
													</RadioGroup>
													<FormHelperText>{errors['zbcfxeps']}</FormHelperText>
												</FormControl>
											)}
										</div>
									</div>
									<input type="hidden" name="onrhzypc" placeholder="" value={formData.onrhzypc || ''} />
									{displayConsumptionRatio && (<>
										<div className={oneColumnStyle}>
											<label htmlFor="tb_fpbztytz_kpmrawic" className={labelStyle}>
												小于%
											</label>
											<div className="mt-2">
												{isViewReadOnly ? (
													<Typography variant="body2" gutterBottom>{formData.kpmrawic || ''}</Typography>
												) : (
													<FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['kpmrawic'] = el;
													}}>
														<TextField
															type="number"
															id="tb_fpbztytz_kpmrawic"
															name="kpmrawic"
															value={formData.kpmrawic || ''}
															onChange={handleInputChange}
															size="small"
															variant="outlined"
															error={errors.kpmrawic ? true : false}
															helperText={errors.kpmrawic}
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
											<label htmlFor="tb_fpbztytz_colPhzrfx" className={labelStyle}>
												电价优惠
											</label>
											<div className="mt-2">
												{isViewReadOnly ? (
													<Typography variant="body2" gutterBottom>{formData.colPhzrfx || ''}</Typography>
												) : (
													<FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['colPhzrfx'] = el;
													}}>
														<TextField
															type="number"
															id="tb_fpbztytz_colPhzrfx"
															name="colPhzrfx"
															value={formData.colPhzrfx || ''}
															onChange={handleInputChange}
															size="small"
															variant="outlined"
															error={errors.colPhzrfx ? true : false}
															helperText={errors.colPhzrfx}
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
											<label htmlFor="tb_fpbztytz_trdeksdd" className={labelStyle}>
												大于%
											</label>
											<div className="mt-2">
												{isViewReadOnly ? (
													<Typography variant="body2" gutterBottom>{formData.trdeksdd || ''}</Typography>
												) : (
													<FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['trdeksdd'] = el;
													}}>
														<TextField
															type="number"
															id="tb_fpbztytz_trdeksdd"
															name="trdeksdd"
															value={formData.trdeksdd || ''}
															onChange={handleInputChange}
															size="small"
															variant="outlined"
															error={errors.trdeksdd ? true : false}
															helperText={errors.trdeksdd}
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
											<label htmlFor="tb_fpbztytz_colZrubxi" className={labelStyle}>
												电价优惠
											</label>
											<div className="mt-2">
												{isViewReadOnly ? (
													<Typography variant="body2" gutterBottom>{formData.colZrubxi || ''}</Typography>
												) : (
													<FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['colZrubxi'] = el;
													}}>
														<TextField
															type="number"
															id="tb_fpbztytz_colZrubxi"
															name="colZrubxi"
															value={formData.colZrubxi || ''}
															onChange={handleInputChange}
															size="small"
															variant="outlined"
															error={errors.colZrubxi ? true : false}
															helperText={errors.colZrubxi}
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
											<label className={labelStyle}>
												区间设置（大于% / 小于%）
											</label>
											<div className="mt-2">
												{isViewReadOnly ? (
													<Typography variant="body2" gutterBottom>{`${formData.olsmhynx || ''} ~ ${formData.olmzmqkw || ''}`}</Typography>
												) : (
													<div className="flex items-start gap-2">
														<FormControl fullWidth ref={(el) => {
															if (el) fieldRefs.current['olsmhynx'] = el;
														}}>
															<TextField
																type="number"
																id="tb_fpbztytz_olsmhynx"
																name="olsmhynx"
																placeholder="大于%"
																value={formData.olsmhynx || ''}
																onChange={handleInputChange}
																size="small"
																variant="outlined"
																error={errors.olsmhynx ? true : false}
																helperText={errors.olsmhynx}
															/>
														</FormControl>
														<FormControl fullWidth ref={(el) => {
															if (el) fieldRefs.current['olmzmqkw'] = el;
														}}>
															<TextField
																type="number"
																id="tb_fpbztytz_olmzmqkw"
																name="olmzmqkw"
																placeholder="小于%"
																value={formData.olmzmqkw || ''}
																onChange={handleInputChange}
																size="small"
																variant="outlined"
																error={errors.olmzmqkw ? true : false}
																helperText={errors.olmzmqkw}
															/>
														</FormControl>
													</div>
												)}
											</div>
										</div>
										<div className={oneColumnStyle}>
											<label htmlFor="tb_fpbztytz_colCzxxiv" className={labelStyle}>
												电价优惠
											</label>
											<div className="mt-2">
												{isViewReadOnly ? (
													<Typography variant="body2" gutterBottom>{formData.colCzxxiv || ''}</Typography>
												) : (
													<FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['colCzxxiv'] = el;
													}}>
														<TextField
															type="number"
															id="tb_fpbztytz_colCzxxiv"
															name="colCzxxiv"
															value={formData.colCzxxiv || ''}
															onChange={handleInputChange}
															size="small"
															variant="outlined"
															error={errors.colCzxxiv ? true : false}
															helperText={errors.colCzxxiv}
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
									</>
									)}
								</div>

							</div>
						</div>
						<div className="sticky bottom-4 z-10 mt-8 flex items-center justify-end gap-x-3 px-5 py-4 backdrop-blur-md">
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
									<ArrowBackRoundedIcon fontSize="small" />
									{t('page.back')}
								</button>
							) : (
								<>
									<button type="button" disabled={disabledAction} className={cancelStyle}
										onClick={() => {
											if (onCancel) {
												const jsonData = { ...formData };

												onCancel(jsonData);
											} else if (from) {
												navigate(from);
											}
										}}
									>
										<CancelIcon fontSize="small" />
										{t('page.cancel')}
									</button>
									<button
										disabled={disabledAction}
										type="submit"
										className={submitStyle}>
										<CheckCircleRoundedIcon fontSize="small" />
										{t('page.submit')}
									</button>
								</>
							)}
						</div>
						{isLoading && (
							<Box
								className="fixed inset-0 flex justify-center items-center bg-white/60 z-50 backdrop-blur-sm"
							>
								<CircularProgress disableShrink color="inherit" />
							</Box>
						)}
					</form>
				</div>
				<SimpleConfirmDialog open={isConfirmOpen} onConfirm={() => { submitFormData(); setIsConfirmOpen(false); }} onCancel={() => { setIsConfirmOpen(false) }}>
					{t('page.confirmsubmit')}
				</SimpleConfirmDialog>
			</ThemeProvider>
		</>
	)
}