import AppMarkdown from "@/components/app-markdown";
import { ParableLifeLessonBlock } from "@/payload-types";
import { BookOpen, ExternalLink, Lightbulb } from "lucide-react";

interface Props {
  block: ParableLifeLessonBlock;
}

export default function ParableLifeLessonView({ block }: Props) {
  const { contents, translator, source } = block;

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      {/* Narrative Sequence */}
      <div className="space-y-6">
        {contents.map((item, idx) => {
          if (item.type === "scripture") {
            return (
              <div
                key={idx}
                className="my-6 rounded-2xl border-l-4 border-amber-500 bg-amber-50/70 p-6 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <BookOpen className="mt-0.5 size-6 shrink-0 text-amber-600" />
                  <div className="space-y-1">
                    <blockquote className="font-serif text-lg text-gray-900 italic md:text-xl">
                      “{item.verse}”
                    </blockquote>
                    {item.reference && (
                      <p className="text-right text-sm font-semibold text-amber-800">
                        ({item.reference})
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          if (item.type === "callout") {
            return (
              <div
                key={idx}
                className="border-primary-200 from-primary-50/80 my-6 flex items-start gap-4 rounded-2xl border bg-gradient-to-r to-teal-50/40 p-6 shadow-sm"
              >
                <div className="bg-primary-100 text-primary-700 flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <Lightbulb className="size-5" />
                </div>
                <div className="text-primary-950 text-base leading-relaxed font-medium md:text-lg">
                  <AppMarkdown>{item.content}</AppMarkdown>
                </div>
              </div>
            );
          }

          // Default: "body"
          return (
            <div
              key={idx}
              className="prose prose-lg max-w-none leading-relaxed text-gray-800"
            >
              <AppMarkdown>{item.content}</AppMarkdown>
            </div>
          );
        })}
      </div>

      {/* Attribution Footer */}
      {(translator || source?.name) && (
        <footer className="mt-8 space-y-1 border-t border-gray-100 pt-4 text-sm text-gray-500">
          {translator && (
            <p>
              <strong className="text-gray-700">Chuyển ngữ:</strong>{" "}
              {translator}
            </p>
          )}
          {source?.name && (
            <p className="flex items-center gap-1.5">
              <strong className="text-gray-700">Nguồn:</strong>
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-primary-600 inline-flex items-center gap-1 hover:underline"
                >
                  <span>{source.name}</span>
                  <ExternalLink className="size-3.5" />
                </a>
              ) : (
                <span>{source.name}</span>
              )}
            </p>
          )}
        </footer>
      )}
    </article>
  );
}
