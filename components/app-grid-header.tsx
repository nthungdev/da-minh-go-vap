export default function AppGridHeader({
  text,
}: {
  text: String
}) {
  return (
    <div className="flex flex-row text-center text-primary items-center">
      <div className="flex-1 h-[2px] bg-primary"></div>
      <span className="mx-1.5 uppercase font-bold text-2xl">{text}</span>
      <div className="flex-1 h-[2px] bg-primary"></div>
    </div>
  )
}
