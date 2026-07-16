import hIcon from '../assets/images/epbp-logo.png';

export default function RivetSvg() {
    return (
        <div className="flex items-center gap-2">
            <img src={hIcon} alt="EPBP" className="h-9 w-auto shrink-0" />
            <span className="text-[14px] font-bold leading-snug tracking-tight text-slate-800">
                新能源<br />电力           
            </span>
        </div>
    );
}
