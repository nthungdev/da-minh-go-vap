import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

export default function AppMarkdown({
  children,
}: Readonly<{ children: string | null | undefined }>) {
  return (
    <Markdown
      className="markdown"
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
    >
      {children}
    </Markdown>
  )
}
