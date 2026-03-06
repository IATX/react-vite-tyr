// src/components/ComponentMap.tsx
import React from 'react';

// Import all dynamic routing page components
	import QueryFzwlye from '../app/ilzpxj/query/QueryFzwlye';
	import QueryGxffwv from '../app/ilzpxj/query/QueryGxffwv';
	import QueryIjjudr from '../app/ilzpxj/query/QueryIjjudr';
	import QueryJokhkp from '../app/ilzpxj/query/QueryJokhkp';
	import QueryJxzqzn from '../app/ilzpxj/query/QueryJxzqzn';
	import QueryKaeany from '../app/ilzpxj/query/QueryKaeany';
	import QueryOldktk from '../app/ilzpxj/query/QueryOldktk';
	import QueryQkjhps from '../app/ilzpxj/query/QueryQkjhps';
	import QueryQrogsu from '../app/ilzpxj/query/QueryQrogsu';
	import QueryUugwep from '../app/ilzpxj/query/QueryUugwep';
	import QueryVtqjos from '../app/ilzpxj/query/QueryVtqjos';
	import QueryWnkrtk from '../app/ilzpxj/query/QueryWnkrtk';
	import QueryWxkson from '../app/ilzpxj/query/QueryWxkson';
	import QueryXpmlfk from '../app/ilzpxj/query/QueryXpmlfk';
	import QueryXwztav from '../app/ilzpxj/query/QueryXwztav';
	import QueryYagetq from '../app/ilzpxj/query/QueryYagetq';
	import QueryZcolik from '../app/ilzpxj/query/QueryZcolik';
	import PrefabDepartmentList from '../app/ilzpxj/query/PrefabDepartmentList';
	import PrefabDepartmentSearch from '../app/ilzpxj/query/PrefabDepartmentSearch';
	import PrefabRoleList from '../app/ilzpxj/query/PrefabRoleList';
	import PrefabRoleSearch from '../app/ilzpxj/query/PrefabRoleSearch';
	import PrefabUserList from '../app/ilzpxj/query/PrefabUserList';
	import PrefabUserQueryList from '../app/ilzpxj/query/PrefabUserQueryList';
	import PrefabLogList from '../app/ilzpxj/query/PrefabLogList';
	import ViewTbDhnkqhqgNmiwkj from '../app/ilzpxj/view/ViewTbDhnkqhqgNmiwkj';
	import ViewTbGvfrokeqSfidnf from '../app/ilzpxj/view/ViewTbGvfrokeqSfidnf';
	import ViewTbIfsxuxeiLiyiee from '../app/ilzpxj/view/ViewTbIfsxuxeiLiyiee';
	import ViewTbJdelyxiiRwhmui from '../app/ilzpxj/view/ViewTbJdelyxiiRwhmui';
	import ViewTbJkywwxtlMsurqp from '../app/ilzpxj/view/ViewTbJkywwxtlMsurqp';
	import ViewTbKlxmblqlAcsguo from '../app/ilzpxj/view/ViewTbKlxmblqlAcsguo';
	import ViewTbKrqdqnqcEcrvcd from '../app/ilzpxj/view/ViewTbKrqdqnqcEcrvcd';
	import ViewTbLgtnnfggBdonpj from '../app/ilzpxj/view/ViewTbLgtnnfggBdonpj';
	import ViewTbLgtnnfggQuvmwv from '../app/ilzpxj/view/ViewTbLgtnnfggQuvmwv';
	import ViewTbLgtnnfggRxcudr from '../app/ilzpxj/view/ViewTbLgtnnfggRxcudr';
	import ViewTbNiavzhptBhzzpz from '../app/ilzpxj/view/ViewTbNiavzhptBhzzpz';
	import ViewTbPiclbkqkIsjbmb from '../app/ilzpxj/view/ViewTbPiclbkqkIsjbmb';
	import ViewTbPiclbkqkTvruep from '../app/ilzpxj/view/ViewTbPiclbkqkTvruep';
	import ViewTbPiclbkqkXvhrik from '../app/ilzpxj/view/ViewTbPiclbkqkXvhrik';
	import ViewTbStybmjgdRuiowc from '../app/ilzpxj/view/ViewTbStybmjgdRuiowc';
	import ViewTbTcbogtyoAfmnqw from '../app/ilzpxj/view/ViewTbTcbogtyoAfmnqw';
	import ViewTbWzghpmogSemlgb from '../app/ilzpxj/view/ViewTbWzghpmogSemlgb';
	import ViewTbWzghpmogVxpfmm from '../app/ilzpxj/view/ViewTbWzghpmogVxpfmm';
	import ViewTbXbbyezwtKxchdy from '../app/ilzpxj/view/ViewTbXbbyezwtKxchdy';
	import ViewTbXbbyezwtMugqix from '../app/ilzpxj/view/ViewTbXbbyezwtMugqix';
	import ViewTbXntlcwohUzlwbg from '../app/ilzpxj/view/ViewTbXntlcwohUzlwbg';
	import ViewTbYrnfwwvyQfxmub from '../app/ilzpxj/view/ViewTbYrnfwwvyQfxmub';
	import PrefabDepartmentAdd from '../app/ilzpxj/view/PrefabDepartmentAdd';
	import PrefabDepartmentEdit from '../app/ilzpxj/view/PrefabDepartmentEdit';
	import PrefabRoleAdd from '../app/ilzpxj/view/PrefabRoleAdd';
	import PrefabRoleEdit from '../app/ilzpxj/view/PrefabRoleEdit';
	import PrefabUserAdd from '../app/ilzpxj/view/PrefabUserAdd';
	import PrefabUserEdit from '../app/ilzpxj/view/PrefabUserEdit';
	import PrefabPurviewEdit from '../app/ilzpxj/view/PrefabPurviewEdit';
	import PrefabModuleAdd from '../app/ilzpxj/view/PrefabModuleAdd';
	import PrefabModuleEdit from '../app/ilzpxj/view/PrefabModuleEdit';
	import PrefabMenuAdd from '../app/ilzpxj/view/PrefabMenuAdd';
	import PrefabMenuEdit from '../app/ilzpxj/view/PrefabMenuEdit';

import Dashboard from './ilzpxj/hub/DashboardForm.tsx';
import MchElecPrice from '../app/ilzpxj/hub/MerchantElectricPriceForm';

// Define the component mapping interface, the key is a string and the value is the React component type
export type ComponentType = 'view' | 'query' | 'hub' | 'other';

export interface IComponentItem {
  elem: React.ReactNode;
  type: ComponentType;
  path?: string;
}

export interface IComponentMap {
  [key: string]: IComponentItem;
}

// Define a mapping object containing all dynamic routing components
const componentMap: IComponentMap = {
		'QueryFzwlye': {
			'elem': <QueryFzwlye />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryFzwlye',
		},
		'QueryGxffwv': {
			'elem': <QueryGxffwv />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryGxffwv',
		},
		'QueryIjjudr': {
			'elem': <QueryIjjudr />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryIjjudr',
		},
		'QueryJokhkp': {
			'elem': <QueryJokhkp />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryJokhkp',
		},
		'QueryJxzqzn': {
			'elem': <QueryJxzqzn />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryJxzqzn',
		},
		'QueryKaeany': {
			'elem': <QueryKaeany />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryKaeany',
		},
		'QueryOldktk': {
			'elem': <QueryOldktk />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryOldktk',
		},
		'QueryQkjhps': {
			'elem': <QueryQkjhps />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryQkjhps',
		},
		'QueryQrogsu': {
			'elem': <QueryQrogsu />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryQrogsu',
		},
		'QueryUugwep': {
			'elem': <QueryUugwep />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryUugwep',
		},
		'QueryVtqjos': {
			'elem': <QueryVtqjos />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryVtqjos',
		},
		'QueryWnkrtk': {
			'elem': <QueryWnkrtk />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryWnkrtk',
		},
		'QueryWxkson': {
			'elem': <QueryWxkson />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryWxkson',
		},
		'QueryXpmlfk': {
			'elem': <QueryXpmlfk />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryXpmlfk',
		},
		'QueryXwztav': {
			'elem': <QueryXwztav />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryXwztav',
		},
		'QueryYagetq': {
			'elem': <QueryYagetq />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryYagetq',
		},
		'QueryZcolik': {
			'elem': <QueryZcolik />,
			'type': 'query',
			'path': 'app/ilzpxj/query/QueryZcolik',
		},
		'PrefabDepartmentList': {
			'elem': <PrefabDepartmentList />,
			'type': 'query',
			'path': 'app/ilzpxj/query/PrefabDepartmentList',
		},
		'PrefabDepartmentSearch': {
			'elem': <PrefabDepartmentSearch />,
			'type': 'query',
			'path': 'app/ilzpxj/query/PrefabDepartmentSearch',
		},
		'PrefabRoleList': {
			'elem': <PrefabRoleList />,
			'type': 'query',
			'path': 'app/ilzpxj/query/PrefabRoleList',
		},
		'PrefabRoleSearch': {
			'elem': <PrefabRoleSearch />,
			'type': 'query',
			'path': 'app/ilzpxj/query/PrefabRoleSearch',
		},
		'PrefabUserList': {
			'elem': <PrefabUserList />,
			'type': 'query',
			'path': 'app/ilzpxj/query/PrefabUserList',
		},
		'PrefabUserQueryList': {
			'elem': <PrefabUserQueryList />,
			'type': 'query',
			'path': 'app/ilzpxj/query/PrefabUserQueryList',
		},
		'PrefabLogList': {
			'elem': <PrefabLogList />,
			'type': 'query',
			'path': 'app/ilzpxj/query/PrefabLogList',
		},
		'ViewTbDhnkqhqgNmiwkj': {
			'elem': <ViewTbDhnkqhqgNmiwkj />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbDhnkqhqgNmiwkj',
		},
		'ViewTbGvfrokeqSfidnf': {
			'elem': <ViewTbGvfrokeqSfidnf />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbGvfrokeqSfidnf',
		},
		'ViewTbIfsxuxeiLiyiee': {
			'elem': <ViewTbIfsxuxeiLiyiee />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbIfsxuxeiLiyiee',
		},
		'ViewTbJdelyxiiRwhmui': {
			'elem': <ViewTbJdelyxiiRwhmui />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbJdelyxiiRwhmui',
		},
		'ViewTbJkywwxtlMsurqp': {
			'elem': <ViewTbJkywwxtlMsurqp />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbJkywwxtlMsurqp',
		},
		'ViewTbKlxmblqlAcsguo': {
			'elem': <ViewTbKlxmblqlAcsguo />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbKlxmblqlAcsguo',
		},
		'ViewTbKrqdqnqcEcrvcd': {
			'elem': <ViewTbKrqdqnqcEcrvcd />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbKrqdqnqcEcrvcd',
		},
		'ViewTbLgtnnfggBdonpj': {
			'elem': <ViewTbLgtnnfggBdonpj />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbLgtnnfggBdonpj',
		},
		'ViewTbLgtnnfggQuvmwv': {
			'elem': <ViewTbLgtnnfggQuvmwv />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbLgtnnfggQuvmwv',
		},
		'ViewTbLgtnnfggRxcudr': {
			'elem': <ViewTbLgtnnfggRxcudr />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbLgtnnfggRxcudr',
		},
		'ViewTbNiavzhptBhzzpz': {
			'elem': <ViewTbNiavzhptBhzzpz />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbNiavzhptBhzzpz',
		},
		'ViewTbPiclbkqkIsjbmb': {
			'elem': <ViewTbPiclbkqkIsjbmb />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbPiclbkqkIsjbmb',
		},
		'ViewTbPiclbkqkTvruep': {
			'elem': <ViewTbPiclbkqkTvruep />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbPiclbkqkTvruep',
		},
		'ViewTbPiclbkqkXvhrik': {
			'elem': <ViewTbPiclbkqkXvhrik />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbPiclbkqkXvhrik',
		},
		'ViewTbStybmjgdRuiowc': {
			'elem': <ViewTbStybmjgdRuiowc />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbStybmjgdRuiowc',
		},
		'ViewTbTcbogtyoAfmnqw': {
			'elem': <ViewTbTcbogtyoAfmnqw />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbTcbogtyoAfmnqw',
		},
		'ViewTbWzghpmogSemlgb': {
			'elem': <ViewTbWzghpmogSemlgb />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbWzghpmogSemlgb',
		},
		'ViewTbWzghpmogVxpfmm': {
			'elem': <ViewTbWzghpmogVxpfmm />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbWzghpmogVxpfmm',
		},
		'ViewTbXbbyezwtKxchdy': {
			'elem': <ViewTbXbbyezwtKxchdy />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbXbbyezwtKxchdy',
		},
		'ViewTbXbbyezwtMugqix': {
			'elem': <ViewTbXbbyezwtMugqix />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbXbbyezwtMugqix',
		},
		'ViewTbXntlcwohUzlwbg': {
			'elem': <ViewTbXntlcwohUzlwbg />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbXntlcwohUzlwbg',
		},
		'ViewTbYrnfwwvyQfxmub': {
			'elem': <ViewTbYrnfwwvyQfxmub />,
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbYrnfwwvyQfxmub',
		},
		'PrefabDepartmentAdd': {
			'elem': <PrefabDepartmentAdd />,
			'type': 'view',
			'path': 'app/ilzpxj/view/PrefabDepartmentAdd',
		},
		'PrefabDepartmentEdit': {
			'elem': <PrefabDepartmentEdit />,
			'type': 'view',
			'path': 'app/ilzpxj/view/PrefabDepartmentEdit',
		},
		'PrefabRoleAdd': {
			'elem': <PrefabRoleAdd />,
			'type': 'view',
			'path': 'app/ilzpxj/view/PrefabRoleAdd',
		},
		'PrefabRoleEdit': {
			'elem': <PrefabRoleEdit />,
			'type': 'view',
			'path': 'app/ilzpxj/view/PrefabRoleEdit',
		},
		'PrefabUserAdd': {
			'elem': <PrefabUserAdd />,
			'type': 'view',
			'path': 'app/ilzpxj/view/PrefabUserAdd',
		},
		'PrefabUserEdit': {
			'elem': <PrefabUserEdit />,
			'type': 'view',
			'path': 'app/ilzpxj/view/PrefabUserEdit',
		},
		'PrefabPurviewEdit': {
			'elem': <PrefabPurviewEdit />,
			'type': 'view',
			'path': 'app/ilzpxj/view/PrefabPurviewEdit',
		},
		'PrefabModuleAdd': {
			'elem': <PrefabModuleAdd />,
			'type': 'view',
			'path': 'app/ilzpxj/view/PrefabModuleAdd',
		},
		'PrefabModuleEdit': {
			'elem': <PrefabModuleEdit />,
			'type': 'view',
			'path': 'app/ilzpxj/view/PrefabModuleEdit',
		},
		'PrefabMenuAdd': {
			'elem': <PrefabMenuAdd />,
			'type': 'view',
			'path': 'app/ilzpxj/view/PrefabMenuAdd',
		},
		'PrefabMenuEdit': {
			'elem': <PrefabMenuEdit />,
			'type': 'view',
			'path': 'app/ilzpxj/view/PrefabMenuEdit',
		},
		'Dashboard': {
			'elem': <Dashboard />,
			'type': 'hub',
			'path': 'app/ilzpxj/hub/Dashboard',
		},
		'MchElecPrice': {
			'elem': <MchElecPrice />,
				'type': 'hub',
				'path': 'app/ilzpxj/hub/MchElecPrice',
		},
};

export default componentMap;