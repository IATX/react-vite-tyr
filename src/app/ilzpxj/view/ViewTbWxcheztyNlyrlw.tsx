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
			        		lgourzqr: '',
			        		kaodyext: '',
			        		urooosee: '',
			        		zymjxejd: '',
			        		nplhjcqw: '',
			        		gwqejsjc: '',
			        		iifqgvji: '',
			        		pcczlucm: '',
			        		auaqendl: '',
			        		pgpnwvil: '',
			        		kybetqnl: '',
			        		dafnoyjy: '',
			        		mhqescps: '',
	    	pkWxchezty: '',
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
		if (formData.pkWxchezty !== '') {
			axios.post(bpcApiUrl + '/tableview/queryformdata/view_tb_wxchezty_nlyrlw/' + formData.pkWxchezty, {}, {
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
		    	"lgourzqr": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"kaodyext": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"zymjxejd": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"nplhjcqw": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"gwqejsjc": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"iifqgvji": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"pcczlucm": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"mhqescps": (value: any) => {
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
		
	      axios.post(bpcApiUrl + '/tableview/remixjsondata/view_tb_wxchezty_nlyrlw', trimObjectValues(formData), {
	        headers: {
	          'grooveToken': token
	        }
	      }).then(response => {
	    	if (response.data && response.data.success) {
	    		setFormData((prevData: any) => ({
					...prevData,
					pkWxchezty: response.data.data.pkWxchezty,
				}));
	    	
	      		const jsonData = { ...formData };
	
				showAlert(t('message.operationSuccess'), 'success');
	
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
        
					    	if (validationRules["lgourzqr"]) {
						    	const errorMsg = validationRules["lgourzqr"](formData.lgourzqr);
						
								if (errorMsg != '') {
						    		newErrors["lgourzqr"] = errorMsg;
						    	}
						    }
					    	if (validationRules["kaodyext"]) {
						    	const errorMsg = validationRules["kaodyext"](formData.kaodyext);
						
								if (errorMsg != '') {
						    		newErrors["kaodyext"] = errorMsg;
						    	}
						    }
					    	if (validationRules["zymjxejd"]) {
						    	const errorMsg = validationRules["zymjxejd"](formData.zymjxejd);
						
								if (errorMsg != '') {
						    		newErrors["zymjxejd"] = errorMsg;
						    	}
						    }
					    	if (validationRules["nplhjcqw"]) {
						    	const errorMsg = validationRules["nplhjcqw"](formData.nplhjcqw);
						
								if (errorMsg != '') {
						    		newErrors["nplhjcqw"] = errorMsg;
						    	}
						    }
					    	if (validationRules["gwqejsjc"]) {
						    	const errorMsg = validationRules["gwqejsjc"](formData.gwqejsjc);
						
								if (errorMsg != '') {
						    		newErrors["gwqejsjc"] = errorMsg;
						    	}
						    }
					    	if (validationRules["iifqgvji"]) {
						    	const errorMsg = validationRules["iifqgvji"](formData.iifqgvji);
						
								if (errorMsg != '') {
						    		newErrors["iifqgvji"] = errorMsg;
						    	}
						    }
					    	if (validationRules["pcczlucm"]) {
						    	const errorMsg = validationRules["pcczlucm"](formData.pcczlucm);
						
								if (errorMsg != '') {
						    		newErrors["pcczlucm"] = errorMsg;
						    	}
						    }
					    	if (validationRules["mhqescps"]) {
						    	const errorMsg = validationRules["mhqescps"](formData.mhqescps);
						
								if (errorMsg != '') {
						    		newErrors["mhqescps"] = errorMsg;
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
                 <form id="form_view_tb_wxchezty_nlyrlw" onSubmit={handleSubmit}>
                    <div className="space-y-12">
      					    	<div className={groupCardStyle}>
		                            <h2 className={groupTitleStyle}>光伏账单</h2>
		                            <p className={groupDescriptionStyle}>
		                                
		                            </p>
		                            <div className={groupContentStyle + ` sm:grid-cols-2`}>
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_wxchezty_lgourzqr" className={labelStyle}>
	                商户
	            </label>
	            <div className="mt-2">
	            {isViewReadOnly ? (
	            	<Typography variant="body2" gutterBottom>{formData.lgourzqr || ''}</Typography>
	            ) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['lgourzqr'] = el;
												}}>
		              <TextField
		                    id="tb_wxchezty_lgourzqr"
		                    name="lgourzqr"
		                    value={formData.lgourzqr || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.lgourzqr ? true : false}
		                    helperText={errors.lgourzqr}
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
	            <label htmlFor="tb_wxchezty_kaodyext" className={labelStyle}>
	                发电户号
	            </label>
	            <div className="mt-2">
	            {isViewReadOnly ? (
	            	<Typography variant="body2" gutterBottom>{formData.kaodyext || ''}</Typography>
	            ) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['kaodyext'] = el;
												}}>
		              <TextField
		                    id="tb_wxchezty_kaodyext"
		                    name="kaodyext"
		                    value={formData.kaodyext || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.kaodyext ? true : false}
		                    helperText={errors.kaodyext}
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
	    	<div className={oneRowStyle}>
	            <label htmlFor="tb_wxchezty_urooosee" className={labelStyle}>
	                发电地址
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.urooosee || ''}</Typography>
	            	) : (
	            	<FormControl fullWidth ref={(el) => {
						if (el) fieldRefs.current['urooosee'] = el;
					}}>
		               	<TextField
		                    multiline
		                    rows={4}
		                    id="tb_wxchezty_urooosee"
		                    name="urooosee"
		                    value={formData.urooosee || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    fullWidth
		                    variant="outlined"
		                    error={errors.urooosee ? true : false}
		                    helperText={errors.urooosee}
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
	            <label htmlFor="tb_wxchezty_nplhjcqw" className={labelStyle}>
	                发电周期（起始）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{new Date(formData.nplhjcqw).toLocaleDateString() || ''}</Typography>
	            	) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['nplhjcqw'] = el;
												}}>
		               <DatePicker
                          name="nplhjcqw"
                          format="YYYY-MM-DD"
                          value={formData.nplhjcqw ? dayjs(formData.nplhjcqw) : null}
                          views={['year', 'month', 'day']}
                          onChange={(newValue: Dayjs | null)=> handleDateChange('nplhjcqw', newValue)}
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
                              id: 'tb_wxchezty_nplhjcqw',
                              error: !!errors['nplhjcqw'],
                              helperText: errors['nplhjcqw'],
                            },
                          }}
                       />
	              </FormControl>
	              )}
			     </div>
	        </div>    
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_wxchezty_zymjxejd" className={labelStyle}>
	                发电周期（截至）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{new Date(formData.zymjxejd).toLocaleDateString() || ''}</Typography>
	            	) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['zymjxejd'] = el;
												}}>
		               <DatePicker
                          name="zymjxejd"
                          format="YYYY-MM-DD"
                          value={formData.zymjxejd ? dayjs(formData.zymjxejd) : null}
                          views={['year', 'month', 'day']}
                          onChange={(newValue: Dayjs | null)=> handleDateChange('zymjxejd', newValue)}
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
                              id: 'tb_wxchezty_zymjxejd',
                              error: !!errors['zymjxejd'],
                              helperText: errors['zymjxejd'],
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
		                            <h2 className={groupTitleStyle}>账单详情</h2>
		                            <p className={groupDescriptionStyle}>
		                                
		                            </p>
		                            <div className={groupContentStyle + ` sm:grid-cols-2`}>
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_wxchezty_gwqejsjc" className={labelStyle}>
	                合计收益（元）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.gwqejsjc || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['gwqejsjc'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_wxchezty_gwqejsjc"
			                    name="gwqejsjc"
			                    value={formData.gwqejsjc || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.gwqejsjc ? true : false}
			                    helperText={errors.gwqejsjc}
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
	            <label htmlFor="tb_wxchezty_iifqgvji" className={labelStyle}>
	                发电量（千瓦时）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.iifqgvji || ''}</Typography>
	            	) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['iifqgvji'] = el;
												}}>
		              <TextField
		                    type="number"
		                    id="tb_wxchezty_iifqgvji"
		                    name="iifqgvji"
		                    value={formData.iifqgvji || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.iifqgvji ? true : false}
		                    helperText={errors.iifqgvji}
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
	            <label htmlFor="tb_wxchezty_pcczlucm" className={labelStyle}>
	                上网电量（千瓦时）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.pcczlucm || ''}</Typography>
	            	) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['pcczlucm'] = el;
												}}>
		              <TextField
		                    type="number"
		                    id="tb_wxchezty_pcczlucm"
		                    name="pcczlucm"
		                    value={formData.pcczlucm || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.pcczlucm ? true : false}
		                    helperText={errors.pcczlucm}
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
	            <label htmlFor="tb_wxchezty_auaqendl" className={labelStyle}>
	                上网电费（元，含税）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.auaqendl || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['auaqendl'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_wxchezty_auaqendl"
			                    name="auaqendl"
			                    value={formData.auaqendl || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.auaqendl ? true : false}
			                    helperText={errors.auaqendl}
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
	            <label htmlFor="tb_wxchezty_pgpnwvil" className={labelStyle}>
	                补助电费（元，含税）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.pgpnwvil || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['pgpnwvil'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_wxchezty_pgpnwvil"
			                    name="pgpnwvil"
			                    value={formData.pgpnwvil || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.pgpnwvil ? true : false}
			                    helperText={errors.pgpnwvil}
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
	            <label htmlFor="tb_wxchezty_kybetqnl" className={labelStyle}>
	                实结机制电量（千瓦时）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.kybetqnl || ''}</Typography>
	            	) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['kybetqnl'] = el;
												}}>
		              <TextField
		                    type="number"
		                    id="tb_wxchezty_kybetqnl"
		                    name="kybetqnl"
		                    value={formData.kybetqnl || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.kybetqnl ? true : false}
		                    helperText={errors.kybetqnl}
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
	            <label htmlFor="tb_wxchezty_dafnoyjy" className={labelStyle}>
	                机制差价电费（元，含税）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.dafnoyjy || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['dafnoyjy'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_wxchezty_dafnoyjy"
			                    name="dafnoyjy"
			                    value={formData.dafnoyjy || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.dafnoyjy ? true : false}
			                    helperText={errors.dafnoyjy}
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
	            <label htmlFor="tb_wxchezty_mhqescps" className={labelStyle}>
	                账单金额（元）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.mhqescps || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['mhqescps'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_wxchezty_mhqescps"
			                    name="mhqescps"
			                    value={formData.mhqescps || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.mhqescps ? true : false}
			                    helperText={errors.mhqescps}
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