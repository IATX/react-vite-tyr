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

import { FormControl, FormControlLabel, FormHelperText, MenuItem, Radio, Checkbox, RadioGroup, Select, TextField, type SelectChangeEvent, FormGroup, InputAdornment, Typography, Box, CircularProgress, Button } from '@mui/material';

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
import { RowInputRenderer, type ColumnConfig } from '../../../components/RowInputRenderer';

import { useInitialActions } from '../js/view_tb_gvfrokeq_zlvans';
import ParsedMeterPanel from '../dev/ParsedMeterPanel';
import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';

// 原始数据浮窗宽度 / 与表单的间距（px）
const COMPARE_PANEL_W = 440;
const COMPARE_GAP = 24;

// Update your component props type to use this interface.
interface ViewPageProps<T> {
	readOnly?:boolean;
	initialData?: T;
	onSave?: (data: any) => void;
	onSubmit?: (data: any) => void;
	onCancel?: (data: any) => void;
	showParsedCompare?: boolean;
}

export default function ViewPage<T extends object = { [key: string]: any }>({ readOnly, initialData, onSave, onSubmit, onCancel, showParsedCompare }: ViewPageProps<T>) {
	const { t } = useTranslation();
	const location = useLocation();
  	const { state } = location; 
	const navigate = useNavigate();

	const { defaultInitialData } = useInitialActions();
	
	const isViewReadOnly = readOnly ?? false;
	const from =  state?.from;
	const fromData = state?.initialData;

	const { showAlert } = useAlert();
	const { token, isAuthenticated } = useSession();
	const bpcApiUrl = import.meta.env.VITE_JET_ASP_BPC_API;
	const VITE_JET_CURRENCY_CODE = import.meta.env.VITE_JET_CURRENCY_CODE || 'GBP';
	const [disabledAction, setDisabledAction] = useState(false);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	// 原始数据浮窗开关（仅编辑页启用）
	const [compareOpen, setCompareOpen] = useState(false);
	const compareActive = !!showParsedCompare && compareOpen;

	// Defines style constants for all form items
	const inputStyle = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-blue-600 sm:text-sm/6 h-9";
	const groupCardStyle = "border-b border-gray-900/10 pb-12 mx-auto max-w-2xl";
	const groupTitleStyle = "text-base/7 font-semibold text-gray-900";
	const groupDescriptionStyle = "mt-1 text-sm/6 text-gray-600";
	const groupContentStyle = "mt-6 grid grid-cols-1 gap-x-6 gap-y-8";
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
			        		tparorbm: '',
			        		ynwjibye: '',
			        		tjmqxlms: '',
			        		jouaevse: '',
			        		ybfzkzts: '',
			        		vptylsiz: '',
							gfumgrlg: '',
					listKmddwu: [],
	    	pkGvfrokeq: '',
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
		if (formData.pkGvfrokeq !== '') {
			axios.post(bpcApiUrl + '/tableview/queryformdata/view_tb_gvfrokeq_zlvans/' + formData.pkGvfrokeq, {}, {
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
		// DatePicker 选出的是「本地午夜」，直接 valueOf() 在东八区会落到前一天的 UTC，
		// 存库（按 UTC 截断为日期）后日期会减一天。这里改成取所选「日历日期」的 UTC 零点，
		// 确保存库后的日期与所选一致。
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
		    	"tjmqxlms": (value: any) => {
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
		
	      axios.post(bpcApiUrl + '/tableview/remixjsondata/view_tb_gvfrokeq_zlvans', trimObjectValues(formData), {
	        headers: {
	          'grooveToken': token
	        }
	      }).then(response => {
	    	if (response.data && response.data.success) {
	    		setFormData((prevData: any) => ({
					...prevData,
					pkGvfrokeq: response.data.data.pkGvfrokeq,
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

					    	if (validationRules["tjmqxlms"]) {
						    	const errorMsg = validationRules["tjmqxlms"](formData.tjmqxlms);

								if (errorMsg != '') {
						    		newErrors["tjmqxlms"] = errorMsg;
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
				
                 <form
                    id="form_view_tb_gvfrokeq_zlvans"
                    onSubmit={handleSubmit}
                    style={{ paddingLeft: compareActive ? COMPARE_PANEL_W + COMPARE_GAP : 0, transition: 'padding-left .3s ease' }}
                 >
                    <div className="space-y-12">
      					    	<div className={groupCardStyle}>
		                            <h2 className={groupTitleStyle}>电量统计表</h2>
		                            <p className={groupDescriptionStyle}>
		                                
		                            </p>
		                            <div className={groupContentStyle + ` sm:grid-cols-2`}>
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_gvfrokeq_tparorbm" className={labelStyle}>
	                商户
	            </label>
	            <div className="mt-2">
	            {isViewReadOnly ? (
	            	<Typography variant="body2" gutterBottom>{formData.tparorbm || ''}</Typography>
	            ) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['tparorbm'] = el;
												}}>
		              <TextField
		                    id="tb_gvfrokeq_tparorbm"
		                    name="tparorbm"
		                    value={formData.tparorbm || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.tparorbm ? true : false}
		                    helperText={errors.tparorbm}
		                    slotProps={{
					            input: {
					              readOnly: true,  
					              startAdornment: <InputAdornment position="start">
					              <TextIcon className='text-base'/>
					              </InputAdornment>
					            },
					          }}
		                  />
	              </FormControl>
	              )}
			     </div>
	        </div>
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_gvfrokeq_ynwjibye" className={labelStyle}>
	                户号
	            </label>
	            <div className="mt-2">
	            {isViewReadOnly ? (
	            	<Typography variant="body2" gutterBottom>{formData.ynwjibye || ''}</Typography>
	            ) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['ynwjibye'] = el;
												}}>
		              <TextField
		                    id="tb_gvfrokeq_ynwjibye"
		                    name="ynwjibye"
		                    value={formData.ynwjibye || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.ynwjibye ? true : false}
		                    helperText={errors.ynwjibye}
		                    slotProps={{
					            input: {
					              readOnly: true,  
					              startAdornment: <InputAdornment position="start">
					              <TextIcon className='text-base'/>
					              </InputAdornment>
					            },
					          }}
		                  />
	              </FormControl>
	              )}
			     </div>
	        </div>
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_gvfrokeq_tjmqxlms" className={labelStyle}>
	                结算日期
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{new Date(formData.tjmqxlms).toLocaleDateString() || ''}</Typography>
	            	) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['tjmqxlms'] = el;
												}}>
		               <DatePicker
                          name="tjmqxlms"
                          format="YYYY-MM"
                          value={formData.tjmqxlms ? dayjs(formData.tjmqxlms) : null}
                          views={['year', 'month']}
                          openTo="month"
                          onChange={(newValue: Dayjs | null)=> handleDateChange('tjmqxlms', newValue ? newValue.startOf('month') : null)}
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
                              id: 'tb_gvfrokeq_tjmqxlms',
                              error: !!errors['tjmqxlms'],
                              helperText: errors['tjmqxlms'],
                            },
                          }}
                       />
	              </FormControl>
	              )}
			     </div>
	        </div>       
	    	<div className={oneRowStyle}>
	            <label htmlFor="tb_gvfrokeq_jouaevse" className={labelStyle}>
	                备注
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.jouaevse || ''}</Typography>
	            	) : (
	            	<FormControl fullWidth ref={(el) => {
						if (el) fieldRefs.current['jouaevse'] = el;
					}}>
		               	<TextField
		                    multiline
		                    rows={4}
		                    id="tb_gvfrokeq_jouaevse"
		                    name="jouaevse"
		                    value={formData.jouaevse || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    fullWidth
		                    variant="outlined"
		                    error={errors.jouaevse ? true : false}
		                    helperText={errors.jouaevse}
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
	            <label htmlFor="tb_gvfrokeq_ybfzkzts" className={labelStyle}>
	                华能抄表人
	            </label>
	            <div className="mt-2">
	            {isViewReadOnly ? (
	            	<Typography variant="body2" gutterBottom>{formData.ybfzkzts || ''}</Typography>
	            ) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['ybfzkzts'] = el;
												}}>
		              <TextField
		                    id="tb_gvfrokeq_ybfzkzts"
		                    name="ybfzkzts"
		                    value={formData.ybfzkzts || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.ybfzkzts ? true : false}
		                    helperText={errors.ybfzkzts}
		                    slotProps={{
					            input: {
					                
					              startAdornment: <InputAdornment position="start">
					              <TextIcon className='text-base'/>
					              </InputAdornment>
					            },
					          }}
		                  />
	              </FormControl>
	              )}
			     </div>
	        </div>
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_gvfrokeq_vptylsiz" className={labelStyle}>
	                商户确认人
	            </label>
	            <div className="mt-2">
	            {isViewReadOnly ? (
	            	<Typography variant="body2" gutterBottom>{formData.vptylsiz || ''}</Typography>
	            ) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['vptylsiz'] = el;
												}}>
		              <TextField
		                    id="tb_gvfrokeq_vptylsiz"
		                    name="vptylsiz"
		                    value={formData.vptylsiz || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.vptylsiz ? true : false}
		                    helperText={errors.vptylsiz}
		                    slotProps={{
					            input: {
					                
					              startAdornment: <InputAdornment position="start">
					              <TextIcon className='text-base'/>
					              </InputAdornment>
					            },
					          }}
		                  />
	              </FormControl>
	              )}
			     </div>
	        </div>
			<input type="hidden" name="gfumgrlg" placeholder="" value={formData.gfumgrlg || ''} />
								    </div>
						        </div>
      					    	<div className={listCardStyle + ' relative'}>
	{showParsedCompare && (
		<div
			className="absolute z-30 transition-all duration-300 ease-in-out"
			style={{
				right: '100%',
				marginRight: COMPARE_GAP,
				top: 0,
				width: COMPARE_PANEL_W,
				opacity: compareActive ? 1 : 0,
				transform: compareActive ? 'translateX(0)' : 'translateX(12px)',
				pointerEvents: compareActive ? 'auto' : 'none',
			}}
		>
			<ParsedMeterPanel
				accountNumber={formData.ynwjibye || undefined}
				yearMonth={formData.tjmqxlms ? dayjs(formData.tjmqxlms).format('YYYY-MM') : undefined}
				onClose={() => setCompareOpen(false)}
			/>
			{/* 指向「电量明细」的连接图标，体现关联关系 */}
			<div
				className="absolute top-1/2 z-40 pointer-events-none"
				style={{ left: '100%', marginLeft: COMPARE_GAP / 2, transform: 'translate(-50%, -50%)' }}
			>
				<ChevronRightRounded sx={{ fontSize: 22, color: '#4f46e5' }} />
			</div>
		</div>
	)}	
	      					    	<table className={tableStyle}>
	      					    		<colgroup>
												<col style={{ width: '92px' }} />
												<col />
												<col style={{ width: '92px' }} />
												<col />
												<col />
											</colgroup>
	      					    		<caption className={tableCaptionStyle}>
	      					    		<div className="flex justify-between items-center w-full">
	      					    			<h2 className={groupTitleStyle}>电量明细</h2>
{showParsedCompare && (
	<button
		type="button"
		onClick={() => setCompareOpen((v) => !v)}
		className={
			'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs shadow-sm transition-colors ' +
			(compareOpen
				? 'text-slate-600 bg-slate-100 hover:bg-slate-200'
				: 'text-blue-600 bg-blue-50 hover:bg-blue-100')
		}
	>
		{compareOpen ? <ChevronLeftRounded sx={{ fontSize: 14 }} /> : <FactCheckOutlined sx={{ fontSize: 14 }} />}
		{compareOpen ? '收起数据' : '对比数据'}
	</button>
)}
	      					    			
		      					    		
										</div>
	      					    		</caption>
	      					    		<thead>
	      					    			<tr><th className={tableThStyle}>发电量项目</th><th className={tableThStyle}>发电量</th><th className={tableThStyle}>上网电量项目</th><th className={tableThStyle}>上网电量</th><th className={tableThStyle}>售电量</th></tr>
	      					    		</thead>
	      					    		<tbody className={tableTbodyStyle}>
											{formData.listKmddwu.map((item: any, index: number) => {
												const rowIndex = 'row_' + index;
												
												
												return (
													<tr key={rowIndex}>
			      					    				<td className={tableTdStyle }>
			      					    				{false ? (
															<RowInputRenderer
																column={{
																	'key': 'uizewbux',
																	'header': '发电量项目',
																	'type': 'input'
																}}
																value={item.uizewbux}
																onChange={(newValue) => {
																	const updatedList = formData.listKmddwu.map((row: any, idx: number) => {
																		const rindex = 'row_' + idx;

																		if (rindex === rowIndex) {
																			return {
																				...row,
																				['uizewbux']: newValue,
																			};
																		}
																		return row;
																	});

																	setFormData((prevData: any) => {
																		return {
																			...prevData,
																			listKmddwu: updatedList,
																		};
																	});
																}}
															/>
														) : (
															<>{item.uizewbux}</>
														)}
														
														
			      					    				</td>
			      					    				
			      					    				
			      					    				<td className={tableTdStyle }>
			      					    				{!isViewReadOnly ? (
															<RowInputRenderer
																column={{
																	'key': 'vcbnneyp',
																	'header': '发电量',
																	'type': 'number'
																}}
																value={item.vcbnneyp}
																onChange={(newValue) => {
																	const updatedList = formData.listKmddwu.map((row: any, idx: number) => {
																		const rindex = 'row_' + idx;

																		if (rindex === rowIndex) {
																			const merged = { ...row, ['vcbnneyp']: newValue }; return { ...merged, dtuxsxpz: (merged.vcbnneyp !== '' && merged.vcbnneyp != null && merged.wumkmcly !== '' && merged.wumkmcly != null) ? (Number(merged.vcbnneyp) - Number(merged.wumkmcly)) : '' };
																		}
																		return row;
																	});

																	setFormData((prevData: any) => {
																		return {
																			...prevData,
																			listKmddwu: updatedList,
																		};
																	});
																}}
															/>
														) : (
															<>{item.vcbnneyp}</>
														)}
														
														
			      					    				</td>
			      					    				<td className={tableTdStyle }>
			      					    				{false ? (
															<RowInputRenderer
																column={{
																	'key': 'tqqnmhrl',
																	'header': '上网电量项目',
																	'type': 'input'
																}}
																value={item.tqqnmhrl}
																onChange={(newValue) => {
																	const updatedList = formData.listKmddwu.map((row: any, idx: number) => {
																		const rindex = 'row_' + idx;

																		if (rindex === rowIndex) {
																			return {
																				...row,
																				['tqqnmhrl']: newValue,
																			};
																		}
																		return row;
																	});

																	setFormData((prevData: any) => {
																		return {
																			...prevData,
																			listKmddwu: updatedList,
																		};
																	});
																}}
															/>
														) : (
															<>{item.tqqnmhrl}</>
														)}
														
														
			      					    				</td>
			      					    				
			      					    				
			      					    				<td className={tableTdStyle }>
			      					    				{!isViewReadOnly ? (
															<RowInputRenderer
																column={{
																	'key': 'wumkmcly',
																	'header': '上网电量',
																	'type': 'number'
																}}
																value={item.wumkmcly}
																onChange={(newValue) => {
																	const updatedList = formData.listKmddwu.map((row: any, idx: number) => {
																		const rindex = 'row_' + idx;

																		if (rindex === rowIndex) {
																			const merged = { ...row, ['wumkmcly']: newValue }; return { ...merged, dtuxsxpz: (merged.vcbnneyp !== '' && merged.vcbnneyp != null && merged.wumkmcly !== '' && merged.wumkmcly != null) ? (Number(merged.vcbnneyp) - Number(merged.wumkmcly)) : '' };
																		}
																		return row;
																	});

																	setFormData((prevData: any) => {
																		return {
																			...prevData,
																			listKmddwu: updatedList,
																		};
																	});
																}}
															/>
														) : (
															<>{item.wumkmcly}</>
														)}
														
														
			      					    				</td>
			      					    				<td className={tableTdStyle + ' '}>
			      					    				{false ? (
															<RowInputRenderer
																column={{
																	'key': 'dtuxsxpz',
																	'header': '售电量',
																	'type': 'number'
																}}
																value={item.dtuxsxpz}
																onChange={(newValue) => {
																	const updatedList = formData.listKmddwu.map((row: any, idx: number) => {
																		const rindex = 'row_' + idx;

																		if (rindex === rowIndex) {
																			return {
																				...row,
																				['dtuxsxpz']: newValue,
																			};
																		}
																		return row;
																	});

																	setFormData((prevData: any) => {
																		return {
																			...prevData,
																			listKmddwu: updatedList,
																		};
																	});
																}}
															/>
														) : (
															<>{item.dtuxsxpz}</>
														)}
														
													        
														
			      					    				</td>
													</tr>
												)
											})}
										</tbody>
	      					    	</table>
	      					    	
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