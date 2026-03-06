
import { useState, useCallback } from 'react';
import axios from 'axios';

import { useAlert } from '../../../components/AlertContext';
import { useSession } from '../../../authority/SessionContext';
import { useConfirm } from '../../../components/useConfirmDialog';

interface NksmxsDataItem {
	pkWtfsrzaf: any;
	fpqojirt: string;
	mvlsoxll: any;
	fohyfwyj: any;
}

interface FormData {
	listNksmxs: NksmxsDataItem[];
}

interface ElectricityStatisticsData {
	gfumgrlg: any;
	tparorbm: any;
	ynwjibye: any;
	tjmqxlms: any;
}

interface SyncMerchantData {
	'bwblkhay': any;
	'mrvqpphi': any;
	'imxdflym': any;
	'xdsjflqz': any;
}

interface BillingStandardData {
	'qwpibxbv': any;
	'imxdflym': any;
	'xdsjflqz': any;
}

interface AgentPurchasedData {
	uislfbtj: any;
	cdtylzeq: any;
	dmnbozws: any;
	jtenztaq: any;
	odrfnzvo: any;
}

export const useInitialActions = () => {
	const VITE_JET_ASP_BPC_API = import.meta.env.VITE_JET_ASP_BPC_API;

	const { token } = useSession();
	const { showAlert } = useAlert();
	const { confirm } = useConfirm();


	{/** 账单概况默认列表 */ }
	const listNksmxsArr: NksmxsDataItem[] = [{ pkWtfsrzaf: null, fpqojirt: '容需量电费', mvlsoxll: null, fohyfwyj: null },
	{ pkWtfsrzaf: null, fpqojirt: '工商业电费', mvlsoxll: null, fohyfwyj: null },
	{ pkWtfsrzaf: null, fpqojirt: '①零售交易电费', mvlsoxll: '', fohyfwyj: '' },
	{ pkWtfsrzaf: null, fpqojirt: '②上网环节线损费用', mvlsoxll: '', fohyfwyj: '' },
	{ pkWtfsrzaf: null, fpqojirt: '③输配电费', mvlsoxll: '', fohyfwyj: '' },
	{ pkWtfsrzaf: null, fpqojirt: '④系统运行费', mvlsoxll: '', fohyfwyj: '' },
	{ pkWtfsrzaf: null, fpqojirt: '⑤政府性基金及附加', mvlsoxll: '', fohyfwyj: '' },
	{ pkWtfsrzaf: null, fpqojirt: '功率因数调整电费', mvlsoxll: '', fohyfwyj: '' },
	{ pkWtfsrzaf: null, fpqojirt: '市场化电费', mvlsoxll: '', fohyfwyj: '' },
	{ pkWtfsrzaf: null, fpqojirt: '本月应付账款', mvlsoxll: '', fohyfwyj: '' },
	{ pkWtfsrzaf: null, fpqojirt: '减已结算之账款', mvlsoxll: '', fohyfwyj: '' },
	{ pkWtfsrzaf: null, fpqojirt: '本月应付尾差或溢付', mvlsoxll: '', fohyfwyj: '' },
	];

	const defaultInitialData: FormData = {
		'listNksmxs': listNksmxsArr
	};

	const [settlementStatementDialogTitle, setSettlementStatementDialogTitle] = useState('');
	const [isSettlementStatementDialogOpen, setIsSettlementStatementDialogOpen] = useState(false);
	const [presettlementStatementData, setPresettlementStatementData] = useState<any>({});

	const [electricityStatisticsDialogTitle, setElectricityStatisticsDialogTitle] = useState('');
	const [isElectricityStatisticsDialogOpen, setIsElectricityStatisticsDialogOpen] = useState(false);
	const [electricityStatisticsInitialData, setElectricityStatisticsInitialData] = useState<ElectricityStatisticsData | null>(null);

	const [syncMerchantDialogTitle, setSyncMerchantDialogTitle] = useState('');
	const [isSyncMerchantDialogOpen, setIsSyncMerchantDialogOpen] = useState(false);
	const [syncMerchantInitialData, setSyncMerchantInitialData] = useState<SyncMerchantData | null>(null);

	const [billingStandardDialogTitle, setBillingStandardDialogTitle] = useState('');
	const [isBillingStandardDialogOpen, setIsBillingStandardDialogOpen] = useState(false);
	const [billingStandardInitialData, setBillingStandardInitialData] = useState<BillingStandardData | null>(null);

	const [agentPurchasedDialogTitle, setAgentPurchasedDialogTitle] = useState('');
	const [isAgentPurchasedDialogOpen, setIsAgentPurchasedDialogOpen] = useState(false);
	const [agentPurchasedInitialData, setAgentPurchasedInitialData] = useState<AgentPurchasedData | null>(null);

	// 生成结算数据
	const generateSettlementStatement = useCallback(async (billData: any) => {
		const confirmed = await confirm({
			title: '提示',
			message: `确定生成结算单?`,
			confirmText: '确定',
			cancelText: '取消'
		});

		if (confirmed) {
			axios.post(VITE_JET_ASP_BPC_API + '/billedelectricity/settlestatement/' + billData.pkJkywwxtl, {}, {
				headers: {
					'grooveToken': token
				}
			}).then(response => {
				if (response.data.code == '-9999') {
					// showAlert(response.data.message, 'error');
					try {
						const res = JSON.parse(response.data.message);

						if (res.premise === 'NoMerchant') {
							editMerchantForm(billData);
						} else if (res.premise === 'NoBillingStandard') {
							editBillingStandardForm(res, billData);
						} else if (res.premise === 'NoSettlementData') {
							editElectricityStatisticsForm(res);
						} else if (res.premise === 'NoAgentPurchasedPrice') {
							editAgentPurchasedPriceForm(res);
						}
					} catch (error) {
						confirm({
							title: '提示',
							message: response.data.message,
							confirmText: '确定',
							cancelText: '取消',
						});
					}

					return;
				}

				if (response.data) {
					// 在成功后调用 Hook 内部的 Setter
					setSettlementStatementDialogTitle(response.data.title);
					setPresettlementStatementData(response.data.formData);
					setIsSettlementStatementDialogOpen(true);
				} else {
					showAlert('Failed to settle statement.', 'error');
				}
			}).catch(err => {
				showAlert('Settle statement exception: ' + err, 'error');
			}).finally(() => {
				// 可选：执行清理或通知
			});
		}
	}, [token, VITE_JET_ASP_BPC_API, confirm]); // 依赖项列表

	// 同步商户信息
	const editMerchantForm = async (billData: any) => {
		try {
			const confirmed = await confirm({
				title: '提示',
				message: `将「${billData.snebfkdc}」同步到商户信息，同时设定电价依据？`,
				confirmText: '确定',
				cancelText: '取消',
			});

			if (confirmed) {
				setSyncMerchantDialogTitle('商户注册');
				setIsSyncMerchantDialogOpen(true);
				setSyncMerchantInitialData({
					'bwblkhay': billData.btvttbdp,
					'mrvqpphi': billData.snebfkdc,
					'imxdflym': billData.btvttbdp,
					'xdsjflqz': billData.snebfkdc,
				});
			}
		} catch (error) {
			showAlert('Network service exception: ' + error, 'error');
		}
	}

	// 填报同期代理购电电价表 
	const editAgentPurchasedPriceForm = async (res: any) => {
		const confirmed = await confirm({
			title: '提示',
			message: '缺少' + res.periodTitle + '代理购电工商业用户电价表，现在去填报？',
			confirmText: '确定',
			cancelText: '取消',
		});

		if (confirmed) {
			setAgentPurchasedDialogTitle
			setAgentPurchasedInitialData({
				uislfbtj: res.title,
				cdtylzeq: res.startDate,
				dmnbozws: res.endDate,
				jtenztaq: '1',
				odrfnzvo: '普通'
			});

			setAgentPurchasedDialogTitle(res.periodTitle + '-代理购电工商业用户电价表');
			setIsAgentPurchasedDialogOpen(true);
		}
	}

	// 填报同期电量统计表 
	const editElectricityStatisticsForm = async (res: any) => {
		const confirmed = await confirm({
			title: '提示',
			message: '缺少' + res.periodTitle + '电量统计表，现在去填报？',
			confirmText: '确定',
			cancelText: '取消',
		});

		if (confirmed) {
			setElectricityStatisticsInitialData({
				gfumgrlg: res.merchantId,
				tparorbm: res.merchantName,
				ynwjibye: res.merchantNumber,
				tjmqxlms: res.date
			});

			setElectricityStatisticsDialogTitle(res.periodTitle + '-电量统计表');
			setIsElectricityStatisticsDialogOpen(true);
		}
	}

	// 设置商户代购电价
	const editBillingStandardForm = async (res: any, billData: any) => {
		try {
			const confirmed = await confirm({
				title: '提示',
				message: `缺少结算电价电价依据，马上设置？`,
				confirmText: '确定',
				cancelText: '取消',
			});

			if (confirmed) {
				setBillingStandardDialogTitle('结算电价设置');
				setIsBillingStandardDialogOpen(true);
				setBillingStandardInitialData({
					'qwpibxbv': res.merchantId,
					'imxdflym': billData.btvttbdp,
					'xdsjflqz': billData.snebfkdc,
				});
			}
		} catch (error) {
			showAlert('Network service exception: ' + error, 'error');
		}
	}

	return {
		defaultInitialData,
		presettlementStatementData,
		settlementStatementDialogTitle,
		setSettlementStatementDialogTitle,
		isSettlementStatementDialogOpen,
		setIsSettlementStatementDialogOpen,
		generateSettlementStatement,
		electricityStatisticsDialogTitle,
		setElectricityStatisticsDialogTitle,
		isElectricityStatisticsDialogOpen,
		setIsElectricityStatisticsDialogOpen,
		electricityStatisticsInitialData,
		syncMerchantDialogTitle,
		isSyncMerchantDialogOpen,
		setIsSyncMerchantDialogOpen,
		syncMerchantInitialData,
		billingStandardDialogTitle,
		isBillingStandardDialogOpen,
		setIsBillingStandardDialogOpen,
		billingStandardInitialData,
		agentPurchasedDialogTitle,
		isAgentPurchasedDialogOpen,
		setIsAgentPurchasedDialogOpen,
		agentPurchasedInitialData
	}
}