import { getPayload } from 'payload'
import config from '@payload-config'
import AppPage from '@/components/app-page'
import BlocksRenderer from '@/components/blocks-renderer'

// export const dynamicParams = true // or false, to 404 on unknown paths
export const dynamic = 'force-static'

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const pages = await payload.find({ collection: 'pages' })
  return pages.docs.map((page) => ({
    path: page.path.split('/'),
  }))
}

export default async function Page(props: {
  params: Promise<{ path?: string[] }>
}) {
  const params = await props.params
  const path = '/' + (params.path || []).join('/')
  // console.log({ params, path })
  const payload = await getPayload({ config })
  const query = await payload.find({
    collection: 'pages',
    where: {
      path: { equals: path },
    },
  })
  const page = query.docs[0]
  if (!page) {
    console.log('page not found')
    // TODO
  }

  console.log({ page })
  return (
    <AppPage>
      <h1 className="sr-only">{page.title}</h1>
      <BlocksRenderer blocks={page.main || []} />
    </AppPage>
  )
}
