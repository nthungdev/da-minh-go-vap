import { getPostsByHiddenTags } from "@/utils/posts";
import AppPage from "./app-page";
import AppPostGrid from "./app-post-grid";
import AppSeparator from "./app-separator";

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
      <ul className='space-y-4'>
        {categoriesData.map(({ title, posts }, index) => (
          <li key={index} className="space-y-4">
            <h2 className="text-2xl uppercase text-center">{title}</h2>
            <AppPostGrid posts={posts} />
            {index !== categoriesData.length - 1 && <AppSeparator />}
          </li>
        ))}
      </ul>
    </AppPage>
  )
}
