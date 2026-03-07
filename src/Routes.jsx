import React from "react";
import { Routes, Route } from "react-router-dom";

import NotFound from "./components/404";
import AuthRoute from "./components/AuthRoute";
import UnAuthRoute from "./components/UnAuthRoute";
import Home from "./components/Home";
import Login from "./components/Login";
import AddNote from "./components/Notes/AddNote";
import Notes from "./components/Notes/Notes";
import Settings from "./components/Settings";
import Signup from "./components/SignUp";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<UnAuthRoute><Login /></UnAuthRoute>} />
      <Route path="/signup" element={<UnAuthRoute><Signup /></UnAuthRoute>} />
      <Route path="/notes/:id" element={<AuthRoute><Notes /></AuthRoute>} />
      <Route path="/note/new" element={<AuthRoute><AddNote /></AuthRoute>} />
      <Route path="/settings" element={<AuthRoute><Settings /></AuthRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
