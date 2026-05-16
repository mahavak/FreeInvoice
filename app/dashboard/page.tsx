import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { DashboardClient } from '@/components/DashboardClient'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  let session
  try {
    session = await getServerSession(authOptions)
  } catch {
    redirect('/api/auth/signin')
  }

  if (!session) {
    redirect('/api/auth/signin')
  }

  return <DashboardClient />
}