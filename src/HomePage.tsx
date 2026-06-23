import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid'
import { useTranslation } from 'react-i18next';
import overview from './assets/images/epbp-overview.png';
import { useNavigate } from 'react-router-dom';
import { useSession } from './authority/SessionContext';
import epbpLogo from './assets/images/epbp-logo.png';

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

  const { isAuthenticated } = useSession();

  // 前景图左侧羽化：与文字交错处虚化融合
  const fgMaskStyle = {
    maskImage: 'linear-gradient(to right, transparent 0%, #000 24%, #000 100%)',
    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 24%, #000 100%)',
  };

  // 前景图顶部羽化 10%
  const fgTopMaskStyle = {
    maskImage: 'linear-gradient(to bottom, transparent 0%, #000 10%, #000 100%)',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 10%, #000 100%)',
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <nav className="relative z-50 flex h-12 items-center justify-between">
            <div className="flex items-center md:gap-x-12">
              <a aria-label="Home" href={BASE_PATH} className="inline-flex items-center">
                <img src={epbpLogo} alt="EPBP" className="h-14 w-auto -my-2" />
              </a>
              <div className="hidden md:flex md:gap-x-6">
                <a className="inline-block rounded-lg px-2 py-1 text-sm text-blue-50 hover:bg-white/10 hover:text-white" href="#features">{t('portal.feature')}</a>
                <a className="inline-block rounded-lg px-2 py-1 text-sm text-blue-50 hover:bg-white/10 hover:text-white" href="#testimonials">{t('portal.update')}</a>
                <a className="inline-block rounded-lg px-2 py-1 text-sm text-blue-50 hover:bg-white/10 hover:text-white" href="#pricing">{t('portal.pricing')}</a></div>
            </div>
            <div className="flex items-center gap-x-5 md:gap-x-8">
              {/* session 控制：未登录显示「登录系统」，已登录显示「工作空间」 */}
              {isAuthenticated ? (
                <a className="group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-100 focus-visible:outline-white" href={`#`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/main');
                }}><span>{t('portal.workspace')}</span></a>
              ) : (
                <a className="group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-100 focus-visible:outline-white" href={`#`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}><span>{t('portal.signin')}</span></a>
              )}
              <div className="-mr-1 md:hidden">
                <div data-headlessui-state="">
                  <button className="relative z-10 flex h-8 w-8 items-center justify-center focus:not-data-focus:outline-hidden" type="button" aria-expanded="false" data-headlessui-state="">
                    <svg aria-hidden="true" className="h-3.5 w-3.5 overflow-visible stroke-white" fill="none" strokeWidth="2" strokeLinecap="round">
                      <path d="M0 1H14M0 7H14M0 13H14" className="origin-center transition"></path>
                      <path d="M2 2L12 12M12 2L2 12" className="origin-center transition scale-90 opacity-0"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
      <div className="relative flex flex-1 items-center overflow-hidden bg-gradient-to-b from-blue-100 via-sky-50 to-sky-50 py-2">
        {/* 前景产品图：绝对定位贴右、h-full，左/上羽化，位于文字下层与之交错 */}
        <div className="absolute right-0 top-0 z-0 hidden h-full lg:block" style={fgTopMaskStyle}>
          <img
            alt="Product screenshot"
            src={overview}
            width={1024}
            height={800}
            className="h-full w-auto max-w-none object-contain drop-shadow-2xl"
            style={fgMaskStyle}
          />
        </div>

        {/* 左侧浅色蒙版：保证交错处文字清晰 */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-sky-50 from-30% via-sky-50/80 to-transparent to-75%" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col justify-center lg:max-w-lg">
              <h2 className="text-base/7 font-semibold text-blue-600">一站式、高标准、高精度</h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-3xl">
                Flexible, Accurate and Efficient
              </p>
              <p className="mt-6 text-sm/7 text-gray-700">
                <span className="font-semibold text-md underline decoration-wavy decoration-gray-400 underline-offset-2">生产报表自动回填和电费计费平台</span>通过高度灵活的多维度定价引擎和精确的电量数据处理机制保证了电费计算的准确性和合规性。它不仅是实现精确营收结算的工具，更是支撑未来复杂电力市场运营、促进用户侧精细化管理和推动能源数字化的核心基础设施。
              </p>
              <dl className="mt-10 max-w-xl space-y-6 text-sm text-gray-700">
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
        </div>

      {/* 页脚 */}
      <footer className="bg-sky-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-8 sm:flex-row sm:justify-between lg:px-8">
          <div className="text-center text-sm font-medium leading-relaxed text-slate-600 sm:text-left">
            华能新能源股份有限公司上海分公司<br />
            华能（上海）清洁能源开发有限公司
          </div>
          <p className="text-sm/7 text-slate-600">
            © {new Date().getFullYear()} 生产报表自动回填和电费计费平台
          </p>
        </div>
      </footer>
    </div>
  )
}
