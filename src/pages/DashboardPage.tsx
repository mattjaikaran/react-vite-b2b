import { useAuth } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, Spinner } from '@/components/ui'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {user?.first_name || user?.username}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={user?.is_active ? 'success' : 'error'}>
              {user?.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member Since</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight text-gray-900">
              {user?.date_joined ? formatDate(user.date_joined) : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="truncate text-lg font-semibold tracking-tight text-gray-900">
              {user?.email}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button type="button" variant="outline">View Profile</Button>
          <Button type="button" variant="outline">Change Password</Button>
          <Button type="button" variant="outline">Notifications</Button>
          <Button type="button" variant="outline">Settings</Button>
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-12 text-center text-gray-500">
            <p>No recent activity to display.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
