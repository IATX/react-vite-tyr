
interface dataItem {
    pkWnoeallm: any; // 主键
    uizewbux: string; // 发电量项目
    adguhuya: any; // 正向有功底码
    jewccvah: any; // 正向有功表数
    vcbnneyp: any; // 发电量
    tqqnmhrl: string; // 上网电量项目
    xglsayhb: any; // 反向有功底码
    pypzpeeb: any; // 反向有功表数
    wumkmcly: any; // 上网电量
    dtuxsxpz: any; // 售电量
}

interface FormData {
    listKmddwu: dataItem[];
}

export const useInitialActions = () => {


    {/** 缺省列表 */ }
    const arr: dataItem[] = [
    { pkWnoeallm: null, uizewbux: '峰', adguhuya: null, jewccvah: null, vcbnneyp:null, tqqnmhrl:'峰', xglsayhb: null, pypzpeeb: null, wumkmcly:null, dtuxsxpz:null},
    { pkWnoeallm: null, uizewbux: '平', adguhuya: null, jewccvah: null, vcbnneyp:null, tqqnmhrl:'平', xglsayhb: null, pypzpeeb: null, wumkmcly:null, dtuxsxpz:null},
    { pkWnoeallm: null, uizewbux: '尖', adguhuya: null, jewccvah: null, vcbnneyp:null, tqqnmhrl:'尖', xglsayhb: null, pypzpeeb: null, wumkmcly:null, dtuxsxpz:null},
    { pkWnoeallm: null, uizewbux: '谷', adguhuya: null, jewccvah: null, vcbnneyp:null, tqqnmhrl:'谷', xglsayhb: null, pypzpeeb: null, wumkmcly:null, dtuxsxpz:null},
    ];

    const defaultInitialData: FormData = {
        'listKmddwu': arr
    };

    return {
        defaultInitialData
    }
}