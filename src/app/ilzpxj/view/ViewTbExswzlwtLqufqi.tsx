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
	readOnly?:boolean;
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
	const from =  state?.from;
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
			        		qrfxwkpy: '',
			        		umakupcb: '',
			        		ovehnwzi: '',
			        		kdaiahlw: '',
							colYwkcgr: '',
			        		colGudugq: '',
			        		colZyszui: '',
			        		colJbhosi: '',
			        		fgtqnhyn: '',
			        		nwcjwyrf: '',
			        		mrseixpo: '',
			        		kdzxnwil: '',
			        		qgwvxncr: '',
			        		jshfcttg: '',
			        		colTgqbxp: '',
			        		tpjmbqpf: '',
			        		rxnrcarc: '',
			        		afnfufjj: '',
			        		szimebex: '',
			        		nughvqbr: '',
			        		huscgxas: '',
	    	pkExswzlwt: '',
	    	tableViewOPTMode: 'submit',
	    	formDataBin:{}
    	}
    	
    	// Merge the incoming data with the default data
		return { ...defaultData, ...initialData, ...fromData};
    });
    
    
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const fieldRefs = useRef<Record<string, HTMLElement>>({});
    
    useEffect(() => {
		// This effect will run whenever initialData changes
		if (formData.pkExswzlwt !== '') {
			axios.post(bpcApiUrl + '/tableview/queryformdata/view_tb_exswzlwt_lqufqi/' + formData.pkExswzlwt, {}, {
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
			let formDataVal = formData[name as keyof typeof formData]?.trim();

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
		const newTimestamp = value ? Date.UTC(value.year(), value.month(), value.date()) : null;

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
		
	      axios.post(bpcApiUrl + '/tableview/remixjsondata/view_tb_exswzlwt_lqufqi', trimObjectValues(formData), {
	        headers: {
	          'grooveToken': token
	        }
	      }).then(response => {
	    	if (response.data && response.data.success) {
	    		setFormData((prevData: any) => ({
					...prevData,
					pkExswzlwt: response.data.data.pkExswzlwt,
				}));
	    	
	      		const jsonData = { ...formData };
	
				showAlert('Operation successfully.', 'success');
	
				onSubmit?.(jsonData);
	        } else if(response.data && !response.data.success) {
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
                 <form id="form_view_tb_exswzlwt_lqufqi" onSubmit={handleSubmit}>
                    <div className="space-y-12">
      					    	<div className={groupCardStyle}>
		                            <h2 className={groupTitleStyle}>结算详情</h2>
		                            <p className={groupDescriptionStyle}>
		                                
		                            </p>
		                            <div className={groupContentStyle + ` sm:grid-cols-2`}>
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_exswzlwt_qrfxwkpy" className={labelStyle}>
	                所属期
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{new Date(formData.qrfxwkpy).toLocaleDateString() || ''}</Typography>
	            	) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['qrfxwkpy'] = el;
												}}>
		               <DatePicker
                          name="qrfxwkpy"
                          format="YYYY-MM-DD"
                          value={formData.qrfxwkpy ? dayjs(formData.qrfxwkpy) : null}
                          views={['year', 'month', 'day']}
                          onChange={(newValue: Dayjs | null)=> handleDateChange('qrfxwkpy', newValue)}
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
                              id: 'tb_exswzlwt_qrfxwkpy',
                              error: !!errors['qrfxwkpy'],
                              helperText: errors['qrfxwkpy'],
                            },
                          }}
                       />
	              </FormControl>
	              )}
			     </div>
	        </div>       
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_exswzlwt_umakupcb" className={labelStyle}>
	                总上网电量
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.umakupcb || ''}</Typography>
	            	) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['umakupcb'] = el;
												}}>
		              <TextField
		                    type="number"
		                    id="tb_exswzlwt_umakupcb"
		                    name="umakupcb"
		                    value={formData.umakupcb || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.umakupcb ? true : false}
		                    helperText={errors.umakupcb}
		                    slotProps={{
					            input: {
					                 
					              startAdornment: <InputAdornment position="start"><NumberIcon className='text-base'/></InputAdornment>
					            },
					          }}
		                  />
	              </FormControl>
	              )}
			     </div>
	        </div> 
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_exswzlwt_ovehnwzi" className={labelStyle}>
	                余电上网电量
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.ovehnwzi || ''}</Typography>
	            	) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['ovehnwzi'] = el;
												}}>
		              <TextField
		                    type="number"
		                    id="tb_exswzlwt_ovehnwzi"
		                    name="ovehnwzi"
		                    value={formData.ovehnwzi || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.ovehnwzi ? true : false}
		                    helperText={errors.ovehnwzi}
		                    slotProps={{
					            input: {
					                 
					              startAdornment: <InputAdornment position="start"><NumberIcon className='text-base'/></InputAdornment>
					            },
					          }}
		                  />
	              </FormControl>
	              )}
			     </div>
	        </div> 
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_exswzlwt_kdaiahlw" className={labelStyle}>
	                自发自用用电量
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.kdaiahlw || ''}</Typography>
	            	) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['kdaiahlw'] = el;
												}}>
		              <TextField
		                    type="number"
		                    id="tb_exswzlwt_kdaiahlw"
		                    name="kdaiahlw"
		                    value={formData.kdaiahlw || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.kdaiahlw ? true : false}
		                    helperText={errors.kdaiahlw}
		                    slotProps={{
					            input: {
					                 
					              startAdornment: <InputAdornment position="start"><NumberIcon className='text-base'/></InputAdornment>
					            },
					          }}
		                  />
	              </FormControl>
	              )}
			     </div>
	        </div> 
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_exswzlwt_colYwkcgr" className={labelStyle}>
	                补贴电量
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.colYwkcgr || ''}</Typography>
	            	) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['colYwkcgr'] = el;
												}}>
		              <TextField
		                    type="number"
		                    id="tb_exswzlwt_colYwkcgr"
		                    name="colYwkcgr"
		                    value={formData.colYwkcgr || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.colYwkcgr ? true : false}
		                    helperText={errors.colYwkcgr}
		                    slotProps={{
					            input: {
					                 
					              startAdornment: <InputAdornment position="start"><NumberIcon className='text-base'/></InputAdornment>
					            },
					          }}
		                  />
	              </FormControl>
	              )}
			     </div>
	        </div> 
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_exswzlwt_colGudugq" className={labelStyle}>
	                消纳比例
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.colGudugq || ''}</Typography>
	            	) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['colGudugq'] = el;
												}}>
		              <TextField
		                    type="number"
		                    id="tb_exswzlwt_colGudugq"
		                    name="colGudugq"
		                    value={formData.colGudugq || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.colGudugq ? true : false}
		                    helperText={errors.colGudugq}
		                    slotProps={{
					            input: {
					                 
					              startAdornment: <InputAdornment position="start"><NumberIcon className='text-base'/></InputAdornment>
					            },
					          }}
		                  />
	              </FormControl>
	              )}
			     </div>
	        </div> 
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_exswzlwt_colZyszui" className={labelStyle}>
	                折扣
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.colZyszui || ''}</Typography>
	            	) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['colZyszui'] = el;
												}}>
		              <TextField
		                    type="number"
		                    id="tb_exswzlwt_colZyszui"
		                    name="colZyszui"
		                    value={formData.colZyszui || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.colZyszui ? true : false}
		                    helperText={errors.colZyszui}
		                    slotProps={{
					            input: {
					                 
					              startAdornment: <InputAdornment position="start"><NumberIcon className='text-base'/></InputAdornment>
					            },
					          }}
		                  />
	              </FormControl>
	              )}
			     </div>
	        </div> 
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_exswzlwt_colJbhosi" className={labelStyle}>
	                非分时电度电价
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.colJbhosi || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['colJbhosi'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_exswzlwt_colJbhosi"
			                    name="colJbhosi"
			                    value={formData.colJbhosi || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.colJbhosi ? true : false}
			                    helperText={errors.colJbhosi}
			                    slotProps={{
						            input: {
						                 
						              startAdornment: <InputAdornment position="start">
						              	{
											VITE_JET_CURRENCY_CODE === 'GBP' ? (
												<CurrencyPoundRounded className='text-base'/>
											) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
												<CurrencyYenOutlinedIcon className='text-base'/>	
											) : VITE_JET_CURRENCY_CODE === 'USD' ? (
												<AttachMoneyOutlinedIcon className='text-base'/>	
											) : (
												<CurrencyPoundRounded className='text-base'/>
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
								    </div>
						        </div>
      					    	<div className={groupCardStyle}>
		                            <h2 className={groupTitleStyle}>合计</h2>
		                            <p className={groupDescriptionStyle}>
		                                
		                            </p>
		                            <div className={groupContentStyle + ` sm:grid-cols-2`}>
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_exswzlwt_fgtqnhyn" className={labelStyle}>
	                结算电价（含税）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.fgtqnhyn || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['fgtqnhyn'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_exswzlwt_fgtqnhyn"
			                    name="fgtqnhyn"
			                    value={formData.fgtqnhyn || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.fgtqnhyn ? true : false}
			                    helperText={errors.fgtqnhyn}
			                    slotProps={{
						            input: {
						                 
						              startAdornment: <InputAdornment position="start">
						              	{
											VITE_JET_CURRENCY_CODE === 'GBP' ? (
												<CurrencyPoundRounded className='text-base'/>
											) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
												<CurrencyYenOutlinedIcon className='text-base'/>	
											) : VITE_JET_CURRENCY_CODE === 'USD' ? (
												<AttachMoneyOutlinedIcon className='text-base'/>	
											) : (
												<CurrencyPoundRounded className='text-base'/>
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
	            <label htmlFor="tb_exswzlwt_nwcjwyrf" className={labelStyle}>
	                结算电费
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.nwcjwyrf || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['nwcjwyrf'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_exswzlwt_nwcjwyrf"
			                    name="nwcjwyrf"
			                    value={formData.nwcjwyrf || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.nwcjwyrf ? true : false}
			                    helperText={errors.nwcjwyrf}
			                    slotProps={{
						            input: {
						                 
						              startAdornment: <InputAdornment position="start">
						              	{
											VITE_JET_CURRENCY_CODE === 'GBP' ? (
												<CurrencyPoundRounded className='text-base'/>
											) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
												<CurrencyYenOutlinedIcon className='text-base'/>	
											) : VITE_JET_CURRENCY_CODE === 'USD' ? (
												<AttachMoneyOutlinedIcon className='text-base'/>	
											) : (
												<CurrencyPoundRounded className='text-base'/>
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
	            <label htmlFor="tb_exswzlwt_mrseixpo" className={labelStyle}>
	                结算收入
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.mrseixpo || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['mrseixpo'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_exswzlwt_mrseixpo"
			                    name="mrseixpo"
			                    value={formData.mrseixpo || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.mrseixpo ? true : false}
			                    helperText={errors.mrseixpo}
			                    slotProps={{
						            input: {
						                 
						              startAdornment: <InputAdornment position="start">
						              	{
											VITE_JET_CURRENCY_CODE === 'GBP' ? (
												<CurrencyPoundRounded className='text-base'/>
											) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
												<CurrencyYenOutlinedIcon className='text-base'/>	
											) : VITE_JET_CURRENCY_CODE === 'USD' ? (
												<AttachMoneyOutlinedIcon className='text-base'/>	
											) : (
												<CurrencyPoundRounded className='text-base'/>
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
	            <label htmlFor="tb_exswzlwt_kdzxnwil" className={labelStyle}>
	                销项税额
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.kdzxnwil || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['kdzxnwil'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_exswzlwt_kdzxnwil"
			                    name="kdzxnwil"
			                    value={formData.kdzxnwil || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.kdzxnwil ? true : false}
			                    helperText={errors.kdzxnwil}
			                    slotProps={{
						            input: {
						                 
						              startAdornment: <InputAdornment position="start">
						              	{
											VITE_JET_CURRENCY_CODE === 'GBP' ? (
												<CurrencyPoundRounded className='text-base'/>
											) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
												<CurrencyYenOutlinedIcon className='text-base'/>	
											) : VITE_JET_CURRENCY_CODE === 'USD' ? (
												<AttachMoneyOutlinedIcon className='text-base'/>	
											) : (
												<CurrencyPoundRounded className='text-base'/>
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
								    </div>
						        </div>
      					    	<div className={groupCardStyle}>
		                            <h2 className={groupTitleStyle}>余电上网部分</h2>
		                            <p className={groupDescriptionStyle}>
		                                
		                            </p>
		                            <div className={groupContentStyle + ` sm:grid-cols-2`}>
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_exswzlwt_qgwvxncr" className={labelStyle}>
	                结算电价（含税）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.qgwvxncr || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['qgwvxncr'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_exswzlwt_qgwvxncr"
			                    name="qgwvxncr"
			                    value={formData.qgwvxncr || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.qgwvxncr ? true : false}
			                    helperText={errors.qgwvxncr}
			                    slotProps={{
						            input: {
						                 
						              startAdornment: <InputAdornment position="start">
						              	{
											VITE_JET_CURRENCY_CODE === 'GBP' ? (
												<CurrencyPoundRounded className='text-base'/>
											) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
												<CurrencyYenOutlinedIcon className='text-base'/>	
											) : VITE_JET_CURRENCY_CODE === 'USD' ? (
												<AttachMoneyOutlinedIcon className='text-base'/>	
											) : (
												<CurrencyPoundRounded className='text-base'/>
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
	            <label htmlFor="tb_exswzlwt_jshfcttg" className={labelStyle}>
	                结算电费
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.jshfcttg || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['jshfcttg'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_exswzlwt_jshfcttg"
			                    name="jshfcttg"
			                    value={formData.jshfcttg || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.jshfcttg ? true : false}
			                    helperText={errors.jshfcttg}
			                    slotProps={{
						            input: {
						                 
						              startAdornment: <InputAdornment position="start">
						              	{
											VITE_JET_CURRENCY_CODE === 'GBP' ? (
												<CurrencyPoundRounded className='text-base'/>
											) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
												<CurrencyYenOutlinedIcon className='text-base'/>	
											) : VITE_JET_CURRENCY_CODE === 'USD' ? (
												<AttachMoneyOutlinedIcon className='text-base'/>	
											) : (
												<CurrencyPoundRounded className='text-base'/>
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
	            <label htmlFor="tb_exswzlwt_colTgqbxp" className={labelStyle}>
	                补贴金额
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.colTgqbxp || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['colTgqbxp'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_exswzlwt_colTgqbxp"
			                    name="colTgqbxp"
			                    value={formData.colTgqbxp || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.colTgqbxp ? true : false}
			                    helperText={errors.colTgqbxp}
			                    slotProps={{
						            input: {
						                 
						              startAdornment: <InputAdornment position="start">
						              	{
											VITE_JET_CURRENCY_CODE === 'GBP' ? (
												<CurrencyPoundRounded className='text-base'/>
											) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
												<CurrencyYenOutlinedIcon className='text-base'/>	
											) : VITE_JET_CURRENCY_CODE === 'USD' ? (
												<AttachMoneyOutlinedIcon className='text-base'/>	
											) : (
												<CurrencyPoundRounded className='text-base'/>
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
	            <label htmlFor="tb_exswzlwt_tpjmbqpf" className={labelStyle}>
	                结算收入
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.tpjmbqpf || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['tpjmbqpf'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_exswzlwt_tpjmbqpf"
			                    name="tpjmbqpf"
			                    value={formData.tpjmbqpf || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.tpjmbqpf ? true : false}
			                    helperText={errors.tpjmbqpf}
			                    slotProps={{
						            input: {
						                 
						              startAdornment: <InputAdornment position="start">
						              	{
											VITE_JET_CURRENCY_CODE === 'GBP' ? (
												<CurrencyPoundRounded className='text-base'/>
											) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
												<CurrencyYenOutlinedIcon className='text-base'/>	
											) : VITE_JET_CURRENCY_CODE === 'USD' ? (
												<AttachMoneyOutlinedIcon className='text-base'/>	
											) : (
												<CurrencyPoundRounded className='text-base'/>
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
	            <label htmlFor="tb_exswzlwt_rxnrcarc" className={labelStyle}>
	                销项税额
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.rxnrcarc || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['rxnrcarc'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_exswzlwt_rxnrcarc"
			                    name="rxnrcarc"
			                    value={formData.rxnrcarc || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.rxnrcarc ? true : false}
			                    helperText={errors.rxnrcarc}
			                    slotProps={{
						            input: {
						                 
						              startAdornment: <InputAdornment position="start">
						              	{
											VITE_JET_CURRENCY_CODE === 'GBP' ? (
												<CurrencyPoundRounded className='text-base'/>
											) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
												<CurrencyYenOutlinedIcon className='text-base'/>	
											) : VITE_JET_CURRENCY_CODE === 'USD' ? (
												<AttachMoneyOutlinedIcon className='text-base'/>	
											) : (
												<CurrencyPoundRounded className='text-base'/>
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
								    </div>
						        </div>
      					    	<div className={groupCardStyle}>
		                            <h2 className={groupTitleStyle}>自发自用部分</h2>
		                            <p className={groupDescriptionStyle}>
		                                
		                            </p>
		                            <div className={groupContentStyle + ` sm:grid-cols-2`}>
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_exswzlwt_afnfufjj" className={labelStyle}>
	                结算电价（含税）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.afnfufjj || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['afnfufjj'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_exswzlwt_afnfufjj"
			                    name="afnfufjj"
			                    value={formData.afnfufjj || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.afnfufjj ? true : false}
			                    helperText={errors.afnfufjj}
			                    slotProps={{
						            input: {
						                 
						              startAdornment: <InputAdornment position="start">
						              	{
											VITE_JET_CURRENCY_CODE === 'GBP' ? (
												<CurrencyPoundRounded className='text-base'/>
											) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
												<CurrencyYenOutlinedIcon className='text-base'/>	
											) : VITE_JET_CURRENCY_CODE === 'USD' ? (
												<AttachMoneyOutlinedIcon className='text-base'/>	
											) : (
												<CurrencyPoundRounded className='text-base'/>
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
	            <label htmlFor="tb_exswzlwt_szimebex" className={labelStyle}>
	                结算电费
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.szimebex || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['szimebex'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_exswzlwt_szimebex"
			                    name="szimebex"
			                    value={formData.szimebex || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.szimebex ? true : false}
			                    helperText={errors.szimebex}
			                    slotProps={{
						            input: {
						                 
						              startAdornment: <InputAdornment position="start">
						              	{
											VITE_JET_CURRENCY_CODE === 'GBP' ? (
												<CurrencyPoundRounded className='text-base'/>
											) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
												<CurrencyYenOutlinedIcon className='text-base'/>	
											) : VITE_JET_CURRENCY_CODE === 'USD' ? (
												<AttachMoneyOutlinedIcon className='text-base'/>	
											) : (
												<CurrencyPoundRounded className='text-base'/>
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
	            <label htmlFor="tb_exswzlwt_nughvqbr" className={labelStyle}>
	                营业收入
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.nughvqbr || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['nughvqbr'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_exswzlwt_nughvqbr"
			                    name="nughvqbr"
			                    value={formData.nughvqbr || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.nughvqbr ? true : false}
			                    helperText={errors.nughvqbr}
			                    slotProps={{
						            input: {
						                 
						              startAdornment: <InputAdornment position="start">
						              	{
											VITE_JET_CURRENCY_CODE === 'GBP' ? (
												<CurrencyPoundRounded className='text-base'/>
											) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
												<CurrencyYenOutlinedIcon className='text-base'/>	
											) : VITE_JET_CURRENCY_CODE === 'USD' ? (
												<AttachMoneyOutlinedIcon className='text-base'/>	
											) : (
												<CurrencyPoundRounded className='text-base'/>
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
	            <label htmlFor="tb_exswzlwt_huscgxas" className={labelStyle}>
	                销项税额
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.huscgxas || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['huscgxas'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_exswzlwt_huscgxas"
			                    name="huscgxas"
			                    value={formData.huscgxas || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.huscgxas ? true : false}
			                    helperText={errors.huscgxas}
			                    slotProps={{
						            input: {
						                 
						              startAdornment: <InputAdornment position="start">
						              	{
											VITE_JET_CURRENCY_CODE === 'GBP' ? (
												<CurrencyPoundRounded className='text-base'/>
											) : VITE_JET_CURRENCY_CODE === 'CNY' ? (
												<CurrencyYenOutlinedIcon className='text-base'/>	
											) : VITE_JET_CURRENCY_CODE === 'USD' ? (
												<AttachMoneyOutlinedIcon className='text-base'/>	
											) : (
												<CurrencyPoundRounded className='text-base'/>
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
								    </div>
						        </div>
                    </div>	
					<div className="mt-6 flex items-center justify-end gap-x-6">
                        {isViewReadOnly ? (
							<button type="button" disabled={disabledAction} className={cancelStyle}
	                        onClick={() => {
									if(from) {
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
										if(from) {
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
				<SimpleConfirmDialog open={isConfirmOpen} onConfirm={() => {submitFormData();setIsConfirmOpen(false);}} onCancel={() => {setIsConfirmOpen(false)}}>
					{t('page.confirmsubmit')}
				</SimpleConfirmDialog>
             </ThemeProvider>
        </>
    )
}