import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ColorModeProvider } from './theme/ThemeContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/dashboard';
import StudentsPage from './pages/students';
import InstructorsPage from './pages/instrucotrs';
import LocationsPage from './pages/locations'

function App() {
  return (
    <ColorModeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="contacts" element={<div>Students Page Placeholder</div>} />
            <Route path="instructors" element={<InstructorsPage />} />
            <Route path="classes" element={<div>Classes Page Placeholder</div>} />
            <Route path="programs" element={<div>Programs Page Placeholder</div>} />
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
