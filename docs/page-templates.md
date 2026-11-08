# Design Document: Post & Page Content Template System

**Author**: Antigravity AI  
**Date**: 2026-09-13  
**Status**: Revised / In Review

---

## 1. Executive Summary

Currently, editors publishing articles on the Đa Minh Gò Vấp website must manually write complex raw HTML and embedded `<style>` tags directly into the markdown `body` field whenever a post requires special layout or rich styling (e.g., Gospel Reflections with side-by-side Scripture, Saint timelines, bilingual quote columns, vertical video intentions, image galleries with lightboxes, etc.).

This causes major operational and technical issues:

- Non-technical editors struggle to write or edit raw HTML/CSS without breaking layouts.
- Inconsistent styles, conflicting inline CSS variables, and lack of responsiveness.
- Hardcoded media URLs bypassing Cloudflare CDN image optimization (`transformUrl`).
- Fragile markup that risks rendering errors on mobile screens.

This document proposes a **Structured Content Template System** for Payload CMS 3 and Next.js 15. Instead of composing raw HTML, editors can choose between three clear content modes:

1. **Markdown**: Standard single markdown editor for traditional prose articles.
2. **Template**: A structured template selected from a curated library of 11 purposeful templates with dedicated fields, layout previews, and zero HTML required.
3. **Blocks**: Freeform block composition where editors can mix and match all available blocks across the design system.

> [!IMPORTANT]
> **No Built-in RichText**: In accordance with project conventions, all formatted text areas strictly use the project's custom `markdownField` component instead of Payload's default Lexical richText.

---

## 2. Content Modes Architecture

In Payload CMS (`src/payload/collections/posts.ts`), the post editor presents a clear mode switcher:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Chế độ nội dung (Content Mode):                                         │
│ ( ) Văn bản thường (Markdown)                                          │
│ (•) Mẫu định dạng sẵn (Template)                                       │
│ ( ) Ghép khối tự do (Blocks)                                           │
└────────────────────────────────────────────────────────────────────────┘
```

- **Markdown Mode**: Exposes the standard localized `body` markdown field.
- **Template Mode**: Exposes a single `template` polymorphic blocks field (`maxRows: 1`). The editor clicks "Chọn mẫu bài viết" (Select Template), views visual thumbnails and descriptions, and selects one of the 11 templates. Only the specific fields for that template appear.
- **Blocks Mode**: Exposes a multi-row `blocks` field allowing full freeform stacking of all content blocks (accordion, image galleries, quotes, timeline, video grids, etc.).

---

## 3. Template Catalog & Visual Layout Specifications

Below is the complete specification for each of the 11 templates, including visual ASCII wireframes, field schema, and descriptions.

---

### Template 1: Gospel Reflection (Split Layout) / _Suy Niệm Lời Chúa - Bố Cục Phân Tách_

- **Slug**: `gospel-reflection-split`
- **Category**: Suy Niệm / Phụng Vụ
- **Use Case**: Daily and Sunday gospel reflections featuring a two-column desktop layout with meditation on the left and a sticky Gospel reading card on the right.

#### Visual Layout Wireframe

```
+-----------------------------------------------------------------------+
|  [ Ngày Lễ Phụng Vụ (liturgyDate) ]  -  [ Tuần Lễ (liturgyWeek) ]      |
+-----------------------------------------------------------------------+
|  DESKTOP (2 Columns: 1fr / 340px)                                     |
|  +-------------------------------------+  +-------------------------+ |
|  | [ Câu Lời Chúa Trọng Tâm (keyVerse)]|  | [ Tin Mừng (passage) ]  | |
|  |                                     |  |                         | |
|  | [ Bài Suy Niệm (reflection) ]       |  | [ Nội Dung Bài Đọc ]    | |
|  | - Đoạn văn 1                        |  | v1. Không ai lên trời.. | |
|  | - Đoạn văn 2                        |  | v2. Như Môsê giương...  | |
|  |                                     |  |                         | |
|  | +---------------------------------+ |  | [ Nguồn Bản Dịch ]      | |
|  | | Lời Nguyện Kết (prayer)         | |  |                         | |
|  | +---------------------------------+ |  +-------------------------+ |
|  +-------------------------------------+                              |
|                                                                       |
|  [ Tác giả: author ]  -  [ Thực hiện: productionUnit ]                |
+-----------------------------------------------------------------------+
```

#### Parameters / Fields

All formatted text fields use `markdownField`.

1. `liturgyDate` (Text, required): e.g. "Thứ Hai, 14/09/2026"
2. `liturgyWeek` (Text, required): e.g. "Thứ Hai tuần XXIV Mùa Thường Niên"
3. `keyVerse` (Text, optional): Opening focus scripture quote (e.g. "Thiên Chúa yêu thế gian đến nỗi đã ban Con Một...")
4. `reflection` (`markdownField`, required): Main meditation text
5. `prayer` (`markdownField`, optional): Concluding prayer box
6. `gospel` (Group, required):
   - `passage` (Text, required): Scripture reference (e.g. "Ga 3,13-17")
   - `reading` (`markdownField`, required): Gospel text with verse numbers
   - `translationCredit` (Text, optional): e.g. "Bản dịch của Nhóm Các Giờ Kinh Phụng Vụ"
7. `author` (Text, optional): Author name (e.g. "Nữ tu Maria Đinh Thị Oanh")
8. `productionUnit` (Text, optional): Ministry or unit (e.g. "Ban Truyền thông Dòng Nữ Đa Minh Gò Vấp")

---

### Template 2: Gospel Reflection (Card Layout) / _Suy Niệm Lời Chúa - Thẻ Tích Hợp_

- **Slug**: `gospel-reflection-card`
- **Category**: Suy Niệm / Phụng Vụ
- **Use Case**: Elegant single-column card meditation with Spotify podcast audio player, optional hero illustration, and expandable Gospel excerpt.

#### Visual Layout Wireframe

```
+-----------------------------------------------------------------------+
|  [ Ngày & Tuần Phụng Vụ (liturgyMeta) ]           [ Xem Tin Mừng v ]  |
+-----------------------------------------------------------------------+
|  [ Hình Minh Họa (image - optional) ]                                 |
|  +-----------------------------------------------------------------+  |
|  |                     (16:9 Banner Image)                         |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  [ Spotify Podcast Player (spotifyUrl - required) ]                   |
|  +-----------------------------------------------------------------+  |
|  | [> Play]  Suy Niệm Lời Chúa (Spotify Embed)            [ 12:45 ]|  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  [ Nội Dung Suy Niệm (body - markdownField) ]                          |
|  Đoạn văn bài chia sẻ tâm tình, suy tư Lời Chúa...                    |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | Tác giả: author                 |  Giọng đọc: audioReader       |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

#### Parameters / Fields

1. `liturgyMeta` (Text, required): e.g. "THỨ HAI, 14/09/2026 — Tuần XXIV Mùa Thường Niên"
2. `image` (Upload -> Media, optional): Hero image for the meditation card
3. `spotifyUrl` (Text, required): Spotify podcast episode or track URL / embed ID
4. `gospel` (Group, optional):
   - `reference` (Text): e.g. "Ga 3,13-17"
   - `content` (`markdownField`): Scripture reading text
5. `body` (`markdownField`, required): Reflection paragraphs
6. `author` (Text, optional): e.g. "Paulthem, CSC"
7. `audioReader` (Text, optional): e.g. "Phan Anh"

---

### Template 3: Saint Biography & Timeline / _Tiểu Sử Vị Thánh & Dòng Thời Gian_

- **Slug**: `saint-biography`
- **Category**: Vị Thánh / Lịch Sử
- **Use Case**: Feast day profile celebrating a Saint with portrait header, 3 grouped main sections (biography timeline, virtues & teachings, and prayer), followed by citations.

#### Visual Layout Wireframe

```
+-----------------------------------------------------------------------+
|  +--------+   THÁNH GIOAN KIM KHẨU (saintName)                        |
|  | (Avatar|   Giám mục - Tiến sĩ Hội Thánh (saintTitle)               |
|  | Portrait)  Kính nhớ ngày 13/9 (feastDay)                           |
|  +--------+                                                           |
+-----------------------------------------------------------------------+
|  PHẦN 1: DÒNG THỜI GIAN (timeline)                                    |
|   (o) 347       : Xuất thân tại Antiôkia...                           |
|    |                                                                  |
|   (o) 386       : Thụ phong Linh mục...                               |
|    |                                                                  |
|   (o) 398       : Tấn phong Giám mục Constantinople...                |
+-----------------------------------------------------------------------+
|  PHẦN 2: GƯƠNG NHÂN ĐỨC (virtues - array of paragraphs)               |
|  * Tiêu đề 1: Người cha của người nghèo                              |
|    Nội dung chi tiết về lòng bác ái của vị thánh...                  |
|  * Tiêu đề 2: Lời vàng bảo vệ chân lý                                |
|    Nội dung các bài giảng thuyết và giáo huấn...                      |
+-----------------------------------------------------------------------+
|  PHẦN 3: LỜI NGUYỆN (prayer)                                          |
|  +-----------------------------------------------------------------+  |
|  | Lạy Thánh Gioan Kim Khẩu, xin cầu bầu cho chúng con...          |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
|  Tài liệu tham khảo (references)                                      |
+-----------------------------------------------------------------------+
```

#### Parameters / Fields

1. `saintName` (Text, required): e.g. "THÁNH GIOAN KIM KHẨU"
2. `saintTitle` (Text, required): e.g. "Giám mục - Tiến sĩ Hội Thánh"
3. `feastDay` (Text, required): e.g. "Kính nhớ ngày 13/9"
4. `portrait` (Upload -> Media, required): Portrait image
5. `mainContent` (Group, required):
   - `timeline` (Array of items):
     - `periodOrYear` (Text, required): e.g. "Năm 347", "Thời niên thiếu"
     - `description` (Text, required): Event description
   - `virtues` (Array of items):
     - `title` (Text, required): Virtue or section title
     - `body` (`markdownField`, required): Paragraph content
   - `prayer` (`markdownField`, optional): Saint intercessory prayer
6. `references` (`markdownField`, optional): Bibliography / source links

---

### Template 4: Vertical Video & Prayer Intention / _Video Dọc & Ý Chỉ Cầu Nguyện_

- **Slug**: `vertical-video-prayer`
- **Category**: Cầu Nguyện / Sứ Vụ
- **Use Case**: Two-column layout optimized for 9:16 vertical video intentions (YouTube Shorts / Reels) on one side and liturgical intention text on the other.

#### Visual Layout Wireframe

```
+-----------------------------------------------------------------------+
|  DESKTOP (2 Columns: 400px / 1fr)                                     |
|  +--------------------+  +------------------------------------------+ |
|  |                    |  | [ Ý Chỉ Cầu Nguyện (intentionPrayer) ]   | |
|  |    9:16 Video      |  | Lạy Chúa, chúng con dâng lên Chúa trái   | |
|  |    (YouTube Shorts |  | đất thân yêu với những dòng sông...      | |
|  |     / Reels Embed) |  |                                          | |
|  |                    |  | +--------------------------------------+ | |
|  |                    |  | | [ Câu Lời Chúa Trọng Tâm ]           | | |
|  |                    |  | | "ĐỨC CHÚA là Thiên Chúa đem con người| | |
|  |                    |  | |  đặt vào vườn Êđen..." (St 2,15)     | | |
|  |                    |  | +--------------------------------------+ | |
|  +--------------------+  +------------------------------------------+ |
+-----------------------------------------------------------------------+
```

#### Parameters / Fields

1. `video` (Group, required):
   - `type` (Select: "youtube" | "facebook", default: "youtube")
   - `videoId` (Text, required): e.g. "oBh8b7tH9BY"
2. `intentionPrayer` (`markdownField`, required): Prayer intention text
3. `scriptureAnchor` (Group, optional):
   - `verse` (Text): Bible verse
   - `reference` (Text): Scripture citation (e.g. "St 2,15")

---

### Template 5: News Article with Featured Lightbox / _Bản Tin Giáo Hội & Ảnh Nổi_

- **Slug**: `news-article-featured`
- **Category**: Bản Tin / Tin Tức Giáo Hội
- **Use Case**: Professional news dispatch with floated featured image, click-to-zoom accessible lightbox, editorial paragraphs, and source citation.

#### Visual Layout Wireframe

```
+-----------------------------------------------------------------------+
|  +----------------------+  [ Nội Dung Bản Tin (content) ]             |
|  |  Featured Image      |  Đoạn mở đầu bản tin thời sự Giáo Hội...   |
|  |  (Click for Lightbox)|                                             |
|  |  [Caption text]      |  Các phán quyết, thông cáo chính thức từ    |
|  +----------------------+  Tòa Thượng thẩm và Vatican...              |
|                                                                       |
|  Đoạn tiếp nối nội dung bản tin trải rộng toàn trang...               |
|                                                                       |
|  Nguồn tin: sourceName (sourceUrl)                                    |
+-----------------------------------------------------------------------+
```

#### Parameters / Fields

1. `featuredImage` (Upload -> Media, required): Featured image
2. `imageCaption` (Text, optional): Image caption
3. `imageAlignment` (Select: "left" | "right" | "center", default: "left")
4. `content` (`markdownField`, required): News article text
5. `sourceName` (Text, optional): e.g. "Rome Reports"
6. `sourceUrl` (Text, optional): Link to original news source

---

### Template 6: Event Report & Photo Gallery / _Bản Tin Sự Kiện & Thư Viện Ảnh_

- **Slug**: `event-gallery-report`
- **Category**: Bản Tin / Sinh Hoạt Hội Dòng
- **Use Case**: Event reports (retreats, workshops, feast days) with title, subtitle, narrative sections interspersed with 2-column or 3-column responsive photo galleries with interactive lightboxes.

#### Visual Layout Wireframe

```
+-----------------------------------------------------------------------+
|  TIÊU ĐỀ SỰ KIỆN: NHỊP CẦU YÊU THƯƠNG (eventTitle)                    |
|  Chủ đề: Tổng kết môn học Nghệ thuật tương tác... (eventSubtitle)     |
+-----------------------------------------------------------------------+
|  [ Mục 1: Nội dung tường thuật (narrative - markdownField) ]          |
|  Tối thứ Sáu ngày 10.09.2026, Thỉnh viện Têrêsa đã tổ chức...        |
|                                                                       |
|  [ Thư Viện Ảnh (2 Cột hoặc 3 Cột) ]                                 |
|  +---------------------------+   +---------------------------+        |
|  | [ Hình 1 ] (Click to zoom)|   | [ Hình 2 ] (Click to zoom)|        |
|  | Chú thích hình 1          |   | Chú thích hình 2          |        |
|  +---------------------------+   +---------------------------+        |
|                                                                       |
|  [ Mục 2: Phần tiếp theo... ]                                         |
|                                                                       |
|  Ban Truyền thông thực hiện (credits)                                 |
+-----------------------------------------------------------------------+
```

#### Parameters / Fields

1. `eventTitle` (Text, required): e.g. "NHỊP CẦU YÊU THƯƠNG"
2. `eventSubtitle` (Text, optional): Subtitle or theme description
3. `sections` (Array, required):
   - `narrative` (`markdownField`): Narrative section
   - `photos` (Array of Upload -> Media with caption): Images to render
   - `columns` (Select: "2" | "3" | "4", default: "2"): Grid columns
4. `credits` (Text, optional): Reporter or photographer attribution

---

### Template 7: Catechism Q&A Series / _Hiểu Để Yêu - Chuyên Đề Giáo Lý_

- **Slug**: `catechism-qa-series`
- **Category**: Chuyên Đề / Giáo Lý
- **Use Case**: Catechetical series (e.g. "Hiểu để yêu") answering faith and liturgy questions with icon-badged sections and clear, structured explanations.

#### Visual Layout Wireframe

```
+-----------------------------------------------------------------------+
|  TIÊU ĐỀ BÀI HỎI ĐÁP: AMEN LÀ GÌ? (title)                             |
|  Lời mở đầu (introduction - markdownField):                           |
|  Là người Công giáo, chắc chắn chúng ta không lạ gì với từ Amen...    |
+-----------------------------------------------------------------------+
|  [ Mục 1 ] [Icon: 📖]  Tiêu đề: Nguồn gốc từ "Amen" (item.title)     |
|  Nội dung giải thích (item.body - markdownField):                     |
|  Amen là một từ có nguồn gốc từ tiếng Hípri...                       |
+-----------------------------------------------------------------------+
|  [ Mục 2 ] [Icon: 📜]  Tiêu đề: "Amen" trong Kinh Thánh               |
|  Nội dung giải thích (item.body - markdownField):                     |
|  1. Trong Cựu Ước: Lời xác nhận giao ước...                           |
|  2. Trong Tân Ước: Đức Giêsu là Đấng Amen...                          |
+-----------------------------------------------------------------------+
|  Ban Mục vụ Giáo lý Hội Dòng (credits)                                |
+-----------------------------------------------------------------------+
```

#### Parameters / Fields

1. `title` (Text, required): e.g. "AMEN LÀ GÌ?"
2. `introduction` (`markdownField`, required): Conversational opening
3. `items` (Array, required):
   - `icon` (Text / Select, default: "📖"): Icon or emoji (📖, 📜, ✝️, 💡, etc.)
   - `title` (Text, required): Section title
   - `body` (`markdownField`, required): Section explanation
4. `credits` (Text, optional): Ministry or author credit

---

### Template 8: Kids Bible Story / _Bé Và Lời - Câu Chuyện Kinh Thánh_

- **Slug**: `kids-bible-story`
- **Category**: Chuyên Đề / Thiếu Nhi
- **Use Case**: Youth & children's biblical formation with story title, takeaway subtitle, summary card, golden memory verse, and presentation credits.

#### Visual Layout Wireframe

```
+-----------------------------------------------------------------------+
|  TIÊU ĐỀ: NGÔN SỨ ÊLIA – NGƯỜI DÁM ĐỨNG VỀ PHÍA CHÚA (title)          |
|  Phụ đề: Dù chỉ có một mình, Êlia vẫn can đảm tin tưởng... (subtitle) |
+-----------------------------------------------------------------------+
|  +-----------------------------------------------------------------+  |
|  | KHÁM PHÁ CÂU CHUYỆN (summaryCard.intro)                         |  |
|  | - Điểm ghi nhớ 1: Can đảm nói sự thật (takeaways[0])            |  |
|  | - Điểm ghi nhớ 2: Lắng nghe tiếng Chúa qua gió nhẹ (takeaways[1])| |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  [ CÂU CHUYỆN (markdownField) ]                                       |
|  Kể lại toàn bộ diễn biến câu chuyện ngôn sứ Êlia và các tư tế...     |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | LỜI CHÚA GHI NHỚ (memoryQuote)                                  |  |
|  | "Hãy can đảm làm điều đúng, dù chỉ một mình, vì Chúa ở bên ta"  |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  Người trình bày: Sơ Thoa (presenter)                                 |
|  Đơn vị thực hiện: Ban Truyền thông (productionUnit)                  |
+-----------------------------------------------------------------------+
```

#### Parameters / Fields

1. `title` (Text, required): Story title (e.g. "Ngôn sứ Êlia – Người dám đứng về phía Chúa")
2. `subtitle` (Text, required): Lesson takeaway summary
3. `summaryCard` (Group, optional):
   - `intro` (Text): Card intro text
   - `takeaways` (Array of Text strings): Bullet takeaways
4. `content` (`markdownField`, required): Narrative storytelling text
5. `memoryQuote` (Text, optional): Memory scripture verse or golden quote
6. `credits` (Group, optional):
   - `presenter` (Text): Presenter / storyteller name (e.g. "Nữ tu Maria Nguyễn Thị Thu Thoa")
   - `productionUnit` (Text): Ministry team (e.g. "Ban Truyền thông Hội Dòng")

---

### Template 9: Parable & Moral Lesson / _Chuyện Ngụ Ngôn & Bài Học Cuộc Sống_

- **Slug**: `parable-life-lesson`
- **Category**: Chuyên Đề / Bài Học Cuộc Sống
- **Use Case**: Moral fables and character-building stories constructed as an array of flexible content blocks (body text, scripture anchor, and callouts).

#### Visual Layout Wireframe

```
+-----------------------------------------------------------------------+
|  [ Khối 1: Body (markdownField) ]                                     |
|  Trong một đồng cỏ xinh đẹp, đàn ong sống với nhau rất vui vẻ...      |
|  Một ngày nọ hai chú ong va vào nhau, chú ong nổi giận và bỏ đi...    |
+-----------------------------------------------------------------------+
|  [ Khối 2: Scripture Anchor ]                                         |
|  +-----------------------------------------------------------------+  |
|  | "Thầy không bảo là đến bảy lần, nhưng là đến bảy mươi lần bảy."|  |
|  |                                                 -- Mt 18,21-22  |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
|  [ Khối 3: Callout (Text) ]                                           |
|  ! Ghi nhớ: Tha thứ không làm chúng ta yếu đi, nhưng giúp trái tim    |
|    trở nên tự do và bình an.                                          |
+-----------------------------------------------------------------------+
|  Chuyển ngữ: translator  -  Nguồn: source (sourceUrl)                 |
+-----------------------------------------------------------------------+
```

#### Parameters / Fields

1. `contents` (Array of Blocks/Objects, required):
   - `type` (Select: "body" | "scripture" | "callout")
   - `content` (`markdownField` if "body", Text if "callout")
   - `verse` (Text, only if "scripture"): Bible verse quote
   - `reference` (Text, only if "scripture"): Bible citation (e.g. "Mt 18,21-22")
2. `translator` (Text, optional): Translator name (e.g. "Nữ tu Maria Nguyễn Thị Mai Hiên")
3. `source` (Group, optional):
   - `name` (Text): e.g. "Latter Day Kids"
   - `url` (Text): Source link

---

### Template 10: Bilingual Quote Card / _Danh Ngôn Song Ngữ_

- **Slug**: `bilingual-quote-card`
- **Category**: Văn Hóa / Suy Tư / Danh Ngôn
- **Use Case**: Side-by-side or stacked comparative quote card with serif typography, decorative quotation marks, language badges, and citations.

#### Visual Layout Wireframe

```
+-----------------------------------------------------------------------+
|  Tác giả: author  |  Nguồn: source                                    |
+-----------------------------------------------------------------------+
|  DESKTOP (2 Columns side-by-side / Mobile stacked)                    |
|  +---------------------------------+ +------------------------------+ |
|  | “                               | | “                            | |
|  | Don't cry over the past,       | | Đừng khóc vì quá khứ,        | |
|  | it's gone. Live in the present  | | nó đã qua rồi. Hãy sống cho  | |
|  | and make it beautiful.          | | hiện tại và làm nó tươi đẹp. | |
|  |                               ” | |                            ” | |
|  | [ Bản gốc tiếng Anh ]           | | [ Bản dịch tiếng Việt ]      | |
|  +---------------------------------+ +------------------------------+ |
+-----------------------------------------------------------------------+
```

#### Parameters / Fields

1. `author` (Text, required): e.g. "Đào Hoàng Diệu"
2. `source` (Text, optional): e.g. "Trích từ sách Sayings Of Youth, trang 87"
3. `original` (Group, required):
   - `language` (Text, default: "English"): Language name
   - `quote` (Text, required): Original quote text
   - `caption` (Text, default: "Bản gốc tiếng Anh")
4. `translation` (Group, required):
   - `language` (Text, default: "Tiếng Việt"): Language name
   - `quote` (Text, required): Translated quote text
   - `caption` (Text, default: "Bản dịch tiếng Việt")

---

### Template 11: Dominican Spiritual Reflection / _Linh Đạo & Suy Niệm Đa Minh_

- **Slug**: `dominican-spirituality`
- **Category**: Linh Đạo / Hội Dòng
- **Use Case**: Contemplative reflections on the Dominican charism, St. Dominic, community fraternity, and Holy Year jubilee themes.

#### Visual Layout Wireframe

```
+-----------------------------------------------------------------------+
|  TIÊU ĐỀ: SỐNG NĂM THÁNH VỚI CHA THÁNH (reflectionTitle)              |
|  Chủ đề: Kiến tạo cộng đoàn hiệp nhất yêu thương (theme)              |
+-----------------------------------------------------------------------+
|  [ LỜI MỞ ĐẦU TÂM TÌNH (lead - markdownField) ]                       |
|  Chỉ còn ít ngày nữa, Năm Thánh sẽ bế mạc. Đêm nay, tôi muốn dừng lại |
|  lắng nghe một nhịp tim quen thuộc của Cha Thánh Đa Minh...          |
+-----------------------------------------------------------------------+
|  ❖ Điểm 1: Một đời sống ở giữa anh em (point.title)                   |
|    Nội dung suy niệm chi tiết (point.content - markdownField)...     |
|                                                                       |
|  ❖ Điểm 2: Gương mặt dịu hiền của người cha                           |
|    Nội dung suy niệm chi tiết...                                      |
|    > "Đừng khóc! Cha sẽ hữu ích cho anh em hơn khi về Trời"           |
+-----------------------------------------------------------------------+
|  +-----------------------------------------------------------------+  |
|  | LỜI NGUYỆN CỘNG ĐOÀN (closingPrayer - markdownField)            |  |
|  | Xin Cha Thánh dạy chúng con xây dựng cộng đoàn mỗi ngày...      |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  Tác giả: author  -  Dòng Nữ Đa Minh Gò Vấp (authorAffiliation)      |
+-----------------------------------------------------------------------+
```

#### Parameters / Fields

1. `reflectionTitle` (Text, required): Title of reflection
2. `theme` (Text, optional): Spiritual theme
3. `lead` (`markdownField`, required): Opening meditation
4. `points` (Array, required):
   - `symbol` (Text, default: "❖"): Bullet symbol
   - `title` (Text, required): Point title
   - `content` (`markdownField`, required): Meditation content
   - `highlightQuote` (Text, optional): Saint quote or highlighted saying
5. `closingPrayer` (`markdownField`, optional): Communal prayer
6. `author` (Text, required): Sister's name (e.g. "Nữ tu Maria Vũ Thị Chín (MJC)")
7. `authorAffiliation` (Text, default: "Dòng nữ Đa Minh Gò Vấp")

---

## 4. Technical Architecture & Component Implementation

### 4.1. Payload CMS Field Configuration

In `src/payload/collections/posts.ts`:

```typescript
import markdownField from "@/payload/fields/markdown";
import { postTemplates } from "@/payload/blocks/post-templates";
import { pageBlocks } from "@/payload/blocks";

// Inside Posts fields tabs -> Nội Dung:
{
  name: "contentMode",
  type: "radio",
  label: "Chế độ nội dung",
  defaultValue: "markdown",
  options: [
    { label: "Văn bản thường (Markdown)", value: "markdown" },
    { label: "Mẫu định dạng sẵn (Template)", value: "template" },
    { label: "Ghép khối tự do (Blocks)", value: "blocks" },
  ],
  admin: {
    layout: "horizontal",
  },
},
{
  name: "template",
  type: "blocks",
  label: "Mẫu giao diện bài viết",
  maxRows: 1,
  admin: {
    condition: (_, siblingData) => siblingData?.contentMode === "template",
    description: "Chọn 1 mẫu giao diện phù hợp để nhập nội dung theo cấu trúc.",
  },
  blocks: postTemplates,
},
{
  name: "contentBlocks",
  type: "blocks",
  label: "Các khối nội dung",
  admin: {
    condition: (_, siblingData) => siblingData?.contentMode === "blocks",
    description: "Tự do ghép các khối nội dung theo nhu cầu.",
  },
  blocks: pageBlocks,
},
markdownField({
  name: "body",
  label: "Nội dung (Markdown)",
  localized: true,
  admin: {
    condition: (_, siblingData) => siblingData?.contentMode === "markdown",
  },
}),
```

### 4.2. Next.js Frontend Rendering Engine

In `src/app/(app)/posts/[slug]/page.tsx`:

```tsx
import PostTemplateRenderer from "@/components/post-templates";
import BlockRenderer from "@/components/block-renderer";
import AppMarkdown from "@/components/app-markdown";

export default async function Page(props: Props) {
  // ... fetching post ...
  const contentMode = post.contentMode || "markdown";

  return (
    <AppPage>
      {/* Existing Header / ShareToolbar / Video player */}

      {contentMode === "template" && post.template?.[0] && (
        <PostTemplateRenderer block={post.template[0]} post={post} />
      )}

      {contentMode === "blocks" && post.contentBlocks?.length && (
        <BlockRenderer blocks={post.contentBlocks} />
      )}

      {contentMode === "markdown" && (
        <AppMarkdown className="mt-8">{post.body}</AppMarkdown>
      )}

      {/* Existing Related Posts Grid */}
    </AppPage>
  );
}
```

### 4.3. Component Architecture & Coding Standards

In full compliance with `AGENTS.md`:

1. **Always `markdownField`**: All formatted text fields in template blocks use `markdownField`. On the frontend, they render via `<AppMarkdown />`.
2. **Tailwind CSS v4 & `cn`**: Dynamic classes use `cn` from `@/utils/common`. No raw template literal strings.
3. **Cloudflare Media Optimization**: All images render with `<Image />` and pass their source through `transformUrl` from `@/utils/cloudflare`.
4. **Accessible Lightbox**: For image galleries and featured news photos, an accessible client component with keyboard support (Escape key, ARIA dialog) replaces the fragile CSS checkbox hacks.

---

## 5. Verification Plan

1. **Type Checking**: Run `pnpm generate:types` followed by `pnpm check-types` (`tsc --noemit`) to verify zero TypeScript errors.
2. **Lint & Formatting**: Run `pnpm lint:fix` and `pnpm prettier:fix`.
3. **Admin UI Testing**: Confirm in Payload Admin (`http://localhost:3000/admin`) that switching between `markdown`, `template`, and `blocks` renders the appropriate fields cleanly without conflicts.
4. **Live Preview & Visual Quality**: Verify each of the 11 templates in desktop, tablet, and mobile viewports.
