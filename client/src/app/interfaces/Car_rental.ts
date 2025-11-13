export interface iCar_rental {
    Ma_don_thue: number;           // PK - Mã đơn thuê xe duy nhất
    Ma_nguoi_thue: number;         // FK - Mã người thuê (tham chiếu User.Vai_tro = 1)
    Ma_xe: number;                 // FK - Mã xe (tham chiếu Car.Ma_xe)
    Ma_vi_tri_nhan: number;        // FK - Mã vị trí nhận xe (tham chiếu Location)
    Ma_vi_tri_tra: number;         // FK - Mã vị trí trả xe (tham chiếu Location)
    Ngay_nhan_xe: string;          // Ngày nhận xe (định dạng ISO yyyy-MM-dd)
    Gio_nhan_xe: string;           // Giờ nhận xe (HH:mm)
    Ngay_tra_xe: string;           // Ngày trả xe (định dạng ISO yyyy-MM-dd)
    Gio_tra_xe: string;            // Giờ trả xe (HH:mm)
    Tong_ngay_thue: number;        // Tổng số ngày thuê
    Tong_chi_phi: number;          // Tổng chi phí thuê = Gia_thue * Tong_ngay_thue
    Trang_thai: number;            // 3=Đã huỷ | 4=Đã hoàn tất |
}
