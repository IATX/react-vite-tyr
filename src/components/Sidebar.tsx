import React, { useContext, useRef, useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemAvatar, ListItemText, Typography, Avatar, Link, Collapse, ListItemButton, Popover, Box, Divider, Grid, styled, Paper, ListSubheader, MenuList, Tooltip, IconButton } from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    KeyboardArrowRight as KeyboardArrowRightIcon,
    MoreVert as MoreVertIcon,
    SmartToy as SmartToyIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    BorderColor,
} from '@mui/icons-material';

import RivetSvg from "./RivetSvg";
import RivetMiniSvg from "./RivetMiniSvg";

import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import type { IMenu } from '../utils/generateRoutes';

import { TreeItem } from '@mui/x-tree-view/TreeItem';

import { useBreadcrumbs } from '../context/BreadcrumbContext';
import componentMap, { type IComponentItem, type IComponentMap } from '../app/ComponentMap';

import { useTranslation } from 'react-i18next';
import { RichTreeView } from '@mui/x-tree-view';
import { blue, blueGrey, grey } from '@mui/material/colors';

interface SidebarProps {
    activeItemId: string;
    onItemClick: (itemId: string) => void;
    open: boolean;
    onExpandSidebar: () => void;
    width: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItemId, onItemClick, open, onExpandSidebar, width }) => {
    const { t } = useTranslation();

    const navigate = useNavigate();

    const handleItemClick = (itemId: string) => {
        // 调用父组件的回调函数，将新的激活项ID传递出去
        onItemClick(itemId);
    };
    // const [activeItemId, setActiveItemId] = useState(defaultActiveItemId);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuTreeNodes, setMenuTreeNodes] = useState<IMenu[]>([]);
    const [menuTreeOrigan, setMenuTreeOrigan] = useState<IMenu[]>([]);
    const { appMenus, appHubs, setCurrentBayContent } = useContext(AppContext);
    const [collapseSubmenus, setCollapseSubmenus] = useState<{ [key: string]: boolean }>({});
    const { setBreadcrumbs } = useBreadcrumbs();

    const [parentBreadcrumbs, setParentBreadcrumbs] = useState<{ name: string, url: string }[]>([]);

    // Defining a lookup function
    function findComponentItemByPath(map: IComponentMap, targetPath: string): IComponentItem | undefined {
        // Get all property values ​​in the map (i.e. IComponentItem objects)
        const componentItems = Object.values(map);

        // Use find() to traverse the array and find the target item that matches the path
        const foundItem = componentItems.find(item => item.path === targetPath);

        // Returns the found elem, or undefined if not found
        return foundItem;
    }

    const handleClick = (event: React.MouseEvent<HTMLElement>, menu: IMenu, breadcrumbArr: { name: string, url: string }[], childrenMenus?: IMenu[]) => {
        handleItemClick(menu.id);

        if (childrenMenus && childrenMenus.length > 0) {
            setAnchorEl(event.currentTarget);

            setMenuTreeNodes(childrenMenus);
            setMenuTreeOrigan(childrenMenus);

            setParentBreadcrumbs(breadcrumbArr);
        }

        if (menu.url !== '') {
            setBreadcrumbs(breadcrumbArr);

            if (menu.id === 'react_vite_tyr_dashboard' || menu.id === 'react_vite_tyr_settings') {
                navigate(menu.url);
            } else {
                const componentItem = findComponentItemByPath(componentMap, menu.url);

                if (componentItem && componentItem.elem) {
                    setCurrentBayContent({
                        title: menu.label,
                        subheader: menu.label,
                        elem: componentItem.elem,
                        type: componentItem.type
                    });
                } else {
                    setCurrentBayContent({
                        title: menu.label,
                        subheader: menu.label,
                        elem: <>Not found element for {menu.id}.</>,
                        type: 'blank'
                    });
                }

                navigate('/main/trays');
            }

        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const findNodeById = (id: string, nodes: IMenu[]): IMenu | undefined => {
        for (const node of nodes) {
            if (node.id === id) {
                return node;
            }
            if (node.children) {
                const found = findNodeById(id, node.children);
                if (found) {
                    return found;
                }
            }
        }
        return undefined;
    };

    const handleNodeClick = (event: React.SyntheticEvent | null,
        nodeId: string,
        isSelected: boolean,) => {
        // Find the corresponding node data according to the node ID
        const selectedNode = findNodeById(nodeId, menuTreeOrigan);

        // If the node is found and it has a `path` attribute, jump to it
        if (selectedNode && selectedNode.url) {
            const combinedArray = [...parentBreadcrumbs, ...[{ 'name': selectedNode.label, 'url': selectedNode.url }]];

            setBreadcrumbs(combinedArray);

            const componentItem = findComponentItemByPath(componentMap, selectedNode.url);

            if (componentItem && componentItem.elem) {
                setCurrentBayContent({
                    title: selectedNode.label,
                    subheader: selectedNode.label,
                    elem: componentItem.elem,
                    type: componentItem.type
                });
            } else {
                setCurrentBayContent({
                    title: selectedNode.label,
                    subheader: selectedNode.label,
                    elem: <>Not found element for {selectedNode.id}.</>,
                    type: 'blank'
                });
            }

            handleClose();

            navigate('/main/trays');
        }
    };

    const openPopover = Boolean(anchorEl);

    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'up' | 'down') => {
        if (scrollRef.current) {
            const scrollAmount = 100; // 每次点击滚动的像素
            scrollRef.current.scrollBy({
                top: direction === 'up' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // @ts-ignore
    return (
        <Box className={`w-64 p-4 flex flex-col justify-between border-r
                transition-all duration-300 ease-in-out overflow-hidden`} style={{ width: `${width}px` }} sx={{borderColor: blueGrey[50]}}>
            {/* Logo */}
            <div className={`flex items-center mb-8 transition-all duration-300 ${!open ? 'justify-center' : ''}`}>
                <div className="transition-opacity duration-300 ease-in-out">
                    {open ? <RivetSvg /> : <RivetMiniSvg />}
                </div>
            </div>
            {/* Menu Items */}
            <div className='min-h-0 flex-1 overflow-y-auto custom-scrollbar' ref={scrollRef}>
                <div className='p-1'>
                    {/** Mainspace */}
                    {open && (
                        <p className="text-sm font-semibold mb-2">{t('system.mainspace')}</p>
                    )}
                    <List sx={{ width: '100%', maxWidth: 320, py: 0 }}>
                        {appHubs && appHubs.map((item) => (
                            <ListItem
                                key={item.id}
                                disablePadding
                                sx={{
                                    minHeight: 75,
                                    borderRadius: '8px',
                                    mb: 1,
                                    backgroundColor: open ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                                    border: open ? '1px solid' : '1px solid transparent',
                                    borderColor: open ? '#eceff1' : 'transparent',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                        borderColor: '#cfd8dc',
                                        '& .MuiAvatar-root': {
                                            transform: !open ? 'scale(1.1)' : 'scale(1.05)',
                                            color: 'primary.main',
                                            borderColor: 'primary.main',
                                        }
                                    },
                                }}
                            >
                                <Tooltip
                                    title={!open ? (
                                        <Box sx={{ p: 0.5 }}>
                                            <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{item.label}</Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>{item.subtitle}</Typography>
                                        </Box>
                                    ) : ""}
                                    placement="right"
                                    arrow
                                >
                                    <ListItemButton
                                        onClick={() => {
                                            // 安全获取组件，防止 .elem 报错
                                            const componentItem = findComponentItemByPath(componentMap, item.url);    

                                            setCurrentBayContent({
                                                title: item.label,
                                                subheader: item.subtitle,
                                                elem: componentItem?.elem || <Box sx={{ p: 2 }}>未找到Hub页面</Box>,
                                                type: 'hub'
                                            });

                                            navigate('/main/trays');
                                        }}
                                        sx={{
                                            py: open ? 1 : 1.5,
                                            px: open ? 2 : 0,
                                            borderRadius: '8px',
                                            flexDirection: open ? 'row' : 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: open ? 1.5 : 0,
                                            '&:hover': {
                                                backgroundColor: !open ? 'transparent' : 'initial',
                                            }
                                        }}
                                    >
                                        {/* 1. 图标头像部分 */}
                                        <ListItemAvatar
                                            sx={{
                                                minWidth: 0,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                mr: open ? 0.5 : 0,
                                                mb: open ? 0 : 0.5
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    width: open ? 34 : 30,
                                                    height: open ? 34 : 30,
                                                    bgcolor: '#f8fafc',
                                                    color: 'primary.main',
                                                    border: '1.5px solid',
                                                    borderColor: 'primary.main',
                                                    transition: 'all 0.3s ease',
                                                    '& .MuiSvgIcon-root': {
                                                        fontSize: open ? 18 : 22,
                                                        color: 'inherit',
                                                    }
                                                }}
                                            >
                                                {/* 直接使用变量，不要用 ${} */}
                                                {item.icon && <item.icon sx={{  }} />}
                                            </Avatar>
                                        </ListItemAvatar>

                                        {/* 2. 文字内容部分 */}
                                        <ListItemText
                                            primary={item.label}
                                            secondary={open ? item.subtitle : null}
                                            slotProps={{
                                                primary: {
                                                    variant: 'caption',
                                                    fontWeight: 600,
                                                    noWrap: true,
                                                    className: `transition-all duration-300 ${!open ? 'text-[10px] scale-90' : 'text-sm'}`,
                                                    sx: {
                                                        color: 'text.primary',
                                                        textAlign: open ? 'left' : 'center',
                                                        width: !open ? '60px' : 'auto',
                                                    },
                                                }
                                            }}
                                            sx={{
                                                m: 0,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: !open ? 'center' : 'flex-start',
                                                mt: !open ? 0.2 : 0,
                                                '& .MuiListItemText-root': { m: 0 }
                                            }}
                                        />
                                    </ListItemButton>
                                </Tooltip>
                            </ListItem>
                        ))}
                    </List>
                </div>

                <Divider
                    sx={{
                        borderBottomWidth: 1,
                        my: 1,
                        mx: -0.5,
                        borderColor: blueGrey[100]
                    }}
                />

                {/* Navigation */}
                {open && (
                    <>
                        <p className="text-sm font-semibold mt-4 mb-2">{t('system.navigation')}</p>
                    </>
                )}
                {appMenus && appMenus.map((item) => (
                    <Box key={'box_' + item.id}>
                        <Tooltip
                            title={!open ? t(item.label) : ""}
                            placement="right"
                            arrow
                        >
                            <ListItem
                                component={Link}
                                onClick={(event) => {
                                    if (!open && item.children && item.children.length > 0) {
                                        onExpandSidebar();
                                    }

                                    // 2. 正常逻辑：处理面包屑/点击跳转
                                    handleClick(event, item, [{
                                        name: t(item.label),
                                        url: item.url
                                    }]);

                                    // 3. 处理展开/收缩子菜单
                                    setCollapseSubmenus(prevData => ({
                                        ...prevData,
                                        [item.id]: !collapseSubmenus[item.id]
                                    }));
                                }}
                                key={item.id}
                                className={`
                                            rounded-md transition-all duration-200
                                            ${item.id === activeItemId ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500 hover:bg-gray-100'} 
                                            ${!open ? 'flex-col justify-center py-2 px-0' : 'flex-row justify-start py-[2px] px-2'}
                                            `}
                                sx={{ cursor: 'pointer', position: 'relative' }}
                            >
                                {/* 1. 图标部分 */}
                                <ListItemIcon
                                    className={`
                                                min-w-0 transition-all
                                                ${item.id === activeItemId ? 'text-blue-500' : 'text-gray-500'}
                                                ${!open ? 'mb-1' : 'mr-0'}
                                            `}
                                    sx={{ justifyContent: 'center' }}
                                >
                                    {item.icon && <item.icon sx={{ width: open ? '1.2rem' : '1.3rem', height: open ? '1.2rem' : '1.3rem' }} />}
                                </ListItemIcon>

                                {/* 2. 文字部分：现在收缩和展开都存在，但样式不同 */}
                                <ListItemText
                                    primary={t(item.label)}
                                    slotProps={{
                                        primary: {
                                            className: `transition-all duration-200 ${!open
                                                ? 'text-center text-[10px] leading-tight font-medium' // 收缩时的超小字体
                                                : 'px-2 text-base/8 sm:text-sm/8'         // 展开时的正常字体
                                                } ${item.id === activeItemId ? 'font-semibold' : ''}`,
                                            sx: {
                                                display: 'block',
                                                maxWidth: !open ? '64px' : 'none',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }
                                        },
                                    }}
                                    style={{ margin: 0 }}
                                />

                                {/* 3. 箭头部分：仅在有子项时显示 */}
                                {item.children && item.children.length > 0 && (
                                    <Box
                                        sx={{
                                            minWidth: 0,
                                            display: 'flex',
                                            // 收缩时绝对定位到右上角，展开时正常靠右
                                            position: !open ? 'absolute' : 'static',
                                            right: !open ? 4 : 0,
                                            top: !open ? 8 : 'auto',
                                            ml: open ? 'auto' : 0,
                                            opacity: 0.6
                                        }}
                                    >
                                        {!collapseSubmenus[item.id] || !open ? (
                                            <KeyboardArrowRightIcon sx={{ fontSize: '0.9rem', color: grey[900] }} />
                                        ) : (
                                            <ExpandMoreIcon sx={{ fontSize: '0.9rem' }} />
                                        )}
                                    </Box>
                                )}
                            </ListItem>
                        </Tooltip>

                        {/* Sub-menu container and loop */}
                        {open && item.children && (
                            <Collapse in={collapseSubmenus[item.id]} timeout="auto" unmountOnExit>
                                {item.children.map((subItem) => (
                                    <ListItem
                                        key={subItem.id}
                                        component={Link}
                                        onClick={(event) => handleClick(event, subItem, [{
                                            name: t(item.label),
                                            url: item.url
                                        }, {
                                            name: t(subItem.label),
                                            url: subItem.url
                                        }], subItem.children)}
                                        className={`p-[2px] ml-[10px] rounded-md ${subItem.id === activeItemId ? 'text-blue-500 cursor-pointer' : 'text-gray-600 hover:text-blue-500 hover:bg-gray-100 cursor-pointer'}`}
                                    >
                                        <ListItemIcon className={`min-w-0 ${subItem.id === activeItemId ? 'text-blue-500' : 'text-gray-500'}`}>
                                            {subItem.icon && <subItem.icon sx={{ width: '1rem', height: '1rem' }} />}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t(subItem.label)}
                                            slotProps={{
                                                primary: {
                                                    className: `px-2 ${subItem.id === activeItemId ? 'font-semibold text-base/8 sm:text-sm/8' : 'text-base/8 sm:text-sm/8'}`,
                                                },
                                            }}
                                            style={{ marginTop: '0px', marginBottom: '0px', width: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                        />
                                        {subItem.children && subItem.children.length > 0 && (
                                            <ListItemIcon sx={{ minWidth: 0, mr: '15px' }}>
                                                <MoreVertIcon sx={{ width: '1rem', height: '1rem' }} />
                                            </ListItemIcon>
                                        )}
                                    </ListItem>
                                ))}
                            </Collapse>
                        )}

                    </Box>

                ))}
                <Popover
                    open={openPopover}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    classes={{
                        paper: 'shadow-none border border-gray-200 rounded-md p-2',
                    }}
                >
                    <Box sx={{}}>
                        <RichTreeView
                            items={menuTreeNodes}
                            onItemSelectionToggle={handleNodeClick}
                            slots={{
                                item: (props) => {
                                    // 这里的 props.itemId 对应你 menuTreeNodes 里的 id
                                    // 我们可以通过 id 找回原始的 menu 对象，从而获取它的 icon
                                    const nodeData = findNodeById(props.itemId, menuTreeOrigan);
                                    const IconComponent = nodeData?.icon;

                                    return (
                                        <TreeItem
                                            {...props}
                                            slots={{
                                                // 将数据里的图标注入到 TreeItem 的图标槽位中
                                                icon: IconComponent ? () => <IconComponent sx={{ width: '1rem', height: '1rem' }} /> : undefined
                                            }}
                                        />
                                    );
                                }
                            }}
                            slotProps={{
                                item: {
                                    sx: {
                                        fontSize: '.875rem',
                                        '& .MuiTreeItem-label': {
                                            fontSize: '.875rem'
                                        }
                                    }
                                }
                            }}
                        />
                    </Box>
                </Popover>
            </div>


            {/* Powered By Content*/}
            <div className={`flex flex-col items-center transition-all duration-300 justify-center ${!open ? 'w-full py-2' : 'gap-2'}`}>
                {open && (
                    <div className="flex justify-center">
                        <IconButton size="small" onClick={() => scroll('up')}>
                            <KeyboardArrowUpIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => scroll('down')}>
                            <KeyboardArrowDownIcon fontSize="small" />
                        </IconButton>
                    </div>
                )}

                {open ? (
                    // 展开状态：保持原样，精致小巧
                    <>
                        <Typography className="text-sm text-gray-500">
                            Powered by <span className="font-semibold">{t('system.LLM')}</span>
                        </Typography>
                    </>
                ) : (
                    // 收缩状态：大图标居中 + Tooltip
                    <Tooltip
                        title={`Powered by ${t('system.LLM')}`}
                        placement="right"
                        arrow
                        // 增加偏移量，让 Tooltip 离侧边栏远一点，不遮挡
                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 12] } }] } }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                            <SmartToyIcon
                                sx={{
                                    color: 'primary.main',
                                    fontSize: '1.6rem', // 图标加大，视觉冲击力更强
                                    cursor: 'pointer',
                                    // 增加一点呼吸动效，让它看起来更“智能”
                                    '&:hover': { transform: 'scale(1.1)', transition: 'transform 0.2s' }
                                }}
                            />
                        </Box>
                    </Tooltip>
                )}
            </div>

        </Box>
    );
};

export default Sidebar;