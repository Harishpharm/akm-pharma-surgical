import React, { useContext, useState, useMemo, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import SearchBar from './SearchBar';
import ProductCard from './ProductCard';
import Cart from './Cart';
import { CartIcon } from './Icons';

const CustomerPortal: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { products, cart, user, refreshFromGoogleSheet, googleSheetId, isSyncing } = context;
    const [searchTerm, setSearchTerm] = useState('');
    const [manufacturerFilter, setManufacturerFilter] = useState('all');
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Automation: Sync data as soon as the portal loads
    useEffect(() => {
        if (googleSheetId) {
            refreshFromGoogleSheet();
            const interval = setInterval(refreshFromGoogleSheet, 300000);
            return () => clearInterval(interval);
        }
    }, [refreshFromGoogleSheet, googleSheetId]);

    const manufacturers = useMemo(() => ['all', ...Array.from(new Set(products.map(p => p.manufacturer)))], [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesManufacturer = manufacturerFilter === 'all' || product.manufacturer === manufacturerFilter;
            return matchesSearch && matchesManufacturer;
        });
    }, [products, searchTerm, manufacturerFilter]);
    
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'Very Good': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
            case 'Good': return 'bg-blue-50 text-blue-800 border-blue-200';
            case 'Moderate': return 'bg-orange-50 text-orange-800 border-orange-200';
            case 'Critical': return 'bg-red-50 text-red-800 border-red-200';
            default: return 'bg-slate-50 text-slate-800 border-slate-200';
        }
    };

    return (
        <div className="container mx-auto px-6 pt-40 md:pt-48 pb-20">
            {/* Account Status Banner */}
            {user && (
                <div className={`mb-8 p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center ${getStatusColor(user.creditStatus)}`}>
                    <div>
                        <h2 className="font-black text-lg uppercase tracking-tighter">Account Status: {user.creditStatus || 'Unknown'}</h2>
                        <p className="text-[12px] font-bold opacity-90 uppercase tracking-widest mt-1">
                            {user.creditStatus === 'Critical' 
                                ? 'Ordering Blocked: Due to overdue payments (>60 days).' 
                                : `Outstanding Dues: ₹${user.outstandingAmount?.toFixed(2) || '0.00'}`
                            }
                        </p>
                    </div>
                    {user.creditStatus === 'Critical' && (
                        <span className="mt-4 md:mt-0 px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl animate-pulse">
                            Restricted Access
                        </span>
                    )}
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <h1 className="text-3xl md:text-5xl font-black text-brand-dark tracking-tighter uppercase">Web <span className="text-brand-blue">Ordering</span></h1>
                <div className="flex items-center space-x-2 text-slate-400">
                    <span className="text-[10px] font-black uppercase tracking-widest">Inventory Status:</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${googleSheetId ? 'text-brand-green' : 'text-amber-500'}`}>
                        {googleSheetId ? (isSyncing ? 'Syncing...' : 'Live Sync') : 'Configuration Pending'}
                    </span>
                </div>
            </div>

            {!googleSheetId ? (
                <div className="bg-amber-50 border border-amber-200 p-16 rounded-[2.5rem] text-center" role="alert">
                    <div className="text-5xl mb-6">⚙️</div>
                    <h3 className="text-xl font-black text-amber-900 uppercase tracking-tight">System Setup Required</h3>
                    <p className="text-amber-700 font-bold mt-2 max-w-md mx-auto">
                        The inventory link is not yet configured. Please log in as an <b>Administrator</b> and enter the Google Sheet ID to activate the portal.
                    </p>
                </div>
            ) : products.length === 0 ? (
                 <div className="bg-brand-grey border border-brand-border p-20 rounded-[3rem] text-center" role="alert">
                    <div className="w-16 h-16 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mx-auto mb-8"></div>
                    <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight">Catalog Syncing...</h3>
                    <p className="text-slate-500 font-bold mt-2">Connecting to secure cloud database. Please wait.</p>
                </div>
            ) : (
                <>
                    <SearchBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        manufacturerFilter={manufacturerFilter}
                        setManufacturerFilter={setManufacturerFilter}
                        manufacturers={manufacturers}
                        allProducts={products}
                    />
                    
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 bg-brand-grey rounded-[3rem] border-2 border-dashed border-slate-200 mt-12">
                            <div className="text-5xl mb-6">🔍</div>
                            <h3 className="text-xl font-black text-brand-dark uppercase">No Products Found</h3>
                            <p className="text-slate-500 font-bold mt-2">Adjust your search or filter to see more results.</p>
                        </div>
                    )}
                </>
            )}

            {/* Sticky Cart Button */}
            <div className="fixed bottom-8 right-8 z-40">
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="bg-brand-blue text-white rounded-[2rem] p-6 shadow-2xl hover:scale-110 transition-transform active:scale-95 focus:outline-none ring-4 ring-white"
                    aria-label="Open Cart"
                >
                    <CartIcon className="w-8 h-8"/>
                    {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-brand-green text-white text-[10px] font-black rounded-full h-8 w-8 flex items-center justify-center border-4 border-white">
                            {cartItemCount}
                        </span>
                    )}
                </button>
            </div>
            
            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
};

export default CustomerPortal;