import { useState, useCallback, useContext } from 'react';
import axios from 'axios';

import { useAlert } from '../../../components/AlertContext';
import { useSession } from '../../../authority/SessionContext';
import { useConfirm } from '../../../components/useConfirmDialog';

import { AppContext } from '../../../context/AppContext';
import Parameterization from '../../../components/RenderComponent';
import { useNavigate } from 'react-router-dom';

// 导出自定义 Hook
export const useBillingActions = () => {
    const VITE_JET_ASP_BPC_API = import.meta.env.VITE_JET_ASP_BPC_API;

    const { token } = useSession();
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();

    const [pkId, setPkId] = useState<number | null>(null);

    const navigate = useNavigate();
    const { setCurrentBayContent } = useContext(AppContext);

    // 2. 导出 Setter 和 State，用于外部组件控制模态框
    const closeDialog = useCallback(() => {
        setPkId(null);
    }, []);

    // 4. 其它操作函数
    const viewAddUpBillingEnergy = useCallback((currentPkId: number, page: number, pageSize: number, queryData: any) => {
        setPkId(currentPkId);

        setCurrentBayContent({
            title: '电费账单',
            subheader: '电费账单合计报表',
            elem: Parameterization('ViewTbPiclbkqkTvruep', {
                key: 'ViewTbPiclbkqkTvruep',
                readOnly: true,
                initialData: {
                    'pkPiclbkqk': currentPkId
                },
                onCancel: (formData: any) => {
                    setCurrentBayContent({
                        title: '电费账单审核',
                        subheader: '电费账单审核',
                        elem: Parameterization('QueryXpmlfk', {
                            page: page,
                            pageSize: pageSize,
                            queryParams: queryData
                        }),
                        type: 'query'
                    });

                    navigate('/main/trays');
                },
                onAffirm: async (formData: any) => {
                    const confirmed = await confirm({
                        title: 'Prompt',
                        message: '审核通过？',
                        confirmText: 'Yes',
                        cancelText: 'Cancel'
                    });

                    if (confirmed) {
                        axios.post(VITE_JET_ASP_BPC_API + '/billedelectricity/affirm/' + currentPkId, {
                            'opinionVal' : formData['qecdhljs']
                        }, {
                            headers: {
                                'grooveToken': token
                            }
                        }).then(response => {
                            if (response.data) {
                                setCurrentBayContent({
                                    title: '电费账单审核',
                                    subheader: '电费账单审核',
                                    elem: Parameterization('QueryXpmlfk', {
                                        page: page,
                                        pageSize: pageSize,
                                        queryParams: queryData
                                    }),
                                    type: 'query'
                                });

                                navigate('/main/trays');
                            } else {
                                showAlert('Failed to affirm bill.', 'error');
                            }
                        }).catch(err => {
                            showAlert('Affirm bill exception: ' + err, 'error');
                        }).finally(() => {
                            // 可选：执行清理或通知
                        });
                    }
                },
                onDeny: async (formData: any) => {
                    const confirmed = await confirm({
                        title: 'Prompt',
                        message: '审核未通过？',
                        confirmText: 'Yes',
                        cancelText: 'Cancel'
                    });

                    if (confirmed) {
                        axios.post(VITE_JET_ASP_BPC_API + '/billedelectricity/deny/' + currentPkId, {
                            'opinionVal' : formData['qecdhljs']
                        }, {
                            headers: {
                                'grooveToken': token
                            }
                        }).then(response => {
                            if (response.data) {
                                setCurrentBayContent({
                                    title: '电费账单审核',
                                    subheader: '电费账单审核',
                                    elem: Parameterization('QueryXpmlfk', {
                                        page: page,
                                        pageSize: pageSize,
                                        queryParams: queryData
                                    }),
                                    type: 'query'
                                });

                                navigate('/main/trays');
                            } else {
                                showAlert('Failed to affirm bill.', 'error');
                            }
                        }).catch(err => {
                            showAlert('Affirm bill exception: ' + err, 'error');
                        }).finally(() => {
                            // 可选：执行清理或通知
                        });
                    }
                }
            }),
            type: 'view'
        });

        navigate('/main/trays');
    }, []);

    const affirmBillingEnergy = useCallback(async (currentPkId: number, refreshTable: Function) => {
        const confirmed = await confirm({
            title: 'Prompt',
            message: '确定提交审核?',
            confirmText: 'Yes',
            cancelText: 'Cancel'
        });

        if (confirmed) {
            axios.post(VITE_JET_ASP_BPC_API + '/billedelectricity/affirm/' + currentPkId, {}, {
                headers: {
                    'grooveToken': token
                }
            }).then(response => {
                if (response.data) {
                    refreshTable();
                } else {
                    showAlert('Failed to add up bill.', 'error');
                }
            }).catch(err => {
                showAlert('Add up data exception: ' + err, 'error');
            }).finally(() => {
                // 可选：执行清理或通知
            });
        }
    }, []);

    // 返回所有需要暴露给组件的状态和操作
    return {
        pkId,
        setPkId,
        viewAddUpBillingEnergy,
        affirmBillingEnergy,
        closeDialog
    };
};