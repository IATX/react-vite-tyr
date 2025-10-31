import React, { useEffect, useRef, type ReactElement } from 'react';

import { styled, ThemeProvider } from '@mui/material/styles';
import theme from '../theme/tyr';

import GroupTree, { type GroupTreeRef } from '../settings/GroupManagementTreePage';
import ModuleTree, { type ModuleTreeRef } from '../settings/ModuleManagementTreePage';
import UserList from '../settings/UserListPage';

import { Alert, Badge, Box, Card, CardActionArea, CardContent, CardHeader, Chip, Collapse, Divider, Grid, IconButton, Paper, Skeleton, Stack, Tooltip, Typography, type SvgIconProps } from '@mui/material';

import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import SaveAltOutlinedIcon from '@mui/icons-material/SaveAltOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import PlaylistAddOutlinedIcon from '@mui/icons-material/PlaylistAddOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';

import { useBreadcrumbs } from '../context/BreadcrumbContext';
import { WrapSoloFormNode } from '../components/WrapNode';
import Parameterization from '../components/RenderComponent';

import axios from 'axios';
import axiosRequester, { requesterConfig } from '../components/AxiosRequester';
import { useAlert } from '../components/AlertContext';
import { useSession } from '../authority/SessionContext';
import { useConfirm } from '../components/useConfirmDialog';
import NewUser from '../components/FormDialogSoloPage';
import NewRole from '../components/FormDialogSoloPage';
import TreeTable from './TreeTable';
import ModuleMenuPurviewList from './PurviewPage';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  boxShadow: 'unset',
  textAlign: 'left',
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

const SelectableCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease-in-out', // 添加过渡效果

  // 选中时的样式 (通过 data-active)
  '&[data-active]': {
    borderColor: 'oklch(62.3% 0.214 259.815)',
    boxShadow: '0px 1px 4px oklch(62.3% 0.214 259.815)',
  },

  // hover 时的样式
  '&:hover': {
    borderColor: 'oklch(62.3% 0.214 259.815)',
    boxShadow: '0px 2px 8px oklch(62.3% 0.214 259.815)',
  },
}));

type ContentType = 'group' | 'user' | 'role' | 'module' | 'log' | 'purview';

interface ActiveContentProp {
  icon: React.ReactNode | null,
  title: string,
  subheader: string,
  elem: React.ReactNode | null
  type: ContentType
}

interface ActiveFormProp {
  icon?: React.ReactNode,
  title: string,
  subheader: string,
  elem: React.ReactNode
}

const SettingsPage = () => {
  const bpcApiUrl = import.meta.env.VITE_JET_ASP_BPC_API;

  const { showAlert } = useAlert();
  const { token } = useSession();
  const { confirm } = useConfirm();

  const [selectedCard, setSelectedCard] = React.useState(-1);
  const [expended, setExpended] = React.useState(true);

  const { setBreadcrumbs } = useBreadcrumbs();

  const [activeContent, setActiveContent] = React.useState<ActiveContentProp>({
    icon: null,
    title: '',
    subheader: '',
    elem: null,
    type: 'group'
  });

  const [activeForm, setActiveForm] = React.useState<ActiveFormProp | null>(null);

  const [numberGroups, setNumberGroups] = React.useState(0);
  const [numberUsers, setNumberUsers] = React.useState(0);
  const [numberRoles, setNumberRoles] = React.useState(0);
  const [numberModules, setNumberModules] = React.useState(0);
  const [numberLogs, setNumberLogs] = React.useState(0);

  const groupTreeRef = useRef<GroupTreeRef>(null);
  const moduleTreeRef = useRef<ModuleTreeRef>(null);

  const RoleTableRef = useRef<any>(null);
  const LogTableRef = useRef<any>(null);
  const UserTableRef = useRef<any>(null);

  useEffect(() => {
    setBreadcrumbs([{
      name: 'Settings',
      url: '/main/settings'
    }]);

    statData();
  }, []);

  const statData = () => {
    axios.post(bpcApiUrl + '/settings/stat', {}, {
      headers: {
        'Content-Type': 'application/json',
        'grooveToken': token
      }
    }).then(res => {
      if (res.data && res.data.success) {
        setNumberGroups(res.data.data.totalGroups);
        setNumberUsers(res.data.data.totalUsers);
        setNumberRoles(res.data.data.totalRoles);
        setNumberModules(res.data.data.totalModules);
        setNumberLogs(res.data.data.totalLogs);
      } else {
        showAlert('Server returned invalid data.', 'error');
      }
    }).catch(err => {
      showAlert('Load settings statistical data exception.', 'error');
    }).finally(() => {

    });
  }

  const successElem = <>
    <Box
      className="flex flex-col items-center justify-center">
      <Box
        className="w-full max-w-lg p-8 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-green-100 rounded-full p-4">
            <DoneOutlinedIcon className="text-green-500" />
          </div>
          <Typography className="text-gray-900 text-lg">
            {'Great! Operation completed successfully.'}
          </Typography>
        </div>
      </Box>
    </Box>
  </>;

  const renderActiveContent = (activeId: string) => {
    if (activeId === 'grouptree') {
      setActiveContent({
        'icon': <GroupsOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />,
        'title': 'Group tree',
        'subheader': 'Organizational tree display and management',
        'elem': <GroupTree ref={groupTreeRef} addGroup={addChlidGroup} editGroup={editGroup} deleteGroup={deleteGroup} />,
        'type': 'group'
      });
    } else if (activeId === 'moduletree') {
      setActiveContent({
        'icon': <MenuOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />,
        'title': 'Module tree',
        'subheader': 'Module & Menu tree display and management',
        'elem': <ModuleTree ref={moduleTreeRef} addMenu={addChlidMenu} editModuleMenu={editModuleMenu} deleteModuleMenu={deleteModuleMenu} setPermission={setModuleMenuPermission} />,
        'type': 'module'
      });
    } else {
      if (activeId === 'userlist') {
        setActiveContent({
          'icon': <PermIdentityOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />,
          'title': 'System User List',
          'subheader': 'User information editing and deletion, password reset, detailed information review.',
          'elem': <UserList ref={UserTableRef} />,
          'type': 'user'
        });
      } else if (activeId === 'rolelist') {
        setActiveContent({
          'icon': <PermIdentityOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />,
          'title': 'System Role List',
          'subheader': 'System role editing and deletion, access and operation permission settings.',
          'elem': Parameterization('PrefabRoleList', {
            'key': 'system_role_list',
            ref: RoleTableRef,
          }),
          'type': 'role'
        });
      } else if (activeId === 'loglist') {
        setActiveContent({
          'icon': <PermIdentityOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />,
          'title': 'System Log List',
          'subheader': 'System startup, user activity, login, and access control log traces.',
          'elem': Parameterization('PrefabLogList', {
            'key': 'system_log_list',
            ref: LogTableRef,
          }),
          'type': 'log'
        });
      } else if (activeId === 'rolesetting') {
        const sampleData = [
          {
            id: '1',
            name: 'Root Item 1',
            children: [
              { id: '1-1', name: 'Child Item 1.1' },
              {
                id: '1-2',
                name: 'Child Item 1.2',
                children: [
                  { id: '1-2-1', name: 'Grandchild Item 1.2.1' },
                ],
              },
            ],
          },
          {
            id: '2',
            name: 'Root Item 2',
            children: [
              { id: '2-1', name: 'Child Item 2.1' },
            ],
          },
        ];

        setActiveContent({
          'icon': <PermIdentityOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />,
          'title': 'Role permission settings',
          'subheader': 'System startup, user activity, login, and access control log traces.',
          'elem': <TreeTable data={sampleData} />,
          'type': 'purview'
        });
      }
    }
  };

  const addFirtLevelGroup = () => {
    const formElem = Parameterization('PrefabDepartmentAdd', {
      key: 'root_child_group',
      initialData: { 'pid': 'root', 'PARENTNAME': 'Root' },
      onCancel: (formData: any) => {
        setActiveForm(
          {
            icon: null,
            title: '',
            subheader: '',
            elem: <Box>
              <Skeleton variant="rectangular" height={118} />
              <Box sx={{ pt: 0.5 }}>
                <Skeleton />
                <Skeleton width="60%" />
              </Box>
            </Box>
          }
        );
      },
      onSubmit: (formData: any) => {
        groupTreeRef.current?.addNode(formData.pid, {
          'title': formData.gname,
          'key': formData.gid,
          'isLeaf': true
        });

        setActiveForm(
          {
            icon: null,
            title: '',
            subheader: '',
            elem: successElem
          }
        );
      },
    });

    setActiveForm({
      'icon': <PermIdentityOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />,
      'title': 'Add a new system group',
      'subheader': 'Please fill in the group information.',
      'elem': WrapSoloFormNode(formElem)
    });
  }

  const addChlidGroup = (values: any) => {
    if (values.key == 'root') {
      // showAlert('Cannot edit root node', 'warning');

      return;
    }

    const formElem = Parameterization('PrefabDepartmentAdd', {
      'key': 'child_' + values.key + '_group',
      initialData: { 'pid': values.key, 'PARENTNAME': values.title },
      onCancel: (formData: any) => {
        setActiveForm(
          {
            icon: null,
            title: '',
            subheader: '',
            elem: <Box>
              <Skeleton variant="rectangular" height={118} />
              <Box sx={{ pt: 0.5 }}>
                <Skeleton />
                <Skeleton width="60%" />
              </Box>
            </Box>
          }
        );
      },
      onSubmit: (formData: any) => {
        groupTreeRef.current?.addNode(values.key, {
          'title': formData.gname,
          'key': formData.gid,
          'isLeaf': true
        });

        setActiveForm(
          {
            icon: null,
            title: '',
            subheader: '',
            elem: successElem
          }
        );
      },
    });

    setActiveForm({
      'icon': <PermIdentityOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />,
      'title': 'Add a new system group',
      'subheader': 'Please fill in the group information.',
      'elem': WrapSoloFormNode(formElem)
    });
  }

  const editGroup = (values: any) => {
    if (values.key == 'root') {
      // showAlert('Cannot edit root node', 'warning');

      return;
    }

    const formElem = Parameterization('PrefabDepartmentEdit', {
      'key': 'child_' + values.key + '_group',
      initialData: {
        'gid': values.key,
        'pid': values.parentId,
        'PARENTNAME': values.parentName
      },
      onCancel: (formData: any) => {
        setActiveForm(
          {
            icon: null,
            title: '',
            subheader: '',
            elem: <Box>
              <Skeleton variant="rectangular" height={118} />
              <Box sx={{ pt: 0.5 }}>
                <Skeleton />
                <Skeleton width="60%" />
              </Box>
            </Box>
          }
        );
      },
      onSubmit: (formData: any) => {
        groupTreeRef.current?.updateNode(formData.gid, {
          'title': formData.gname,
          'key': formData.gid,
          'isLeaf': values.isLeaf
        });

        setActiveForm(
          {
            icon: null,
            title: '',
            subheader: '',
            elem: successElem
          }
        );
      },
    });

    setActiveForm({
      'icon': <PermIdentityOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />,
      'title': 'Add a new system group',
      'subheader': 'Please fill in the group information.',
      'elem': WrapSoloFormNode(formElem)
    });
  }

  const deleteGroup = async (values: any) => {
    const confirmed = await confirm({
      title: 'Prompt',
      message: 'Confirm deletion?',
      confirmText: 'Yes',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      let cfg = requesterConfig(token);

      cfg.useJson();

      const client = axiosRequester(cfg);

      client
        .post(bpcApiUrl + '/group/deleting/' + values.key, {

        }).then((res) => {
          if (res.data.success) {
            groupTreeRef.current?.deleteGroup(values.key);

            setActiveForm(
              {
                icon: null,
                title: '',
                subheader: '',
                elem: successElem
              }
            );
          } else {
            showAlert('Delete operation failed.', 'warning');
          }
        }).catch((error) => {
          showAlert('Api service exception.', 'error');
        }).finally(() => {

        });
    }
  }

  const handleNewModule = (values: any) => {
    const formElem = Parameterization('PrefabModuleAdd', {
      'key': 'child_' + values.key + '_modulemenu',
      initialData: {},
      onCancel: (formData: any) => {
        setActiveForm(
          {
            icon: null,
            title: '',
            subheader: '',
            elem: <Box>
              <Skeleton variant="rectangular" height={118} />
              <Box sx={{ pt: 0.5 }}>
                <Skeleton />
                <Skeleton width="60%" />
              </Box>
            </Box>
          }
        );
      },
      onSubmit: (formData: any) => {
        moduleTreeRef.current?.addNode(values.key, {
          'title': formData.mname,
          'key': 'module_' + formData.mid,
          'isLeaf': true
        });

        setActiveForm(
          {
            icon: null,
            title: '',
            subheader: '',
            elem: successElem
          }
        );
      },
    });

    setActiveForm({
      'icon': <PermIdentityOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />,
      'title': 'Add a new system group',
      'subheader': 'Please fill in the group information.',
      'elem': WrapSoloFormNode(formElem)
    });
  }

  const addChlidMenu = (values: any) => {
    if (values.key == 'root') {
      // showAlert('Cannot edit root node', 'warning');

      return;
    }

    let initParams: { mnpid: string; mid: string } = { mnpid: '', mid: '' };

    if (values.key.indexOf('module_') > -1) {
      initParams['mid'] = values.key.replace('module_', '');
      initParams['mnpid'] = '';
    } else if (values.key.indexOf('menu_') > -1) {
      initParams['mid'] = '';
      initParams['mnpid'] = values.key.replace('menu_', '')
    }

    const formElem = Parameterization('PrefabMenuAdd', {
      'key': 'child_' + values.key + '_modulemenu',
      initialData: initParams,
      onCancel: (formData: any) => {
        setActiveForm(
          {
            icon: null,
            title: '',
            subheader: '',
            elem: <Box>
              <Skeleton variant="rectangular" height={118} />
              <Box sx={{ pt: 0.5 }}>
                <Skeleton />
                <Skeleton width="60%" />
              </Box>
            </Box>
          }
        );
      },
      onSubmit: (formData: any) => {
        moduleTreeRef.current?.addNode(values.key, {
          'title': formData.mnname,
          'key': 'menu_' + formData.mnid,
          'isLeaf': true
        });

        setActiveForm(
          {
            icon: null,
            title: '',
            subheader: '',
            elem: successElem
          }
        );
      },
    });

    setActiveForm({
      'icon': <PermIdentityOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />,
      'title': 'Add a new system group',
      'subheader': 'Please fill in the group information.',
      'elem': WrapSoloFormNode(formElem)
    });
  }

  const editModuleMenu = (values: any) => {
    if (values.key == 'root') {
      // showAlert('Cannot edit root node', 'warning');

      return;
    }

    let componentId = '';
    let pkVal = '';
    let params: any = {};

    if (values.key.indexOf('module_') > -1) {
      componentId = 'PrefabModuleEdit';
      pkVal = values.key.replace('module_', '');

      params['mid'] = pkVal;
    } else if (values.key.indexOf('menu_') > -1) {
      componentId = 'PrefabMenuEdit';
      pkVal = values.key.replace('menu_', '');

      params['mnid'] = pkVal;
    }

    const formElem = Parameterization(componentId, {
      'key': 'child_' + values.key + '_modulemenu',
      initialData: params,
      onCancel: (formData: any) => {
        setActiveForm(
          {
            icon: null,
            title: '',
            subheader: '',
            elem: <Box>
              <Skeleton variant="rectangular" height={118} />
              <Box sx={{ pt: 0.5 }}>
                <Skeleton />
                <Skeleton width="60%" />
              </Box>
            </Box>
          }
        );
      },
      onSubmit: (formData: any) => {
        let nodeName = '';

        if (values.key.indexOf('module_') > -1) {
          nodeName = formData.mname;
        } else if (values.key.indexOf('menu_') > -1) {
          nodeName = formData.mnname;
        }

        moduleTreeRef.current?.updateNode(values.key, {
          'title': nodeName,
          'key': values.key,
          'isLeaf': values.isLeaf
        });

        setActiveForm(
          {
            icon: null,
            title: '',
            subheader: '',
            elem: successElem
          }
        );
      },
    });

    setActiveForm({
      'icon': <PermIdentityOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />,
      'title': 'Add a new system group',
      'subheader': 'Please fill in the group information.',
      'elem': WrapSoloFormNode(formElem)
    });
  }

  const deleteModuleMenu = async (values: any) => {
    const confirmed = await confirm({
      title: 'Prompt',
      message: 'Confirm deletion?',
      confirmText: 'Yes',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      let url = '';

      if (values.key.indexOf('module_') > -1) {
        url = bpcApiUrl + '/module/delete/' + values.key.replace('module_', '');
      } else if (values.key.indexOf('menu_') > -1) {
        url = bpcApiUrl + '/menu/delete/' + values.key.replace('menu_', '');
      }

      let cfg = requesterConfig(token);

      cfg.useJson();

      const client = axiosRequester(cfg);

      client
        .post(url, {
        }).then((res) => {
          if (res.data.success) {
            moduleTreeRef.current?.deleteNode(values.key);

            setActiveForm(
              {
                icon: null,
                title: '',
                subheader: '',
                elem: successElem
              }
            );
          } else {
            showAlert('Delete operation failed.', 'warning');
          }
        }).catch((error) => {
          showAlert('Api service exception.', 'error');
        }).finally(() => {

        });
    }
  }

  const setModuleMenuPermission = (values: any) => {
    let pkVal = '';
    let params: any = {};
    let type = '';
    let tableName = '';

    if (values.key.indexOf('module_') > -1) {
      pkVal = values.key.replace('module_', '');

      params['mid'] = pkVal;
      tableName = 'ISYS_MODULE';
      type = 'module';
    } else if (values.key.indexOf('menu_') > -1) {
      pkVal = values.key.replace('menu_', '');

      params['mnid'] = pkVal;
      tableName = 'ISYS_MODULE_MENU';
      type = 'menu';
    }



    setActiveForm({
      'icon': <PermIdentityOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />,
      'title': 'Add a new system group',
      'subheader': 'Please fill in the group information.',
      'elem': <ModuleMenuPurviewList objectId={pkVal} objectName={values.title} objectType={type} tableName={tableName} />
    });
  }

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleNewUser = () => {
    setIsDialogOpen(true);
  }

  const [isRoleDialogOpen, setIsRoleDialogOpen] = React.useState(false);

  const handleNewRole = () => {
    setIsRoleDialogOpen(true);
  }

  const handleRolePermissions = () => {
    const sampleData = [
      {
        id: '1',
        name: 'Root Item 1',
        children: [
          { id: '1-1', name: 'Child Item 1.1' },
          {
            id: '1-2',
            name: 'Child Item 1.2',
            children: [
              { id: '1-2-1', name: 'Grandchild Item 1.2.1' },
            ],
          },
        ],
      },
      {
        id: '2',
        name: 'Root Item 2',
        children: [
          { id: '2-1', name: 'Child Item 2.1' },
        ],
      },
    ];

    <TreeTable data={sampleData} />
  }

  const backupLog = async () => {
    try {
      const response = await fetch(bpcApiUrl + '/log/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'grooveToken': token
        }
      });

      if (!response.ok) {
        throw new Error('Network request failed');
      }

      // Get the file name, usually from the Content-Disposition header
      const disposition = response.headers.get('Content-Disposition');
      const filenameMatch = disposition && disposition.match(/filename\*?=(?:["'](.+)["']|(.+))/);

      let filename = 'downloaded_file.txt';

      if (filenameMatch) {
        filename = filenameMatch[1] || filenameMatch[2];
      }


      // Convert the response body to a Blob object
      const blob = await response.blob();

      // Create a URL pointing to the Blob
      const url = window.URL.createObjectURL(blob);

      // Create an a tag to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the URL object
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('下载文件时出错:', error);
    }
  }

  const cleanLog = async () => {
    const confirmed = await confirm({
      title: 'Prompt',
      message: 'Confirm cleaning up logs?',
      confirmText: 'Yes',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      let cfg = requesterConfig(token);

      cfg.useJson();

      const client = axiosRequester(cfg);

      client
        .post(bpcApiUrl + '/log/cleanup', {
        }).then((res) => {
          if (res.data) {
            LogTableRef.current?.refreshTable();
          } else {
            showAlert('Clean up logs failed.', 'warning');
          }
        }).catch((error) => {
          showAlert('Api service exception.', 'error');
        }).finally(() => {

        });
    }
  }


  return (
    <>
      {/* Main Content */}
      <ThemeProvider theme={theme}>
        <Collapse in={expended}>
          <Grid container margin={2} spacing={2}>
            <Grid size={3}>
              <Stack spacing={2}>
                <Item>
                  <SelectableCard variant="outlined"
                    onClick={() => {
                      setSelectedCard(0);
                      renderActiveContent('grouptree');
                      setBreadcrumbs(
                        [
                          {
                            name: 'Settings',
                            url: '/main/settings'
                          }, {
                            name: 'Group',
                            url: '/main/settings/group'
                          }
                        ]
                      );
                    }}
                    data-active={selectedCard === 0 ? '' : undefined}
                  >
                    <CardActionArea>
                      <CardHeader
                        avatar={
                          <GroupsOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />
                        }
                        title="Group"
                        subheader="Tree display and management"
                      />
                      <CardContent sx={{ height: '100%' }}>
                        <Stack spacing={2} direction="row">
                          <Badge badgeContent={numberGroups} color="primary">
                            <Tooltip title="View group tree" arrow>
                              <ListOutlinedIcon color="action" onClick={() => {

                              }
                              } />
                            </Tooltip>
                          </Badge>
                          <Tooltip title="Add new groups" arrow>
                            <GroupAddOutlinedIcon color="action" onClick={addFirtLevelGroup} />
                          </Tooltip>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </SelectableCard>
                </Item>
              </Stack>
            </Grid>
            <Grid size={3}>
              <Stack spacing={2}>
                <Item>
                  <SelectableCard variant="outlined" onClick={() => {
                    setSelectedCard(1);
                    renderActiveContent('userlist');
                    setBreadcrumbs(
                      [{
                        name: 'Settings',
                        url: '/main/settings'
                      }, {
                        name: 'User',
                        url: '/main/settings/user'
                      }]
                    );
                  }}
                    data-active={selectedCard === 1 ? '' : undefined}
                  >
                    <CardActionArea>
                      <CardHeader
                        avatar={
                          <PermIdentityOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />
                        }
                        title="User"
                        subheader="Management and assignment"
                      />
                      <CardContent sx={{ height: '100%' }}>
                        <Stack spacing={2} direction="row">
                          <Badge badgeContent={numberUsers} color="primary">
                            <Tooltip title="View user list" arrow>
                              <ListOutlinedIcon color="action" onClick={() => {

                              }
                              } />
                            </Tooltip>
                          </Badge>
                          <Tooltip title="Add new users" arrow>
                            <PersonAddAlt1OutlinedIcon color="action" onClick={() => {
                              handleNewUser();
                            }
                            } />
                          </Tooltip>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </SelectableCard>
                </Item>
              </Stack>
            </Grid>
            <Grid size={3}>
              <Stack spacing={2}>
                <Item>
                  <SelectableCard variant="outlined"
                    onClick={() => {
                      setSelectedCard(2);
                      renderActiveContent('rolelist');
                      setBreadcrumbs(
                        [{
                          name: 'Settings',
                          url: '/main/settings'
                        }, {
                          name: 'Role',
                          url: '/main/settings/role'
                        }]
                      );
                    }}
                    data-active={selectedCard === 2 ? '' : undefined}
                  >
                    <CardActionArea>
                      <CardHeader
                        avatar={
                          <RuleOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />
                        }
                        title="Role"
                        subheader="Permissions and control"
                      />
                      <CardContent sx={{ height: '100%' }}>
                        <Stack spacing={2} direction="row">
                          <Badge badgeContent={numberRoles} color="primary">
                            <Tooltip title="View role list" arrow>
                              <ListOutlinedIcon color="action" />
                            </Tooltip>
                          </Badge>
                          <Tooltip title="Add new roles" arrow>
                            <AddTaskOutlinedIcon color="action" onClick={() => {
                              handleNewRole();
                            }
                            } />
                          </Tooltip>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </SelectableCard>
                </Item>
              </Stack>
            </Grid>
            <Grid size={3}>
              <Stack spacing={2}>
                <Item>
                  <SelectableCard variant="outlined"
                    onClick={() => {
                      setSelectedCard(3);
                      renderActiveContent('moduletree');
                      setBreadcrumbs(
                        [
                          {
                            name: 'Settings',
                            url: '/main/settings'
                          }, {
                            name: 'Module',
                            url: '/main/settings/module'
                          }
                        ]
                      );
                    }}
                    data-active={selectedCard === 3 ? '' : undefined}
                  >
                    <CardActionArea>
                      <CardHeader
                        avatar={
                          <MenuOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />
                        }
                        title="Module & Menu"
                        subheader="Operation entry definition"
                      />
                      <CardContent sx={{ height: '100%' }}>
                        <Stack spacing={2} direction="row">
                          <Badge badgeContent={numberModules} color="primary">
                            <Tooltip title="Module tree" arrow>
                              <AccountTreeOutlinedIcon color="action" />
                            </Tooltip>
                          </Badge>
                          <Tooltip title="Add new modules" arrow>
                            <PlaylistAddOutlinedIcon color="action" onClick={() => {
                              handleNewModule({ key: 'root' });
                            }
                            } />
                          </Tooltip>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </SelectableCard>
                </Item>
              </Stack>
            </Grid>
            <Grid size={3}>
              <Stack spacing={2}>
                <Item>
                  <SelectableCard variant="outlined"
                    onClick={() => {
                      setSelectedCard(4);
                      renderActiveContent('loglist');
                      setBreadcrumbs(
                        [{
                          name: 'Settings',
                          url: '/main/settings'
                        }, {
                          name: 'Role',
                          url: '/main/settings/log'
                        }]
                      );
                    }}
                    data-active={selectedCard === 4 ? '' : undefined}
                  >
                    <CardActionArea>
                      <CardHeader
                        avatar={
                          <HistoryOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />
                        }
                        title="Log"
                        subheader="Login and operation trace tracking"
                      />
                      <CardContent sx={{ height: '100%' }}>
                        <Stack spacing={2} direction="row">
                          <Badge badgeContent={numberLogs} color="primary">
                            <Tooltip title="Manage log list" arrow>
                              <ManageSearchOutlinedIcon color="action" />
                            </Tooltip>
                          </Badge>
                          <Tooltip title="Backup all log" arrow>
                            <SaveAltOutlinedIcon color="action" onClick={backupLog} />
                          </Tooltip>
                          <Tooltip title="Cleanup all log" arrow>
                            <DeleteOutlineOutlinedIcon color="action" onClick={cleanLog} />
                          </Tooltip>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </SelectableCard>
                </Item>
              </Stack>
            </Grid>
            {/** 
            <Grid size={3}>
              <Stack spacing={2}>
                <Item>
                  <SelectableCard variant="outlined"
                    onClick={() => {
                      setSelectedCard(5);
                      renderActiveContent('rolesetting');
                      setBreadcrumbs(
                        [{
                          name: 'Settings',
                          url: '/main/settings'
                        }, {
                          name: 'Purview',
                          url: '/main/settings/purview'
                        }]
                      );
                    }}
                    data-active={selectedCard === 5 ? '' : undefined}
                  >
                    <CardActionArea>
                      <CardHeader
                        avatar={
                          <ManageAccountsOutlinedIcon className='text-4xl text-blue-500 bg-blue-50 rounded-2xl p-2' />
                        }
                        title="Purview"
                        subheader="Permissions and control"
                      />
                      <CardContent sx={{ height: '100%' }}>
                        <Stack spacing={2} direction="row">
                          <Badge badgeContent={numberRoles} color="primary">
                            <Tooltip title="View permission list" arrow>
                              <ListOutlinedIcon color="action" />
                            </Tooltip>
                          </Badge>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </SelectableCard>
                </Item>
              </Stack>
            </Grid>
            */}
          </Grid>
        </Collapse>
        <Grid container margin={2} spacing={2} sx={{
          'display': activeContent.elem === null ? 'none' : ''
        }}>
          <Grid size={12} sx={{ marginTop: '15px;' }}>
            <Divider>
              <Chip icon={expended ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />} label={expended ? 'Collapse' : 'Expand'} size="small" className='bg-blue-100 p-2' onClick={() => { setExpended(!expended); }} />
            </Divider>
          </Grid>
          {(activeContent.type === 'group' || activeContent.type === 'module') && (
            <>
              <Grid size={5} sx={{ marginTop: '15px;' }}>
                <Stack spacing={2}>
                  <Item>
                    <Card variant="outlined">
                      <CardHeader
                        avatar={
                          activeContent.icon
                        }
                        title={activeContent.title}
                        subheader={activeContent.subheader}
                      />
                      <CardContent sx={{ height: '100%' }}>
                        {activeContent.elem === null ? <></> : activeContent.elem}
                      </CardContent>
                    </Card>
                  </Item>
                </Stack>
              </Grid>
              <Grid size={7} sx={{ marginTop: '15px;' }}>
                {activeForm && activeForm.elem ? (
                  activeForm.elem
                ) : (
                  <Box>
                    <Skeleton variant="rectangular" height={118} />
                    <Box sx={{ pt: 0.5 }}>
                      <Skeleton />
                      <Skeleton width="60%" />
                    </Box>
                  </Box>
                )}
              </Grid>
            </>
          )}

          {(activeContent.type === 'user' || activeContent.type === 'role' || activeContent.type === 'log' || activeContent.type === 'purview') && (
            <>
              <Grid size={12} sx={{ marginTop: '15px;' }}>
                <Stack spacing={2}>
                  <Item>
                    <Card variant="outlined">
                      <CardContent sx={{ height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                          {activeContent.title}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                          {activeContent.subheader}
                        </Typography>
                        <Box className="mt-4">
                          {activeContent.elem === null ? <></> : activeContent.elem}
                        </Box>
                      </CardContent>
                    </Card>
                  </Item>
                </Stack>
              </Grid>
            </>
          )}
        </Grid>
        <NewUser
          title="Create New User"
          open={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
          }}
          children={WrapSoloFormNode(Parameterization('PrefabUserAdd', {
            key: 'add_new_user',
            initialData: { 'pid': 'root', 'PARENTNAME': 'Root' },
            onCancel: (formData: any) => {
              setIsDialogOpen(false);
            },
            onSubmit: (formData: any) => {
              if (UserTableRef && UserTableRef.current) {
                UserTableRef.current.refreshTable();
              }

              setIsDialogOpen(false);
            },
          }))}
        />
        <NewRole
          title="Create New Role"
          open={isRoleDialogOpen}
          onClose={() => {
            setIsRoleDialogOpen(false);
          }}
          children={WrapSoloFormNode(Parameterization('PrefabRoleAdd', {
            key: 'add_new_role',
            initialData: {},
            onCancel: (formData: any) => {
              setIsRoleDialogOpen(false);
            },
            onSubmit: (formData: any) => {
              if (RoleTableRef && RoleTableRef.current) {
                RoleTableRef.current.refreshTable();
              }

              setIsRoleDialogOpen(false);
            },
          }))}
        />
      </ThemeProvider>

    </>
  );
};

export default SettingsPage;