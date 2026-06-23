import hIcon from '../assets/images/h-icon.png';

export default function RivetSvg() {
    return (
        <div className="flex items-center gap-2">
            <img src={hIcon} alt="H" className="h-9 w-auto shrink-0" />
            <span className="text-[14px] font-bold leading-snug tracking-tight text-slate-800">
                中国华能<br />CHINA HUANENG            
            </span>
        </div>
    );
}
