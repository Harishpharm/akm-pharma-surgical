
import React from 'react';

const Family: React.FC = () => {
  const familyCompanies = [
    {
      name: 'AKM Clinic 24/7',
      location: 'Rettanai',
      desc: 'Comprehensive outpatient care and emergency clinical services available around the clock.',
      icon: '🏥',
      color: 'bg-blue-50 text-brand-blue'
    },
    {
      name: 'AKM Labs',
      location: 'Rettanai',
      desc: 'State-of-the-art diagnostic testing and pathology services for precise medical analysis.',
      icon: '🔬',
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      name: 'AKM Pharmacy',
      location: 'Rettanai',
      desc: 'Trusted retail pharmacy providing direct-to-patient genuine medical supplies.',
      icon: '💊',
      color: 'bg-orange-50 text-brand-orange'
    },
    {
      name: 'Prayaan Medicals',
      location: 'Gingee',
      desc: 'High-quality medical retail catering to the healthcare needs of the Gingee region.',
      icon: '🩺',
      color: 'bg-purple-50 text-brand-purple'
    },
    {
      name: 'Villupuram Drug House',
      location: 'Villupuram',
      desc: 'Prominent pharmaceutical distribution hub serving the Villupuram district.',
      icon: '🏢',
      color: 'bg-slate-50 text-brand-dark'
    }
  ];

  return (
    <div className="bg-brand-grey min-h-screen pt-40 pb-32">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <span className="text-brand-green font-bold uppercase tracking-[0.3em] text-[10px] mb-6 block">Our Corporate Ecosystem</span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-brand-dark mb-8 tracking-tighter uppercase">
            The <span className="text-brand-blue">AKM Group</span> Network
          </h2>
          <p className="text-slate-600 text-xl font-medium leading-relaxed">
            AKM Pharma and Surgicals is supported by a robust network of clinics, labs, and pharmacies across the region, ensuring end-to-end medical integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {familyCompanies.map((comp) => (
            <div key={comp.name} className="group flex flex-col p-10 bg-white rounded-3xl shadow-clinical hover:shadow-elevated hover:translate-y-[-5px] transition-all duration-300 border border-brand-border">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 ${comp.color} transition-transform group-hover:scale-110`}>
                {comp.icon}
              </div>
              <h3 className="text-2xl font-extrabold text-brand-dark mb-1 uppercase tracking-tighter">{comp.name}</h3>
              <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-6">{comp.location}</p>
              <p className="text-slate-500 text-sm font-medium leading-relaxed flex-grow">{comp.desc}</p>
              <div className="mt-8 pt-6 border-t border-brand-grey flex items-center text-brand-green font-bold text-xs uppercase tracking-widest">
                <span>View Details</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4 4H3"/></svg>
              </div>
            </div>
          ))}
        </div>

        {/* Corporate Motto Banner */}
        <div className="mt-32 text-center">
            <div className="inline-flex items-center space-x-4 bg-brand-dark text-white px-10 py-5 rounded-2xl shadow-xl">
                <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
                <span className="text-sm font-bold uppercase tracking-widest">Unified Excellence in Healthcare Distribution</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Family;
