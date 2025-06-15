// // src/App.js
// import React, { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import ProtectedRoute from './components/ProtectedRoute';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';
// import Products from './pages/Products';
// import Suppliers from './pages/Suppliers';
// import Users from './pages/Users';
// import Orders from './pages/Orders';
// import Sidebar from './components/Sidebar';

// // Main layout component that includes the sidebar
// const MainLayout = ({ children }) => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top bar for mobile to open sidebar */}
//         <header className="bg-white shadow-md p-4 lg:hidden flex items-center justify-between">
//           <button onClick={toggleSidebar} className="text-gray-600 focus:outline-none">
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
//             </svg>
//           </button>
//           <h1 className="text-lg font-semibold text-gray-800">Inventory Tool</h1>
//         </header>
//         <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <AppRoutes />
//       </AuthProvider>
//     </Router>
//   );
// }

// // Separate component for routes to use AuthContext
// function AppRoutes() {
//   const { user, loading } = useAuth();

//   if (loading) {
//     // Show a global loading spinner while AuthContext is initializing
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

//       {/* Protected routes */}
//       <Route element={<MainLayout><ProtectedRoute allowedRoles={['Admin', 'Manager', 'Clerk']} /></MainLayout>}>
//         <Route path="/dashboard" element={<Dashboard />} />
//       </Route>
//       <Route element={<MainLayout><ProtectedRoute allowedRoles={['Admin', 'Manager', 'Clerk']} /></MainLayout>}>
//         <Route path="/products" element={<Products />} />
//       </Route>
//       <Route element={<MainLayout><ProtectedRoute allowedRoles={['Admin', 'Manager']} /></MainLayout>}>
//         <Route path="/suppliers" element={<Suppliers />} />
//       </Route>
//       <Route element={<MainLayout><ProtectedRoute allowedRoles={['Admin', 'Manager', 'Clerk']} /></MainLayout>}>
//         <Route path="/orders" element={<Orders />} />
//       </Route>
//       <Route element={<MainLayout><ProtectedRoute allowedRoles={['Admin']} /></MainLayout>}>
//         <Route path="/users" element={<Users />} />
//       </Route>

//       {/* Catch-all for undefined routes */}
//       <Route path="*" element={
//         <div className="flex items-center justify-center h-screen bg-gray-100">
//           <div className="text-center">
//             <h1 className="text-9xl font-bold text-gray-800">404</h1>
//             <p className="text-2xl md:text-3xl font-light leading-normal text-gray-800 mb-8">
//               Sorry, we couldn't find this page.
//             </p>
//             <button
//               onClick={() => window.location.href = user ? '/dashboard' : '/login'}
//               className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
//             >
//               Go to Home
//             </button>
//           </div>
//         </div>
//       } />
//     </Routes>
//   );
// }

// export default App;


import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Sidebar from './components/Sidebar';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Always show topbar with toggle button */}
        <header className="bg-white shadow-md p-4 flex items-center justify-between">
          <button onClick={toggleSidebar} className="text-gray-600 focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Inventory Tool</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

      <Route element={<MainLayout><ProtectedRoute allowedRoles={['Admin', 'Manager', 'Clerk']} /></MainLayout>}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route element={<MainLayout><ProtectedRoute allowedRoles={['Admin', 'Manager', 'Clerk']} /></MainLayout>}>
        <Route path="/products" element={<Products />} />
      </Route>
      <Route element={<MainLayout><ProtectedRoute allowedRoles={['Admin', 'Manager']} /></MainLayout>}>
        <Route path="/suppliers" element={<Suppliers />} />
      </Route>
      <Route element={<MainLayout><ProtectedRoute allowedRoles={['Admin', 'Manager', 'Clerk']} /></MainLayout>}>
        <Route path="/orders" element={<Orders />} />
      </Route>
      <Route element={<MainLayout><ProtectedRoute allowedRoles={['Admin']} /></MainLayout>}>
        <Route path="/users" element={<Users />} />
      </Route>

      <Route
        path="*"
        element={
          <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
              <h1 className="text-9xl font-bold text-gray-800">404</h1>
              <p className="text-2xl font-light leading-normal text-gray-800 mb-8">
                Sorry, we couldn't find this page.
              </p>
              <button
                onClick={() => window.location.href = user ? '/dashboard' : '/login'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Go to Home
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
