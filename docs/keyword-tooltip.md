# Chú giải từ khóa trong bài viết

Trong bài viết ở chế độ Markdown, bọc cụm từ bằng thẻ `<keyword>` để hiện chú giải khi khách truy cập rê chuột vào hoặc chuyển tiêu điểm bàn phím đến cụm từ đó.

## Cách chèn

1. Mở bài viết trong Payload CMS.
2. Đặt **Chế độ nội dung** thành **Văn bản thường (Markdown)**.
3. Trong trường **Nội dung**, đặt đoạn mã sau tại vị trí cần chú giải và thay nội dung mẫu:

```html
<keyword
  data-title="Thánh Lễ Chúa Nhật"
  data-description="Thánh lễ hằng tuần cử hành mầu nhiệm Chúa Phục Sinh."
  data-image="https://example.org/media/thanh-le.jpg"
  data-href="/duong-dan-bai-viet-lien-quan"
>
  Thánh Lễ Chúa Nhật
</keyword>
```

| Thuộc tính         | Bắt buộc | Cách dùng                                                                                 |
| ------------------ | -------- | ----------------------------------------------------------------------------------------- |
| `data-title`       | Nên có   | Tiêu đề trong thẻ chú giải.                                                               |
| `data-description` | Nên có   | Định nghĩa hoặc phần giải thích ngắn.                                                     |
| `data-image`       | Không    | URL ảnh trong thư viện Media của Payload. Ảnh được tối ưu tự động trên trang.             |
| `data-href`        | Không    | Đường dẫn đến trang liên quan. Khi có đường dẫn, thẻ chú giải hiện liên kết **Xem thêm**. |

Phần chữ giữa `<keyword>` và `</keyword>` là cụm từ khách truy cập thấy trong bài viết. Có thể bọc một từ hoặc một cụm từ. Dùng URL ảnh và đường dẫn bài viết thật thay cho các giá trị mẫu ở trên.

## Kiểm tra kết quả

Trình soạn thảo Markdown chỉ hiển thị vùng nhập liệu, không mở thẻ chú giải tương tác. Lưu bài viết rồi mở trang bài viết để kiểm tra nội dung, ảnh và liên kết. Khách truy cập có thể mở chú giải bằng cách rê chuột hoặc đưa tiêu điểm bàn phím đến cụm từ.

## Tên thuộc tính trong nội dung cũ

Nội dung hiện có cũng có thể dùng `title`, `description`, `image`, `data-image-url` và `href`. Với nội dung mới, hãy dùng các tên `data-*` trong ví dụ để thống nhất.
