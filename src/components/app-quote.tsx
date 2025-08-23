interface AppQuoteProps {
  quote: string;
}

export default function AppQuote(props: AppQuoteProps) {
  return (
    <blockquote className="bg-primary-200 relative rounded-lg p-8">
      <div className="relative z-10">
        <p className="text-xl text-gray-800 md:text-3xl md:leading-normal">
          <em>{props.quote}</em>
        </p>
      </div>
    </blockquote>
  );
}
