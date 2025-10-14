import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import { Toaster } from '@/components/ui/sonner';

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-center" />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/repos" element={<Repositories />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
