
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="bg-white min-h-screen pt-40 pb-32">
      <div className="container mx-auto px-6">
        {/* Story Section */}
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-24 items-center mb-32">
          <div className="lg:w-1/2 relative">
             <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-premium border-[12px] border-white transition-transform duration-700 hover:scale-[1.02]">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070" 
                  className="w-full aspect-[4/5] object-cover"
                  alt="Laboratory"
                />
             </div>
             
             {/* Stats Overlay - High Visibility */}
             <div className="absolute bottom-12 -right-6 bg-brand-blue p-8 rounded-[2.5rem] shadow-2xl z-20">
                <p className="text-4xl font-black text-brand-green mb-1">10+</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Years of Service</p>
             </div>
          </div>

          <div className="lg:w-1/2">
            <span className="inline-block px-5 py-2 bg-brand-green/10 text-brand-green font-black uppercase tracking-[0.3em] text-[10px] rounded-full mb-8">
              Legacy of Care
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-brand-dark mb-10 tracking-tighter leading-none uppercase">
              The Reliable Heart of <br/>
              <span className="text-brand-green">Pharma Distribution.</span>
            </h2>
            
            <div className="space-y-8 text-slate-600 text-lg leading-relaxed font-bold">
              <p>
                AKM Pharma and Surgicals is the authorized gateway for premium healthcare solutions in Chengalpattu. We bridge the gap between global manufacturers and local patient care.
              </p>
              <p>
                From specialized surgical kits to critical respiratory equipment like Oxygen Concentrators and CPAP machines, our mission is to ensure every facility is fully equipped to save lives.
              </p>
            </div>

            <div className="flex items-center gap-10 mt-12 border-t border-slate-100 pt-12">
               <div>
                  <h4 className="text-3xl font-black text-brand-dark">100%</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized</p>
               </div>
               <div className="w-px h-12 bg-slate-200"></div>
               <div>
                  <h4 className="text-3xl font-black text-brand-dark">24h</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Turnaround</p>
               </div>
            </div>
          </div>
        </div>

        {/* Mission/Vision - High Contrast */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            <div className="p-16 bg-brand-dark rounded-[3rem] transition-all duration-500 hover:translate-y-[-10px]">
                <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center text-3xl mb-8">🔭</div>
                <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">Our Vision</h3>
                <p className="text-slate-400 text-lg font-bold leading-relaxed">
                  To be the gold standard in pharmaceutical logistics, empowering clinics with the world's most advanced medical gear and medications.
                </p>
            </div>
            <div className="p-16 bg-brand-green rounded-[3rem] transition-all duration-500 hover:translate-y-[-10px]">
                <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center text-3xl mb-8">🚀</div>
                <h3 className="text-3xl font-black text-brand-dark mb-6 uppercase tracking-tighter">Our Mission</h3>
                <p className="text-slate-900 text-lg font-bold leading-relaxed">
                  Eliminating healthcare bottlenecks by providing a comprehensive, digital, and ethical supply range at competitive wholesale rates.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default About;
