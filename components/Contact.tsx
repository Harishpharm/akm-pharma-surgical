
import React from 'react';
import { WhatsAppIcon } from './Icons';

const Contact: React.FC = () => {
  const mapUrl = "https://share.google/F0p9wOp3czrfznclt";

  const rentalItems = [
    {
      name: 'Oxygen Concentrators',
      specs: '5L / 10L High Purity Output',
      description: 'Medical-grade oxygen supply for home and clinical use. 24/7 delivery and setup included.',
      icon: '💨'
    },
    {
      name: 'CPAP Machines',
      specs: 'Auto-Adjusting Pressure',
      description: 'Advanced sleep apnea therapy with humidification. Top brands like ResMed and Philips.',
      icon: '😴'
    },
    {
      name: 'BiPAP Machines',
      specs: 'Non-Invasive Ventilation',
      description: 'Dual-pressure support for complex respiratory conditions. Technical calibration provided.',
      icon: '🫁'
    }
  ];

  const whatsappBaseUrl = "https://wa.me/917448811335?text=Hi%20AKM%20Pharma,%20I'd%20like%20to%20inquire%20about%20your%20services.";

  return (
    <div className="bg-white min-h-screen pt-40 pb-20">
      <div className="container mx-auto px-6">
        {/* Rental Section - High Visibility */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <span className="inline-block px-5 py-2 bg-brand-blue/10 text-brand-blue font-black uppercase tracking-[0.3em] text-[10px] rounded-full mb-6">
              Critical Life Support
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-brand-dark tracking-tighter leading-none uppercase mb-6">
              Medical Equipment <span className="text-brand-green">Rental Hub.</span>
            </h2>
            <p className="text-slate-500 text-lg font-bold max-w-2xl mx-auto">
              Authorized sales and professional rental plans for respiratory care. We provide technical installation and 24/7 support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {rentalItems.map((item) => (
              <div key={item.name} className="bg-brand-grey border border-brand-border rounded-[2.5rem] p-10 group hover:bg-white hover:shadow-2xl transition-all duration-500 flex flex-col">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black text-brand-dark mb-2 uppercase tracking-tight">{item.name}</h3>
                <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-4">{item.specs}</p>
                <p className="text-slate-500 text-sm font-bold leading-relaxed mb-8 flex-grow">{item.description}</p>
                <div className="pt-6 border-t border-slate-200 flex flex-col space-y-3">
                  <a href="tel:+917448811335" className="inline-block bg-brand-dark text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue transition-all active:scale-95 shadow-lg shadow-brand-dark/10 text-center">
                    Inquire Now &rarr;
                  </a>
                  <a href={whatsappBaseUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-2 bg-[#25D366] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95">
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Details & Map */}
        <section className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="bg-brand-dark p-12 text-white rounded-[3rem] shadow-2xl">
              <h3 className="text-2xl font-black mb-10 uppercase tracking-tighter border-b border-white/10 pb-6">Logistics Centre</h3>
              <div className="space-y-10">
                <div>
                  <p className="text-brand-blue text-[10px] font-black uppercase tracking-widest mb-3">Operational Address</p>
                  <p className="text-lg font-bold leading-relaxed text-slate-300">
                    No: A45, 2nd main road, <br/>
                    9th cross street, Anna Nagar, <br/>
                    Chengalpattu-603001
                  </p>
                </div>
                <div>
                  <p className="text-brand-blue text-[10px] font-black uppercase tracking-widest mb-4">Direct Dispatch Lines</p>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-2xl font-black group-hover:text-brand-green transition-colors">+91 74488 11335</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary Line</p>
                      </div>
                      <a href={`https://wa.me/917448811335`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#25D366] rounded-xl hover:scale-110 transition-transform">
                        <WhatsAppIcon className="w-5 h-5" />
                      </a>
                    </div>
                    
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-xl font-black opacity-80 group-hover:text-brand-blue transition-colors">+91 74488 44406</p>
                        {/* Label removed per user request */}
                      </div>
                      <a href={`https://wa.me/917448844406`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#25D366]/20 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition-all">
                        <WhatsAppIcon className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-xl font-black opacity-80 group-hover:text-brand-blue transition-colors">+91 70100 72756</p>
                        {/* Label removed per user request */}
                      </div>
                      <a href={`https://wa.me/917010072756`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#25D366]/20 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition-all">
                        <WhatsAppIcon className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-brand-blue text-[10px] font-black uppercase tracking-widest mb-3">Email Support</p>
                  <p className="text-lg font-bold text-slate-300">akmpharmaandsurgicals@gmail.com</p>
                </div>
              </div>
              
              <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[9px] font-black text-brand-green uppercase tracking-widest mb-2">Technical Assistance</p>
                <p className="text-xs font-bold text-slate-400">Available 24/7 for Rental Equipment troubleshooting and emergency refills.</p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex flex-col h-full">
                <div className="h-full min-h-[500px] shadow-2xl rounded-[3rem] overflow-hidden relative border-[12px] border-white group">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3893.3440939316534!2d79.98394237583486!3d12.69106092102061!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52f99097e30761%3A0xc68294711f582046!2s9th%20Cross%20St%2C%20Anna%20Nagar%2C%20Chengalpattu%2C%20Tamil%20Nadu%20603001!5e0!3m2!1sen!2sin!4v1740000000000!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, minHeight: '500px' }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                  <div className="absolute top-8 left-8 bg-brand-dark text-white px-6 py-3 rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest border border-white/10">
                    AKM Distribution Hub
                  </div>
                </div>
                <div className="mt-8 flex justify-center">
                   <a 
                    href={mapUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-brand-grey text-brand-dark font-black uppercase tracking-widest text-[11px] px-8 py-4 rounded-xl hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    Navigate with Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
