interface AppQuoteProps {
  quote: string;
}

export default function AppQuote(props: AppQuoteProps) {
  return (
    <blockquote className="relative rounded-2xl border border-l-4 border-callout-border/50 border-l-primary bg-callout-bg p-card shadow-inset sm:p-8">
      <div className="relative z-10">
        <p className="font-serif text-xl leading-relaxed break-words text-callout-text md:text-2xl md:leading-relaxed">
          <em>{props.quote}</em>
        </p>
      </div>
    </blockquote>
  );
}
