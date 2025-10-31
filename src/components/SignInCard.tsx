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

import defaultCheckCodeImg from './../assets/checkcode.png';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import LinearProgress from '@mui/material/LinearProgress';
import { Tooltip } from '@mui/material';
import { SessionManager } from '../authority/SessionManager';
import PasswordInput from './PasswordInput';
import AccountInput from './AccountInput';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
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
    const accApiUrl = import.meta.env.VITE_JET_ASP_ACC_API;

    const { showAlert } = useAlert();

    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [errors, setErrors] = React.useState({
        logid: false, pwd: false, checkCode: false
    });
    const [formData, setFormData] = React.useState({
        logid: '', pwd: '', checkCode: ''
    });
    const [checkCodeImageSrc, setCheckCodeImageSrc] = React.useState(defaultCheckCodeImg);
    const { token, setToken, setUser } = useSession();
    const checkCodeRef = React.useRef('check_code_image');
    const navigate = useNavigate();

    const [progress, setProgress] = React.useState(0);
    const [shardSessionId, setShardSessionId] = React.useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!!!validateForm()) {
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
        var cfg = requesterConfig(shardSessionId);

        const client = axiosRequester(cfg);

        cfg.useForm();

        client
            .post(accApiUrl + '/checkcode/get/encryptedpwd', {
                'pwd': formData.pwd
            }).then((res) => {
                if (!!!res.data.success) {
                    alert(res.data.message);
                } else {
                    cfg.useJson();

                    client
                        .post(accApiUrl + '/remotelogin', {
                            'logid': formData.logid,
                            'password': res.data.data,
                            'code': formData.checkCode
                        }).then((resultData) => {
                            if (!!!resultData.data.success) {
                                showAlert(resultData.data.message, 'error');
                                setProgress(0);
                            } else {
                                SessionManager.setPermanentToken(resultData.data.data.token);

                                setToken(resultData.data.data.token);
                                setUser(SessionManager.transform(resultData.data.data.user));

                                navigate("/main");
                            }
                        }).catch((error) => {
                            // console.log(error.message);
                            showAlert('Exception in api service', 'error');
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

        var cfg = requesterConfig(token);

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
                showAlert('Exception in obtaining verification code', 'error');
            });

    };

    const CheckCodeImage = () => {
        return (
            <>
                <Tooltip title={'Click to get a new code'} arrow placement="top">
                    <Box
                        component="img"
                        ref={checkCodeRef}
                        src={checkCodeImageSrc}
                        onClick={GetVerificationCode}
                        id="checkcode_image"
                        sx={{
                            borderRadius: 1, // Rounded corners
                            height: '40px'
                        }}
                    />
                </Tooltip>
            </>
        );
    };

    return (
        <>

            <Card variant="outlined" sx={{
                border: 'none',
                backgroundColor: 'inherit',
                boxShadow: 'none'
            }}>
                <img src={RivetIcon} width={124} height={48} />
                <p className="font-semibold text-xl">Sign-in to your account</p>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 12 }}>
                            <FormControl sx={{ width: '100%', height: '80px' }}>
                                <FormLabel htmlFor="logid">Account</FormLabel>
                                <AccountInput
                                    error={errors.logid}
                                    helperText={errors.logid ? 'Account is required.' : ''}
                                    id="logid"
                                    name="logid"
                                    value={formData.logid}
                                    onChange={changeInputs}
                                    placeholder="Your account"
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <FormLabel htmlFor="logid">Password
                                    </FormLabel>
                                </Box>
                                
                                <PasswordInput
                                    error={errors.pwd}
                                    helperText={errors.pwd ? 'Password is required.' : ''}
                                    id="pwd"
                                    name="pwd"
                                    value={formData.pwd}
                                    onChange={changeInputs}
                                    placeholder="Your password"
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
                                    <FormLabel htmlFor="checkCode">Verification Code</FormLabel>
                                </Box>
                                <StyledTextField
                                    error={errors.checkCode}
                                    helperText={errors.checkCode ? 'Verification code is required.' : ''}
                                    placeholder="••••••"
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
                            Sign in
                        </Button>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography sx={{ textAlign: 'center' }}>
                                Don&apos;t have an account?{' '}
                                <span>
                                    <Link
                                        href="/material-ui/getting-started/templates/sign-in/"
                                        variant="body2"
                                        sx={{ alignSelf: 'center' }}
                                    >
                                        Sign up
                                    </Link>
                                </span>
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

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
