"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { buildKeywordMarkup } from "@/payload/fields/markdown/keyword-markup";
import type { MarkdownEditorHandle } from "@/payload/fields/markdown/MarkdownEditor";
import styles from "./KeywordTooltipHelper.module.css";

const GUIDE_URL =
  "https://docs.dongdaminhgovap.org/doc/chu-giai-tu-khoa-trong-bai-viet-htDaSDQbj9";

const SYNTAX_EXAMPLE =
  '<keyword data-title="…" data-description="…">cụm từ</keyword>';

interface FormState {
  phrase: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

const EMPTY_FORM: FormState = {
  phrase: "",
  title: "",
  description: "",
  image: "",
  href: "",
};

interface KeywordTooltipHelperProps {
  editorRef: RefObject<MarkdownEditorHandle | null>;
}

/** Help panel and builder dialog that insert `<keyword>` tooltip markup into the Markdown editor. */
export default function KeywordTooltipHelper({
  editorRef,
}: KeywordTooltipHelperProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  // The dialog is portaled to <body> so its <form> is never nested inside Payload's document form.
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setPortalTarget(document.body), []);
  const idPrefix = useId();
  const fieldId = (name: keyof FormState) => `${idPrefix}-${name}`;

  function openBuilder() {
    const selection = editorRef.current?.getSelection();
    selectionRef.current = selection
      ? { start: selection.start, end: selection.end }
      : null;
    setForm({ ...EMPTY_FORM, phrase: selection?.text.trim() ?? "" });
    dialogRef.current?.showModal();
  }

  function closeBuilder() {
    dialogRef.current?.close();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // React bubbles submit through portals to Payload's form, which would save the post.
    event.stopPropagation();
    const editor = editorRef.current;
    const selection = selectionRef.current;
    if (!(editor && selection)) return;

    const markup = buildKeywordMarkup({
      phrase: form.phrase,
      title: form.title,
      description: form.description,
      image: form.image.trim(),
      href: form.href.trim(),
    });
    closeBuilder();
    editor.replaceRange(selection.start, selection.end, markup);
  }

  function update(name: keyof FormState) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((previous) => ({ ...previous, [name]: event.target.value }));
  }

  return (
    <section className={styles.panel} aria-label="Chú giải từ khóa">
      <div className={styles.panelText}>
        <strong>Chú giải từ khóa</strong>
        <span>
          Chọn một cụm từ trong nội dung rồi bấm <em>Chèn chú giải</em>, hoặc tự
          viết thẻ <code>{SYNTAX_EXAMPLE}</code>.{" "}
          <a href={GUIDE_URL} target="_blank" rel="noopener noreferrer">
            Xem hướng dẫn
          </a>
        </span>
      </div>
      <button
        type="button"
        className={styles.primaryButton}
        onClick={openBuilder}
      >
        Chèn chú giải
      </button>

      {portalTarget &&
        createPortal(
          <dialog
            ref={dialogRef}
            className={styles.dialog}
            aria-labelledby={fieldId("phrase") + "-heading"}
          >
            <form className={styles.form} onSubmit={onSubmit}>
              <h2
                id={fieldId("phrase") + "-heading"}
                className={styles.heading}
              >
                Chèn chú giải từ khóa
              </h2>

              <div className={styles.grid}>
                <div className={styles.inputs}>
                  <label htmlFor={fieldId("phrase")}>
                    Cụm từ hiển thị <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={fieldId("phrase")}
                    value={form.phrase}
                    onChange={update("phrase")}
                    required
                  />

                  <label htmlFor={fieldId("title")}>
                    Tiêu đề <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={fieldId("title")}
                    value={form.title}
                    onChange={update("title")}
                    required
                  />

                  <label htmlFor={fieldId("description")}>
                    Mô tả <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id={fieldId("description")}
                    value={form.description}
                    onChange={update("description")}
                    rows={3}
                    required
                  />

                  <label htmlFor={fieldId("image")}>
                    URL ảnh (không bắt buộc)
                  </label>
                  <input
                    id={fieldId("image")}
                    type="url"
                    value={form.image}
                    onChange={update("image")}
                    placeholder="https://…"
                  />

                  <label htmlFor={fieldId("href")}>
                    Đường dẫn &ldquo;Xem thêm&rdquo; (không bắt buộc)
                  </label>
                  <input
                    id={fieldId("href")}
                    value={form.href}
                    onChange={update("href")}
                    placeholder="/duong-dan-bai-viet"
                  />
                </div>

                <div className={styles.previewColumn}>
                  <span className={styles.previewLabel}>Xem trước</span>
                  <div className={styles.preview} aria-live="polite">
                    {form.image.trim() && (
                      // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary URL
                      <img
                        src={form.image.trim()}
                        alt=""
                        className={styles.previewImage}
                      />
                    )}
                    <strong>{form.title || "Tiêu đề chú giải"}</strong>
                    <p>{form.description || "Mô tả ngắn về cụm từ."}</p>
                    {form.href.trim() && (
                      <span className={styles.previewLink}>Xem thêm →</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={closeBuilder}
                >
                  Hủy
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Chèn vào nội dung
                </button>
              </div>
            </form>
          </dialog>,
          portalTarget,
        )}
    </section>
  );
}
