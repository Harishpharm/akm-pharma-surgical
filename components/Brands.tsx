
import React, { useState } from 'react';

const Brands: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Curated list of major pharmaceutical companies with verified domains for precise logo fetching
  const brandList = [
    { name: 'Abbott Healthcare', domain: 'abbott.com' },
    { name: 'Alkem Laboratories', domain: 'alkemlabs.com' },
    { name: 'Apex Laboratories', domain: 'apexlab.com' },
    { name: 'Aristo Pharmaceuticals', domain: 'aristopharma.org' },
    { name: 'AstraZeneca', domain: 'astrazeneca.com' },
    { name: 'Bayer Pharmaceuticals', domain: 'bayer.com' },
    { name: 'Blue Cross Labs', domain: 'bluecrosslabs.com' },
    { name: 'Cadila Pharmaceuticals', domain: 'cadilapharma.com' },
    { name: 'Cipla Limited', domain: 'cipla.com' },
    { name: 'Dr. Reddy\'s', domain: 'drreddys.com' },
    { name: 'Eris Lifesciences', domain: 'erislifesciences.com' },
    { name: 'Glenmark Pharma', domain: 'glenmarkpharma.com' },
    { name: 'GSK India', domain: 'gsk.com' },
    { name: 'Intas Pharmaceuticals', domain: 'intaspharma.com' },
    { name: 'Ipca Laboratories', domain: 'ipca.com' },
    { name: 'JB Chemicals', domain: 'jbcpl.com' },
    { name: 'Lupin Limited', domain: 'lupin.com' },
    { name: 'Mankind Pharma', domain: 'mankindpharma.com' },
    { name: 'Micro Labs', domain: 'microlabsltd.com' },
    { name: 'MSD India', domain: 'msd.com' },
    { name: 'Novartis', domain: 'novartis.com' },
    { name: 'Pfizer India', domain: 'pfizer.com' },
    { name: 'Sanofi India', domain: 'sanofi.com' },
    { name: 'Sun Pharma', domain: 'sunpharma.com' },
    { name: 'Torrent Pharma', domain: 'torrentpharma.com' },
    { name: 'USV Private Limited', domain: 'usv.in' },
    { name: 'Zydus Lifesciences', domain: 'zyduslife.com' },
  ];

  const filteredBrands = brandList.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen pt-40 pb-32">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <span className="text-brand-blue font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Our Distribution Partners</span>
            <h2 className="text-4xl md:text-6xl font-black text-brand-dark tracking-tighter leading-none uppercase">
              Authorized <span className="text-brand-green">Global</span> Brands.
            </h2>
            <p className="text-slate-500 text-lg font-bold mt-6">
              Direct wholesale supply chain for India's leading pharmaceutical manufacturers and international healthcare giants.
            </p>
          </div>
          
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text"
              placeholder="Search manufacturers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-brand-grey border-2 border-transparent rounded-2xl focus:border-brand-blue focus:bg-white focus:outline-none transition-all font-bold text-brand-dark shadow-sm"
            />
          </div>
        </div>

        {/* Dynamic Grid of Exact Logos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredBrands.map((brand) => (
            <div 
              key={brand.name} 
              className="group bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:border-brand-blue/20 transition-all duration-500 flex flex-col items-center justify-between text-center min-h-[220px]"
            >
              <div className="w-full flex-grow flex items-center justify-center p-4">
                <img 
                  src={`https://logo.clearbit.com/${brand.domain}?size=512`} 
                  alt={`${brand.name} official logo`}
                  className="max-h-24 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700"
                  loading="lazy"
                  onError={(e) => {
                    // Professional medical fallback if logo fails
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=f1f5f9&color=2563eb&bold=true&size=512&font-size=0.33`;
                    target.classList.remove('grayscale');
                  }}
                />
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-50 w-full">
                <p className="text-[10px] font-black text-brand-dark uppercase tracking-tighter line-clamp-1 mb-1 group-hover:text-brand-blue transition-colors">
                  {brand.name}
                </p>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Authorized Stockist
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBrands.length === 0 && (
          <div className="text-center py-32 bg-brand-grey rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="text-5xl mb-6">🔍</div>
            <h3 className="text-xl font-black text-brand-dark uppercase">No Manufacturers Found</h3>
            <p className="text-slate-500 font-bold mt-2">Try searching for another pharmaceutical group.</p>
          </div>
        )}

        {/* Promotional Banner */}
        <div className="mt-32 bg-brand-dark rounded-[3.5rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-blue/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
           
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="max-w-2xl text-center lg:text-left">
                <span className="inline-block bg-brand-green text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-8">
                  Wholesale Procurement
                </span>
                <h3 className="text-4xl md:text-6xl font-black mb-10 leading-none tracking-tighter uppercase">
                  Bulk Supply <br/>
                  <span className="text-brand-blue">Simplified.</span>
                </h3>
                <p className="text-slate-400 text-lg font-bold leading-relaxed">
                  Are you a pharmacy owner or a hospital procurement manager? Access our digital portal to see live stock levels and exclusive schemes for all brands listed above.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] w-full lg:w-96 text-center">
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">Direct Access Lines</p>
                 <div className="space-y-2 mb-10">
                    <p className="text-2xl font-black">+91 74488 11335</p>
                    <p className="text-xl font-bold opacity-75">+91 74488 44406</p>
                    <p className="text-xl font-bold opacity-75">+91 70100 72756</p>
                    <p className="text-xs font-bold text-brand-blue pt-2">akmpharmaandsurgicals@gmail.com</p>
                 </div>
                 <button className="w-full bg-brand-blue hover:bg-white hover:text-brand-dark text-white font-black py-5 rounded-2xl transition-all shadow-xl uppercase tracking-widest text-[11px] active:scale-95">
                    Launch Order Portal
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Brands;
