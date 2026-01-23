import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExtraWorkList from './pages/ExtraWorkList';
import ExtraWorkDetail from './pages/ExtraWorkDetail';
import ExtraWorkForm from './pages/ExtraWorkForm';
import AddMaterialsToExtraWork from './pages/AddMaterialsToExtraWork';
import ShiftsList from './pages/ShiftsList';
import ShiftForm from './pages/ShiftForm';
import Admin from './pages/Admin';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="extra-work" element={<ExtraWorkList />} />
              <Route path="extra-work/new" element={<ExtraWorkForm />} />
              <Route path="extra-work/:id/add-materials" element={<AddMaterialsToExtraWork />} />
              <Route path="extra-work/:id" element={<ExtraWorkDetail />} />
              <Route path="shifts" element={<ShiftsList />} />
              <Route path="shifts/new" element={<ShiftForm />} />
              <Route path="admin" element={<Admin />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
