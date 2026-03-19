export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-5 flex justify-between items-center">

      <h1 className="text-xl font-bold text-blue-500">
        AI Interview Integrity
      </h1>

      <div className="space-x-6">
        <button className="hover:text-blue-400">Features</button>
        <button className="hover:text-blue-400">How It Works</button>
        <button className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700">
          Start Interview
        </button>
      </div>

    </nav>
  )
}