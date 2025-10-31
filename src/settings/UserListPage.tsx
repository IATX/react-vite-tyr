import React, { forwardRef, useEffect, useImperativeHandle, useState, type MouseEventHandler } from 'react';
import { Avatar, Button, List, Skeleton } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';

import axiosRequester, { requesterConfig } from '../components/AxiosRequester';
import { useAlert } from '../components/AlertContext';
import { useSession } from '../authority/SessionContext';
import { useConfirm } from '../components/useConfirmDialog';

import FemaleIcon from '@mui/icons-material/Face3';
import MaleIcon from '@mui/icons-material/Face6';
import PersonIcon from '@mui/icons-material/Person';
import { ThemeProvider, Tooltip, Typography } from '@mui/material';
import type { MenuInfo } from 'rc-menu/lib/interface';
import SimpleConfirmDialog from '../components/SimpleConfirmDialog';
import EditUser from '../components/FormDialogSoloPage';
import { WrapSoloFormNode } from '../components/WrapNode';
import Parameterization from '../components/RenderComponent';

interface DataType {
  id?: string;
  name?: string;
  account?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  flag?: number,
  status?: string,
  roleNames?: string;
  loading: boolean;
}

export interface DataListRef {
  refreshTable: () => void;
}

const PAGE_SIZE = 5;

const App = forwardRef<DataListRef, {}>((props, ref) => {
  const bpcApiUrl = import.meta.env.VITE_JET_ASP_BPC_API;

  const { token } = useSession();
  const { showAlert } = useAlert();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [list, setList] = useState<DataType[]>([]);
  const [page, setPage] = useState(1);
  const [currentUserAction, setCurrentUserAction] = useState<{ id: string, name: string, opera: string, msg: string }>({
    id: '',
    name: '',
    opera: '',
    msg: ''
  });

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const fetchData = (currentPage: number) => {
    const loadDataUrl = `${bpcApiUrl}/user/list?pageNum=${currentPage}&pageSize=${PAGE_SIZE}`;

    const headers: any = {
      'Content-Type': 'application/json'
    };

    headers['grooveToken'] = token;

    return fetch(loadDataUrl, {
      method: 'POST',
      headers: headers
    }).then((res) => res.json());
  };

  const loadCurrentUserData = () => {
    fetchData(page).then((res) => {
      if (res.success && Array.isArray(res.data)) {
        const results = res.data;

        if (results.length < PAGE_SIZE) {
          setNoData(true);
        }

        setInitLoading(false);
        setData(results);
        setList(results);
      } else {
        showAlert('Get list data error', 'error');
      }

    });
  }

  useImperativeHandle(ref, () => ({
    refreshTable: refreshLoad,
  }));

  useEffect(() => {
    loadCurrentUserData();
  }, []);

  const refreshLoad = () => {
    setLoading(true);
    setList(data.concat(Array.from({ length: PAGE_SIZE }).map(() => ({ loading: true }))));
    const nextPage = 1;
    setPage(nextPage);
    fetchData(nextPage).then((res) => {
      if (res.success && Array.isArray(res.data)) {
        const results = res.data;

        if (results.length < PAGE_SIZE) {
          setNoData(true);
        }

        const newData = results;
        setData(newData);
        setList(newData);
        setLoading(false);
      } else {
        showAlert('Get list data error', 'error');
      }
      // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
      // In real scene, you can using public method of react-virtualized:
      // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
      window.dispatchEvent(new Event('resize'));
    });
  };

  const onLoadMore = () => {
    setLoading(true);
    setList(data.concat(Array.from({ length: PAGE_SIZE }).map(() => ({ loading: true }))));
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage).then((res) => {
      if (res.success && Array.isArray(res.data)) {
        const results = res.data;

        if (results.length < PAGE_SIZE) {
          setNoData(true);
        }

        const newData = data.concat(results);
        setData(newData);
        setList(newData);
        setLoading(false);
      } else {
        showAlert('Get list data error', 'error');
      }
      // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
      // In real scene, you can using public method of react-virtualized:
      // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
      window.dispatchEvent(new Event('resize'));
    });
  };

  const loadMore =
    !initLoading && !loading && !noData ? (
      <div
        style={{
          textAlign: 'center',
          marginTop: 12,
          height: 32,
          lineHeight: '32px',
        }}
      >
        <Button type="link" onClick={onLoadMore}>Load more</Button>
      </div>
    ) : null;

  const getIconComponent = (iconName: string | undefined) => {
    switch (iconName) {
      case 'Male':
        return <MaleIcon />;
      case 'Female':
        return <FemaleIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getMenuItems = (user: DataType): MenuProps['items'] => [
    {
      label: user.flag === -1 ? 'Unlock' : 'Lock',
      key: user.flag === -1 ? 'unlock' : 'lock',
    },
    {
      label: 'Edit',
      key: 'edit',
    },
    {
      label: 'Reset',
      key: 'reset',
    },
    {
      label: 'Delete',
      key: 'delete',
    },
  ];

  const handleUserActions = () => {
    if (currentUserAction.opera === 'lock') {
      handleLockUser();
    } else if (currentUserAction.opera === 'unlock') {
      handleUnlockUser();
    } else if (currentUserAction.opera === 'reset') {
      handleResetUser();
    } else if (currentUserAction.opera === 'delete') {
      handleDeleteUser();
    } 
  }

  // Lock user account
  const handleLockUser = () => {
    let cfg = requesterConfig(token);

    cfg.useJson();

    const client = axiosRequester(cfg);

    client
      .post(bpcApiUrl + '/user/locking/' + currentUserAction.id, {

      }).then((res) => {
        if (res.data.success) {
          loadCurrentUserData();
        } else {
          showAlert('Locking operation failed.', 'warning');
        }
      }).catch((error) => {
        showAlert('Api service exception.', 'error');
      }).finally(() => {

      });
  }

  // unlock user account
  const handleUnlockUser = () => {
    let cfg = requesterConfig(token);

    cfg.useJson();

    const client = axiosRequester(cfg);

    client
      .post(bpcApiUrl + '/user/unlock/' + currentUserAction.id, {

      }).then((res) => {
        if (res.data.success) {
          loadCurrentUserData();
        } else {
          showAlert('Unlock operation failed.', 'warning');
        }
      }).catch((error) => {
        showAlert('Api service exception.', 'error');
      }).finally(() => {

      });
  }

  // Reset user password to default value
  const handleResetUser = () => {
    let cfg = requesterConfig(token);

    cfg.useJson();

    const client = axiosRequester(cfg);

    client
      .post(bpcApiUrl + '/user/resetting/' + currentUserAction.id, {

      }).then((res) => {
        if (res.data.success) {
          loadCurrentUserData();
        } else {
          showAlert('Reset operation failed.', 'warning');
        }
      }).catch((error) => {
        showAlert('Api service exception.', 'error');
      }).finally(() => {

      });
  }

  // Delete user instantce
  const handleDeleteUser = () => {
    let cfg = requesterConfig(token);

    cfg.useJson();

    const client = axiosRequester(cfg);

    client
      .post(bpcApiUrl + '/user/deletion/' + currentUserAction.id, {

      }).then((res) => {
        if (res.data.success) {
          loadCurrentUserData();
        } else {
          showAlert('Delete operation failed.', 'warning');
        }
      }).catch((error) => {
        showAlert('Api service exception.', 'error');
      }).finally(() => {

      });
  }

  const handleMenuClick = (e: MenuInfo, user: DataType) => {
    switch (e.key) {
      case 'lock':
        setIsConfirmOpen(true);
        setCurrentUserAction({
          'id': (user.id ? user.id : ''),
          'name': (user.name ? user.name : ''),
          'opera': e.key,
          'msg': 'Confirm locking user ' + user.name + '?'
        });
        break;
      case 'unlock':
        setIsConfirmOpen(true);
        setCurrentUserAction({
          'id': (user.id ? user.id : ''),
          'name': (user.name ? user.name : ''),
          'opera': e.key,
          'msg': 'Confirm unlock user ' + user.name + '?'
        });
        break;
      case 'edit':
        setIsDialogOpen(true);
        setCurrentUserAction({
          'id': (user.id ? user.id : ''),
          'name': (user.name ? user.name : ''),
          'opera': e.key,
          'msg': ""
        });
        break;
      case 'reset':
        setIsConfirmOpen(true);
        setCurrentUserAction({
          'id': (user.id ? user.id : ''),
          'name': (user.name ? user.name : ''),
          'opera': e.key,
          'msg': "Confirm resetting user " + user.name + "'s password?"
        });
        break;
      case 'delete':
        setIsConfirmOpen(true);
        setCurrentUserAction({
          'id': (user.id ? user.id : ''),
          'name': (user.name ? user.name : ''),
          'opera': e.key,
          'msg': "Confirm deleting user " + user.name + "?"
        });
        break;
      default:
        break;
    }
  };

  return (
    <>
      <List
        style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
        loading={initLoading}
        itemLayout="horizontal"
        loadMore={loadMore}
        dataSource={list}
        renderItem={(item) => {
          let actionArr = [];

          // actionArr.push(<Tooltip title="Reset password" arrow><Button type="text" key="list-user-edit">Reset</Button></Tooltip>);
          // actionArr.push(<Tooltip title="Delete user" arrow><Button danger type="text" key="list-user-delete">Delete</Button></Tooltip>);
          actionArr.push(<Dropdown menu={{
            items: getMenuItems(item),
            onClick: (e) => handleMenuClick(e, item)
          }}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                Actions
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>);
          return (<>
            <List.Item
              actions={actionArr}
            >
              <Skeleton avatar title={false} loading={item.loading} active>
                <List.Item.Meta
                  avatar={<Avatar icon={getIconComponent(item.avatar)} className='bg-gray-100 text-slate-600' />}
                  title={item.name}
                  description={<>
                    <span className="font-semibold">Account:</span> {item.account}
                    {item.email && (<><span className="font-semibold pl-2">Email: </span>{item.email}</>)}
                    {item.phone && (<><span className="font-semibold pl-2">Phone: </span>{item.phone}</>)}
                    {item.roleNames && (<><span className="font-semibold pl-2">Permissions: </span>{item.roleNames}</>)}
                  </>}
                />
                <div>{item.flag === -1 ? <Tooltip title="The user account has been frozen" arrow><Typography variant="body2" color="error">{item.status}</Typography></Tooltip> : <Tooltip title="User is active" arrow><Typography variant="body2" color="primary">{item.status}</Typography></Tooltip>}

                </div>
              </Skeleton>
            </List.Item>
          </>);

        }}
      />
      <SimpleConfirmDialog open={isConfirmOpen} onConfirm={() => { handleUserActions(); setIsConfirmOpen(false); }} onCancel={() => { setIsConfirmOpen(false) }}>
        {currentUserAction.msg}
      </SimpleConfirmDialog>
      <EditUser
        title="Edit user information"
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
        }}
        children={WrapSoloFormNode(Parameterization('PrefabUserEdit', {
          key: 'edit_user_info',
          initialData: { 'uid': currentUserAction.id },
          onCancel: (formData: any) => {
            setIsDialogOpen(false);
          },
          onSubmit: (formData: any) => {
            setIsDialogOpen(false);

            refreshLoad();
          },
        }))}
      />
    </>
  );
});

export default App;