import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.tsx'
import Search from './pages/Search.tsx'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </div>
  )
}

export default App
