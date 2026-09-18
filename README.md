# SkillLab

SkillLab là thư viện Skill thực chiến giúp người dùng biến ý tưởng thành kết quả với AI.

## Chạy trên máy

- Node.js `>=22.13.0`
- `npm install`
- `npm run dev`

Mở `http://localhost:3000` để xem website.

## Build cho Vercel

```bash
npm run build
npm run start
```

Project đã có `vercel.json` và sử dụng Next.js App Router. Khi đưa repository lên Vercel, chọn framework **Next.js**, giữ lệnh build mặc định `npm run build`, và chưa cần khai báo biến môi trường cho bản giao diện hiện tại.

## Cấu trúc dự kiến

- `app/`: giao diện SkillLab.
- `public/`: favicon và tài sản tĩnh.
- `vercel.json`: cấu hình triển khai Vercel.
- `.env.example`: danh sách biến môi trường sẽ dùng cho tài khoản, thanh toán và MCP ở các giai đoạn sau.

## Các bước tiếp theo

1. Chốt tên thương hiệu, logo và tên miền.
2. Thay dữ liệu mẫu bằng danh sách Skill được phép thương mại hóa.
3. Thêm trang chi tiết Skill và thanh toán QR.
4. Thêm tài khoản khách hàng và kho Skill cá nhân.
5. Kết nối MCP riêng và tự động cấp quyền sau thanh toán.
