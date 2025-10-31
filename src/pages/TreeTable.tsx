import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Collapse,
  IconButton
} from '@mui/material';
import { ChevronRight, KeyboardArrowDown } from '@mui/icons-material';

// --- 1. 类型定义部分 (来自 types.ts) ---
export interface TreeData {
  id: string;
  name: string;
  children?: TreeData[];
  [key: string]: any;
}

interface TreeTableRowProps {
  row: TreeData;
  level: number;
}
// ----------------------------------------

// --- 2. 递归行组件部分 (来自 TreeTableRow.tsx) ---
const TreeTableRow: React.FC<TreeTableRowProps> = ({ row, level }) => {
  const [open, setOpen] = useState(false);

  const hasChildren = row.children && row.children.length > 0;

  const handleToggle = () => {
    if (hasChildren) {
      setOpen(!open);
    }
  };

  return (
    <>
      <TableRow className="hover:bg-gray-50 transition-colors">
        <TableCell>
          <div className="flex items-center">
            {/* 根据层级设置缩进 */}
            <Box sx={{ width: `${level * 20}px` }} />
            
            {hasChildren ? (
              <IconButton size="small" onClick={handleToggle}>
                {open ? <KeyboardArrowDown /> : <ChevronRight />}
              </IconButton>
            ) : (
              // 如果没有子节点，用一个占位符保持对齐
              <Box sx={{ width: '40px' }} />
            )}
            
            <span className="ml-2">{row.name}</span>
          </div>
        </TableCell>
        <TableCell>{row.id}</TableCell>
        <TableCell>
          {/* 这里可以放置你的操作按钮 */}
        </TableCell>
      </TableRow>

      {/* 使用 Collapse 动画效果，当 open 为 true 时展开 */}
      {hasChildren && (
        <TableRow>
          <TableCell colSpan={3} className="p-0 border-none">
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Table size="small" className="w-full">
                <TableBody>
                  {/* 递归渲染子行 */}
                  {row.children?.map((child) => (
                    <TreeTableRow key={child.id} row={child} level={level + 1} />
                  ))}
                </TableBody>
              </Table>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
// ----------------------------------------

// --- 3. 主表格组件部分 (来自 TreeTable.tsx) ---
interface TreeTableProps {
  data: TreeData[];
}

const TreeTable: React.FC<TreeTableProps> = ({ data }) => {
  return (
    <TableContainer component={Paper} className="shadow-lg rounded-md">
      <Table aria-label="tree table">
        <TableHead>
          <TableRow className="bg-gray-100">
            <TableCell className="font-bold">Name</TableCell>
            <TableCell className="font-bold">ID</TableCell>
            <TableCell className="font-bold">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TreeTableRow key={row.id} row={row} level={0} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TreeTable;
// ----------------------------------------