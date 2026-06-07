import { Outlet } from 'react-router-dom';
import TopInfoBar from '../components/TopInfoBar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CustomerChat from '../components/CustomerChat';


const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopInfoBar />
      <Navbar />
      
      {/* Outlet là nơi nội dung các trang (Home, Cart...) sẽ hiển thị */}
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
      <CustomerChat />
    </div>
  );
};

export default MainLayout;