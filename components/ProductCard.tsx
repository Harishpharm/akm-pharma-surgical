
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Product } from '../types';
import { PlusIcon, MinusIcon } from './Icons';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const context = useContext(AppContext);
    
    const isLiquid = useMemo(() => /\d\s*(ml|gm|g)\b/i.test(product.name), [product.name]);
    const primaryUnit = isLiquid ? 'Piece' : 'Strip';

    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState<'Strip' | 'Box' | 'Piece'>(primaryUnit);
    const [added, setAdded] = useState(false);

    if (!context) return null;
    const { addToCart } = context;

    const isOutOfStock = product.stock <= 0;

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addToCart(product, quantity || 1, unit);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const increment = () => {
        if (isOutOfStock) return;
        setQuantity(prev => prev + 1);
    };
    
    const decrement = () => {
        if (isOutOfStock) return;
        setQuantity(prev => Math.max(1, prev - 1));
    };

    return (
        <div className={`bg-white rounded-3xl border shadow-sm hover:shadow-lg transition-all duration-300 p-5 flex flex-col h-full ${isOutOfStock ? 'border-slate-100 opacity-75' : 'border-slate-200'}`}>
            {/* Header: Manufacturer & Tags */}
            <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest opacity-80">
                    {product.manufacturer}
                </span>
                <div className="flex gap-1">
                    {isOutOfStock && (
                        <span className="bg-slate-100 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-slate-200 uppercase">
                            Out of Stock
                        </span>
                    )}
                    {product.offerPercentage && !isOutOfStock && (
                        <span className="bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-red-100">
                            -{product.offerPercentage}%
                        </span>
                    )}
                </div>
            </div>
            
            {/* Product Name - Guaranteed 2 lines */}
            <h3 className="text-[13px] font-black text-slate-800 leading-tight mb-4 line-clamp-2 min-h-[2.5rem]">
                {product.name}
            </h3>

            {/* Pricing Section */}
            <div className="flex items-baseline space-x-1.5 mb-5">
                <span className="text-xl font-black text-brand-dark">₹{product.price.toFixed(2)}</span>
                <span className="text-[9px] text-slate-400 font-black uppercase">/ {unit}</span>
            </div>

            <div className="mt-auto space-y-4">
                {/* Unit Selector Toggle */}
                <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button 
                        onClick={() => !isOutOfStock && setUnit(primaryUnit)} 
                        disabled={isOutOfStock}
                        className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${unit === primaryUnit ? 'bg-white shadow-sm text-brand-blue' : 'text-slate-400'}`}
                    >
                        {primaryUnit}
                    </button>
                    <button 
                        onClick={() => !isOutOfStock && setUnit('Box')} 
                        disabled={isOutOfStock}
                        className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${unit === 'Box' ? 'bg-white shadow-sm text-brand-blue' : 'text-slate-400'}`}
                    >
                        Box
                    </button>
                </div>

                {/* Quantity Stepper & Add Button */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-1">
                        <button 
                            onClick={decrement}
                            disabled={isOutOfStock}
                            className={`w-10 h-10 flex items-center justify-center transition-transform ${isOutOfStock ? 'text-slate-300' : 'text-slate-500 hover:text-brand-blue active:scale-90'}`}
                            aria-label="Decrease quantity"
                        >
                            <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className={`text-sm font-black ${isOutOfStock ? 'text-slate-300' : 'text-brand-dark'}`}>
                            {isOutOfStock ? 0 : quantity}
                        </span>
                        <button 
                            onClick={increment}
                            disabled={isOutOfStock}
                            className={`w-10 h-10 flex items-center justify-center transition-transform ${isOutOfStock ? 'text-slate-300' : 'text-slate-500 hover:text-brand-blue active:scale-90'}`}
                            aria-label="Increase quantity"
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={added || isOutOfStock}
                        className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                            isOutOfStock
                            ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                            : added 
                                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                                : 'bg-brand-blue text-white shadow-brand-blue/20 hover:bg-brand-dark'
                        }`}
                    >
                        {isOutOfStock ? 'Out of Stock' : (added ? '✓ Item Added' : 'Add to Order')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
