import React, { useContext } from 'react';
import './App.css';
import IndexPage from './components/IndexPage';
import Layout from './components/Layout';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { UserContext, UserContextProvider } from './components/UserContext'; // Import UserContext
import CreateLog from './components/CreateLog';
import AnalysisPage from './components/AnalysisPage';
import EditLog from './components/EditLog';
import UnauthorizedUser from './components/UnauthorizedUser';
// ... (imports)

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route
          path="/"
          element={<Layout />}
        >
          <Route index element={<LoginPage />} />
          <Route path="/logs" element={<PrivateRoute component={<IndexPage />} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create" element={<PrivateRoute component={<CreateLog />} />} />
          <Route path="/analysis" element={<PrivateRoute component={<AnalysisPage />} />} />
          {/* Add other protected routes here */}
          <Route path="unauth" element={<UnauthorizedUser />} />
          {/* Redirect to /unauth for any other routes */}
          <Route path="*" element={<Navigate to="/unauth" />} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

// PrivateRoute component to check if the user is authenticated
function PrivateRoute({ component }) {
  const { userInfo } = useContext(UserContext);

  // If the user is authenticated, render the component; otherwise, navigate to /unauth
  return userInfo ? component : <Navigate to="/unauth" />;
}

export default App;
