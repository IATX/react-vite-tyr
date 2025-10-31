import React from 'react';
import Avatar from '@mui/material/Avatar';
import { Button, Chip, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { styled, ThemeProvider } from '@mui/material/styles';

import { useSession } from '../authority/SessionContext';
import { useAlert } from '../components/AlertContext';
import { useNavigate } from 'react-router-dom';

import NavBreadcrumb from './NavBreadcrumb';

import ProfileForm from '../settings/ProfilePage';
import ProfilePage from '../components/FormDialogSoloPage';
import { WrapSoloFormNode } from './WrapNode';
import theme from '../theme/tyr';


export type TyrBreadcrumb = {
    arr: { name: string; url?: string; }[];
};

const Header: React.FC<TyrBreadcrumb> = ({ arr }) => {
    const applicationName = import.meta.env.VITE_APP_NAME;

    const { user, clearSession } = useSession();
    const { showAlert } = useAlert();

    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const navigate = useNavigate();

    const handleSignOut = () => {
        clearSession();

        navigate("/login");
    }

    const handlePortrait = () => {
        setIsDialogOpen(true);
    }

    const CustomStyledButton = styled(Button)({
        borderRadius: 8,
        padding: '6px 8px 6px 10px',
        '&:hover': {
            backgroundColor: 'oklch(97% 0.014 254.604)',
        },
        textTransform: 'none',
        height: '26px',
        fontSize: '0.8125rem',
        fontWeight: '500',
        letterSpacing: '0.01rem'
    });

    return (
        <>
            <ThemeProvider theme={theme}>
                <div className='flex flex-col border border-white border-b-gray-200'>
                    <header className="p-4 bg-white flex justify-between items-center ">
                        {/* Search Bar */}
                        <div className='flex items-center'>
                            <h2 className="text-lg font-semibold">{applicationName}</h2>
                        </div>

                        <div className='flex items-center gap-2'>
                            <Tooltip title={'Password management'} arrow>
                                <Chip variant="outlined" sx={{
                                    border: 'none'
                                }}
                                    avatar={<Avatar alt="Natacha" sx={{
                                        border: 'none'
                                    }}
                                    ><PersonIcon></PersonIcon></Avatar>}
                                    label={user?.name}
                                    onClick={handlePortrait}
                                />
                            </Tooltip>
                            <Tooltip title={'Sign out'} arrow>
                                <CustomStyledButton variant="text" onClick={handleSignOut} endIcon={<LogoutIcon className='text-xs' />}>
                                    Sign out
                                </CustomStyledButton>
                            </Tooltip>
                        </div>
                    </header>

                    <div className='px-4 py-2 bg-white'>
                        <NavBreadcrumb navItems={arr}></NavBreadcrumb>
                    </div>
                </div>
                <ProfilePage
                    title="Change the password"
                    open={isDialogOpen}
                    onClose={() => {
                        setIsDialogOpen(false);
                    }}

                    children={WrapSoloFormNode(<ProfileForm onCancel={() => {
                        setIsDialogOpen(false);
                    }} onSubmit={() => {
                        setIsDialogOpen(false);

                        showAlert('Update password successfully.', 'success');
                    }} />)}
                />
            </ThemeProvider>
        </>
    );
};

export default Header;