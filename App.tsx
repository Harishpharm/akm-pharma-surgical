
import React, { useContext, useState } from 'react';
import { AppContext } from './context/AppContext';
import Login from './components/Login';
import OwnerDashboard from './components/OwnerDashboard';
import CustomerPortal from './components/CustomerPortal';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Family from './components/Family';
import { WhatsAppIcon } from './components/Icons';

const App: React.FC = () => {
  const context = useContext(AppContext);
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'contact' | 'order' | 'family'>('home');

  if (!context) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-brand-grey">
        <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mb-4"></div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Initializing Core Systems</span>
      </div>
    );
  }

  const { user } = context;

  const renderOrderSystem = () => {
    if (!user) return <Login />;
    if (user.role === 'owner') return <OwnerDashboard />;
    if (user.role === 'customer') return <CustomerPortal />;
    return <Login />;
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onOrderClick={() => setCurrentPage('order')} onContactClick={() => setCurrentPage('contact')} />;
      case 'about': return <About />;
      case 'family': return <Family />;
      case 'contact': return <Contact />;
      case 'order': return renderOrderSystem();
      default: return <Home onOrderClick={() => setCurrentPage('order')} onContactClick={() => setCurrentPage('contact')} />;
    }
  };

  const whatsappUrl = "https://wa.me/917448811335?text=Hi%20AKM%20Pharma,%20I'd%20like%20to%20inquire%20about%20pharmaceutical%20supplies.";

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-brand-dark">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="flex-grow pt-0">
        {renderPage()}
      </main>

      {/* Floating WhatsApp Action Button - Positioned on right, stacked above cart */}
      <a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-32 right-8 z-[90] bg-[#25D366] text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group ring-4 ring-white"
        aria-label="Message on WhatsApp"
      >
        <WhatsAppIcon className="w-8 h-8" />
        <span className="absolute right-full mr-4 whitespace-nowrap bg-brand-dark text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          Chat now
        </span>
      </a>
      
      {/* Clinical Professional Footer */}
      <footer className="bg-brand-grey pt-24 pb-12 border-t border-brand-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
               <div className="mb-8">
                 <h2 className="text-3xl font-black text-brand-blue tracking-tighter uppercase leading-none">AKM</h2>
                 <p className="text-[12px] font-bold text-slate-800 uppercase tracking-widest mt-1">Pharma and Surgicals</p>
               </div>
               <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-xs mt-4">
                 The authorized leader in pharmaceutical logistics, respiratory care sales, and surgical distribution for healthcare providers.
               </p>
            </div>
            
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-8">Navigation</h4>
              <ul className="space-y-4 text-xs font-bold text-slate-600">
                <li onClick={() => setCurrentPage('home')} className="hover:text-brand-green cursor-pointer">Main Hub</li>
                <li onClick={() => setCurrentPage('about')} className="hover:text-brand-green cursor-pointer">Corporate History</li>
                <li onClick={() => setCurrentPage('family')} className="hover:text-brand-green cursor-pointer">Our Ecosystem</li>
                <li onClick={() => setCurrentPage('order')} className="hover:text-brand-green cursor-pointer">Order Portal</li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-8">Wholesale Verticals</h4>
              <ul className="space-y-4 text-xs font-bold text-slate-600">
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-brand-green rounded-full mr-2"></span> Authorized Pharma</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-brand-green rounded-full mr-2"></span> Oxygen Sales & Rent</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-brand-green rounded-full mr-2"></span> CPAP/BiPAP Supply</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-brand-green rounded-full mr-2"></span> Medical Consumables</li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-8">Direct Contact</h4>
              <div className="text-xs font-bold text-slate-600 space-y-2">
                <p>Chengalpattu, Tamil Nadu 603001</p>
                <p className="font-black text-brand-dark">+91 74488 11335</p>
                <p>+91 74488 44406</p>
                <p>+91 70100 72756</p>
                <p className="pt-2 text-[10px] text-slate-400">akmpharmaandsurgicals@gmail.com</p>
              </div>
            </div>
          </div>
          
          <div className="pt-10 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
              © {new Date().getFullYear()} AKM PHARMA & SURGICALS. ALL RIGHTS RESERVED.
            </p>
            <div className="flex space-x-8 text-[9px] font-bold uppercase tracking-widest text-slate-400">
               <span className="hover:text-brand-blue cursor-pointer">Compliance</span>
               <span className="hover:text-brand-blue cursor-pointer">Privacy</span>
               <span className="hover:text-brand-blue cursor-pointer">Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
