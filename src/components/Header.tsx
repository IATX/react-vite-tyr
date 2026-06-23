import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import { Chip, Divider, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import { ThemeProvider } from '@mui/material/styles';

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
                                        '&:hover': { bgcolor: '#ecfdf5', color: '#059669' }
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
                            <Tooltip title={'密码管理'} arrow>

                                <Chip variant="outlined" sx={{

                                    border: 'none'

                                }}

                                    avatar={<Avatar alt="Natacha" sx={{

                                        border: 'none',
                                        bgcolor: '#ecfdf5',
                                        color: '#059669',

                                    }}

                                    ><PersonIcon></PersonIcon></Avatar>}

                                    label={user?.name}

                                    onClick={handlePortrait}

                                />

                            </Tooltip>

                            <Divider orientation="vertical" flexItem sx={{ my: 0.75, borderColor: '#e2e8f0' }} />

                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="group flex items-center rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            >
                                <LogoutIcon fontSize="small" />
                                {/* 悬浮时从右侧滑出文字，移出自动收起 */}
                                <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-300 ease-out group-hover:ml-1.5 group-hover:max-w-[6rem] group-hover:opacity-100">
                                    {t('system.signout')}
                                </span>
                            </button>
                        </div>
                    </header>

                    <div className='px-4 py-2 bg-white'>
                        <NavBreadcrumb navItems={arr}></NavBreadcrumb>
                    </div>
                </div>
                <ProfilePage
                    title="密码管理"
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