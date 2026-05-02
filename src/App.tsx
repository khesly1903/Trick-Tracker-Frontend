import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ColorModeProvider } from './theme/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';

import LandingPage from './pages/landing';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';

import Dashboard from './pages/dashboard';
import StudentsPage from './pages/students';
import ContactsPage from './pages/contacts';
import InstructorsPage from './pages/instrucotrs';
import ClassesPage from './pages/classes';
import ProgramsPage from './pages/programs';
import LocationsPage from './pages/locations';
import EnrollmentsPage from './pages/enrollments';
import TrackerPage from './pages/tracker';

function App() {
  return (
    <ColorModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Private routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="instructors" element={<InstructorsPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="programs" element={<ProgramsPage />} />
              <Route path="enrollments" element={<EnrollmentsPage />} />
              <Route path="tracker" element={<TrackerPage />} />
              <Route path="locations" element={<LocationsPage />} />
              <Route path="management" element={<div>Management Page Placeholder</div>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ColorModeProvider>
  );
}

export default App;
