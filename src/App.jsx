import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Generator from "./pages/Generator.jsx";
import Verify from "./pages/Verify.jsx";

const isAuthed = () => localStorage.getItem("auth_ok") === "1";

function PrivateRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/generator" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/generator"
        element={
          <PrivateRoute>
            <Generator />
          </PrivateRoute>
        }
      />
      <Route
        path="/verify"
        element={
          <PrivateRoute>
            <Verify />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/generator" replace />} />
    </Routes>
  );
}
