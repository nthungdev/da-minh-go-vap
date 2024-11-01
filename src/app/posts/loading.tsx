import AppPage from '@/components/app-page'
import { Spinner } from 'flowbite-react'

export default function Loading() {
  return (
    <AppPage>
      <div className='flex flex-row justify-center'>
        <Spinner className="w-12 h-12 text-center text-primary-1" />
      </div>
    </AppPage>
  )
}
