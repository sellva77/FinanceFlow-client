import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
    return (
        <div className="app-layout">
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)'
                    },
                    success: {
                        iconTheme: { primary: '#10b981', secondary: '#fff' }
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#fff' }
                    }
                }}
            />
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
