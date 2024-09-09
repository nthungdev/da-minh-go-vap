import Image from 'next/image'

export default function AppSeparator() {
  return (
    <Image
      src="/svgs/separator.svg"
      className="pointer-events-none"
      alt="separator"
      width={1080}
      height={720}
    />
  )
}
