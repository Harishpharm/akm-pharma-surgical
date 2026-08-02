
import React, { useState, useEffect } from 'react';
import { WhatsAppIcon } from './Icons';

interface HomeProps {
  onOrderClick: () => void;
  onContactClick: () => void;
}

const slides = [
  {
    gradient: "from-slate-900 via-blue-950 to-indigo-900",
    tag: "PHARMA DISTRIBUTION",
    title: "Authorized Wholesale Solutions.",
    description: "Reliable distribution for 40+ global brands including Cipla, Abbott, Mankind, Alkem, Viatris, Lupin, Micro Labs, Aqua Labs, Healing Pharma, and Universal Life Science. Trusted partner for hospitals, clinics, and pharmacies."
  },
  {
    gradient: "from-blue-900 via-blue-800 to-sky-700",
    tag: "OXYGEN & RESPIRATORY",
    title: "Critical Life Support Equipment.",
    description: "Oxygen Concentrators, CPAP, and BiPAP machines. Sales and rental plans available 24/7 with technical support."
  },
  {
    gradient: "from-emerald-900 via-teal-900 to-brand-green",
    tag: "MEDICAL SUPPLIES",
    title: "High-Quality Surgical Consumables.",
    description: "A comprehensive range of surgical disposables, clinical kits, and high-precision medical instruments."
  }
];

const Home: React.FC<HomeProps> = ({ onOrderClick, onContactClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const whatsappUrl = "https://wa.me/917448811335?text=Hi%20AKM%20Pharma,%20I'd%20like%20to%20place%20an%20order.";

  return (
    <div className="bg-white">
      {/* High-Contrast Clinical Hero with Dynamic Gradients */}
      <section className="relative h-[600px] md:h-[750px] overflow-hidden bg-brand-dark">
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br ${slide.gradient} ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            {/* Abstract Decorative Elements for Professional Look */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-24 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>

            <div className="relative h-full container mx-auto px-6 flex items-center">
              <div className="max-w-4xl">
                <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md text-white border border-white/20 font-black text-[10px] tracking-[0.2em] rounded-lg mb-8 uppercase">
                  {slide.tag}
                </span>
                <h1 className="text-5xl md:text-8xl font-black text-white mb-8 leading-[0.95] tracking-tighter uppercase">
                  {slide.title.split('.').map((part, i) => (
                    <React.Fragment key={i}>
                        {part}{i === 0 && part.trim() !== '' ? <span className="text-brand-green">.</span> : ''}
                        <br className="hidden md:block" />
                    </React.Fragment>
                  ))}
                </h1>
                <p className="text-blue-100/80 text-lg md:text-xl font-medium mb-12 max-w-3xl leading-relaxed">
                  {slide.description}
                </p>
                
                <div className="flex flex-wrap gap-6 items-center">
                  {/* Catchy Web Order Portal Button */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-brand-green opacity-40 rounded-2xl blur-lg group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                    <button 
                      onClick={onOrderClick} 
                      className="relative bg-brand-green hover:bg-white hover:text-brand-dark text-white font-black px-12 py-6 rounded-2xl shadow-2xl transition-all active:scale-95 uppercase text-[11px] tracking-[0.2em] flex items-center space-x-4"
                    >
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                      </span>
                      <span>WEB ORDER PORTAL</span>
                    </button>
                  </div>

                  <button 
                    onClick={onContactClick} 
                    className="bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white hover:text-brand-dark font-black px-10 py-6 rounded-2xl transition-all active:scale-95 uppercase text-[11px] tracking-[0.2em]"
                  >
                    Equipment Rental
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation Indicators */}
        <div className="absolute bottom-12 left-6 md:left-12 flex items-center space-x-4">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-16 bg-brand-green' : 'w-6 bg-white/20 hover:bg-white/40'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
          <span className="text-white/30 text-[10px] font-black tracking-widest ml-4 uppercase">
            0{currentSlide + 1} / 0{slides.length}
          </span>
        </div>
      </section>

      {/* Core Services Grid */}
      <section className="py-24 bg-brand-grey border-y border-brand-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tighter uppercase mb-4">
              Integrated <span className="text-brand-green">Healthcare</span> Services
            </h2>
            <div className="w-20 h-1.5 bg-brand-blue mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-2xl shadow-clinical border border-brand-border group hover:border-brand-green transition-colors">
              <div className="w-16 h-16 bg-emerald-50 text-brand-green rounded-xl flex items-center justify-center text-3xl mb-8 group-hover:bg-brand-green group-hover:text-white transition-all">
                💊
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3 uppercase">Pharma Wholesale</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Authorized stockist for 40+ global leaders. Primary supplier for hospitals, clinics, and pharmacies with verified supply chains.</p>
            </div>

            <div className="bg-white p-10 rounded-2xl shadow-clinical border border-brand-border group hover:border-brand-blue transition-colors">
              <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-xl flex items-center justify-center text-3xl mb-8 group-hover:bg-brand-blue group-hover:text-white transition-all">
                💨
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3 uppercase">Respiratory Care</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Sales and Rental of Oxygen Concentrators and CPAP machines. Professional technical support available 24/7.</p>
            </div>

            <div className="bg-white p-10 rounded-2xl shadow-clinical border border-brand-border group hover:border-slate-800 transition-colors">
              <div className="w-16 h-16 bg-slate-50 text-brand-dark rounded-xl flex items-center justify-center text-3xl mb-8 group-hover:bg-brand-dark group-hover:text-white transition-all">
                ⚕️
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3 uppercase">Surgical Hub</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Reliable supply of clinical disposables and surgical instruments delivered across the region with maximum speed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-24 container mx-auto px-6">
        <div className="bg-brand-dark rounded-[2.5rem] p-12 md:p-20 text-white flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-8 leading-none tracking-tighter uppercase">
              10 Years of <span className="text-brand-green">Excellence.</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">
              Serving the medical community with verified, authorized, and genuine pharmaceutical products. Our digital portal ensures seamless wholesale procurement.
            </p>
            <div className="flex gap-12">
              <div>
                <p className="text-4xl font-extrabold text-white">100%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green">Authentic</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-white">24/7</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Response</p>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <div className="bg-white text-brand-dark p-10 rounded-3xl shadow-2xl text-center">
               <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-4">Stockist Hub</p>
               <div className="space-y-1 mb-8">
                  <p className="text-2xl font-black">+91 74488 11335</p>
                  <p className="text-lg font-bold opacity-75">+91 74488 44406</p>
                  <p className="text-lg font-bold opacity-75">+91 70100 72756</p>
               </div>
               
               <div className="space-y-3 mb-8">
                  <a 
                    href="tel:+917448811335"
                    className="w-full bg-brand-blue text-white font-bold py-4 px-10 rounded-xl text-xs uppercase tracking-widest hover:bg-brand-dark transition-all block text-center"
                  >
                      Call Now
                  </a>
                  <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] text-white font-bold py-4 px-10 rounded-xl text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center space-x-2"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>Message on WhatsApp</span>
                  </a>
               </div>
               <p className="text-slate-500 text-[10px] font-bold">akmpharmaandsurgicals@gmail.com</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
