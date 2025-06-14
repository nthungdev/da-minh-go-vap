import { getPayload } from 'payload'
import config from '@payload-config'
import AppPage from '@/components/app-page'
import BlocksRenderer from '@/components/blocks-renderer'
import { notFound } from 'next/navigation'

// export const dynamicParams = true // or false, to 404 on unknown paths
export const dynamic = 'force-static'

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const pages = await payload.find({ collection: 'pages' })
  const params = pages.docs.map((page) => ({
    path: page.path.split('/'),
  }))
  return params
}

export default async function Page(props: {
  params: Promise<{ path?: string[] }>
}) {
  const params = await props.params
  const path = '/' + (params.path || []).join('/')
  const payload = await getPayload({ config })
  const query = await payload.find({
    collection: 'pages',
    where: {
      path: { equals: path },
    },
  })
  const page = query.docs[0]
  if (!page) {
    notFound()
  }

  const banners =
    (page.banners &&
      page.banners.every((b) => typeof b === 'object') &&
      page.banners) ||
    []

  return (
    <AppPage banners={banners}>
      <h1 className="sr-only">{page.title}</h1>
      <div className="space-y-4 lg:space-y-8">
        <section>
          <BlocksRenderer blocks={page.beforeMain || []} />
        </section>
        <div className="lg:flex flex-row items-start gap-x-4">
          <section className="flex-1">
            <BlocksRenderer blocks={page.main || []} />
          </section>
          {page?.aside && (
            <aside className="hidden lg:block w-56 lg:w-64 bg-primary-1">
              <BlocksRenderer blocks={page.aside} />
            </aside>
          )}
        </div>
      </div>
    </AppPage>
  )
}
