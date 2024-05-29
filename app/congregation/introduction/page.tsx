import {
  // react as Congregration,
  attributes,
  body
} from '@/content/pages/congregation/introduction.md'
import AppMarkdown from '@/components/app-markdown'

export default function CongregationIntroduction() {

  const {
    submenus: { introduction = '' } = {},
  } = attributes

  return (
    <main>
      <AppMarkdown>{body}</AppMarkdown>
    </main>
  )
}
