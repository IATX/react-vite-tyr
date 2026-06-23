import AppTheme from './theme/AppTheme';
import SignInCard from './components/SignInCard';
import epbpLogo from './assets/images/epbp-logo.png';

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gradient-to-br from-blue-700 via-sky-100 to-emerald-100 px-6 py-12 lg:px-8">
        {/* 虚化柔光色块 */}
        <div className="pointer-events-none absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full bg-blue-700/60 blur-3xl" />
        <div className="pointer-events-none absolute top-1/4 -right-28 h-[26rem] w-[26rem] rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-[30rem] w-[30rem] rounded-full bg-emerald-200/50 blur-3xl" />
        {/* 太阳暖色光晕（靠近右上角） */}
        <div className="pointer-events-none absolute -top-20 -right-4 h-[22rem] w-[22rem] rounded-full bg-amber-300/45 blur-3xl" />
        <div className="pointer-events-none absolute top-6 right-24 h-40 w-40 rounded-full bg-orange-300/50 blur-2xl" />


        {/* 左上角 Logo（透明背景） */}
        <img
          src={epbpLogo}
          alt="EPBP"
          className="absolute left-6 top-7 z-20 h-[4.5rem] w-auto drop-shadow-md lg:left-10 lg:top-9"
        />

        {/* 登录卡片：透明融入背景，系统名称居中于卡片顶部 */}
        <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="rounded-2xl bg-blue/10 px-8 py-10 backdrop-blur-xl sm:px-10">
            <SignInCard
              showLogo={false}
              title={
                <span className="whitespace-nowrap text-[1.7rem] font-bold leading-tight tracking-tight text-slate-800">
                  生产报表自动回填和电费计费平台
                </span>
              }
            />
          </div>
        </div>
      </div>
    </AppTheme>
  );
}
