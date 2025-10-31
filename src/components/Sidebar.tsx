import React, { useContext, useState, type ReactEventHandler } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Typography, Avatar, Link, Collapse, ListItemButton, Popover, Box, Divider, Grid, styled, Paper, ListSubheader, MenuList } from '@mui/material';
import {
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

import RivetSvg from "./RivetSvg";

import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import type { IMenu } from '../utils/generateRoutes';
import { RichTreeView, type TreeViewBaseItem } from '@mui/x-tree-view';

import { useBreadcrumbs } from '../context/BreadcrumbContext';
import componentMap, { type IComponentItem, type IComponentMap } from '../app/ComponentMap';

interface SidebarProps {
    activeItemId: string;
    onItemClick: (itemId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItemId, onItemClick }) => {
    const navigate = useNavigate();

    const handleItemClick = (itemId: string) => {
        // 调用父组件的回调函数，将新的激活项ID传递出去
        onItemClick(itemId);
    };
    // const [activeItemId, setActiveItemId] = useState(defaultActiveItemId);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuTreeNodes, setMenuTreeNodes] = useState<TreeViewBaseItem[]>([]);
    const [menuTreeOrigan, setMenuTreeOrigan] = useState<IMenu[]>([]);
    const { appMenus, setCurrentBayContent } = useContext(AppContext);
    const [collapseSubmenus, setCollapseSubmenus] = useState<{ [key: string]: boolean }>({});
    const { setBreadcrumbs } = useBreadcrumbs();

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
            navigate(selectedNode.url);
        }
    };

    const open = Boolean(anchorEl);

    return (
        <aside className="w-64 p-4 flex flex-col justify-between">
            <div>
                {/* Logo */}
                <div className="flex items-center mb-8">
                    <RivetSvg></RivetSvg>
                </div>
                <div className='p-1'>
                    {/* Navigation */}
                    <h2 className="text-base/7 font-semibold text-gray-900">Navigation</h2>
                    {appMenus && appMenus.map((item) => (
                        <Box key={'box_' + item.id}>
                            <ListItem
                                component={Link}
                                onClick={(event) => {
                                    handleClick(event, item, [{
                                        name: item.label,
                                        url: item.url
                                    }]);
                                    setCollapseSubmenus(prevData => ({ ...prevData, [item.id]: !collapseSubmenus[item.id] }));
                                }}
                                key={item.id}
                                className={`p-[5px] rounded-md ${item.id === activeItemId ? 'text-blue-500 cursor-pointer' : 'text-gray-600 hover:text-blue-500 hover:bg-gray-100 cursor-pointer'}`}
                            >
                                <ListItemIcon className={`${item.id === activeItemId ? 'min-w-8 text-blue-500' : 'min-w-8'}`}>
                                    <item.icon />
                                </ListItemIcon>
                                <ListItemText primary={item.label} slotProps={{
                                    primary: {
                                        className: `${item.id === activeItemId ? 'font-semibold text-base/8 sm:text-sm/8' : 'text-base/8 sm:text-sm/8'}`,
                                    },
                                }} style={{ marginTop: '0px', marginBottom: '0px' }} />
                            </ListItem>

                            {/* Sub-menu container and loop */}
                            {item.children && (
                                <Collapse in={collapseSubmenus[item.id]} timeout="auto" unmountOnExit>
                                    {item.children.map((subItem) => (
                                        <ListItem
                                            key={subItem.id}
                                            component={Link}
                                            onClick={(event) => handleClick(event, subItem, [{
                                                name: item.label,
                                                url: item.url
                                            }, {
                                                name: subItem.label,
                                                url: subItem.url
                                            }], subItem.children)}
                                            className={`p-[5px] ml-[10px] rounded-md ${subItem.id === activeItemId ? 'text-blue-500 cursor-pointer' : 'text-gray-600 hover:text-blue-500 hover:bg-gray-100 cursor-pointer'}`}
                                        >
                                            <ListItemIcon className={`${subItem.id === activeItemId ? 'min-w-8 text-blue-500' : 'min-w-8'}`}>
                                                <subItem.icon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={subItem.label}
                                                slotProps={{
                                                    primary: {
                                                        className: `${subItem.id === activeItemId ? 'font-semibold text-base/8 sm:text-sm/8' : 'text-base/8 sm:text-sm/8'}`,
                                                    },
                                                }}
                                                style={{ marginTop: '0px', marginBottom: '0px', width: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                            />
                                            {subItem.children && subItem.children.length > 0 && (
                                                <ListItemIcon sx={{ minWidth: 0, ml: 'auto' }}>
                                                    <ChevronRightIcon />
                                                </ListItemIcon>
                                            )}
                                        </ListItem>
                                    ))}
                                </Collapse>
                            )}

                        </Box>

                    ))}
                    <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                        classes={{
                            paper: 'shadow-none border border-gray-200 w-[300px] rounded-md p-2',
                        }}
                    >
                        <Box sx={{ minHeight: 352, minWidth: 250 }}>
                            <RichTreeView items={menuTreeNodes} onItemSelectionToggle={handleNodeClick}
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
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-2 mt-4">
                <div>
                    {/*<Typography className="font-semibold text-sm">Created by IATX</Typography>*/}
                    <Typography className="text-sm text-gray-500">Powered by <span className="font-semibold">Gemini</span></Typography>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;