import AppPage from "@/components/app-page";
import { attributes } from '@/content/pages/congregation/history.md'

/**
 * History
 */
export default function CongregationHistory() {
  const { developmentHistory, communityHistory } = attributes as CongregationHistory

  return (
    <AppPage className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl">{developmentHistory.title}</h2>

        <ol className="space-y-4">
          {developmentHistory.timeline.map(({ title, body }, index) => (
            <li key={index}>
              <h3 className="text-lg">{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-2xl">{communityHistory.title}</h2>
      </section>
    </AppPage>
  )
}
