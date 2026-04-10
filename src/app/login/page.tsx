import { login, signup } from './actions'
import GoogleSignInButton from './GoogleSignInButton'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 flex-col px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-gray-900">Epaper CMS</h1>
          <p className="text-gray-500 mt-2">Sign in to manage your e-paper</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <GoogleSignInButton />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>
        </div>

        <form className="animate-in flex-1 flex flex-col w-full justify-center gap-4 text-foreground">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              className="rounded-md px-4 py-2 bg-white border outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              name="email"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              className="rounded-md px-4 py-2 bg-white border outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="flex flex-col gap-2 mt-4">
            <button
              formAction={login}
              className="bg-gray-900 text-white rounded-md px-4 py-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all"
            >
              Sign In
            </button>
            <button
              formAction={signup}
              className="bg-white border text-gray-900 rounded-md px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all"
            >
              Sign Up
            </button>
          </div>
          
          {resolvedSearchParams?.message && (
            <div className="p-4 mt-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center">
              {resolvedSearchParams.message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
