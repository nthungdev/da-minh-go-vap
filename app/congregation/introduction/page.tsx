import {
  // react as Congregration,
  attributes,
  body
} from '@/content/pages/congregration.md'
import { AppMarkdown } from '@/app/components'

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
