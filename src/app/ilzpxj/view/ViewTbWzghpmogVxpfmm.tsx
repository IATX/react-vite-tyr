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
			xdsjflqz: '',
			imxdflym: '',
			qepibxbv: '',
			fpllerek: '',
			xjegvvik: '',
			qnttkoss: '',
			elacpixp: '',
			zdwotikn: '',
			zrahdrwh: '',
			xntauybt: '',
			bwvcrcnt: '',
			cvbvwepx: '',
			pkWzghpmog: '',
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

					setDisplayPriceDetails(response.data.data.fpllerek === 'P0001');
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

	const [displayPriceDetails, setDisplayPriceDetails] = useState<Boolean>(false);

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

			setDisplayPriceDetails(value === 'P0001');
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
		"fpllerek": (value: any) => {
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

		if (validationRules["fpllerek"]) {
			const errorMsg = validationRules["fpllerek"](formData.fpllerek);

			if (errorMsg != '') {
				newErrors["fpllerek"] = errorMsg;
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
				<form id="form_view_tb_wzghpmog_vxpfmm" onSubmit={handleSubmit}>
					<div className="space-y-12">
						<div className={groupCardStyle}>
							<h2 className={groupTitleStyle}>电价设置</h2>
							<p className={groupDescriptionStyle}>

							</p>
							<div className={groupContentStyle + ` sm:grid-cols-2`}>
								<div className={oneColumnStyle}>
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
								<div className={oneColumnStyle}>
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
								<div className={oneColumnStyle}>
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
													onChange={(e) => { handleRadioChange(e, [{ 'id': 'P0001', 'name': '代理购电工商业用户电价表' }, { 'id': 'P0002', 'name': '电费单电价' },], 'xjegvvik') }}
												>
													<FormControlLabel value="P0001" control={<Radio />} label="代理购电工商业用户电价表" />
													<FormControlLabel value="P0002" control={<Radio />} label="电费单电价" />
												</RadioGroup>
												<FormHelperText>{errors['fpllerek']}</FormHelperText>
											</FormControl>
										)}
									</div>
								</div>
								<input type="hidden" name="xjegvvik" placeholder="" value={formData.xjegvvik || ''} />
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
							<h2 className={groupTitleStyle}>电价分类</h2>
							<p className={groupDescriptionStyle}>

							</p>
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
							</div>
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
										if (onCancel) {
											const jsonData = { ...formData };

											onCancel(jsonData);
										} else if (from) {
											navigate(from);
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