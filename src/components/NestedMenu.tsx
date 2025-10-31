// components/NestedMenu.tsx
import React, { useState } from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { type MenuItem } from './MenuItemTypes'; // 确保你已定义 MenuItem 类型

interface NestedMenuProps {
  items: MenuItem[];
  depth?: number; // 用于控制菜单的缩进深度
}

const NestedMenu: React.FC<NestedMenuProps> = ({ items, depth = 0 }) => {
  // 使用一个对象来管理每个菜单项的展开状态
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});

  const handleClick = (id: string) => {
    setOpen((prevOpen) => ({
      ...prevOpen,
      [id]: !prevOpen[id],
    }));
  };

  return (
    <List component="div" disablePadding>
      {items.map((item) => (
        <React.Fragment key={item.id}>
          {/* 渲染当前级别的菜单项 */}
          <ListItemButton
            onClick={() => item.children ? handleClick(item.id) : null} // 只有有子菜单才触发点击事件
            className={`rounded-md mb-1 hover:bg-gray-200`} // 悬浮效果
            sx={{ pl: depth * 2 + 16 }} // 根据深度增加左内边距，16是默认的padding
          >
            {item.icon && <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>}
            <ListItemText primary={item.label} />
            {/* 根据是否有子菜单和当前状态来显示图标 */}
            {item.children && (open[item.id] ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>

          {/* 如果有子菜单，使用 Collapse 包裹并递归调用自身 */}
          {item.children && (
            <Collapse in={open[item.id]} timeout="auto" unmountOnExit>
              <NestedMenu items={item.children} depth={depth + 1} />
            </Collapse>
          )}
        </React.Fragment>
      ))}
    </List>
  );
};

export default NestedMenu;