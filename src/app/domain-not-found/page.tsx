export default function DomainNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Domain Not Configured</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          This custom domain points to Epaper CMS, but it hasn&apos;t been connected to an active publication yet.
        </p>
        <p className="text-sm text-gray-500">
          If you are the site owner, log into your dashboard and add this domain in your Site Settings.
        </p>
      </div>
    </div>
  )
}
