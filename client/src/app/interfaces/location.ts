export interface iLocation {
    Ma_vi_tri: number;          // Mã định danh duy nhất của vị trí (PK)
    Dia_chi_cu_the: string;     // Địa chỉ chi tiết
    Tinh_thanh: string;         // Tên Tỉnh/Thành phố
    Quan_huyen: string;         // Tên Quận/Huyện
    Phuong_xa?: string;         // Tên Phường/Xã (có thể null)
}
