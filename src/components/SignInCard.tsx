import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import axiosRequester, { requesterConfig } from './AxiosRequester';
import { useSession } from '../authority/SessionContext';
import { useAlert } from '../components/AlertContext';

import RivetIcon from './../assets/rivet.svg';

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import LinearProgress from '@mui/material/LinearProgress';
import { Tooltip } from '@mui/material';
import { SessionManager } from '../authority/SessionManager';
import PasswordInput from './PasswordInput';
import AccountInput from './AccountInput';

import { useTranslation } from 'react-i18next';

import theme from '../theme/tyr';
import { ThemeProvider } from '@mui/material/styles';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),

    // --- 核心改动：背景、边框与阴影的微调 ---
    bgcolor: '#f8fafc', // 使用极浅的蓝灰色（类似 Tailwind 的 slate-50），比纯白更高级
    border: '1px solid',
    borderColor: '#fff', // 边框比背景色稍深一点点，形成精致的边界
    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.05)', // 更加克制的阴影

    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },

    // --- 深色模式适配 ---
    ...theme.applyStyles('dark', {
        bgcolor: '#0f172a', // 深蓝色底色
        borderColor: '#1e293b',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    }),
}));

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '.375rem',
        backgroundColor: '#fff',
        // 悬浮时的边框
        '&:hover': {
            borderColor: '#9e9e9e',
        },
        // 聚焦时的边框
        '&.Mui-focused': {
            borderColor: 'hsl(210, 98%, 48%)',
            outline: '1px solid hsl(210, 98%, 48%);'
        },
    },
});



const SignInCard: React.FC = () => {
    const { t } = useTranslation();

    const accApiUrl = import.meta.env.VITE_JET_ASP_ACC_API;

    const BASE_PATH = import.meta.env.VITE_JET_ASP_CONTEXT || '/';

    const { showAlert } = useAlert();

    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [errors, setErrors] = React.useState({
        logid: false, pwd: false, checkCode: false
    });
    const [formData, setFormData] = React.useState({
        logid: '', pwd: '', checkCode: ''
    });
    const [checkCodeImageSrc, setCheckCodeImageSrc] = React.useState('data:image/jpeg;base64,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');
    const { token, setToken, setUser } = useSession();
    const checkCodeRef = React.useRef('check_code_image');
    const navigate = useNavigate();

    const [progress, setProgress] = React.useState(0);
    const [shardSessionId, setShardSessionId] = React.useState('');

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
            }).catch((error) => {
                // console.log(error.message);
                showAlert('Exception in obtaining verification code: ' + error.message, 'error');
            });

    };

    const CheckCodeImage = () => {
        return (
            <>
                <Tooltip title={t('system.getsignincode')} arrow placement="top">
                    <Box
                        component="img"
                        ref={checkCodeRef}
                        src={checkCodeImageSrc}
                        onClick={GetVerificationCode}
                        id="checkcode_image"
                        sx={{
                            borderRadius: 1, // Rounded corners
                            height: '35px',
                            cursor: 'pointer'
                        }}
                    />
                </Tooltip>
            </>
        );
    };

    return (
        <>

            <Card variant="outlined" sx={{
            }}>
                <a href={BASE_PATH}><img src={RivetIcon} width={110} height={40} className='mb-4' /></a>
                <p className="font-semibold text-xl">{t('system.signinhint')}</p>
                <ThemeProvider theme={theme}>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 12 }}>
                                <FormControl sx={{ width: '100%', height: '80px' }}>
                                    <FormLabel htmlFor="logid">{t('system.account')}</FormLabel>
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
                                        required
                                        autoFocus
                                        fullWidth
                                        variant="outlined"
                                        color={errors.logid ? 'error' : 'primary'}
                                    ></AccountInput>
                                </FormControl>
                            </Grid>
                            <Grid size={{ md: 12 }}>
                                <FormControl sx={{ width: '100%', height: '80px' }}>
                                    <FormLabel htmlFor="logid">{t('system.password')}
                                    </FormLabel>

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
                                        required
                                        fullWidth
                                        variant="outlined"
                                        color={errors.pwd ? 'error' : 'primary'}
                                    ></PasswordInput>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 8, md: 8 }}>
                                <FormControl sx={{ width: '100%', height: '80px' }}>
                                    <Box sx={{ display: { xs: 'flex', flexDirection: 'column' }, width: '100%' }}>
                                        <FormLabel htmlFor="checkCode">{t('system.verificationcode')}</FormLabel>
                                    </Box>
                                    <StyledTextField
                                        error={errors.checkCode}
                                        helperText={errors.checkCode ? t('validation.signin.codeerror') : ''}
                                        placeholder="******"
                                        type="text"
                                        id="checkCode"
                                        name="checkCode"
                                        value={formData.checkCode}
                                        onChange={changeInputs}
                                        autoComplete=""
                                        disabled={isLoading}
                                        required
                                        fullWidth
                                        variant="outlined"
                                        color={errors.checkCode ? 'error' : 'primary'}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid size={{ md: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <FormLabel htmlFor="checkCode">&nbsp;</FormLabel>
                                </Box>
                                <CheckCodeImage></CheckCodeImage>
                            </Grid>
                            <Grid size={{ xs: 12 }}><Button type="submit" fullWidth onClick={validateInputs} disabled={isLoading} className='text-white bg-blue-500 hover:bg-blue-400'>
                                {t('system.signin')}
                            </Button>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Typography sx={{ textAlign: 'center' }}>
                                    <span>
                                        <Link
                                            href={BASE_PATH}
                                            variant="body2"
                                            sx={{ alignSelf: 'center' }}
                                        >
                                            {t('system.backhome')}
                                        </Link>
                                    </span>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </ThemeProvider>
            </Card>
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

export default React.memo(SignInCard);
