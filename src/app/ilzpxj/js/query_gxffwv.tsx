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

    const { token, user } = useSession();
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
    const viewSettlementStatement = useCallback((currentPkId: number, page: number, pageSize: number, queryData: any) => {
        setPkId(currentPkId);

        setCurrentBayContent({
            title: '商户结算单',
            subheader: '商户结算单',
            elem: Parameterization('ViewTbLgtnnfggBdonpj', {
                key: 'ViewTbLgtnnfggBdonpj',
                initialData: {
                    'pkLgtnnfgg': currentPkId,
                },
                readOnly: true,
                onCancel: (formData: any) => {
                    setCurrentBayContent({
                        title: '商户结算单审核',
                        subheader: '商户结算单审核',
                        elem: Parameterization('QueryGxffwv', {
                            page: page,
                            pageSize: pageSize,
                            queryParams: queryData
                        }),
                        type: 'query'
                    });

                    navigate('/main/trays');
                }
            }),
            type: 'view'
        });

        navigate('/main/trays');
    }, []);

    const reviewSettlementStatement = useCallback((currentPkId: number, page: number, pageSize: number, queryData: any) => {
        setPkId(currentPkId);

        setCurrentBayContent({
            title: '商户结算单',
            subheader: '商户结算单',
            elem: Parameterization('ViewTbLgtnnfggQuvmwv', {
                key: 'ViewTbLgtnnfggQuvmwv',
                initialData: {
                    'pkLgtnnfgg': currentPkId,
                },
                onCancel: (formData: any) => {
                    setCurrentBayContent({
                        title: '商户结算单审核',
                        subheader: '商户结算单审核',
                        elem: Parameterization('QueryGxffwv', {
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
                        axios.post(VITE_JET_ASP_BPC_API + '/billedelectricity/settlestatement/affirm/' + currentPkId, {
                            'approver': formData['vneozebq'],
                            'approvalOpinionVal': formData['eannwugo'],
                            'reviewer': formData['xoobgftt'],
                            'reviewOpinionVal': formData['dqecbjsa']
                        }, {
                            headers: {
                                'grooveToken': token
                            }
                        }).then(response => {
                            if (response.data) {
                                setCurrentBayContent({
                                    title: '电费账单审核',
                                    subheader: '电费账单审核',
                                    elem: Parameterization('QueryGxffwv', {
                                        page: page,
                                        pageSize: pageSize,
                                        queryParams: queryData
                                    }),
                                    type: 'query'
                                });

                                navigate('/main/trays');
                            } else {
                                showAlert('Failed to affirm statement.', 'error');
                            }
                        }).catch(err => {
                            showAlert('Affirm statement exception: ' + err, 'error');
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
                        axios.post(VITE_JET_ASP_BPC_API + '/billedelectricity/settlestatement/deny/' + currentPkId, {
                            'approver': formData['vneozebq'],
                            'approvalOpinionVal': formData['eannwugo'],
                            'reviewer': formData['xoobgftt'],
                            'reviewOpinionVal': formData['dqecbjsa']
                        }, {
                            headers: {
                                'grooveToken': token
                            }
                        }).then(response => {
                            if (response.data) {
                                setCurrentBayContent({
                                    title: '电费账单审核',
                                    subheader: '电费账单审核',
                                    elem: Parameterization('QueryGxffwv', {
                                        page: page,
                                        pageSize: pageSize,
                                        queryParams: queryData
                                    }),
                                    type: 'query'
                                });

                                navigate('/main/trays');
                            } else {
                                showAlert('Failed to affirm statement.', 'error');
                            }
                        }).catch(err => {
                            showAlert('Affirm statement exception: ' + err, 'error');
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

    const deleteSettlementStatement = async (val: any, refreshTable: Function) => {
        const confirmed = await confirm({
            title: 'Prompt',
            message: 'Confirm Deletion?',
            confirmText: 'Yes',
            cancelText: 'Cancel'
        });

        if (confirmed) {
            const formData = new FormData();

            formData.append('pkLgtnnfgg', val);

            axios.post(VITE_JET_ASP_BPC_API + '/tableview/deleteformdata/view_tb_lgtnnfgg_bdonpj', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'grooveToken': token
                }
            }).then(response => {
                if (response.data && response.data.success) {
                    refreshTable();
                } else {
                    showAlert('Failed to delete data.', 'error');
                }
            }).catch(err => {
                showAlert('Delete data exception.', 'error');
            }).finally(() => {
            });
        }
    }

    // 返回所有需要暴露给组件的状态和操作
    return {
        pkId,
        setPkId,
        viewSettlementStatement,
        reviewSettlementStatement,
        deleteSettlementStatement,
        closeDialog
    };
};