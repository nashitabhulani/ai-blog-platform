import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import BlogLayout from './layouts/BlogLayout'

import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import Dashboard from './pages/Dashboard'
import AIGenerator from './pages/AIGenerator'
import DraftPosts from './pages/DraftPosts'
import PublishedPosts from './pages/PublishedPosts'
import Categories from './pages/Categories'
import BulkGenerator from './pages/BulkGenerator'

import BlogHome from './pages/BlogHome'
import BlogPost from './pages/BlogPost'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Admin / Dashboard - Protected */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ai-generator" element={<AIGenerator />} />
            <Route path="drafts" element={<DraftPosts />} />
            <Route path="published" element={<PublishedPosts />} />
            <Route path="categories" element={<Categories />} />
            <Route path="bulk-factory" element={<BulkGenerator />} />
          </Route>

          {/* Public Blog */}
          <Route path="/blog" element={<BlogLayout />}>
            <Route index element={<BlogHome />} />
            <Route path=":slug" element={<BlogPost />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
