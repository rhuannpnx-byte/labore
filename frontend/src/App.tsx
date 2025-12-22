import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Projects from './pages/Projects';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import FormsList from './pages/FormsList';
import FormBuilder from './pages/FormBuilder';
import FormView from './pages/FormView';
import FormFill from './pages/FormFill';
import SubmissionsList from './pages/SubmissionsList';
import SubmissionView from './pages/SubmissionView';
import AllSubmissions from './pages/AllSubmissions';
import OfflineIndicator from './components/OfflineIndicator';
import PendingSubmissionsList from './components/PendingSubmissionsList';
import { ReportsList } from './pages/ReportsList';
import { ReportBuilder } from './pages/ReportBuilder';
import { ReportGenerate } from './pages/ReportGenerate';
import { ReportViewer } from './pages/ReportViewer';
import { ReportBatchViewer } from './pages/ReportBatchViewer';
import { ReportGenerations } from './pages/ReportGenerations';

function App() {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Rota de Login */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
        />

        {/* Rotas Protegidas com Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          
          <Route 
            path="/companies" 
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                <Companies />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/projects" 
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN']}>
                <Projects />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN']}>
                <Users />
              </ProtectedRoute>
            } 
          />

          <Route path="/forms" element={<FormsList />} />
          <Route 
            path="/forms/new" 
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN', 'ENGENHEIRO']}>
                <FormBuilder />
              </ProtectedRoute>
            } 
          />
          <Route path="/forms/:id" element={<FormView />} />
          <Route 
            path="/forms/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN', 'ENGENHEIRO']}>
                <FormBuilder />
              </ProtectedRoute>
            } 
          />
          <Route path="/forms/:id/fill" element={<FormFill />} />
          <Route path="/forms/:id/submissions" element={<SubmissionsList />} />

          <Route path="/submissions" element={<AllSubmissions />} />
          <Route path="/submissions/:id" element={<SubmissionView />} />
          <Route path="/pending-submissions" element={<PendingSubmissionsList />} />

          <Route path="/reports" element={<ReportsList />} />
          <Route 
            path="/reports/new" 
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN', 'ENGENHEIRO']}>
                <ReportBuilder />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN', 'ENGENHEIRO']}>
                <ReportBuilder />
              </ProtectedRoute>
            } 
          />
          <Route path="/reports/:id/generate" element={<ReportGenerate />} />
          <Route path="/reports/:id/generations" element={<ReportGenerations />} />
          <Route path="/reports/view-batch/:ids" element={<ReportBatchViewer />} />
          <Route path="/reports/view/:generationId" element={<ReportViewer />} />
        </Route>

        {/* Rota padrão - redirecionar para login ou dashboard */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} 
        />
      </Routes>
      
      {/* Indicador de status offline/sincronização */}
      {isAuthenticated && <OfflineIndicator />}
    </BrowserRouter>
  );
}

export default App;
