import assert from "node:assert/strict";
import test from "node:test";
import {
  extractHeadingsFromElements,
  type HeadingElementLike,
  slugifyHeading,
} from "../src/utils/table-of-contents.ts";

function createHeading(
  tagName: string,
  textContent: string | null,
  id = "",
): HeadingElementLike & { classes: string[] } {
  const classes: string[] = [];
  return {
    tagName,
    textContent,
    id,
    classes,
    classList: {
      add: (...tokens: string[]) => {
        classes.push(...tokens);
      },
    },
  };
}

test("slugifyHeading normalizes Vietnamese diacritics and đ/Đ", () => {
  assert.equal(
    slugifyHeading("I. Ơn gọi thừa sai của người nữ tu"),
    "i-on-goi-thua-sai-cua-nguoi-nu-tu",
  );
  assert.equal(
    slugifyHeading("Đoạn 1: Mở đầu — Giới thiệu"),
    "doan-1-mo-dau-gioi-thieu",
  );
  assert.equal(slugifyHeading("ĐƯỜNG HƯỚNG MỤC VỤ"), "duong-huong-muc-vu");
});

test("slugifyHeading falls back to section when heading has only punctuation", () => {
  assert.equal(slugifyHeading("... --- !!!"), "section");
  assert.equal(slugifyHeading("   "), "section");
});

test("extractHeadingsFromElements extracts h2 and h3, skips empty and non-h2/h3", () => {
  const h1 = createHeading("H1", "Post Title");
  const h2 = createHeading("H2", "1. Dẫn nhập");
  const emptyH2 = createHeading("H2", "   ");
  const h3 = createHeading("H3", "1.1. Bối cảnh");
  const h4 = createHeading("H4", "Sub-detail");

  const items = extractHeadingsFromElements([h1, h2, emptyH2, h3, h4]);

  assert.deepEqual(items, [
    { id: "1-dan-nhap", text: "1. Dẫn nhập", level: 2 },
    { id: "1-1-boi-canh", text: "1.1. Bối cảnh", level: 3 },
  ]);
  assert.equal(h2.id, "1-dan-nhap");
  assert.equal(h3.id, "1-1-boi-canh");
  assert.deepEqual(h2.classes, ["scroll-mt-20"]);
  assert.deepEqual(h3.classes, ["scroll-mt-20"]);
  assert.equal(h1.id, "");
  assert.equal(h4.id, "");
});

test("extractHeadingsFromElements deduplicates identical headings with -2, -3", () => {
  const first = createHeading("H2", "Lời nguyện");
  const second = createHeading("H2", "Lời nguyện");
  const third = createHeading("H3", "Lời nguyện");

  const items = extractHeadingsFromElements([first, second, third]);

  assert.deepEqual(items, [
    { id: "loi-nguyen", text: "Lời nguyện", level: 2 },
    { id: "loi-nguyen-2", text: "Lời nguyện", level: 2 },
    { id: "loi-nguyen-3", text: "Lời nguyện", level: 3 },
  ]);
});

test("extractHeadingsFromElements preserves existing IDs and avoids collisions", () => {
  const generatedFirst = createHeading("H2", "Kết luận");
  const preExisting = createHeading("H2", "Phần cuối", "ket-luan");
  const duplicatePreExisting = createHeading("H3", "Ghi chú", "ket-luan");

  const items = extractHeadingsFromElements([
    generatedFirst,
    preExisting,
    duplicatePreExisting,
  ]);

  assert.deepEqual(items, [
    { id: "ket-luan-2", text: "Kết luận", level: 2 },
    { id: "ket-luan", text: "Phần cuối", level: 2 },
    { id: "ket-luan-3", text: "Ghi chú", level: 3 },
  ]);
});
