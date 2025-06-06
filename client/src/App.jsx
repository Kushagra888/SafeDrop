import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Home from "./Home/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard/Dashboard";
import FileDownload from "./FIleDownload";
import RequireAuth from "./components/Auth/RequireAuth";
import NoRequireAuth from "./components/Auth/NotRequireAuth";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/f/:code" element={<FileDownload />} />
        
        {/* Auth Required Routes */}
        <Route element={<RequireAuth />}>
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Route>

        {/* Non-auth-only Routes */}
        <Route element={<NoRequireAuth />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
