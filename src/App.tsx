import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "./components/ui/provider"

import SetRoomId from "./pages/setroomid";
import Room from "./pages/room";

function App() {
  return (
    <Provider>
      <Router>
        <Routes>
          {/* Default route: go to /set-room-id */}
          <Route path="/" element={<Navigate to="/set-room-id" replace />} />
          <Route path="/set-room-id" element={<SetRoomId />} />
          {/* Room route with dynamic param */}
          <Route path="/room/:roomId" element={<Room />} />
          {/* Catch-all - if you want. Otherwise, remove or handle differently */}
          <Route path="*" element={<Navigate to="/set-room-id" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
