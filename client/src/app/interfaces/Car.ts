export interface iCar {
    Ma_xe: number;              // int
    Ma_nguoi_dung?: number;     // int
    Ma_vi_tri?: number;         // int
    Giay_to_xe: string;         // String
    Bien_so_xe: string;         // String
    Anh_xe: string[];           // ✅ Danh sách nhiều ảnh
    Mo_ta: string;              // String
    Hang_xe: string;            // String
    Dong_xe: string;            // String
    Nhien_lieu: string;         // String
    Mau_sac: string;            // String
    Hop_so: string;             // String
    So_km: number;              // int
    Muc_tieu_thu: number;       // double
    Gia_thue: number;           // int
    So_cho: number;             // int
    Tinh_trang_xe: string;      // String
    Diem_danh_gia: number;      // double
    So_luot_danh_gia: number;   // int
    So_luot_thue: number;       // int
    Bao_hanh_gan_nhat: string | Date; // ✅ Ngày gần nhất bảo hành
    Loai_xe?: string;           // String
    Nam_san_xuat?: number;      // int
    So_chuyen?: number;         // int (alias cho So_luot_thue)
}