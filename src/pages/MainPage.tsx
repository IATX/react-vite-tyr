import { useEffect } from 'react';

import { useBreadcrumbs } from '../context/BreadcrumbContext';

export default function MainPage() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([]);
  }, []);

  return (
    <>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-6 sm:mt-8 lg:mt-10">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="max-w-2xl" style={{ "opacity": 1, "transform": "none" }}>
            <h2>
              <span className="mb-6 block font-display text-base font-semibold text-neutral-950">服务宗旨</span>
              <span className="sr-only"> - </span>
              <span className="block font-display tracking-tight max-w-2xl text-balance text-2xl font-medium sm:text-3xl text-neutral-950">Intelligent Data-Driven No-Code Platform</span>
            </h2>
            <div className="mt-6 max-w-4xl text-base text-neutral-600">
              <p>我们的<span className="font-semibold">智能数据驱动的无代码软件生成平台</span>代表了下一代软件交付范式。该平台深度整合了 无代码可视化构建 的敏捷性、专业级数据建模 的严谨性，以及 AI 智能生成 的高效性。通过接收客户的业务需求，平台能够迅速从底层数据结构出发，自动设计、构建并部署一套功能完备的软件系统。我们致力于帮助企业以前所未有的速度和精度，将复杂的业务逻辑转化为可运行的 概念验证 (PoC) 版本，同时提供开放接口支持二次开发，确保软件资产的可持续进化和长期价值。</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-16">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="lg:flex lg:items-center lg:justify-start">
            <div>
              <ul role="list" className="text-base text-neutral-600 mt-16 lg:mt-0 lg:w-3/4 lg:min-w-132">
                <li className="group mt-10 first:mt-0">
                  <div style={{ "opacity": 1, "transform": "none" }}>
                    <div className="pt-10 group-first:pt-0 group-first:before:hidden group-first:after:hidden relative before:absolute after:absolute before:bg-neutral-950 after:bg-neutral-950/10 before:top-0 before:left-0 before:h-px before:w-6 after:top-0 after:right-0 after:left-8 after:h-px">
                      <strong className="font-semibold text-neutral-950">核心数据模型驱动 - </strong>
                      平台将数据结构视为软件系统的核心基石，确保了生成的系统在底层逻辑上具备高度的稳定性和扩展性。
                    </div>
                  </div>
                </li>
                <li className="group mt-10 first:mt-0">
                  <div style={{ "opacity": 1, "transform": "none" }}>
                    <div className="pt-10 group-first:pt-0 group-first:before:hidden group-first:after:hidden relative before:absolute after:absolute before:bg-neutral-950 after:bg-neutral-950/10 before:top-0 before:left-0 before:h-px before:w-6 after:top-0 after:right-0 after:left-8 after:h-px">
                      <strong className="font-semibold text-neutral-950">AI 智能组件生成与应用构建 - </strong>
                      利用先进的 AI 大模型能力，平台实现了从抽象业务逻辑到具体功能组件的自动化转换。</div>
                  </div>
                </li>
                <li className="group mt-10 first:mt-0"><div style={{ "opacity": 1, "transform": "none" }}>
                  <div className="pt-10 group-first:pt-0 group-first:before:hidden group-first:after:hidden relative before:absolute after:absolute before:bg-neutral-950 after:bg-neutral-950/10 before:top-0 before:left-0 before:h-px before:w-6 after:top-0 after:right-0 after:left-8 after:h-px">
                    <strong className="font-semibold text-neutral-950">开放接口与资产化二次开发 - </strong>
                    平台确保了生成的系统不是一个封闭的黑箱，而是可以持续迭代、融入专业开发流程的宝贵资产。</div>
                </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
