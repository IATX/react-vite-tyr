import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import { Button, Chip, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import { styled, ThemeProvider } from '@mui/material/styles';

import { useSession } from '../authority/SessionContext';
import { useAlert } from '../components/AlertContext';
import { useNavigate } from 'react-router-dom';

import NavBreadcrumb from './NavBreadcrumb';

import ProfileForm from '../settings/ProfilePage';
import ProfilePage from '../components/FormDialogSoloPage';
import { WrapSoloFormNode } from './WrapNode';
import theme from '../theme/tyr';

import { useTranslation } from 'react-i18next';
import { blue, blueGrey } from '@mui/material/colors';

export type TyrBreadcrumb = {
    arr: { name: string; url?: string; }[];
    sidebarOpen: boolean;
    onToggle?: () => void;
};

const Header: React.FC<TyrBreadcrumb> = ({ arr, sidebarOpen, onToggle }) => {
    const { t } = useTranslation();

    const applicationName = import.meta.env.VITE_APP_NAME;

    const { user, clearSession } = useSession();
    const { showAlert } = useAlert();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        // height: '26px',
        // fontSize: '0.8125rem',
        fontWeight: '500',
        letterSpacing: '0.01rem'
    });

    return (
        <>
            <ThemeProvider theme={theme}>
                <div className="flex flex-col border-b" style={{borderColor: blueGrey[50]}}>
                    <header className="p-4 bg-white flex justify-between items-center">
                        {/* 左侧区域：切换按钮 + 标题 */}
                        <div className='flex items-center gap-3'>
                            <Tooltip title={sidebarOpen ? "收起菜单" : "展开菜单"}>
                                {/* 展开/收缩按钮 */}
                                <IconButton
                                    onClick={onToggle} // 这里绑定你控制 Sidebar 的函数
                                    size="small"
                                    sx={{
                                        color: 'text.secondary',
                                        bgcolor: 'slate.50',
                                        transition: 'all 0.3s ease',
                                        // 增加点击时的旋转动画感（可选）
                                        transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                                        '&:hover': { bgcolor: 'primary.50', color: 'primary.main' }
                                    }}
                                >
                                    {/* 使用 MenuOpen 图标更有“收缩”的指向感 */}
                                    {sidebarOpen ? <MenuOpenIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>

                            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
                                {applicationName}
                            </h2>
                        </div>

                        {/* 右侧区域：用户信息 + 退出 */}
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

                                    {t('system.signout')}

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
                    dialogSize={`xs`}
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