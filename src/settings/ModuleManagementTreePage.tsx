import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Button, Popover, Tree, type TreeProps } from 'antd';

import axiosRequester, { requesterConfig } from '../components/AxiosRequester';
import { useSession } from '../authority/SessionContext';
import { useAlert } from '../components/AlertContext';

import './css/GroupTree.css';

interface DataNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  children?: DataNode[];
}

interface TreeNodeWithParent extends DataNode {
  parent?: TreeNodeWithParent | null;
  children?: TreeNodeWithParent[];
}

const initTreeData: DataNode[] = [
  { title: 'Root', key: 'root' },
];

export interface ModuleTreeRef {
  addNode: (parentKey: string, newNode: DataNode) => void;
  updateNode: (parentKey: string, newNode: DataNode) => void;
  deleteNode: (key: string) => void;
  refreshNode: (key: string) => void;
}

interface ModuleManagementTreeProps {
  addMenu: (node: DataNode | null) => void;
  editModuleMenu: (node: DataNode | null) => void;
  deleteModuleMenu: (node: DataNode | null) => void;
  setPermission: (node: DataNode | null) => void;
}

const ModuleManagementTree = forwardRef<ModuleTreeRef, ModuleManagementTreeProps>(({ addMenu, editModuleMenu, deleteModuleMenu, setPermission }, ref) => {
  const bpcApiUrl = import.meta.env.VITE_JET_ASP_BPC_API;
  const [treeData, setTreeData] = useState<TreeNodeWithParent[]>(initTreeData);

  const [currentSelectedNode, setCurrentSelectedNode] = useState<{
    key: string,
    isLeaf: boolean,
    title: string,
    parentId?: string,
    parentName?: string,
  } | null>(null);

  const [popoverVisible, setPopoverVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const { token } = useSession();
  const { showAlert } = useAlert();

  useImperativeHandle(ref, () => ({
    addNode: (parentKey: string, newNode: DataNode) => {
      setTreeData(originData => {
        const newTreeData = addTreeData(originData, parentKey, [newNode]);
        return newTreeData;
      });
    },
    updateNode: (key: string, newNode: DataNode) => {
      setTreeData(originData => {
        const newTreeData = updateTreeData(originData, key, newNode);
        return newTreeData;
      });
    },
    refreshNode: (key: string) => {

    },
    deleteNode: (key: string) => {
      setTreeData(originData => {
        const newTreeData = removeNodeByKey(originData, key);

        return newTreeData;
      });
    },
  }));

  // It's just a simple demo. You can use tree map to optimize update perf.
  const loadTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] =>
    list.map((node) => {
      if (node.key === key) {
        return {
          ...node,
          children: node.children ? node.children.concat(children) : []
        };
      }
      // If the current node has child nodes, recursively process
      if (node.children) {
        return {
          ...node,
          children: addTreeData(node.children, key, children),
        };
      }
      // If no matching node is found and there are no child nodes, return directly
      return node;
    });

  // It's just a simple demo. You can use tree map to optimize update perf.
  const addTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] =>
    list.map((node) => {
      if (node.key === key) {
        return {
          ...node,
          isLeaf: false,
          children: node.children ? node.children.concat(children) : children
        };
      }
      // If the current node has child nodes, recursively process
      if (node.children) {
        return {
          ...node,
          children: addTreeData(node.children, key, children),
        };
      }
      // If no matching node is found and there are no child nodes, return directly
      return node;
    });

  // It's just a simple demo. You can use tree map to optimize update perf.
  const updateTreeData = (list: DataNode[], key: React.Key, newNode: DataNode): DataNode[] =>
    list.map((node) => {
      if (node.key === key) {
        node.title = newNode.title;

        return {
          ...node,
          children: node.children ? node.children : []
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, newNode),
        };
      }
      return node;
    });

  /**
 * Recursively removes a node from a tree data array by its key.
 * This function returns a new array, leaving the original array unchanged.
 *
 * @param tree The tree data array (e.g., DataNode[]).
 * @param key The key of the node to be removed.
 * @returns A new DataNode[] with the specified node removed.
 */
  const removeNodeByKey = (tree: DataNode[], key: React.Key): DataNode[] => {
    // Use filter to create a new array without the target node.
    // This handles the top-level removal directly.
    return tree.filter(node => node.key !== key).map(node => {
      // Recursively process the children if they exist.
      if (node.children) {
        const newChildren = removeNodeByKey(node.children, key);

        // Return a new object with the updated children.
        return { ...node, isLeaf: newChildren.length == 0, children: newChildren };
      }
      // If no children, or if the node is not a parent of the target, return it as is.
      return node;
    });
  };

  /**
   * Recursively traverse the tree, adding a parent reference to each node
   * @param {DataNode[]} data Tree data
   * @param {DataNode | null} parent Parent Node
   * @returns {DataNode[]} New tree data with parent reference
   */
  const addParentRef = (
    data: DataNode[],
    parent: TreeNodeWithParent | null = null
  ): TreeNodeWithParent[] => {
    return data.map(node => {
      // Cast to a new type with parent
      const newNode: TreeNodeWithParent = { ...node, parent };

      // If there are child nodes, process them recursively
      if (newNode.children) {
        newNode.children = addParentRef(newNode.children, newNode);
      }

      return newNode;
    });
  };

  const onLoadData = async (node: DataNode) => {
      // 检查是否已经加载过，防止重复请求
      if (node.children) {
        return;
      }
  
      try {
        const response = await fetch(bpcApiUrl + '/module/lazytree/' + node.key, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'grooveToken': token
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
  
        if (!data.success) {
          showAlert('Failed to load tree data.', 'error');
        } else {
          // 创建一个更新树的新函数
          const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] => {
            return list.map(item => {
              if (item.key === key) {
                return { ...item, children };
              }
              if (item.children) {
                return { ...item, children: updateTreeData(item.children, key, children) };
              }
              return item;
            });
          };
  
          // 更新状态，触发重新渲染
          setTreeData(prevData => updateTreeData(prevData, node.key, data.data));
        }
      } catch (error) {
        showAlert('Load tree data exception', 'error');
  
        console.error("Failed to load tree data:", error);
      }
    };

  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    if (info !== null) {
      const clickedNode = info.node as TreeNodeWithParent;

      const title = clickedNode?.title?.toString() || '';
      const key = clickedNode?.key?.toString() || '';
      const isLeaf = clickedNode?.isLeaf ?? true;

      setCurrentSelectedNode({
        'title': title,
        'key': key,
        'isLeaf': isLeaf,
        'parentId': clickedNode.parent?.key || '',
        'parentName': clickedNode.parent?.title || '',
      });

      const { clientX, clientY } = info.nativeEvent;

      setMenuPosition({ top: clientY, left: clientX });

      setPopoverVisible(true);
    } else {
      setPopoverVisible(false);

      setCurrentSelectedNode(null);
    }

    // onSelectNode(info.node as DataNode);
  };

  const menuContent = (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button type="text" className="text-sm" onClick={() => {
        addMenu(currentSelectedNode);
      }}>
        Add
      </Button>
      <Button type="text" className="text-sm" onClick={() => {
        editModuleMenu(currentSelectedNode);
      }}>
        Edit
      </Button>
      {currentSelectedNode && currentSelectedNode.isLeaf && (
        <Button type="text" className="text-sm" onClick={() => {
          deleteModuleMenu(currentSelectedNode);
        }}>
          Delete
        </Button>
      )}
      <Button type="text" className="text-sm" onClick={() => {
        setPermission(currentSelectedNode);
      }}>
        Authorize
      </Button>
    </div>
  );

  return <>
    <Tree loadData={onLoadData} treeData={treeData} onSelect={onSelect}
      className="tyr-group-tree"
    />
    {currentSelectedNode && currentSelectedNode.key !== 'root' && (
      <div style={{ position: 'absolute', top: menuPosition.top, left: menuPosition.left, zIndex: 1000 }}>
        <Popover
          open={popoverVisible}
          onOpenChange={setPopoverVisible}
          content={menuContent}
          placement="bottomLeft"
        >
          {/* Hidden anchor used to trigger Popover */}
          <div style={{ width: 0, height: 0 }} />
        </Popover>
      </div>
    )}
  </>;
});

export default ModuleManagementTree;