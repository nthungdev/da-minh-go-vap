import tokens from "../../../../design/tokens.json";

type TokenLeaf = {
  $value: string;
  $type: string;
};

const PALETTE_GROUPS = [
  "chill",
  "matisse",
  "dodger-blue",
  "gun-powder",
  "light-apricot",
  "keppel",
  "viola",
] as const;

const TYPOGRAPHY_SCALE = [
  { label: "4xl", className: "text-4xl font-bold", spec: "36px / 2.25rem" },
  { label: "3xl", className: "text-3xl font-bold", spec: "30px / 1.875rem" },
  { label: "2xl", className: "text-2xl font-semibold", spec: "24px / 1.5rem" },
  { label: "xl", className: "text-xl font-semibold", spec: "20px / 1.25rem" },
  { label: "lg", className: "text-lg font-medium", spec: "18px / 1.125rem" },
  { label: "base", className: "text-base", spec: "16px / 1rem" },
  { label: "sm", className: "text-sm", spec: "14px / 0.875rem" },
  { label: "xs", className: "text-xs", spec: "12px / 0.75rem" },
  { label: "xxs", className: "text-xxs", spec: "10px / 0.625rem" },
];

const SPACING_SCALE = [
  { token: "1", px: "4px", widthClass: "w-1" },
  { token: "2", px: "8px", widthClass: "w-2" },
  { token: "4", px: "16px", widthClass: "w-4" },
  { token: "6", px: "24px", widthClass: "w-6" },
  { token: "8", px: "32px", widthClass: "w-8" },
  { token: "12", px: "48px", widthClass: "w-12" },
  { token: "16", px: "64px", widthClass: "w-16" },
  { token: "24", px: "96px", widthClass: "w-24" },
];

const RADII_SCALE = [
  { label: "rounded-sm", className: "rounded-sm" },
  { label: "rounded-md", className: "rounded-md" },
  { label: "rounded-lg", className: "rounded-lg" },
  { label: "rounded-xl", className: "rounded-xl" },
  { label: "rounded-2xl", className: "rounded-2xl" },
  { label: "rounded-full", className: "rounded-full" },
];

const SHADOW_SCALE = [
  { label: "shadow-xs", className: "shadow-xs" },
  { label: "shadow-sm", className: "shadow-sm" },
  { label: "shadow-md", className: "shadow-md" },
  { label: "shadow-lg", className: "shadow-lg" },
];

export default function FoundationsSection() {
  const colorTokens = tokens.color as Record<string, Record<string, TokenLeaf>>;

  return (
    <section
      id="foundations"
      data-penpot-page="01 Foundations"
      className="space-y-10"
    >
      <div className="border-b border-gray-200 pb-4">
        <span className="text-primary-700 text-xs font-semibold tracking-wider uppercase">
          01 Foundations
        </span>
        <h2 className="mt-1 text-2xl font-bold text-gray-900">
          Design Tokens &amp; Foundations
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Sourced from <code>design/tokens.json</code> and{" "}
          <code>src/app/(app)/globals.css</code>.
        </p>
      </div>

      {/* Frame 1: Color Palettes */}
      <div
        data-penpot-frame="Color Palettes"
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">Color Palettes</h3>
        <div className="space-y-6">
          {PALETTE_GROUPS.map((group) => {
            const shades = colorTokens[group];
            if (!shades) return null;
            return (
              <div key={group} className="space-y-2">
                <div className="text-sm font-semibold text-gray-800 capitalize">
                  {group.replace("-", " ")}
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-12">
                  {Object.entries(shades).map(([shade, leaf]) => (
                    <div
                      key={`${group}-${shade}`}
                      className="overflow-hidden rounded-md border border-gray-200"
                    >
                      <div
                        className="h-10 w-full"
                        style={{ backgroundColor: leaf.$value }}
                      />
                      <div className="bg-white p-1.5">
                        <div className="text-[11px] font-semibold text-gray-900">
                          {shade}
                        </div>
                        <div className="font-mono text-[10px] text-gray-500">
                          {leaf.$value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frame 2: Typography Scale */}
      <div
        data-penpot-frame="Typography Scale"
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Typography Scale
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="text-xs font-medium text-gray-500 uppercase">
              Sans (Default)
            </div>
            <div className="mt-1 text-xl font-bold text-gray-900">
              Nunito Variable
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Hội dòng Đa Minh Gò Vấp — Chiêm niệm và Trao truyền.
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="text-xs font-medium text-gray-500 uppercase">
              Serif (Article)
            </div>
            <div className="font-noto-serif mt-1 text-xl font-bold text-gray-900">
              Noto Serif Variable
            </div>
            <p className="font-noto-serif mt-1 text-sm text-gray-600">
              Hội dòng Đa Minh Gò Vấp — Chiêm niệm và Trao truyền.
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="text-xs font-medium text-gray-500 uppercase">
              Serif (Quote)
            </div>
            <div className="font-lora mt-1 text-xl font-bold text-gray-900 italic">
              Lora Variable Italic
            </div>
            <p className="font-lora mt-1 text-sm text-gray-600 italic">
              &ldquo;Nói với Chúa hoặc nói về Chúa.&rdquo;
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {TYPOGRAPHY_SCALE.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div className="flex items-baseline gap-4">
                <span className="w-12 font-mono text-xs text-gray-500">
                  {item.label}
                </span>
                <span className={item.className}>Hội dòng Đa Minh Gò Vấp</span>
              </div>
              <span className="font-mono text-xs text-gray-500">
                {item.spec}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Frame 3: Spacing, Radii & Shadows */}
      <div
        data-penpot-frame="Spacing, Radii & Shadows"
        className="grid gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-xs lg:grid-cols-3"
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Spacing Scale</h3>
          <div className="space-y-2.5">
            {SPACING_SCALE.map((item) => (
              <div key={item.token} className="flex items-center gap-3">
                <span className="w-8 font-mono text-xs text-gray-500">
                  {item.token}
                </span>
                <div
                  className={`bg-primary-600 h-4 rounded-xs ${item.widthClass}`}
                />
                <span className="font-mono text-xs text-gray-600">
                  {item.px}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Border Radii</h3>
          <div className="grid grid-cols-2 gap-3">
            {RADII_SCALE.map((item) => (
              <div
                key={item.label}
                className={`border-primary-300 bg-primary-50 flex h-14 items-center justify-center border text-xs font-medium text-gray-800 ${item.className}`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Shadows</h3>
          <div className="grid grid-cols-2 gap-4">
            {SHADOW_SCALE.map((item) => (
              <div
                key={item.label}
                className={`flex h-16 items-center justify-center rounded-lg border border-gray-100 bg-white text-xs font-medium text-gray-800 ${item.className}`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
