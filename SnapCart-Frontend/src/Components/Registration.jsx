import { NavLink } from "react-router-dom"

const Registration = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white dark:bg-slate-900">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl text-slate-800 dark:text-white font-bold tracking-wide">Welcome</h1>
          <p className="text-gray-500 dark:text-gray-400">Sign in to your account or create a new one</p>
        </div>
        <div className="flex flex-col space-y-4">
          <NavLink
            to="/login"
            className="inline-flex items-center justify-center rounded-md bg-slate-800 dark:bg-white hover:bg-slate-900 px-4 py-3 text-sm font-medium text-white dark:text-slate-800 shadow transition-colors focus:outline-none w-full"
          >
            Login
          </NavLink>
          <NavLink
            to="/signup"
            className="inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-600 bg-transparent px-4 py-3 text-sm font-medium text-gray-900 dark:text-white dark:hover:text-slate-900 shadow-2xl shadow-slate-800 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none w-full hover:transition-all duration-500"
          >
            Sign Up
          </NavLink>
        </div>
      </div>
    </main>
  )
}

export default Registration
