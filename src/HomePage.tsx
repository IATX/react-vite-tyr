import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid'
import { useTranslation } from 'react-i18next';
import overview from './assets/images/epbp-overview.png';
import { useNavigate } from 'react-router-dom';
import { useSession } from './authority/SessionContext';
import EpbpIcon from './app/ilzpxj/assets/EpbpIcon';

const features = [
  {
    name: '灵活与合规的定价引擎',
    description:
      '多维定价模型，规则引擎驱动和历史版本管理。支持复杂的分时电价（ToU）、尖峰平谷定价、阶梯电价以及容量电费等多种计费组合。',
    icon: CloudArrowUpIcon,
  },
  {
    name: '精确与高效的电量数据处理',
    description: '多种渠道实时导入计量数据，内置强大的数据校验逻辑，能够自动识别和修复缺失、异常或错误的电量数据。',
    icon: LockClosedIcon,
  },
  {
    name: '自动化结算与发票生成',
    description: '能够在预定的结算周期内，自动触发计费流程生成结算金额并生成格式化的电子发票和纸质发票。',
    icon: ServerIcon,
  },
]

const BASE_PATH = import.meta.env.VITE_JET_ASP_CONTEXT || '/';

export default function HomePage() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { user } = useSession();

  const maskStyle = {
    // 目标：让右侧最后 20% 区域淡出
    maskImage: `linear-gradient(to right, black 100%, transparent 100%)`
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <nav className="relative z-50 flex justify-between">
          <div className="flex items-center md:gap-x-12">
            <a aria-label="Home" href={BASE_PATH}>
              <EpbpIcon></EpbpIcon>
            </a>
            <div className="hidden md:flex md:gap-x-6">
              <a className="inline-block rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900" href="#features">{t('portal.feature')}</a>
              <a className="inline-block rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900" href="#testimonials">{t('portal.update')}</a>
              <a className="inline-block rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900" href="#pricing">{t('portal.pricing')}</a></div>
          </div>
          <div className="flex items-center gap-x-5 md:gap-x-8">
            <div className="hidden md:block">
              <a className="inline-block rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900" href={`#`} onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}>{t('portal.signin')}</a>
            </div>
            <a className="group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 bg-blue-600 text-white hover:text-slate-100 hover:bg-blue-500 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600" color="blue" href={`#`} 
            onClick={(e) => {
              e.preventDefault();
              
              if(user.id !== '-1') {
                 navigate('/main');
              } else {
                 navigate('/login');
              }
            }}><span>{t('portal.workspace')}</span></a>
            <div className="-mr-1 md:hidden">
              <div data-headlessui-state="">
                <button className="relative z-10 flex h-8 w-8 items-center justify-center focus:not-data-focus:outline-hidden" type="button" aria-expanded="false" data-headlessui-state="">
                  <svg aria-hidden="true" className="h-3.5 w-3.5 overflow-visible stroke-slate-700" fill="none" strokeWidth="2" strokeLinecap="round">
                    <path d="M0 1H14M0 7H14M0 13H14" className="origin-center transition"></path>
                    <path d="M2 2L12 12M12 2L2 12" className="origin-center transition scale-90 opacity-0"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
      <div className="overflow-hidden bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 items-center sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="flex flex-col justify-center">

              <div className="lg:max-w-lg">
                <h2 className="text-base/7 font-semibold text-blue-600">一站式、高标准、高精度</h2>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-3xl">
                  Flexible, Accurate and Efficient
                </p>
                <p className="mt-6 text-sm/7 text-gray-700">
                  电力定价与计费平台 (Electricity Pricing and Billing Platform, EPBP) 通过高度灵活的多维度定价引擎和精确的电量数据处理机制保证了电费计算的准确性和合规性。它不仅是实现精确营收结算的工具，更是支撑未来复杂电力市场运营、促进用户侧精细化管理和推动能源数字化的核心基础设施。
                </p>
                <dl className="mt-10 max-w-xl space-y-6 text-sm text-gray-700 lg:max-w-none">
                  {features.map((feature) => (
                    <div key={feature.name} className="relative pl-9">
                      <dt className="inline font-semibold text-gray-900">
                        <feature.icon aria-hidden="true" className="absolute top-1 left-1 size-5 text-blue-600" />
                        {feature.name}
                      </dt>{' '}
                      <dd className="inline">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <img
              alt="Product screenshot"
              src={overview}
              width={1024}
              height={800}
              className="w-3xl max-w-none rounded-xl opacity-75 shadow-xl ring-1 ring-gray-400/10 sm:w-228 md:-ml-4 lg:-ml-0"
              style={maskStyle}
            />
          </div>
        </div>
      </div>
    </>
  )
}
