
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { UserIcon, LogoutIcon, DownloadIcon } from './Icons';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: 'home' | 'about' | 'contact' | 'order' | 'family') => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const context = useContext(AppContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!context) return null;
  const { user, logout, catalogueData, products } = context;

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'History', id: 'about' },
    { label: 'Rentals & Support', id: 'contact' },
    { label: 'Order Portal', id: 'order' },
  ];

  const handleNavClick = (id: any) => {
    onNavigate(id);
    setIsMenuOpen(false);
  };

  const downloadCatalogue = () => {
    try {
      if (catalogueData) {
        const link = document.createElement('a');
        link.href = catalogueData;
        link.download = (context as any).catalogueFileName || 'AKM_Pharma_Catalog.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("No PDF catalogue uploaded by the admin yet.");
      }
    } catch (error) {
      console.error("Error downloading catalogue:", error);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-2 px-4' : 'py-4 px-4'}`}>
      <div className="container mx-auto">
        <div className={`rounded-[2rem] px-4 md:px-8 py-2.5 flex justify-between items-center border transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md border-brand-border shadow-clinical' : 'bg-white border-transparent shadow-sm'}`}>
          
          <div 
            className="cursor-pointer flex items-center space-x-2 group" 
            onClick={() => handleNavClick('home')}
          >
            <div className="flex flex-col items-start justify-center pr-2">
                <span className="text-3xl md:text-4xl font-brand font-[900] italic leading-none tracking-tight uppercase text-[#0D47A1] drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
                  AKM
                </span>
                <span className="text-[8px] md:text-[9px] font-black text-slate-700 uppercase tracking-[0.25em] mt-1 ml-0.5">
                  Pharma & Surgicals
                </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all rounded-xl ${currentPage === item.id ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-500 hover:text-brand-blue hover:bg-brand-grey'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Download Catalogue Button */}
            <button 
              onClick={downloadCatalogue}
              className="hidden md:flex items-center space-x-2 px-4 lg:px-6 py-2.5 lg:py-4 text-[10px] font-black uppercase tracking-widest text-brand-blue bg-brand-blue/5 hover:bg-brand-blue hover:text-white rounded-xl lg:rounded-2xl transition-all border border-brand-blue/10 active:scale-95"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              <span>Download Catalogue</span>
            </button>

            {user ? (
              <div className="hidden md:flex items-center space-x-3 bg-brand-grey pl-2 pr-4 py-1.5 lg:py-2.5 rounded-xl lg:rounded-2xl border border-brand-border">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-brand-green rounded-lg lg:rounded-xl flex items-center justify-center text-white">
                  <UserIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-brand-dark leading-none">{user.name}</span>
                  <span className="text-[8px] text-brand-blue font-bold uppercase tracking-tighter">{user.role}</span>
                </div>
                <button onClick={logout} className="ml-2 p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                  <LogoutIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <a 
                href="tel:+917448811335" 
                className="flex md:flex bg-[#0D47A1] text-white text-[10px] font-black uppercase tracking-widest px-6 lg:px-10 py-3 lg:py-5 rounded-xl lg:rounded-2xl hover:bg-brand-dark transition-all shadow-xl active:scale-95 text-center items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 005.405 5.405l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                <span>Call Now</span>
              </a>
            )}

            <button 
              className="lg:hidden p-3.5 rounded-xl transition-all bg-brand-grey text-brand-dark active:scale-90"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`lg:hidden fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-[-1] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)} />
      
      <div className={`lg:hidden absolute top-full left-4 right-4 mt-2 transition-all duration-300 transform origin-top ${isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
        <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl border border-brand-border space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-8 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all ${currentPage === item.id ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-600 hover:bg-brand-grey'}`}
            >
              {item.label}
            </button>
          ))}
          
          <button onClick={downloadCatalogue} className="block w-full text-left px-8 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest text-brand-blue bg-blue-50 mt-2">
            Download Catalogue
          </button>

          {!user && (
             <div className="grid grid-cols-2 gap-2 mt-4">
                <a href="tel:+917448811335" className="flex items-center justify-center py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-brand-dark">
                    Call Now
                </a>
                <a href="https://wa.me/917448811335" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-[#25D366]">
                    WhatsApp
                </a>
             </div>
          )}

          {user && (
            <button onClick={logout} className="block w-full text-left px-8 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest text-red-500 bg-red-50 mt-4">
              Logout System
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
