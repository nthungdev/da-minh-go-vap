export default function AppGridHeader({
  text,
}: {
  text: string
}) {
  return (
    <div className="flex flex-row text-center text-primary-800 items-center">
      <div className="flex-1 h-[2px] bg-primary-800"></div>
      <span className="mx-1.5 uppercase font-bold text-2xl font-header">{text}</span>
      <div className="flex-1 h-[2px] bg-primary-800"></div>
    </div>
  )
}
