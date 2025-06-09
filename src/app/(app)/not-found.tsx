import AppPage from '@/components/app-page'
import Link from 'next/link'

export default function NotFound() {
  return (
    <AppPage className='flex-1 flex flex-col justify-center items-center'>
      <h1 className='text-4xl'>Không Tìm Thấy</h1>
      <p className='mt-4'>Trang này không tồn tại</p>
      <Link href="/" className='mt-10'>Về Trang Chủ</Link>
    </AppPage>
  )
}