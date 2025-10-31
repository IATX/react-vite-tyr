import React, { useState, useRef } from 'react';
import {
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Box,
} from '@mui/material';
import { type PopoverMenuItem } from './PopoverMenuItemTypes';

interface NestedPopoverMenuProps {
  items: PopoverMenuItem[];
}

const NestedPopoverMenu: React.FC<NestedPopoverMenuProps> = ({ items }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openItem, setOpenItem] = useState<PopoverMenuItem | null>(null);
  // 使用 useRef 来保存计时器的引用
  const closeTimer = useRef<number | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>, item: PopoverMenuItem) => {
    // 鼠标移入时，如果存在关闭计时器，则立即清除
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (item.children) {
      setAnchorEl(event.currentTarget);
      setOpenItem(item);
    }
  };

  const handleClose = () => {
    // 鼠标移出时，设置一个延迟关闭的计时器
    closeTimer.current = setTimeout(() => {
      setAnchorEl(null);
      setOpenItem(null);
    }, 200); // 200毫秒延迟，防止闪烁
  };

  const open = Boolean(anchorEl);

  return (
    <List dense disablePadding>
      {items.map((item) => (
        <React.Fragment key={item.label}>
          <ListItemButton
            onMouseEnter={(event) => handleOpen(event, item)}
            onMouseLeave={handleClose}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        </React.Fragment>
      ))}

      {/* 只有当有子菜单且鼠标悬停时才渲染 Popover */}
      {openItem && openItem.children && (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          disableRestoreFocus
          // 鼠标重新移入 Popover 时，清除关闭计时器
          onMouseEnter={() => {
            if (closeTimer.current) {
              clearTimeout(closeTimer.current);
              closeTimer.current = null;
            }
          }}
          onMouseLeave={handleClose} // 鼠标离开 Popover 时，再次设置关闭计时器
        >
          <Box sx={{ minWidth: 200, py: 1 }}>
            {/* 递归调用自身，传入子菜单数据 */}
            <NestedPopoverMenu items={openItem.children} />
          </Box>
        </Popover>
      )}
    </List>
  );
};

export default NestedPopoverMenu;