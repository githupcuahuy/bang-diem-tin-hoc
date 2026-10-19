# Website chấm điểm thi đua 4 tổ

Website gồm bảng xếp hạng, cộng/trừ điểm có lý do, lịch sử chấm điểm và tự tạo mã QR theo địa chỉ website. Giao diện có thể mở thử ngay, nhưng **phải cấu hình Firebase và đăng tải** để đồng bộ điểm giữa nhiều thiết bị.

## Phần A — Tạo cơ sở dữ liệu Firebase miễn phí

1. Mở https://console.firebase.google.com/ và đăng nhập tài khoản Google.
2. Chọn **Create a project** (Tạo dự án). Đặt tên, ví dụ `bang-diem-thi-dua-lop`; Analytics có thể tắt.
3. Trong dự án, vào **Build → Realtime Database → Create Database**. Chọn vị trí gần bạn và tạo database.
4. Mở **Project settings** (biểu tượng bánh răng) → **General** → **Your apps** → nhấn biểu tượng Web `</>`. Đặt tên ứng dụng rồi đăng ký.
5. Firebase sẽ hiển thị một đối tượng `firebaseConfig`. Mở file `firebase-config.js` trong thư mục này và thay toàn bộ các giá trị `YOUR_...` bằng giá trị thật Firebase cung cấp. Giữ nguyên tên các trường.
6. Trong **Realtime Database → Rules**, dùng quy tắc dưới đây để tất cả người có link có thể đọc và ghi điểm:

```json
{
  "rules": {
    "classScores": {
      ".read": true,
      ".write": true
    }
  }
}
```

7. Nhấn **Publish** để lưu Rules.

**Cảnh báo quan trọng:** Quy tắc trên cho phép bất kỳ ai truy cập được database đọc, thêm, sửa hoặc xóa dữ liệu trong `classScores`. Điều này phù hợp với yêu cầu “ai có link cũng chấm điểm”, nhưng link có thể bị chuyển tiếp và người khác có thể phá điểm. Chỉ dùng cho bảng điểm lớp không nhạy cảm; không ghi tên đầy đủ, số điện thoại hay thông tin riêng tư. Nếu cần chống phá, hãy dùng đăng nhập và giới hạn quyền ghi.

## Phần B — Đăng website miễn phí bằng GitHub Pages

1. Tạo tài khoản tại https://github.com/ nếu chưa có.
2. Tạo repository mới, ví dụ `bang-diem-thi-dua`. Có thể chọn **Public** để GitHub Pages miễn phí hoạt động thuận tiện.
3. Giải nén ZIP này trên máy tính. Tải **các file bên trong thư mục** (`index.html`, `style.css`, `app.js`, `firebase-config.js`) lên thư mục gốc của repository. Có thể tải cả `HUONG-DAN.md`.
4. Mở repository → **Settings → Pages**.
5. Trong **Build and deployment**, chọn **Deploy from a branch**; branch `main`, folder `/(root)`, rồi nhấn **Save**.
6. Chờ GitHub triển khai. Địa chỉ thường có dạng `https://TEN-TAI-KHOAN.github.io/bang-diem-thi-dua/`. Dùng chính URL GitHub hiển thị trong phần Pages.
7. Mở đường link đó. Nếu thấy trạng thái “Đã đồng bộ trực tuyến”, website đã kết nối database. Thử chấm một điểm và mở link trên điện thoại khác để kiểm tra dữ liệu có cập nhật không.

## Phần C — Tạo và tải mã QR

1. Mở website bằng URL HTTPS GitHub Pages chính thức.
2. Nhấn **Chia sẻ / Mã QR**.
3. Nhấn **Tải mã QR (PNG)** rồi in hoặc gửi ảnh cho các bạn.
4. Dùng camera điện thoại quét thử trước khi chia sẻ rộng rãi.

QR chỉ được tạo từ URL trang web hiện tại. Không tạo QR từ đường dẫn `file:///...` trên máy tính, vì các bạn khác sẽ không mở được.

## Kiểm tra lỗi thường gặp

- **“Chưa kết nối dữ liệu”**: kiểm tra `firebase-config.js` đã thay hết `YOUR_...` chưa; `databaseURL` phải đúng URL Realtime Database trong Firebase.
- **“Lỗi quyền truy cập”**: kiểm tra Rules đã Publish và đường dẫn database đúng.
- **Mở website nhưng thay đổi không đồng bộ**: mở đúng URL GitHub Pages trên cả hai thiết bị; kiểm tra kết nối mạng.
- **Sửa file mà web chưa đổi**: chờ GitHub Pages triển khai lại rồi tải mới trang (Ctrl+F5).

## Ghi chú

- Điểm ban đầu của 4 tổ là 0.
- Điểm cộng/trừ được tính từ nhật ký sự kiện; xóa dữ liệu database sẽ làm mất lịch sử và điểm.
- Lịch sử hiển thị tối đa 100 lượt mới nhất.
- Dự án dùng Firebase SDK và QRCode.js từ CDN, nên trình duyệt cần có Internet.
