import { Navigate } from '@tanstack/react-router'
import { useAuth } from '@/app/auth/useAuth'
import { LoginForm } from '@/ui/auth/LoginForm'

export function LoginRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace={true} />
  }

  return (
    <div className="container d-flex justify-content-center align-items-center flex-grow-1">
      <div className="card p-4 shadow-sm w-100" style={{ maxWidth: '400px' }}>
        <LoginForm />
      </div>
    </div>
  )
}
