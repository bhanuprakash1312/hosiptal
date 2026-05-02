import React, { useState, useEffect } from 'react'
import Home from './Pages/home'
import Login from './Pages/auth/Login'
import { Route, Routes } from 'react-router-dom'
import Register from './Pages/auth/Register'
import BookAppointment from './Pages/patient/BookAppointment'
import ReviewAppointment from './Pages/patient/ReviewAppointment'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppointmentSuccess from './Pages/patient/AppointmentSuccess'
import VerifyOtp from './Pages/auth/VerifyOtp'
import CompleteRegistration from './Pages/auth/CompleteRegistration'
import Dashboard from './Pages/patient/PatientDashboard'
import ChatPage from './Pages/doctor/ChatPage'
import DoctorDashboard from './Pages/doctor/DoctorDashboard'
import DoctorLogin from './Pages/auth/DoctorLogin'
import ForgotPassword from './Pages/auth/ForgotPassword'
import VerifyOtpPassword from './Pages/auth/VerifyOtpPassword'
import ResetPassword from './Pages/auth/Reset-Password'
import AdminDashboard from './Pages/admin/AdminDashboard'

import ManageDepartements from './Pages/admin/ManageDepartements'
import ManageDoctors from './Pages/admin/ManageDoctors'
import LoadingScreen from './components/common/LoadingScreen'

const App = () => {
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    // Simulate initial app loading / auth check for smooth UI entry
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  if (initialLoading) {
    return <LoadingScreen fullScreen={true} message="Initializing Hospital Portal..." />
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password-otp" element={<VerifyOtpPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/book-appointment" element={
          <ProtectedRoute>
            <BookAppointment />
          </ProtectedRoute>
        } />

        <Route path="/review-appointment" element={
          <ProtectedRoute>
            <ReviewAppointment />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/appointment-success" element={<AppointmentSuccess />} />
        <Route path="/doctor" element={
          <ProtectedRoute>
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/complete-registration" element={<CompleteRegistration />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path='/chat/:appointmentId' element={<ChatPage/>}/>
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/departments" element={
          <ProtectedRoute>
            <ManageDepartements />
          </ProtectedRoute>
        } />
        <Route path="/admin/doctors" element={
          <ProtectedRoute>
            <ManageDoctors />
          </ProtectedRoute>
        } />

      </Routes>
    </div>
  )
}

export default App
