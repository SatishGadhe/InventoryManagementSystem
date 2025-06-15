// // src/components/Sidebar.js
// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const Sidebar = ({ isOpen, toggleSidebar }) => {
//   const { user, logout } = useAuth();

//   const navItems = [
//     { name: 'Dashboard', path: '/dashboard', roles: ['Admin', 'Manager', 'Clerk'] },
//     { name: 'Products', path: '/products', roles: ['Admin', 'Manager', 'Clerk'] },
//     { name: 'Suppliers', path: '/suppliers', roles: ['Admin', 'Manager'] },
//     { name: 'Orders', path: '/orders', roles: ['Admin', 'Manager', 'Clerk'] },
//     { name: 'Users', path: '/users', roles: ['Admin'] }, // Only Admin can manage users
//   ];

//   return (
//     <>
//       {/* Overlay for mobile view when sidebar is open */}
//       <div
//         className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-30 lg:hidden ${
//           isOpen ? 'block' : 'hidden'
//         }`}
//         onClick={toggleSidebar}
//       ></div>

//       <aside
//         className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transform ${
//           isOpen ? 'translate-x-0' : '-translate-x-full'
//         } lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
//       >
//         <div className="p-6 text-xl font-bold border-b border-gray-700 flex items-center justify-between">
//           <span>Inventory Tool</span>
//           <button onClick={toggleSidebar} className="lg:hidden text-white focus:outline-none">
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
//             </svg>
//           </button>
//         </div>

//         <nav className="flex-1 px-4 py-6 overflow-y-auto">
//           <ul>
//             {user && navItems.map((item) => (
//               // Only render if the user's role is allowed for this navigation item
//               item.roles.includes(user.role) && (
//                 <li key={item.name} className="mb-2">
//                   <NavLink
//                     to={item.path}
//                     className={({ isActive }) =>
//                       `flex items-center px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 ${
//                         isActive ? 'bg-gray-700 text-white font-semibold' : ''
//                       }`
//                     }
//                     onClick={toggleSidebar} // Close sidebar on nav item click (mobile)
//                   >
//                     {/* Placeholder for icons */}
//                     <span className="mr-3">📊</span> {/* Example icon */}
//                     {item.name}
//                   </NavLink>
//                 </li>
//               )
//             ))}
//           </ul>
//         </nav>

//         <div className="p-4 border-t border-gray-700">
//           {user && (
//             <div className="text-sm text-gray-400 mb-2">
//               Logged in as: <span className="font-semibold text-white">{user.username} ({user.role})</span>
//             </div>
//           )}
//           <button
//             onClick={logout}
//             className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out transform hover:scale-105"
//           >
//             Logout
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;



import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', roles: ['Admin', 'Manager', 'Clerk'] },
    { name: 'Products', path: '/products', roles: ['Admin', 'Manager', 'Clerk'] },
    { name: 'Suppliers', path: '/suppliers', roles: ['Admin', 'Manager'] },
    { name: 'Orders', path: '/orders', roles: ['Admin', 'Manager', 'Clerk'] },
    { name: 'Users', path: '/users', roles: ['Admin'] },
  ];

  return (
    <>
      {/* Overlay for all screen sizes */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-30 ${
          isOpen ? 'block' : 'hidden'
        }`}
        onClick={toggleSidebar}
      ></div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-6 text-xl font-bold border-b border-gray-700 flex items-center justify-between">
          <span>Inventory Tool</span>
          <button onClick={toggleSidebar} className="text-white focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul>
            {user &&
              navItems.map(
                (item) =>
                  item.roles.includes(user.role) && (
                    <li key={item.name} className="mb-2">
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 ${
                            isActive ? 'bg-gray-700 text-white font-semibold' : ''
                          }`
                        }
                        onClick={toggleSidebar}
                      >
                        <span className="mr-3">📊</span>
                        {item.name}
                      </NavLink>
                    </li>
                  )
              )}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          {user && (
            <div className="text-sm text-gray-400 mb-2">
              Logged in as: <span className="font-semibold text-white">{user.username} ({user.role})</span>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
