# Project Directives & Rules

## Autonomous Command & Build Execution
- **Tự động chạy lệnh không cần hỏi**: Khi cần thực thi bất kỳ lệnh PowerShell, terminal, script kiểm tra, kiểm tra database hoặc lệnh build (`dotnet build`, `npm run build`, `npm run lint`,...), Agent luôn **chủ động tự động chạy ngay lập tức** mà **không cần hỏi ý kiến hay chờ người dùng xác nhận**.
- **Chủ động debug và sửa lỗi**: Khi một lệnh build hoặc script gặp lỗi, Agent tự động phân tích output, xác định nguyên nhân và tiến hành chỉnh sửa mã nguồn rồi chạy lại để kiểm chứng kết quả.
- **Báo cáo kết quả trực tiếp**: Sau khi thực hiện xong các bước và lệnh cần thiết, tóm tắt trực tiếp kết quả và giải pháp cho người dùng.
