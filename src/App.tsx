import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages Here
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Components Here
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "./protected/ProtectedRoute";
import WritePrescription from "./pages/WritePrescription";

function App() {
    return (
        <>
            <Toaster />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/write-prescription"
                        element={
                            <ProtectedRoute>
                                <WritePrescription />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
