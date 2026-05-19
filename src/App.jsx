import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Pages
import Login          from './components/auth/Login'
import Layout         from './components/shared/Layout'
import EmployeeDash   from './pages/EmployeeDashboard'
import GoalSheetPage  from './pages/GoalSheetPage'
import ManagerDash    from './pages/ManagerDashboard'
import TeamGoalReview from './pages/TeamGoalReview'
import AdminDash      from './pages/AdminDashboard'
import SharedGoalsPage from './pages/SharedGoalsPage'

function ProtectedRoute({ children, roles }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  if (!user)   return <Navigate to="/login" replace />
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/" replace />
  return children
}

function Spinner() {
  return (
    <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
  )
}

function RoleRedirect() {
  const { profile, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  if (!profile) return <Navigate to="/login" replace />
  if (profile.role === 'employee') return <Navigate to="/employee"  replace />
  if (profile.role === 'manager')  return <Navigate to="/manager"   replace />
  if (profile.role === 'admin')    return <Navigate to="/admin"     replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute><RoleRedirect /></ProtectedRoute>
        } />

        {/* Employee */}
        <Route path="/employee" element={
          <ProtectedRoute roles={['employee']}>
            <Layout><EmployeeDash /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/employee/goals/:cycleId" element={
          <ProtectedRoute roles={['employee']}>
            <Layout><GoalSheetPage /></Layout>
          </ProtectedRoute>
        } />

        {/* Manager */}
        <Route path="/manager" element={
          <ProtectedRoute roles={['manager']}>
            <Layout><ManagerDash /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/manager/review/:sheetId" element={
          <ProtectedRoute roles={['manager']}>
            <Layout><TeamGoalReview /></Layout>
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <Layout><AdminDash /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/shared-goals" element={
          <ProtectedRoute roles={['admin']}>
            <Layout><SharedGoalsPage /></Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
