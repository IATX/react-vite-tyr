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
			        		uislfbtj: '',
			        		jtenztaq: '1',
			        		odrfnzvo: '普通',
			        		cdtylzeq: '',
			        		dmnbozws: '',
			        		eqqrepck: '',
			        		vghyjelr: '',
			        		uxmevhzr: '',
			        		hsoyoxad: '',
			        		tgfmfgug: '',
			        		qfcydhul: '',
			        		vjtwicby: '',
			        		ppleoliy: '',
			        		yqjhrqpv: '',
			        		dbjcahum: '',
			        		stmwshrs: '',
			        		shwsiwey: '',
			        		mqnwdfoo: '',
			        		batuyfhf: '',
			        		zaftbdnw: '',
			        		lhlvljqd: '',
			        		tzikxfvh: '',
			        		xkatnuim: '',
			        		zmvivlpk: '',
	    	pkXntlcwoh: '',
		    			pkWdfewcyh: '',
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
		if (formData.pkXntlcwoh !== '') {
			axios.post(bpcApiUrl + '/tableview/queryformdata/view_tb_xntlcwoh_uzlwbg/' + formData.pkXntlcwoh, {}, {
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
		    	"uislfbtj": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"jtenztaq": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"vghyjelr": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"hsoyoxad": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"ppleoliy": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"yqjhrqpv": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"dbjcahum": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"stmwshrs": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"shwsiwey": (value: any) => {
			      if (value === null || typeof value === 'undefined' || isEmpty(value, false)) return t('validation.required');
			
			      return '';
			    },
		    	"mqnwdfoo": (value: any) => {
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
		
	      axios.post(bpcApiUrl + '/tableview/remixjsondata/view_tb_xntlcwoh_uzlwbg', trimObjectValues(formData), {
	        headers: {
	          'grooveToken': token
	        }
	      }).then(response => {
	    	if (response.data && response.data.success) {
	    		setFormData((prevData: any) => ({
					...prevData,
					pkXntlcwoh: response.data.data.pkXntlcwoh,
				    			pkWdfewcyh: response.data.data.pkWdfewcyh,
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
				setIsLoading(false);
	      });
	};
	
	// Submit processing function
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		
        const newErrors: { [key: string]: string } = {};
        
					    	if (validationRules["uislfbtj"]) {
						    	const errorMsg = validationRules["uislfbtj"](formData.uislfbtj);
						
								if (errorMsg != '') {
						    		newErrors["uislfbtj"] = errorMsg;
						    	}
						    }
					    	if (validationRules["jtenztaq"]) {
						    	const errorMsg = validationRules["jtenztaq"](formData.jtenztaq);
						
								if (errorMsg != '') {
						    		newErrors["jtenztaq"] = errorMsg;
						    	}
						    }
					    	if (validationRules["vghyjelr"]) {
						    	const errorMsg = validationRules["vghyjelr"](formData.vghyjelr);
						
								if (errorMsg != '') {
						    		newErrors["vghyjelr"] = errorMsg;
						    	}
						    }
					    	if (validationRules["hsoyoxad"]) {
						    	const errorMsg = validationRules["hsoyoxad"](formData.hsoyoxad);
						
								if (errorMsg != '') {
						    		newErrors["hsoyoxad"] = errorMsg;
						    	}
						    }
					    	if (validationRules["ppleoliy"]) {
						    	const errorMsg = validationRules["ppleoliy"](formData.ppleoliy);
						
								if (errorMsg != '') {
						    		newErrors["ppleoliy"] = errorMsg;
						    	}
						    }
					    	if (validationRules["yqjhrqpv"]) {
						    	const errorMsg = validationRules["yqjhrqpv"](formData.yqjhrqpv);
						
								if (errorMsg != '') {
						    		newErrors["yqjhrqpv"] = errorMsg;
						    	}
						    }
					    	if (validationRules["dbjcahum"]) {
						    	const errorMsg = validationRules["dbjcahum"](formData.dbjcahum);
						
								if (errorMsg != '') {
						    		newErrors["dbjcahum"] = errorMsg;
						    	}
						    }
					    	if (validationRules["stmwshrs"]) {
						    	const errorMsg = validationRules["stmwshrs"](formData.stmwshrs);
						
								if (errorMsg != '') {
						    		newErrors["stmwshrs"] = errorMsg;
						    	}
						    }
					    	if (validationRules["shwsiwey"]) {
						    	const errorMsg = validationRules["shwsiwey"](formData.shwsiwey);
						
								if (errorMsg != '') {
						    		newErrors["shwsiwey"] = errorMsg;
						    	}
						    }
					    	if (validationRules["mqnwdfoo"]) {
						    	const errorMsg = validationRules["mqnwdfoo"](formData.mqnwdfoo);
						
								if (errorMsg != '') {
						    		newErrors["mqnwdfoo"] = errorMsg;
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
                 <form id="form_view_tb_xntlcwoh_uzlwbg" onSubmit={handleSubmit}>
                    <div className="space-y-12">
      					    	<div className={groupCardStyle}>
		                            <h2 className={groupTitleStyle}>电价表</h2>
		                            <p className={groupDescriptionStyle}>
		                                
		                            </p>
		                            <div className={groupContentStyle + ` sm:grid-cols-2`}>
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_xntlcwoh_uislfbtj" className={labelStyle}>
	                标题
	            </label>
	            <div className="mt-2">
	            {isViewReadOnly ? (
	            	<Typography variant="body2" gutterBottom>{formData.uislfbtj || ''}</Typography>
	            ) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['uislfbtj'] = el;
												}}>
		              <TextField
		                    id="tb_xntlcwoh_uislfbtj"
		                    name="uislfbtj"
		                    value={formData.uislfbtj || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    variant="outlined"
		                    error={errors.uislfbtj ? true : false}
		                    helperText={errors.uislfbtj}
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
	            <label htmlFor="tb_xntlcwoh_jtenztaq" className={labelStyle}>
	                类型
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.odrfnzvo || ''}</Typography>
	            	) : (
	              <FormControl fullWidth size="small"
	               error={!!errors['jtenztaq']}
	               ref={(el) => {
							if (el) fieldRefs.current['jtenztaq'] = el;
						}}
	               >
                      <Select
                        id="tb_xntlcwoh_jtenztaq"
                        name='jtenztaq'
                        value={formData.jtenztaq || ''}
                        onChange={(e) => handleSelectChange(e, [{'id':'1','name':'普通'},{'id':'1.5','name':'1.5倍'},] , 'odrfnzvo')}
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
                        
				    		<MenuItem value='1'>普通</MenuItem>
				    		<MenuItem value='1.5'>1.5倍</MenuItem>
                      </Select>
                      <FormHelperText>{errors['jtenztaq']}</FormHelperText>
                    </FormControl>
                    )}
			     </div>
	        </div>
			<input type="hidden" name="odrfnzvo" placeholder="" value={formData.odrfnzvo || ''} />
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_xntlcwoh_cdtylzeq" className={labelStyle}>
	                执行时间（从）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{new Date(formData.cdtylzeq).toLocaleDateString() || ''}</Typography>
	            	) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['cdtylzeq'] = el;
												}}>
		               <DatePicker
                          name="cdtylzeq"
                          value={formData.cdtylzeq ? dayjs(formData.cdtylzeq) : null}
                          views={['year', 'month', 'day']}
                          onChange={(newValue: Dayjs | null)=> handleDateChange('cdtylzeq', newValue)}
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
                              id: 'tb_xntlcwoh_cdtylzeq',
                              error: !!errors['cdtylzeq'],
                              helperText: errors['cdtylzeq'],
                            },
                          }}
                       />
	              </FormControl>
	              )}
			     </div>
	        </div>       
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_xntlcwoh_dmnbozws" className={labelStyle}>
	                执行时间（至）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{new Date(formData.dmnbozws).toLocaleDateString() || ''}</Typography>
	            	) : (
	              <FormControl fullWidth ref={(el) => {
													if (el) fieldRefs.current['dmnbozws'] = el;
												}}>
		               <DatePicker
                          name="dmnbozws"
                          value={formData.dmnbozws ? dayjs(formData.dmnbozws) : null}
                          views={['year', 'month', 'day']}
                          onChange={(newValue: Dayjs | null)=> handleDateChange('dmnbozws', newValue)}
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
                              id: 'tb_xntlcwoh_dmnbozws',
                              error: !!errors['dmnbozws'],
                              helperText: errors['dmnbozws'],
                            },
                          }}
                       />
	              </FormControl>
	              )}
			     </div>
	        </div>       
	    	<div className={oneRowStyle}>
	            <label htmlFor="tb_xntlcwoh_eqqrepck" className={labelStyle}>
	                备注
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.eqqrepck || ''}</Typography>
	            	) : (
	            	<FormControl fullWidth ref={(el) => {
						if (el) fieldRefs.current['eqqrepck'] = el;
					}}>
		               	<TextField
		                    multiline
		                    rows={4}
		                    id="tb_xntlcwoh_eqqrepck"
		                    name="eqqrepck"
		                    value={formData.eqqrepck || ''}
		                    onChange={handleInputChange}
		                    size="small"
		                    fullWidth
		                    variant="outlined"
		                    error={errors.eqqrepck ? true : false}
		                    helperText={errors.eqqrepck}
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
		                            <h2 className={groupTitleStyle}>主要分类</h2>
		                            <p className={groupDescriptionStyle}>
		                                
		                            </p>
		                            <div className={groupContentStyle + ` sm:grid-cols-2`}>
	    	<div className={oneColumnStyle}>
	            <label htmlFor="tb_xntlcwoh_vghyjelr" className={labelStyle}>
	                用电分类
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.uxmevhzr || ''}</Typography>
	            	) : (
	              <FormControl fullWidth size="small"
	               error={!!errors['vghyjelr']}
	               ref={(el) => {
							if (el) fieldRefs.current['vghyjelr'] = el;
						}}
	               >
                      <Select
                        id="tb_xntlcwoh_vghyjelr"
                        name='vghyjelr'
                        value={formData.vghyjelr || ''}
                        onChange={(e) => handleSelectChange(e, [{'id':'01','name':'一般工商业用电'},{'id':'02','name':'大工业用电'},] , 'uxmevhzr')}
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
                      <FormHelperText>{errors['vghyjelr']}</FormHelperText>
                    </FormControl>
                    )}
			     </div>
	        </div>
			<input type="hidden" name="uxmevhzr" placeholder="" value={formData.uxmevhzr || ''} />
	    	<div className={oneColumnStyle}>
	            <label htmlFor="tb_xntlcwoh_hsoyoxad" className={labelStyle}>
	                用电制度
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.tgfmfgug || ''}</Typography>
	            	) : (
	              <FormControl fullWidth size="small"
	               error={!!errors['hsoyoxad']}
	               ref={(el) => {
							if (el) fieldRefs.current['hsoyoxad'] = el;
						}}
	               >
                      <Select
                        id="tb_xntlcwoh_hsoyoxad"
                        name='hsoyoxad'
                        value={formData.hsoyoxad || ''}
                        onChange={(e) => handleSelectChange(e, [{'id':'1','name':'单一制'},{'id':'2','name':'两部制'},] , 'tgfmfgug')}
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
                      <FormHelperText>{errors['hsoyoxad']}</FormHelperText>
                    </FormControl>
                    )}
			     </div>
	        </div>
			<input type="hidden" name="tgfmfgug" placeholder="" value={formData.tgfmfgug || ''} />
	    	<div className={oneColumnStyle}>
	            <label htmlFor="tb_xntlcwoh_qfcydhul" className={labelStyle}>
	                电压等级
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.vjtwicby || ''}</Typography>
	            	) : (
	              <FormControl fullWidth size="small"
	               error={!!errors['qfcydhul']}
	               ref={(el) => {
							if (el) fieldRefs.current['qfcydhul'] = el;
						}}
	               >
                      <Select
                        id="tb_xntlcwoh_qfcydhul"
                        name='qfcydhul'
                        value={formData.qfcydhul || ''}
                        onChange={(e) => handleSelectChange(e, [{'id':'1','name':'不满1千'},{'id':'10','name':'10千伏'},{'id':'35','name':'35千伏'},{'id':'110','name':'110千伏'},{'id':'220','name':'220千伏'},] , 'vjtwicby')}
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
                      <FormHelperText>{errors['qfcydhul']}</FormHelperText>
                    </FormControl>
                    )}
			     </div>
	        </div>
			<input type="hidden" name="vjtwicby" placeholder="" value={formData.vjtwicby || ''} />
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_xntlcwoh_ppleoliy" className={labelStyle}>
	                非分时电 度电价 （元/千瓦时）
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.ppleoliy || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['ppleoliy'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_xntlcwoh_ppleoliy"
			                    name="ppleoliy"
			                    value={formData.ppleoliy || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.ppleoliy ? true : false}
			                    helperText={errors.ppleoliy}
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
		                            <h2 className={groupTitleStyle}>其中</h2>
		                            <p className={groupDescriptionStyle}>
		                                
		                            </p>
		                            <div className={groupContentStyle + ` sm:grid-cols-2`}>
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_xntlcwoh_yqjhrqpv" className={labelStyle}>
	                代理购电价格
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.yqjhrqpv || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['yqjhrqpv'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_xntlcwoh_yqjhrqpv"
			                    name="yqjhrqpv"
			                    value={formData.yqjhrqpv || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.yqjhrqpv ? true : false}
			                    helperText={errors.yqjhrqpv}
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
	            <label htmlFor="tb_xntlcwoh_dbjcahum" className={labelStyle}>
	                上网环节线损电价
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.dbjcahum || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['dbjcahum'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_xntlcwoh_dbjcahum"
			                    name="dbjcahum"
			                    value={formData.dbjcahum || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.dbjcahum ? true : false}
			                    helperText={errors.dbjcahum}
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
	            <label htmlFor="tb_xntlcwoh_stmwshrs" className={labelStyle}>
	                电度输配电价
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.stmwshrs || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['stmwshrs'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_xntlcwoh_stmwshrs"
			                    name="stmwshrs"
			                    value={formData.stmwshrs || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.stmwshrs ? true : false}
			                    helperText={errors.stmwshrs}
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
	            <label htmlFor="tb_xntlcwoh_shwsiwey" className={labelStyle}>
	                系统运行费折价
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.shwsiwey || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['shwsiwey'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_xntlcwoh_shwsiwey"
			                    name="shwsiwey"
			                    value={formData.shwsiwey || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.shwsiwey ? true : false}
			                    helperText={errors.shwsiwey}
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
	            <label htmlFor="tb_xntlcwoh_mqnwdfoo" className={labelStyle}>
	                政府性基金及附加
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.mqnwdfoo || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['mqnwdfoo'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_xntlcwoh_mqnwdfoo"
			                    name="mqnwdfoo"
			                    value={formData.mqnwdfoo || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.mqnwdfoo ? true : false}
			                    helperText={errors.mqnwdfoo}
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
		                            <h2 className={groupTitleStyle}>分时电度电价（元/千瓦时）</h2>
		                            <p className={groupDescriptionStyle}>
		                                
		                            </p>
		                            <div className={groupContentStyle + ` sm:grid-cols-2`}>
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_wdfewcyh_batuyfhf" className={labelStyle}>
	                尖峰时段
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.batuyfhf || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['batuyfhf'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_wdfewcyh_batuyfhf"
			                    name="batuyfhf"
			                    value={formData.batuyfhf || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.batuyfhf ? true : false}
			                    helperText={errors.batuyfhf}
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
	            <label htmlFor="tb_wdfewcyh_zaftbdnw" className={labelStyle}>
	                高峰时段
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.zaftbdnw || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['zaftbdnw'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_wdfewcyh_zaftbdnw"
			                    name="zaftbdnw"
			                    value={formData.zaftbdnw || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.zaftbdnw ? true : false}
			                    helperText={errors.zaftbdnw}
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
	            <label htmlFor="tb_wdfewcyh_lhlvljqd" className={labelStyle}>
	                平时段
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.lhlvljqd || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['lhlvljqd'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_wdfewcyh_lhlvljqd"
			                    name="lhlvljqd"
			                    value={formData.lhlvljqd || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.lhlvljqd ? true : false}
			                    helperText={errors.lhlvljqd}
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
	            <label htmlFor="tb_wdfewcyh_tzikxfvh" className={labelStyle}>
	                低谷时段
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.tzikxfvh || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['tzikxfvh'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_wdfewcyh_tzikxfvh"
			                    name="tzikxfvh"
			                    value={formData.tzikxfvh || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.tzikxfvh ? true : false}
			                    helperText={errors.tzikxfvh}
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
		                            <h2 className={groupTitleStyle}>容（需）量用电价</h2>
		                            <p className={groupDescriptionStyle}>
		                                
		                            </p>
		                            <div className={groupContentStyle + ` sm:grid-cols-2`}>
			<div className={oneColumnStyle}>
	            <label htmlFor="tb_wdfewcyh_xkatnuim" className={labelStyle}>
	                最大需量
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.xkatnuim || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['xkatnuim'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_wdfewcyh_xkatnuim"
			                    name="xkatnuim"
			                    value={formData.xkatnuim || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.xkatnuim ? true : false}
			                    helperText={errors.xkatnuim}
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
	            <label htmlFor="tb_wdfewcyh_zmvivlpk" className={labelStyle}>
	                变压器容量
	            </label>
	            <div className="mt-2">
	            	{isViewReadOnly ? (
	            		<Typography variant="body2" gutterBottom>{formData.zmvivlpk || ''}</Typography>
	            	) : (
		              <FormControl fullWidth ref={(el) => {
														if (el) fieldRefs.current['zmvivlpk'] = el;
													}}>
			              <TextField
			                    type="number"
			                    id="tb_wdfewcyh_zmvivlpk"
			                    name="zmvivlpk"
			                    value={formData.zmvivlpk || ''}
			                    onChange={handleInputChange}
			                    size="small"
			                    variant="outlined"
			                    error={errors.zmvivlpk ? true : false}
			                    helperText={errors.zmvivlpk}
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
	                        Close
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