import * as React from 'react';

import { Alert, Box, Checkbox, CircularProgress, FormControl, FormControlLabel, FormLabel, Grid, IconButton, List, ListItem, ListItemText, Paper, Radio, RadioGroup, styled, Switch, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import axiosRequester, { requesterConfig } from '../components/AxiosRequester';
import { useSession } from '../authority/SessionContext';
import { useAlert } from '../components/AlertContext';

interface ItemData {
    roleId: string;
    roleName: string;
    roleDescr: string;
}

interface ModuleMenuPurviewListProps {
    objectId: string;
    objectName: string;
    objectType: string;
    tableName: string;
}

export default function ModuleMenuPurviewList({ objectId, objectName, objectType, tableName }: ModuleMenuPurviewListProps) {
    const bpcApiUrl = import.meta.env.VITE_JET_ASP_BPC_API;

    const { token } = useSession();
    const { showAlert } = useAlert();

    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<ItemData[]>([]);
    const [isEmpty, setIsEmpty] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        'objectId': objectId,
        'objectName': objectName,
        'objectType': objectType,
        'tableName': tableName,
        'roleId': '',
        'roleName': '',
        'roleType': 'role',
        'purview': -1,
        'purviewInherit': 1
    });

    const [checkedSwitch, setCheckedSwitch] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const fetchData = () => {
            setLoading(true);

            let cfg = requesterConfig(token);

            cfg.useJson();

            const client = axiosRequester(cfg);

            client
                .post(bpcApiUrl + '/role/all/withpurview/' + objectId + '/' + objectType, {

                }).then((res) => {
                    if (!!!res.data.success) {
                        showAlert('Failed to get role data', 'error');
                    } else {
                        setData(res.data.data);

                        if (res.data.data.length > 0) {
                            let ch: { [key: string]: boolean } = {};

                            res.data.data.map((role: any) => {
                                ch[role.roleId] = (role.purview === 0 ? true : false);
                            })

                            setCheckedSwitch(ch);
                        }

                        setIsEmpty(res.data.data.length === 0);
                    }
                }).catch((error) => {
                    showAlert('Load data service exception.', 'error');

                    setIsEmpty(true);
                }).finally(() => {
                    setLoading(false);
                });
        };

        fetchData();
    }, [objectId]);

    useEffect(() => {
        // Check if all fields are empty
        if (formData.roleId !== '') {
            setLoading(true);

            let cfg = requesterConfig(token);

            cfg.useJson();

            const client = axiosRequester(cfg);

            client
                .post(bpcApiUrl + '/purview/set', formData).then((res) => {
                    if (!!!res.data.success) {
                        showAlert('Failed to get role data.', 'error');
                    } else {
                        showAlert('Permissions set successfully.', 'success');
                    }
                }).catch((error) => {
                    showAlert('Load data service exception.', 'error');
                }).finally(() => {
                    setLoading(false);
                });
        }
    }, [formData]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isEmpty) {
        return (
            <Box>
                <Alert severity="warning">Please define the role first, and then set the module permissions.</Alert>
            </Box>
        );
    }

    const handleToggle = (event: React.ChangeEvent<HTMLInputElement>, roleId: string, roleName: string) => {
        const isChecked = event.target.checked;

        if (isChecked) {
            setFormData(prevFormData => ({
                ...prevFormData,
                ['roleId']: roleId,
                ['roleName']: roleName,
                ['purview']: 0
            }));
        } else {
            setFormData(prevFormData => ({
                ...prevFormData,
                ['roleId']: roleId,
                ['roleName']: roleName,
                ['purview']: -1
            }));
        }

        setCheckedSwitch(prevState => ({
            ...prevState,
            [roleId]: !prevState[roleId],
        }));
    };

    return (<>
        <Box className='bg-gray-50 rounded-md p-4'>
            <Typography variant="h6" sx={{ display: 'block' }}>
                Access permission settings
            </Typography>
            <Typography className='pt-1' variant="caption" sx={{ display: 'block' }}>
                {objectName}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <List sx={{ width: '100%', }}>
                    {data.map((item) => (
                        <ListItem
                            secondaryAction={
                                <FormControlLabel
                                    control={
                                        <Switch
                                            edge="start"
                                            onChange={(event) => handleToggle(event, item.roleId, item.roleName)}
                                            checked={checkedSwitch[item.roleId] || false}
                                        />
                                    }
                                    label={<Typography variant="body1" className="text-sm">Granted</Typography>}
                                />
                            }
                            className='border-b border-b-gray-100'
                            key={'role' + item.roleId}
                        >
                            <ListItemText
                                primary={item.roleName}
                                secondary={item.roleDescr}
                                slotProps={{
                                    primary: {
                                        sx: {

                                        }
                                    }
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    </>
    );
}
