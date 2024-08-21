import { getPostsByHiddenTags } from "@/utils/posts";
import AppPage from "./app-page";
import AppPostGrid from "./app-post-grid";
import AppSectionHeader from "./app-section-header";

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
      <h1 className="sr-only">{title}</h1>
      <ul className='space-y-12'>
        {categoriesData.map(({ title, posts }, index) => (
          <li key={index} className="space-y-4">
            <AppSectionHeader>
              <h2 className="text-2xl">{title}</h2>
            </AppSectionHeader>
            <AppPostGrid posts={posts} />
          </li>
        ))}
      </ul>
    </AppPage>
  )
}
