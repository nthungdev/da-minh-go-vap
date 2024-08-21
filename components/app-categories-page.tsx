import { getPostsByHiddenTags } from "@/utils/posts";
import AppPage from "./app-page";
import AppPostGrid from "./app-post-grid";

interface AppCategoriesPageProps {
  title: string;
  categories: {
    title: string
    hiddenTags: string[]
  }[];
}

export default function AppCategoriesPage({
  title,
  categories,
}: AppCategoriesPageProps) {
  const categoriesData = categories.map(({ title, hiddenTags }) => ({
    title,
    posts: getPostsByHiddenTags(hiddenTags).slice(0, 4)
  }))

  return (
    <AppPage>
      <ul className='space-y-12'>
        {categoriesData.map(({ title, posts }, index) => (
          <li key={index} className="space-y-4">
            <h2 className='uppercase text-2xl'>{title}</h2>
            <AppPostGrid posts={posts} />
          </li>
        ))}
      </ul>
    </AppPage>
  )
}
