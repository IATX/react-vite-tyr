import { useState, useCallback } from 'react';
import axios from 'axios';

import { useAlert } from '../../../components/AlertContext';
import { useSession } from '../../../authority/SessionContext';
import { useConfirm } from '../../../components/useConfirmDialog';

// 导出自定义 Hook
export const useBillingActions = () => {
    const VITE_JET_ASP_BPC_API = import.meta.env.VITE_JET_ASP_BPC_API;

    const { token } = useSession();
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();

    // 1. 状态定义：必须放在 Hook 内部
    const [isAddupBillDialogOpen, setIsAddupBillDialogOpen] = useState(false);
    const [pkId, setPkId] = useState<number | null>(null);

    // 2. 导出 Setter 和 State，用于外部组件控制模态框
    const closeDialog = useCallback(() => {
        setIsAddupBillDialogOpen(false);
        setPkId(null);
    }, []);

    // 3. 导出核心操作函数，并使用 useCallback 确保引用稳定
    const addUpBillingEnergy = useCallback(async (currentPkId: number, refreshTable: Function) => {
        const confirmed = await confirm({
            title: '提示',
            message: '确定生成统计表?',
            confirmText: '确定',
            cancelText: '取消'
        });

        if (confirmed) {
            axios.post(VITE_JET_ASP_BPC_API + '/billedelectricity/addup/' + currentPkId, {}, {
                headers: {
                    'grooveToken': token
                }
            }).then(response => {
                if (response.data) {
                    refreshTable();
                    // 在成功后调用 Hook 内部的 Setter
                    setIsAddupBillDialogOpen(true);
                    setPkId(currentPkId);
                } else {
                    showAlert('Failed to add up bill.', 'error');
                }
            }).catch(err => {
                showAlert('Add up data exception: ' + err, 'error');
            }).finally(() => {
                // 可选：执行清理或通知
            });
        }
    }, [token, VITE_JET_ASP_BPC_API, confirm]); // 依赖项列表

    // 4. 其它操作函数
    const viewAddUpBillingEnergy = useCallback((currentPkId: number) => {
        setIsAddupBillDialogOpen(true);
        setPkId(currentPkId);
    }, []);

    const submitForReviewBillingEnergy = useCallback(async (currentPkId: number, refreshTable: Function) => {
        const confirmed = await confirm({
            title: 'Prompt',
            message: '确定提交审核?',
            confirmText: 'Yes',
            cancelText: 'Cancel'
        });

        if (confirmed) {
            axios.post(VITE_JET_ASP_BPC_API + '/billedelectricity/submitreview/' + currentPkId, {}, {
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

    const exportBillingEnergy = useCallback(async (currentPkId: number) => {
         axios.post(VITE_JET_ASP_BPC_API + '/billedelectricity/export/' + currentPkId, {}, {
                headers: {
                    'grooveToken': token
                }
            }).then(response => {
                if (response.data) {
                   
                } else {
                    showAlert('Failed to export bill.', 'error');
                }
            }).catch(err => {
                showAlert('Export data exception: ' + err, 'error');
            }).finally(() => {
                // 可选：执行清理或通知
            });
    }, []);

    // 返回所有需要暴露给组件的状态和操作
    return {
        isAddupBillDialogOpen,
        setIsAddupBillDialogOpen,
        pkId,
        setPkId,
        addUpBillingEnergy,
        viewAddUpBillingEnergy,
        submitForReviewBillingEnergy,
        exportBillingEnergy,
        closeDialog
    };
};