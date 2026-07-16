import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Tree, Tooltip, type TreeProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SafetyOutlined } from '@ant-design/icons';

import { useSession } from '../authority/SessionContext';
import { useAlert } from '../components/AlertContext';

import './css/GroupTree.css';

interface DataNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  children?: DataNode[];
  moduleId?: string;
}

interface TreeNodeWithParent extends DataNode {
  parent?: TreeNodeWithParent | null;
  children?: TreeNodeWithParent[];
}

/** Payload handed to the action callbacks (add / edit / delete / authorize). */
export interface ModuleNodePayload {
  key: string;
  title: string;
  isLeaf: boolean;
  parentId: string;
  parentName: string;
  moduleId: string;
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
  addMenu: (node: ModuleNodePayload) => void;
  editModuleMenu: (node: ModuleNodePayload) => void;
  deleteModuleMenu: (node: ModuleNodePayload) => void;
  setPermission: (node: ModuleNodePayload) => void;
}

const ModuleManagementTree = forwardRef<ModuleTreeRef, ModuleManagementTreeProps>(({ addMenu, editModuleMenu, deleteModuleMenu, setPermission }, ref) => {
  const bpcApiUrl = import.meta.env.VITE_JET_ASP_BPC_API;
  const [treeData, setTreeData] = useState<TreeNodeWithParent[]>(initTreeData);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['root']);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const { token } = useSession();
  const { showAlert } = useAlert();

  useImperativeHandle(ref, () => ({
    addNode: (parentKey: string, newNode: DataNode) => {
      setTreeData(originData => addTreeData(originData, parentKey, [newNode]));
      // Auto-expand the parent so the freshly added node is visible right away.
      setExpandedKeys(prev => (prev.includes(parentKey) ? prev : [...prev, parentKey]));
    },
    updateNode: (key: string, newNode: DataNode) => {
      setTreeData(originData => updateTreeData(originData, key, newNode));
    },
    refreshNode: (_key: string) => {

    },
    deleteNode: (key: string) => {
      setTreeData(originData => removeNodeByKey(originData, key));
    },
  }));

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
      if (node.children) {
        return {
          ...node,
          children: addTreeData(node.children, key, children),
        };
      }
      return node;
    });

  // It's just a simple demo. You can use tree map to optimize update perf.
  const updateTreeData = (list: DataNode[], key: React.Key, newNode: DataNode): DataNode[] =>
    list.map((node) => {
      if (node.key === key) {
        return {
          ...node,
          title: newNode.title,
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
   */
  const removeNodeByKey = (tree: DataNode[], key: React.Key): DataNode[] => {
    return tree.filter(node => node.key !== key).map(node => {
      if (node.children) {
        const newChildren = removeNodeByKey(node.children, key);

        return { ...node, isLeaf: newChildren.length == 0, children: newChildren };
      }
      return node;
    });
  };

  const onLoadData = async (node: DataNode) => {
    // Check if it has been loaded to prevent repeated requests
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
        const updateChildren = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] => {
          return list.map(item => {
            if (item.key === key) {
              return { ...item, children };
            }
            if (item.children) {
              return { ...item, children: updateChildren(item.children, key, children) };
            }
            return item;
          });
        };

        setTreeData(prevData => updateChildren(prevData, node.key, data.data));
      }
    } catch (error) {
      showAlert('Load tree data exception', 'error');

      console.error("Failed to load tree data:", error);
    }
  };

  /**
   * Find the parent node of the given key using depth-first traversal.
   * Returns an empty key/title when the target is a root node.
   */
  const getParentNode = (key: string, tree: DataNode[]) => {
    let parentNode = { key: '', title: '' };

    const traverse = (data: DataNode[]): boolean => {
      for (const node of data) {
        if (node.children) {
          if (node.children.some((item) => item.key === key)) {
            parentNode = { key: node.key, title: node.title };
            return true;
          }
          if (traverse(node.children)) {
            return true;
          }
        }
      }
      return false;
    };

    traverse(tree);
    return parentNode;
  };

  /** Build the callback payload for a node, resolving its parent on demand. */
  const buildPayload = (node: DataNode): ModuleNodePayload => {
    const parentNode = getParentNode(node.key, treeData);

    return {
      key: node.key,
      title: node.title,
      isLeaf: node.isLeaf ?? false,
      parentId: parentNode.key,
      parentName: parentNode.title,
      moduleId: node.moduleId ?? '',
    };
  };

  /**
   * Render a tree node with its title plus hover-revealed action icons.
   * The actions stop propagation so clicking them never toggles selection/expansion.
   */
  const titleRender: TreeProps<DataNode>['titleRender'] = (node) => {
    const isRoot = node.key === 'root';
    const canDelete = !isRoot && !!node.isLeaf;

    const runAction = (
      e: React.MouseEvent,
      action: (payload: ModuleNodePayload) => void,
    ) => {
      e.stopPropagation();
      action(buildPayload(node));
    };

    return (
      <span className="tyr-tree-node">
        <span className="tyr-tree-title">{node.title}</span>
        <span className="tyr-tree-actions" onClick={(e) => e.stopPropagation()}>
          <Tooltip title={isRoot ? 'Add module' : 'Add menu'}>
            <span
              className="tyr-tree-action"
              onClick={(e) => runAction(e, addMenu)}
            >
              <PlusOutlined />
            </span>
          </Tooltip>
          {!isRoot && (
            <Tooltip title="Edit">
              <span
                className="tyr-tree-action"
                onClick={(e) => runAction(e, editModuleMenu)}
              >
                <EditOutlined />
              </span>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <span
                className="tyr-tree-action tyr-tree-action-danger"
                onClick={(e) => runAction(e, deleteModuleMenu)}
              >
                <DeleteOutlined />
              </span>
            </Tooltip>
          )}
          {!isRoot && (
            <Tooltip title="Authorize">
              <span
                className="tyr-tree-action"
                onClick={(e) => runAction(e, setPermission)}
              >
                <SafetyOutlined />
              </span>
            </Tooltip>
          )}
        </span>
      </span>
    );
  };

  return (
    <Tree
      blockNode
      loadData={onLoadData}
      treeData={treeData}
      titleRender={titleRender}
      expandedKeys={expandedKeys}
      onExpand={(keys) => setExpandedKeys(keys)}
      selectedKeys={selectedKeys}
      onSelect={(_keys, info) => setSelectedKeys([info.node.key])}
      className="tyr-group-tree"
    />
  );
});

export default ModuleManagementTree;
