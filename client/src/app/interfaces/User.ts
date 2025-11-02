export interface iUser {
    Ma_nguoi_dung: number;
    Ho_va_ten: string;
    So_dien_thoai: string;
    Email: string;
    Mat_khau: string;
    Vai_tro: string; // "1" thuê, "2" chủ xe,  
    Anh_dai_dien: string;
    Ngay_tao: string;
    Can_cuoc_cong_dan?: string;    // chỉ có cho thuê & chủ xe
    Giay_phep_lai_xe?: string;     // chỉ có cho thuê & chủ xe
    So_lan_vi_pham?: number;       // chỉ có cho thuê & chủ xe
}
