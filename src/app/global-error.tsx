"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          background: "#ffffff",
          color: "#292524",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main
          style={{
            maxWidth: "36rem",
            margin: "12vh auto 0",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <h1>Đã xảy ra lỗi</h1>
          <p>Không thể tải trang. Vui lòng thử lại.</p>
          <p lang="en">Something went wrong. Please try again.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: "44px",
              padding: "0 1rem",
              border: 0,
              borderRadius: "0.5rem",
              background: "#0b6f7f",
              color: "#ffffff",
              font: "inherit",
              fontWeight: 600,
            }}
          >
            Thử lại / <span lang="en">Try again</span>
          </button>
        </main>
      </body>
    </html>
  );
}
