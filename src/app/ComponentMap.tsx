import React from 'react';

export type ComponentType = 'view' | 'query' | 'other' | 'hub';

export interface IComponentItem {
  elem: React.LazyExoticComponent<React.ComponentType<any>>;
  type: ComponentType;
  path?: string;
}

export interface IComponentMap {
  [key: string]: IComponentItem;
}

const componentMap: IComponentMap = {
  'QueryFzwlye': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryFzwlye')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryFzwlye',
  },
  'QueryGetoqx': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryGetoqx')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryGetoqx',
  },
  'QueryGxffwv': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryGxffwv')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryGxffwv',
  },
  'QueryIjjudr': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryIjjudr')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryIjjudr',
  },
  'QueryJokhkp': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryJokhkp')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryJokhkp',
  },
  'QueryJxzqzn': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryJxzqzn')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryJxzqzn',
  },
  'QueryKaeany': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryKaeany')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryKaeany',
  },
  'QueryKrrpkm': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryKrrpkm')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryKrrpkm',
  },
  'QueryMmlokn': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryMmlokn')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryMmlokn',
  },
  'QueryOfgrem': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryOfgrem')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryOfgrem',
  },
  'QueryOldktk': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryOldktk')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryOldktk',
  },
  'QueryQkjhps': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryQkjhps')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryQkjhps',
  },
  'QueryQrogsu': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryQrogsu')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryQrogsu',
  },
  'QueryTgtnvf': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryTgtnvf')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryTgtnvf',
  },
  'QueryUugwep': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryUugwep')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryUugwep',
  },
  'QueryVtqjos': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryVtqjos')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryVtqjos',
  },
  'QueryWnkrtk': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryWnkrtk')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryWnkrtk',
  },
  'QueryWxkson': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryWxkson')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryWxkson',
  },
  'QueryXpmlfk': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryXpmlfk')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryXpmlfk',
  },
  'QueryXwztav': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryXwztav')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryXwztav',
  },
  'QueryYagetq': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryYagetq')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryYagetq',
  },
  'QueryZcolik': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryZcolik')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryZcolik',
  },
  'QueryZqqxdz': {
    elem: React.lazy(() => import('../app/ilzpxj/query/QueryZqqxdz')),
    type: 'query',
    path: 'app/ilzpxj/query/QueryZqqxdz',
  },
  'PrefabDepartmentList': {
    elem: React.lazy(() => import('../app/ilzpxj/query/PrefabDepartmentList')),
    type: 'query',
    path: 'app/ilzpxj/query/PrefabDepartmentList',
  },
  'PrefabDepartmentSearch': {
    elem: React.lazy(() => import('../app/ilzpxj/query/PrefabDepartmentSearch')),
    type: 'query',
    path: 'app/ilzpxj/query/PrefabDepartmentSearch',
  },
  'PrefabRoleList': {
    elem: React.lazy(() => import('../app/ilzpxj/query/PrefabRoleList')),
    type: 'query',
    path: 'app/ilzpxj/query/PrefabRoleList',
  },
  'PrefabRoleSearch': {
    elem: React.lazy(() => import('../app/ilzpxj/query/PrefabRoleSearch')),
    type: 'query',
    path: 'app/ilzpxj/query/PrefabRoleSearch',
  },
  'PrefabUserList': {
    elem: React.lazy(() => import('../app/ilzpxj/query/PrefabUserList')),
    type: 'query',
    path: 'app/ilzpxj/query/PrefabUserList',
  },
  'PrefabUserQueryList': {
    elem: React.lazy(() => import('../app/ilzpxj/query/PrefabUserQueryList')),
    type: 'query',
    path: 'app/ilzpxj/query/PrefabUserQueryList',
  },
  'PrefabLogList': {
    elem: React.lazy(() => import('../app/ilzpxj/query/PrefabLogList')),
    type: 'query',
    path: 'app/ilzpxj/query/PrefabLogList',
  },
  'ViewTbCuqscwaiClbnay': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbCuqscwaiClbnay')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbCuqscwaiClbnay',
  },
  'ViewTbCuqscwaiDncdtj': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbCuqscwaiDncdtj')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbCuqscwaiDncdtj',
  },
  'ViewTbExswzlwtLqufqi': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbExswzlwtLqufqi')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbExswzlwtLqufqi',
  },
  'ViewTbDailyLogsFjsjve': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbDailyLogsFjsjve')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbDailyLogsFjsjve',
  },
  'ViewTbDhnkqhqgNmiwkj': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbDhnkqhqgNmiwkj')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbDhnkqhqgNmiwkj',
  },
  'ViewTbDhnkqhqgQdoeqk': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbDhnkqhqgQdoeqk')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbDhnkqhqgQdoeqk',
  },
  'ViewTbEnpqommqStpinc': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbEnpqommqStpinc')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbEnpqommqStpinc',
  },
  'ViewTbExswzlwtKcdgmf': {
			'elem': React.lazy(() => import('../app/ilzpxj/view/ViewTbExswzlwtKcdgmf')),
			'type': 'view',
			'path': 'app/ilzpxj/view/ViewTbExswzlwtKcdgmf',
	},
  'ViewTbGvfrokeqSfidnf': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbGvfrokeqSfidnf')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbGvfrokeqSfidnf',
  },
  'ViewTbGvfrokeqZlvans': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbGvfrokeqZlvans')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbGvfrokeqZlvans',
  },
  'ViewTbIfsxuxeiLiyiee': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbIfsxuxeiLiyiee')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbIfsxuxeiLiyiee',
  },
  'ViewTbJdelyxiiRwhmui': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbJdelyxiiRwhmui')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbJdelyxiiRwhmui',
  },
  'ViewTbJkywwxtlMsurqp': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbJkywwxtlMsurqp')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbJkywwxtlMsurqp',
  },
  'ViewTbJpercefrEmaqau': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbJpercefrEmaqau')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbJpercefrEmaqau',
  },
  'ViewTbKlxmblqlAcsguo': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbKlxmblqlAcsguo')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbKlxmblqlAcsguo',
  },
  'ViewTbKrqdqnqcEcrvcd': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbKrqdqnqcEcrvcd')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbKrqdqnqcEcrvcd',
  },
  'ViewTbLgtnnfggBdonpj': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbLgtnnfggBdonpj')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbLgtnnfggBdonpj',
  },
  'ViewTbLgtnnfggQuvmwv': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbLgtnnfggQuvmwv')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbLgtnnfggQuvmwv',
  },
  'ViewTbLgtnnfggRxcudr': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbLgtnnfggRxcudr')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbLgtnnfggRxcudr',
  },
  'ViewTbNiavzhptBhzzpz': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbNiavzhptBhzzpz')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbNiavzhptBhzzpz',
  },
  'ViewTbPiclbkqkIsjbmb': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbPiclbkqkIsjbmb')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbPiclbkqkIsjbmb',
  },
  'ViewTbPiclbkqkTvruep': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbPiclbkqkTvruep')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbPiclbkqkTvruep',
  },
  'ViewTbPiclbkqkXvhrik': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbPiclbkqkXvhrik')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbPiclbkqkXvhrik',
  },
  'ViewTbQyfyxnobKaiinc': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbQyfyxnobKaiinc')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbQyfyxnobKaiinc',
  },
  'ViewTbStybmjgdRuiowc': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbStybmjgdRuiowc')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbStybmjgdRuiowc',
  },
  'ViewTbTcbogtyoAfmnqw': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbTcbogtyoAfmnqw')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbTcbogtyoAfmnqw',
  },
  'ViewTbWxcheztyNlyrlw': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbWxcheztyNlyrlw')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbWxcheztyNlyrlw',
  },
  'ViewTbWzbgmxdiKoossp': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbWzbgmxdiKoossp')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbWzbgmxdiKoossp',
  },
  'ViewTbWzghpmogSemlgb': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbWzghpmogSemlgb')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbWzghpmogSemlgb',
  },
  'ViewTbWzghpmogVxpfmm': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbWzghpmogVxpfmm')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbWzghpmogVxpfmm',
  },
  'ViewTbXbbyezwtKxchdy': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbXbbyezwtKxchdy')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbXbbyezwtKxchdy',
  },
  'ViewTbXbbyezwtMugqix': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbXbbyezwtMugqix')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbXbbyezwtMugqix',
  },
  'ViewTbXntlcwohNsxogn': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbXntlcwohNsxogn')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbXntlcwohNsxogn',
  },
  'ViewTbXntlcwohUzlwbg': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbXntlcwohUzlwbg')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbXntlcwohUzlwbg',
  },
  'ViewTbYrnfwwvyQfxmub': {
    elem: React.lazy(() => import('../app/ilzpxj/view/ViewTbYrnfwwvyQfxmub')),
    type: 'view',
    path: 'app/ilzpxj/view/ViewTbYrnfwwvyQfxmub',
  },
  'PrefabDepartmentAdd': {
    elem: React.lazy(() => import('../app/ilzpxj/view/PrefabDepartmentAdd')),
    type: 'view',
    path: 'app/ilzpxj/view/PrefabDepartmentAdd',
  },
  'PrefabDepartmentEdit': {
    elem: React.lazy(() => import('../app/ilzpxj/view/PrefabDepartmentEdit')),
    type: 'view',
    path: 'app/ilzpxj/view/PrefabDepartmentEdit',
  },
  'PrefabRoleAdd': {
    elem: React.lazy(() => import('../app/ilzpxj/view/PrefabRoleAdd')),
    type: 'view',
    path: 'app/ilzpxj/view/PrefabRoleAdd',
  },
  'PrefabRoleEdit': {
    elem: React.lazy(() => import('../app/ilzpxj/view/PrefabRoleEdit')),
    type: 'view',
    path: 'app/ilzpxj/view/PrefabRoleEdit',
  },
  'PrefabUserAdd': {
    elem: React.lazy(() => import('../app/ilzpxj/view/PrefabUserAdd')),
    type: 'view',
    path: 'app/ilzpxj/view/PrefabUserAdd',
  },
  'PrefabUserEdit': {
    elem: React.lazy(() => import('../app/ilzpxj/view/PrefabUserEdit')),
    type: 'view',
    path: 'app/ilzpxj/view/PrefabUserEdit',
  },
  'PrefabPurviewEdit': {
    elem: React.lazy(() => import('../app/ilzpxj/view/PrefabPurviewEdit')),
    type: 'view',
    path: 'app/ilzpxj/view/PrefabPurviewEdit',
  },
  'PrefabModuleAdd': {
    elem: React.lazy(() => import('../app/ilzpxj/view/PrefabModuleAdd')),
    type: 'view',
    path: 'app/ilzpxj/view/PrefabModuleAdd',
  },
  'PrefabModuleEdit': {
    elem: React.lazy(() => import('../app/ilzpxj/view/PrefabModuleEdit')),
    type: 'view',
    path: 'app/ilzpxj/view/PrefabModuleEdit',
  },
  'PrefabMenuAdd': {
    elem: React.lazy(() => import('../app/ilzpxj/view/PrefabMenuAdd')),
    type: 'view',
    path: 'app/ilzpxj/view/PrefabMenuAdd',
  },
  'PrefabMenuEdit': {
    elem: React.lazy(() => import('../app/ilzpxj/view/PrefabMenuEdit')),
    type: 'view',
    path: 'app/ilzpxj/view/PrefabMenuEdit',
  },
  'Agentpurchasepricing': {
    elem: React.lazy(() => import('../app/ilzpxj/hub/Agentpurchasepricing')),
    type: 'other',
    path: 'app/ilzpxj/hub/Agentpurchasepricing',
  },
  'Mchelecprice': {
    elem: React.lazy(() => import('../app/ilzpxj/hub/Mchelecprice')),
    type: 'other',
    path: 'app/ilzpxj/hub/Mchelecprice',
  },
  'Billcenter': {
    elem: React.lazy(() => import('../app/ilzpxj/hub/Billcenter')),
    type: 'hub',
    path: 'app/ilzpxj/hub/Billcenter',
  },
  'Fixedpricebillsettlement': {
    elem: React.lazy(() => import('./ilzpxj/dev/FixedPriceBillSettlement')),
    type: 'other',
    path: 'app/ilzpxj/dev/FixedPriceBillSettlement',
  },
  'Electricitybillmanagement': {
    elem: React.lazy(() => import('../app/ilzpxj/hub/Electricitybillmanagement')),
    type: 'hub',
    path: 'app/ilzpxj/hub/Electricitybillmanagement',
  },
  'Electricityoperamanagement': {
    elem: React.lazy(() => import('../app/ilzpxj/hub/Electricityoperamanagement')),
    type: 'hub',
    path: 'app/ilzpxj/hub/Electricityoperamanagement',
  },
};

export default componentMap;
