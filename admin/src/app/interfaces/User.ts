export interface iUser {
    Ma_nguoi_dung: number;        // int
    Ho_va_ten: string;            // String
    So_dien_thoai: string;        // String
    Email: string;                // String
    Mat_khau: string;             // String
    Can_cuoc_cong_dan: string;    // String
    Giay_phep_lai_xe: string;     // String
    Vai_tro: string;              // String (vd: "user", "admin", "owner")
    Anh_dai_dien: string;         // String (đường dẫn ảnh)
    Ngay_tao: string | Date;      // LocalDate (dạng "YYYY-MM-DD")
    So_lan_vi_pham: number;       // int
}
