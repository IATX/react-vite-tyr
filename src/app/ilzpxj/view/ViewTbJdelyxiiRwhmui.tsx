import React, { useEffect, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import FileUploader, { type FileUploaderHandles } from '../../../components/FileUploader';
import { FetchPreloadPkId } from '../../../components/FilePreloadPkId';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../../components/AlertContext';
import { useSession } from '../../../authority/SessionContext';
import SimpleConfirmDialog from '../../../components/SimpleConfirmDialog';
import theme from '../../../theme/tyr';

import { ThemeProvider } from '@mui/material/styles';

import { FormControl, FormControlLabel, FormHelperText, MenuItem, Radio, Checkbox, RadioGroup, Select, TextField, type SelectChangeEvent, FormGroup, InputAdornment } from '@mui/material';

import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { DateValidationError } from '@mui/x-date-pickers/models';

import axios from 'axios';

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

// Update your component props type to use this interface.
interface ViewPageProps<T> {
	initialData?: T;
	onSave?: (data: any) => void;
	onSubmit?: (data: any) => void;
	onCancel?: (data: any) => void;
}

export default function ViewPage<T extends object = { [key: string]: any }>({ initialData, onSave, onSubmit, onCancel }: ViewPageProps<T>) {
	const location = useLocation();
  	const { state } = location; 
	const navigate = useNavigate();
	
	const from = state?.from;
	const fromData = state?.initialData;

	 const { t } = useTranslation();
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
	const groupContentStyle = "mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6";
	const oneColumnStyle = "sm:col-span-3";
	const oneRowStyle = "col-span-full sm:col-span-6";
	const labelStyle = "block text-sm/6 font-medium text-gray-900";
	const uploadStyle = "mt-2 flex justify-center";
	const errorStyle = "mt-2 text-sm text-red-600";
	const submitStyle = "rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";
	const cancelStyle = "rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold shadow-xs hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600";
		
  		
	// Managing form data and validation errors with useState
	const [formData, setFormData] = useState(() => {
		const defaultData = {
			        		lvoezuwe: '',
			        		yhmyxvcn: '',
			        		zmdrspvi: '',
			        		ltqsvqts: '',
			        		almepfwd: '',
			        		uxmjmxgu: '',
	    	pkJdelyxii: '',
	    	tableViewOPTMode: 'submit'
    	}
    	
    	// Merge the incoming data with the default data
		return { ...defaultData, ...initialData, ...fromData};
    });
    
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const fieldRefs = useRef<Record<string, HTMLElement>>({});
    
    useEffect(() => {
		// This effect will run whenever initialData changes
		if (formData.pkJdelyxii !== '') {
			axios.post(bpcApiUrl + '/tableview/queryformdata/view_tb_jdelyxii_rwhmui/' + formData.pkJdelyxii, {}, {
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
	
	const submitFormData = () => {
		setDisabledAction(true);
	
	      axios.post(bpcApiUrl + '/tableview/remixjsondata/view_tb_jdelyxii_rwhmui', trimObjectValues(formData), {
	        headers: {
	          'grooveToken': token
	        }
	      }).then(response => {
	    	if (response.data && response.data.success) {
	    		setFormData((prevData: any) => ({
					...prevData,
					pkJdelyxii: response.data.data.pkJdelyxii,
				}));
	    	
	      		const jsonData = { ...formData };
	
				showAlert(t('message.operationSuccess'), 'success');
	
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
                 <form id="form_view_tb_jdelyxii_rwhmui" onSubmit={handleSubmit}>
                    <div className="space-y-12">
      					    	<div className={groupCardStyle}>
		                            <h2 className={groupTitleStyle}>电量合计详情</h2>
		                            <p className={groupDescriptionStyle}>
		                                
		                            </p>
		                            <div className={groupContentStyle}>
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_jdelyxii_lvoezuwe" className={labelStyle}>
	                开始日期
	            </label>
	            <div className="mt-2">
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['lvoezuwe'] = el;
												}}>
		               <DatePicker
                          name="lvoezuwe"
                          value={formData.lvoezuwe ? dayjs(formData.lvoezuwe) : null}
                          views={['year', 'month', 'day']}
                          onChange={(newValue: Dayjs | null)=> handleDateChange('lvoezuwe', newValue)}
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
                              id: 'tb_jdelyxii_lvoezuwe',
                              error: !!errors['lvoezuwe'],
                              helperText: errors['lvoezuwe'],
                            },
                          }}
                       />
	              </FormControl>
			     </div>
	        </div>       
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_jdelyxii_yhmyxvcn" className={labelStyle}>
	                结束日期
	            </label>
	            <div className="mt-2">
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['yhmyxvcn'] = el;
												}}>
		               <DatePicker
                          name="yhmyxvcn"
                          value={formData.yhmyxvcn ? dayjs(formData.yhmyxvcn) : null}
                          views={['year', 'month', 'day']}
                          onChange={(newValue: Dayjs | null)=> handleDateChange('yhmyxvcn', newValue)}
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
                              id: 'tb_jdelyxii_yhmyxvcn',
                              error: !!errors['yhmyxvcn'],
                              helperText: errors['yhmyxvcn'],
                            },
                          }}
                       />
	              </FormControl>
			     </div>
	        </div>       
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_jdelyxii_zmdrspvi" className={labelStyle}>
	                发电量
	            </label>
	            <div className="mt-2">
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['zmdrspvi'] = el;
												}}>
		              <TextField
		                    type="number"
		                    id="tb_jdelyxii_zmdrspvi"
		                    name="zmdrspvi"
		                    value={formData.zmdrspvi || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.zmdrspvi ? true : false}
		                    helperText={errors.zmdrspvi}
		                    slotProps={{
					            input: {
					                 
					              startAdornment: <InputAdornment position="start"><NumberIcon className='text-base'/></InputAdornment>
					            },
					          }}
		                  />
	              </FormControl>
			     </div>
	        </div> 
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_jdelyxii_ltqsvqts" className={labelStyle}>
	                上网电量
	            </label>
	            <div className="mt-2">
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['ltqsvqts'] = el;
												}}>
		              <TextField
		                    type="number"
		                    id="tb_jdelyxii_ltqsvqts"
		                    name="ltqsvqts"
		                    value={formData.ltqsvqts || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.ltqsvqts ? true : false}
		                    helperText={errors.ltqsvqts}
		                    slotProps={{
					            input: {
					                 
					              startAdornment: <InputAdornment position="start"><NumberIcon className='text-base'/></InputAdornment>
					            },
					          }}
		                  />
	              </FormControl>
			     </div>
	        </div> 
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_jdelyxii_almepfwd" className={labelStyle}>
	                售电量
	            </label>
	            <div className="mt-2">
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['almepfwd'] = el;
												}}>
		              <TextField
		                    type="number"
		                    id="tb_jdelyxii_almepfwd"
		                    name="almepfwd"
		                    value={formData.almepfwd || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.almepfwd ? true : false}
		                    helperText={errors.almepfwd}
		                    slotProps={{
					            input: {
					                 
					              startAdornment: <InputAdornment position="start"><NumberIcon className='text-base'/></InputAdornment>
					            },
					          }}
		                  />
	              </FormControl>
			     </div>
	        </div> 
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_jdelyxii_uxmjmxgu" className={labelStyle}>
	                结算金额
	            </label>
	            <div className="mt-2">
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['uxmjmxgu'] = el;
												}}>
		              <TextField
		                    type="number"
		                    id="tb_jdelyxii_uxmjmxgu"
		                    name="uxmjmxgu"
		                    value={formData.uxmjmxgu || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.uxmjmxgu ? true : false}
		                    helperText={errors.uxmjmxgu}
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
			     </div>
	        </div>     
								    </div>
						       </div>
					</div>
					
					<div className="mt-6 flex items-center justify-end gap-x-6">
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
                        Cancel
                        </button>
                        <button
                        disabled={disabledAction}
                        type="submit"
                        className={submitStyle}>
                        Submit
                        </button>
                    </div>
				</form>
				<SimpleConfirmDialog open={isConfirmOpen} onConfirm={() => {submitFormData();setIsConfirmOpen(false);}} onCancel={() => {setIsConfirmOpen(false)}}>
					Comfirm submission?
				</SimpleConfirmDialog>
             </ThemeProvider>
        </>
    )
}