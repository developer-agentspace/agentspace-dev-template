import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="mt-4 text-lg text-gray-600">Page not found</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
