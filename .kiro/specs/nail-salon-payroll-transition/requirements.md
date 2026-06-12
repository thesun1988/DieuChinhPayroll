# Requirements Document

## Introduction

Website hỗ trợ chủ tiệm nail gốc Việt tại Mỹ chuyển đổi phương thức trả lương nhân viên từ hình thức chia tỉ lệ cash/check (ví dụ: 50% check, 50% cash) sang 100% check. Tiệm nail thường hoạt động theo mô hình ăn chia (commission split) - ví dụ chủ nhận 4 phần, thợ nhận 6 phần doanh thu - và phần thu nhập của thợ được chia theo tỉ lệ cash/check. Mục đích chính là giảm thiểu rủi ro bị IRS audit, đồng thời cung cấp lộ trình chuyển đổi hợp lý, công cụ tính toán lương/thuế (hỗ trợ cả W-2 và 1099), và các khuyến cáo quan trọng. Giao diện hoàn toàn bằng tiếng Việt phục vụ đối tượng người dùng là chủ tiệm nail Việt Nam tại Mỹ.

## Glossary

- **Hệ_Thống**: Website hỗ trợ chuyển đổi payroll cho chủ tiệm nail
- **Chủ_Tiệm**: Người dùng chính của hệ thống, là chủ tiệm nail gốc Việt tại Mỹ
- **Công_Cụ_Tính_Lương**: Module tính toán lương, thuế, và chi phí liên quan
- **Lộ_Trình**: Kế hoạch chuyển đổi theo từng giai đoạn từ cash/check sang 100% check
- **IRS**: Internal Revenue Service - Cơ quan thuế liên bang Hoa Kỳ
- **Payroll**: Hệ thống trả lương nhân viên
- **Check**: Phương thức trả lương qua ngân phiếu có khai thuế đầy đủ (W-2)
- **Cash**: Phương thức trả lương bằng tiền mặt (thường không khai đầy đủ thuế)
- **Ăn_Chia**: Mô hình phân chia doanh thu giữa chủ tiệm và thợ (ví dụ: chủ 40%, thợ 60%)
- **W-2**: Hình thức lao động nhân viên chính thức (employee), chủ tiệm chịu trách nhiệm withhold thuế và đóng employer taxes
- **1099**: Hình thức lao động độc lập (independent contractor), thợ tự chịu trách nhiệm đóng thuế
- **Red_Flag**: Dấu hiệu bất thường có thể khiến IRS chú ý và tiến hành audit
- **Module_Khuyến_Cáo**: Phần hiển thị các lưu ý và cảnh báo về rủi ro IRS

## Requirements

### Requirement 1: Hiển thị lộ trình chuyển đổi

**User Story:** As a Chủ_Tiệm, I want to xem lộ trình chuyển đổi từ cash/check sang 100% check theo từng giai đoạn, so that I can lập kế hoạch chuyển đổi hợp lý mà không gây nghi ngờ cho IRS.

#### Acceptance Criteria

1. WHEN Chủ_Tiệm nhập tỉ lệ Ăn_Chia và tỉ lệ cash/check hiện tại, THE Hệ_Thống SHALL hiển thị lộ trình chuyển đổi theo từng giai đoạn với thời gian cụ thể cho mỗi bước.
2. THE Hệ_Thống SHALL đề xuất lộ trình chuyển đổi tối thiểu 3 giai đoạn trong khoảng 6-12 tháng.
3. WHEN tỉ lệ cash hiện tại lớn hơn 60%, THE Hệ_Thống SHALL đề xuất lộ trình dài hơn (12-18 tháng) để giảm thiểu Red_Flag.
4. THE Hệ_Thống SHALL hiển thị mỗi giai đoạn với tỉ lệ check/cash mục tiêu, thời gian thực hiện, và ghi chú hướng dẫn.
5. IF Chủ_Tiệm nhập tỉ lệ cash ngoài phạm vi 0-100%, THEN THE Hệ_Thống SHALL hiển thị thông báo lỗi yêu cầu nhập lại giá trị hợp lệ.

### Requirement 2: Công cụ tính toán lương và thuế theo mô hình ăn chia

**User Story:** As a Chủ_Tiệm, I want to tính toán chi phí lương và thuế dựa trên mô hình ăn chia (commission split) khi chuyển sang 100% check, so that I can ước lượng chi phí tăng thêm và chuẩn bị tài chính.

#### Acceptance Criteria

1. WHEN Chủ_Tiệm nhập doanh thu trung bình, tỉ lệ Ăn_Chia (ví dụ: chủ 40% / thợ 60%), số thợ, và tỉ lệ cash/check hiện tại, THE Công_Cụ_Tính_Lương SHALL tính toán phần thu nhập của thợ và chi phí thuế tương ứng.
2. THE Công_Cụ_Tính_Lương SHALL cho phép Chủ_Tiệm chọn hình thức lao động cho thợ: W-2 (employee) hoặc 1099 (independent contractor).
3. WHEN hình thức W-2 được chọn, THE Công_Cụ_Tính_Lương SHALL tính toán các khoản thuế employer bao gồm Social Security (6.2%), Medicare (1.45%), Federal Unemployment Tax (FUTA), và State Unemployment Tax (SUTA).
4. WHEN hình thức W-2 được chọn, THE Công_Cụ_Tính_Lương SHALL tính toán các khoản thuế employee bao gồm Federal Income Tax, State Income Tax, Social Security (6.2%), và Medicare (1.45%).
5. WHEN hình thức 1099 được chọn, THE Công_Cụ_Tính_Lương SHALL tính toán thuế Self-Employment Tax (15.3%) và estimated quarterly tax mà thợ phải tự đóng.
6. WHEN hình thức 1099 được chọn, THE Công_Cụ_Tính_Lương SHALL hiển thị lưu ý rằng chủ tiệm không cần withhold thuế nhưng phải nộp Form 1099-NEC nếu trả từ $600 trở lên trong năm.
7. THE Công_Cụ_Tính_Lương SHALL hiển thị so sánh chi phí giữa trước và sau chuyển đổi theo từng giai đoạn của Lộ_Trình, bao gồm cả phần chủ và phần thợ.
8. THE Công_Cụ_Tính_Lương SHALL hiển thị so sánh chi phí giữa hình thức W-2 và 1099 để Chủ_Tiệm đánh giá phương án phù hợp.
9. WHEN Chủ_Tiệm thay đổi bất kỳ thông số đầu vào nào, THE Công_Cụ_Tính_Lương SHALL cập nhật kết quả tính toán trong vòng 1 giây.
10. IF Chủ_Tiệm nhập tỉ lệ ăn chia cho thợ mà phần thu nhập quy đổi theo giờ thấp hơn mức lương tối thiểu liên bang ($7.25/giờ), THEN THE Công_Cụ_Tính_Lương SHALL hiển thị cảnh báo về vi phạm luật lao động (chỉ áp dụng cho hình thức W-2).
11. THE Công_Cụ_Tính_Lương SHALL cho phép Chủ_Tiệm chọn bang (state) để áp dụng thuế SUTA và State Income Tax phù hợp.
12. THE Công_Cụ_Tính_Lương SHALL cho phép nhập tỉ lệ Ăn_Chia tùy chỉnh (ví dụ: 4/6, 5/5, 3/7).

### Requirement 3: Khuyến cáo tránh Red Flag cho IRS

**User Story:** As a Chủ_Tiệm, I want to xem các khuyến cáo và lưu ý quan trọng khi chuyển đổi, so that I can tránh những hành vi có thể gây Red_Flag cho IRS audit.

#### Acceptance Criteria

1. THE Module_Khuyến_Cáo SHALL hiển thị danh sách các hành vi gây Red_Flag phổ biến liên quan đến payroll trong ngành nail salon.
2. THE Module_Khuyến_Cáo SHALL cung cấp hướng dẫn cụ thể cho từng Red_Flag về cách phòng tránh.
3. THE Module_Khuyến_Cáo SHALL bao gồm khuyến cáo về việc thay đổi tỉ lệ cash/check đột ngột (ví dụ: từ 70% cash xuống 0% trong 1 tháng).
4. THE Module_Khuyến_Cáo SHALL bao gồm khuyến cáo về việc giữ hồ sơ lương đầy đủ (pay stubs, W-2, 1099).
5. THE Module_Khuyến_Cáo SHALL bao gồm khuyến cáo về tip reporting và cách xử lý tiền tip đúng quy định IRS.
6. THE Module_Khuyến_Cáo SHALL hiển thị disclaimer rằng thông tin trên website chỉ mang tính tham khảo và Chủ_Tiệm nên tham vấn CPA hoặc luật sư thuế.
7. WHILE Chủ_Tiệm đang xem bất kỳ trang nào của Hệ_Thống, THE Hệ_Thống SHALL hiển thị banner nhắc nhở về tầm quan trọng của việc tham vấn chuyên gia thuế.

### Requirement 4: Giao diện tiếng Việt

**User Story:** As a Chủ_Tiệm, I want to sử dụng website hoàn toàn bằng tiếng Việt, so that I can hiểu rõ mọi thông tin và hướng dẫn mà không gặp rào cản ngôn ngữ.

#### Acceptance Criteria

1. THE Hệ_Thống SHALL hiển thị toàn bộ nội dung giao diện bằng tiếng Việt bao gồm menu, nút bấm, nhãn, và thông báo.
2. THE Hệ_Thống SHALL sử dụng thuật ngữ thuế và lương bằng tiếng Việt kèm theo thuật ngữ tiếng Anh gốc trong ngoặc (ví dụ: "Thuế thu nhập liên bang (Federal Income Tax)").
3. THE Hệ_Thống SHALL hiển thị số tiền theo định dạng USD ($X,XXX.XX).
4. THE Hệ_Thống SHALL hỗ trợ responsive design cho thiết bị di động và máy tính bàn.
5. IF Chủ_Tiệm truy cập Hệ_Thống từ thiết bị có chiều rộng màn hình nhỏ hơn 768px, THEN THE Hệ_Thống SHALL hiển thị giao diện tối ưu cho di động với menu hamburger.

### Requirement 5: Lưu trữ và quản lý dữ liệu người dùng

**User Story:** As a Chủ_Tiệm, I want to lưu lại thông tin tính toán, so that I can xem lại và theo dõi tiến trình chuyển đổi.

#### Acceptance Criteria

1. THE Hệ_Thống SHALL lưu trữ dữ liệu tính toán của Chủ_Tiệm trên trình duyệt (localStorage) mà không yêu cầu tạo tài khoản.
2. WHEN Chủ_Tiệm quay lại Hệ_Thống, THE Hệ_Thống SHALL tự động tải lại dữ liệu đã lưu trước đó.
3. THE Hệ_Thống SHALL cho phép Chủ_Tiệm xuất kết quả tính toán dưới dạng PDF bằng tiếng Việt.
4. THE Hệ_Thống SHALL cho phép Chủ_Tiệm xóa toàn bộ dữ liệu đã lưu khi cần.
5. THE Hệ_Thống SHALL hiển thị thông báo xác nhận trước khi xóa dữ liệu đã lưu.

### Requirement 6: Hướng dẫn phân loại hình thức lao động (W-2 vs 1099)

**User Story:** As a Chủ_Tiệm, I want to hiểu sự khác biệt giữa W-2 và 1099, so that I can chọn đúng hình thức lao động cho thợ và tránh bị IRS phạt vì misclassification.

#### Acceptance Criteria

1. THE Hệ_Thống SHALL cung cấp bảng so sánh chi tiết giữa hình thức W-2 (employee) và 1099 (independent contractor) bao gồm trách nhiệm thuế, quyền lợi, và rủi ro.
2. THE Hệ_Thống SHALL cung cấp checklist giúp Chủ_Tiệm xác định thợ nail thuộc dạng W-2 hay 1099 dựa trên tiêu chí IRS (quyền kiểm soát lịch làm việc, cung cấp dụng cụ, phương thức trả lương).
3. THE Hệ_Thống SHALL hiển thị cảnh báo rằng việc phân loại sai (misclassification) có thể dẫn đến phạt nặng từ IRS bao gồm back taxes, penalties, và interest.
4. THE Hệ_Thống SHALL giải thích mô hình Ăn_Chia phổ biến trong ngành nail (ví dụ: chủ 4 phần / thợ 6 phần) và cách khai thuế đúng cho mô hình này.
5. WHEN Chủ_Tiệm chọn mô hình Ăn_Chia, THE Hệ_Thống SHALL đề xuất hình thức lao động phù hợp dựa trên mức độ kiểm soát của chủ tiệm đối với thợ.

### Requirement 7: Miễn trừ trách nhiệm và bảo vệ dữ liệu cá nhân

**User Story:** As a Chủ_Tiệm, I want to biết rõ giới hạn trách nhiệm của website và cách dữ liệu của tôi được xử lý, so that I can yên tâm sử dụng website mà không lo ngại về trách nhiệm pháp lý hoặc rò rỉ thông tin cá nhân.

#### Acceptance Criteria

1. THE Hệ_Thống SHALL hiển thị trang Miễn trừ trách nhiệm (Disclaimer) nêu rõ rằng mọi thông tin trên website chỉ mang tính chất tham khảo và không cấu thành tư vấn tài chính, thuế, hoặc pháp lý.
2. THE Hệ_Thống SHALL hiển thị khuyến cáo rằng Chủ_Tiệm nên tham vấn CPA (Certified Public Accountant) hoặc luật sư thuế trước khi đưa ra bất kỳ quyết định tài chính nào.
3. THE Hệ_Thống SHALL nêu rõ rằng website không chịu trách nhiệm pháp lý về bất kỳ tổn thất hoặc hậu quả nào phát sinh từ việc sử dụng thông tin trên website.
4. WHEN Chủ_Tiệm truy cập Hệ_Thống lần đầu tiên, THE Hệ_Thống SHALL hiển thị thông báo miễn trừ trách nhiệm yêu cầu Chủ_Tiệm xác nhận đã đọc và hiểu trước khi sử dụng.
5. THE Hệ_Thống SHALL cam kết không thu thập, lưu trữ trên server, hoặc chia sẻ bất kỳ dữ liệu cá nhân nào của Chủ_Tiệm với bên thứ ba.
6. THE Hệ_Thống SHALL nêu rõ rằng mọi dữ liệu tính toán chỉ được lưu trữ trên trình duyệt (localStorage) của thiết bị Chủ_Tiệm và không được truyền đến bất kỳ máy chủ nào.
7. THE Hệ_Thống SHALL hiển thị trang Chính sách bảo mật (Privacy Policy) mô tả rõ ràng cách xử lý dữ liệu bao gồm: không sử dụng cookies theo dõi, không tích hợp analytics bên thứ ba thu thập dữ liệu cá nhân, và không yêu cầu đăng nhập hoặc tạo tài khoản.
8. WHILE Chủ_Tiệm đang sử dụng Hệ_Thống, THE Hệ_Thống SHALL không gửi bất kỳ dữ liệu nhập liệu nào (doanh thu, số thợ, tỉ lệ ăn chia) đến máy chủ bên ngoài.
