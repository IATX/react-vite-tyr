import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ThemeProvider } from '@mui/material/styles';
import axiosRequester, { requesterConfig } from './AxiosRequester';
import { useSession } from '../authority/SessionContext';
import { useAlert } from '../components/AlertContext';

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import LinearProgress from '@mui/material/LinearProgress';
import { Tooltip } from '@mui/material';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { SessionManager } from '../authority/SessionManager';
import PasswordInput from './PasswordInput';
import AccountInput from './AccountInput';

import { useTranslation } from 'react-i18next';

import CodeInput from './CodeInput';

import theme from '../theme/tyr';
import epbpLogo from '../assets/epbp.png';


interface SignInCardProps {
    /** 是否在卡片头部显示 Logo（默认显示） */
    showLogo?: boolean;
    /** 卡片头部标题（默认显示「登录系统」，可传入系统名称或自定义节点覆盖） */
    title?: React.ReactNode;
}

const SignInCard: React.FC<SignInCardProps> = ({ showLogo = true, title }) => {
    const { t } = useTranslation();

    const accApiUrl = import.meta.env.VITE_JET_ASP_ACC_API;

    const { showAlert } = useAlert();

    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [errors, setErrors] = React.useState({
        logid: false, pwd: false, checkCode: false
    });
    const [formData, setFormData] = React.useState({
        logid: '', pwd: '', checkCode: ''
    });
    const [checkCodeImageSrc, setCheckCodeImageSrc] = React.useState('');
    const { token, setToken, setUser } = useSession();
    const checkCodeRef = React.useRef('check_code_image');
    const navigate = useNavigate();

    const [progress, setProgress] = React.useState(0);
    const [shardSessionId, setShardSessionId] = React.useState('');
    // 是否已获取验证码图片（未获取时显示带图标的按钮）
    const [codeFetched, setCodeFetched] = React.useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress === 100) {
                    return 0;
                }
                const diff = Math.random() * 20;
                return Math.min(oldProgress + diff, 100);
            });
        }, 500);

        await new Promise((resolve) => setTimeout(resolve, 3000));

        // const formData = new FormData(event.currentTarget);
        const cfg = requesterConfig(shardSessionId);

        const client = axiosRequester(cfg);

        cfg.useForm();

        client
            .post(accApiUrl + '/checkcode/get/encryptedpwd', {
                'pwd': formData.pwd
            }).then((res) => {
                if (!res.data.success) {
                    alert(res.data.message);
                } else {
                    cfg.useJson();

                    client
                        .post(accApiUrl + '/remotelogin', {
                            'logid': formData.logid,
                            'password': res.data.data,
                            'code': formData.checkCode
                        }).then((resultData) => {
                            if (!resultData.data.success) {
                                showAlert(resultData.data.message, 'error');
                                setProgress(0);
                            } else {
                                setToken(resultData.data.data.token);
                                setUser(SessionManager.transform(resultData.data.data.user));

                                navigate("/main");
                            }
                        }).catch((error) => {
                            showAlert('Exception in api service: ' + error.message, 'error');
                            setProgress(0);
                        }).finally(() => {
                            setIsLoading(false);
                            clearInterval(timer);
                        });
                }
            }).catch((error) => {
                showAlert(error.message, 'error');
                setProgress(0);
            }).finally(() => {
                setIsLoading(false);
                clearInterval(timer);
            });
    };

    const validateInputs = () => {
        // const logid = document.getElementById('logid') as HTMLInputElement;
        // const password = document.getElementById('pwd') as HTMLInputElement;
        // const checkCode = document.getElementById('checkCode') as HTMLInputElement;

        setErrors({
            logid: formData.logid.trim().length == 0,
            pwd: formData.pwd.trim().length == 0,
            checkCode: formData.checkCode.trim().length == 0
        });

        return !errors.logid && !errors.pwd && !errors.checkCode;
    };

    const validateForm = () => {
        // const logid = document.getElementById('logid') as HTMLInputElement;
        // const pwd = document.getElementById('pwd') as HTMLInputElement;
        // const checkCode = document.getElementById('checkCode') as HTMLInputElement;

        return formData.logid.trim().length > 0 && formData.pwd.trim().length > 0 && formData.checkCode.trim().length > 0;
    }

    const changeInputs = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.currentTarget;

        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        setErrors((prevState) => ({ ...prevState, [name]: (value.trim().length == 0) }));
    }, []);

    const GetVerificationCode = () => {
        if (isLoading) {
            // If isLoading is true, exit the function immediately.
            return;
        }

        const cfg = requesterConfig(token);

        const client = axiosRequester(cfg);

        client
            .post(accApiUrl + '/getsharedcode/base64').then((res) => {
                /*setFormData((prev) => ({
                    ...prev,
                    ['checkCodeImageSrc']: ('data:image/jpg;base64,' + data.data.code)
                }));*/

                if (checkCodeRef.current) {
                    // let img = document.getElementById('checkcode_image') as HTMLImageElement;

                    // img.src = ('data:image/jpg;base64,' + data.data.code);
                    // checkCodeRef.current.src = "new-image.jpg";
                }

                setCheckCodeImageSrc(('data:image/jpg;base64,' + res.data.data.code));

                setShardSessionId(res.data.data.shardSessionId);

                setCodeFetched(true);
            }).catch((error) => {
                // console.log(error.message);
                showAlert('Exception in obtaining verification code: ' + error.message, 'error');
            });

    };

    const CheckCodeImage = () => {
        // 未获取验证码时，显示带图标的按钮
        if (!codeFetched) {
            return (
                <button
                    type="button"
                    onClick={GetVerificationCode}
                    disabled={isLoading}
                    className="flex h-[38px] w-full items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-gray-200 bg-gray-50 px-2 text-[13px] font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <VerifiedUserOutlinedIcon sx={{ fontSize: 18 }} />
                    {t('system.getsignincode')}
                </button>
            );
        }

        // 已获取后显示验证码图片，点击刷新
        return (
            <Tooltip title={t('system.getsignincode')} arrow placement="top">
                <Box
                    component="img"
                    ref={checkCodeRef}
                    src={checkCodeImageSrc}
                    onClick={GetVerificationCode}
                    id="checkcode_image"
                    sx={{
                        borderRadius: 3,
                        height: '38px',
                        width: 'auto',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        cursor: 'pointer',
                    }}
                />
            </Tooltip>
        );
    };

    return (
        <>
            <ThemeProvider theme={theme}>
                <div className="w-full">
                    {/* 头部：Logo + 标题 */}
                    <div className="flex flex-col items-center text-center">
                        {showLogo && (
                            <img
                                src={epbpLogo}
                                alt="EPBP"
                                className="h-20 w-auto"
                            />
                        )}
                        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 ">
                            {title ?? t('system.signin')}
                        </h2>

                        <div className="mt-8 flex w-full items-center gap-3">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-blue-100" />
                            <Typography className="shrink-0 text-sm font-medium uppercase tracking-widest text-slate-600">
                                {t('system.signinhint')}
                            </Typography>
                            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-blue-100" />
                        </div>
                    </div>

                    <div className="mt-8 mx-auto w-full max-w-sm">
                        <form method="POST" onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="logid" className="block text-sm/6 font-medium text-slate-600">
                                    {t('system.account')}
                                </label>
                                <div className="mt-2">
                                    <AccountInput
                                        error={errors.logid}
                                        helperText={errors.logid ? t('validation.signin.accounterror') : ''}
                                        id="logid"
                                        name="logid"
                                        value={formData.logid}
                                        onChange={changeInputs}
                                        placeholder={t('system.accountplaceholder')}
                                        autoComplete="logid"
                                        disabled={isLoading}
                                        autoFocus
                                        fullWidth
                                        variant="outlined"
                                        color={errors.logid ? 'error' : 'primary'}
                                    ></AccountInput>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="pwd" className="block text-sm/6 font-medium text-gray-600">
                                        {t('system.password')}
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <PasswordInput
                                        error={errors.pwd}
                                        helperText={errors.pwd ? t('validation.signin.pwderror') : ''}
                                        id="pwd"
                                        name="pwd"
                                        value={formData.pwd}
                                        onChange={changeInputs}
                                        placeholder={t('system.pwdplaceholder')}
                                        autoComplete="pwd"
                                        disabled={isLoading}
                                        fullWidth
                                        variant="outlined"
                                        color={errors.pwd ? 'error' : 'primary'}
                                    ></PasswordInput>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="checkCode" className="block text-sm/6 font-medium text-gray-600">
                                        {t('system.verificationcode')}
                                    </label>
                                </div>

                                <div className="mt-2 flex flex-col gap-1">
                                    <div className="flex items-start gap-3">
                                        <div className="relative flex-1">
                                            <CodeInput
                                                error={errors.checkCode}
                                                helperText={errors.checkCode ? t('validation.signin.codeerror') : ''}
                                                id="checkCode"
                                                name="checkCode"
                                                value={formData.checkCode}
                                                onChange={changeInputs}
                                                placeholder={``}
                                                autoComplete="pwd"
                                                disabled={isLoading}
                                                fullWidth
                                                variant="outlined"
                                                color={errors.checkCode ? 'error' : 'primary'}
                                            ></CodeInput>
                                        </div>

                                        <div className="shrink-0 h-[38px] w-32 overflow-hidden rounded-lg flex items-center">
                                            <CheckCodeImage />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-1">
                                <button
                                    type="submit"
                                    onClick={validateInputs}
                                    disabled={isLoading}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition
                                    hover:bg-blue-500 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
                                    disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isLoading && (
                                        <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    )}
                                    {isLoading ? '登录验证过程中...' : t('system.signin')}
                                </button>
                            </div>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-400">
                            <a href="#" className="font-medium text-blue-600 transition hover:text-blue-500" onClick={(e) => {
                                e.preventDefault();

                                navigate('/');
                            }}>
                                {t('system.backhome')}
                            </a>
                        </p>
                    </div>
                </div>
            </ThemeProvider>

            {isLoading && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '10px',
                        zIndex: 9999,
                    }}>
                    <LinearProgress variant="determinate" value={progress} sx={{ height: '5px' }} />
                </Box>
            )}
        </>
    );
}

export default SignInCard;
