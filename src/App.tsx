import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ColorModeProvider } from './theme/ThemeContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/dashboard';
import StudentsPage from './pages/students';
import ContactsPage from './pages/contacts';
import InstructorsPage from './pages/instrucotrs';
import ClassesPage from './pages/classes';
import ProgramsPage from './pages/programs';
import LocationsPage from './pages/locations'
import EnrollmentsPage from './pages/enrollments'
import TrackerPage from './pages/tracker'

function App() {
  return (
    <ColorModeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="instructors" element={<InstructorsPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="programs" element={<ProgramsPage />} />
            <Route path="enrollments" element={<EnrollmentsPage />} />
            <Route path="tracker" element={<TrackerPage />} />
            {/* <Route path="attendance" element={<div>Attendance Page Placeholder</div>} /> */}
            <Route path="locations" element={<LocationsPage/>} />
            <Route path="management" element={<div>Management Page Placeholder</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ColorModeProvider>
  );
}

export default App;
