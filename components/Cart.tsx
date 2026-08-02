
import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { TrashIcon, CheckCircleIcon } from './Icons';

interface CartProps {
    isOpen: boolean;
    onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
    const context = useContext(AppContext);
    const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
    const [orderComments, setOrderComments] = useState('');

    if (!context) return null;
    const { user, cart, updateCartQuantity, removeFromCart, addOrder, clearCart } = context;

    const totalAmount = useMemo(() => {
        return cart.reduce((total, item) => {
            let itemPrice = item.price;
            // Apply percentage discount first
            if (item.offerPercentage) {
                itemPrice = itemPrice * (1 - item.offerPercentage / 100);
            }
    
            let quantityToPay = item.quantity;
            // Apply free item offer
            if (item.freeOffer) {
                const match = item.freeOffer.match(/(\d+)\+(\d+)/);
                if (match) {
                    const buy = parseInt(match[1], 10);
                    const free = parseInt(match[2], 10);
                    if (buy > 0 && free > 0) {
                        const bundleSize = buy + free;
                        const numBundles = Math.floor(item.quantity / bundleSize);
                        const remainder = item.quantity % bundleSize;
                        quantityToPay = (numBundles * buy) + remainder;
                    }
                }
            }
            
            return total + (itemPrice * quantityToPay);
        }, 0);
    }, [cart]);

    const handleConfirmOrder = async () => {
        // Critical Status Check
        if (user && user.creditStatus === 'Critical') {
            alert("Order Blocked: Your account is in Critical status due to pending dues (>60 days). Please pay the bill to order.");
            return;
        }

        if (cart.length > 0 && user) {
            const orderDetails = {
                customer: user,
                items: cart,
                totalAmount: totalAmount,
                comments: orderComments.trim()
            };
            try {
                await addOrder(orderDetails);
                clearCart();
                setOrderComments('');
                setIsOrderConfirmed(true);
            } catch (err: any) {
                alert(err.message || "Failed to place order. Please try again.");
            }
        }
    };
    
    const handleClose = () => {
        onClose();
        if (isOrderConfirmed) {
            setTimeout(() => setIsOrderConfirmed(false), 500);
        }
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={handleClose}></div>
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-2xl font-bold text-brand-secondary">
                            {isOrderConfirmed ? "Order Confirmed" : "Your Cart"}
                        </h2>
                        <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">&times;</button>
                    </div>
                    
                    {isOrderConfirmed ? (
                        <div className="flex flex-col items-center justify-center text-center p-8 flex-grow">
                            <CheckCircleIcon className="w-24 h-24 text-green-500 mb-4"/>
                            <h3 className="text-2xl font-bold text-gray-800">Thank you for your order!</h3>
                            <p className="text-gray-600 mt-2">Your order will be delivered soon.</p>
                            <button onClick={handleClose} className="mt-8 bg-brand-blue text-white font-bold py-2 px-6 rounded-lg">Continue Shopping</button>
                        </div>
                    ) : cart.length === 0 ? (
                        <div className="flex-grow flex items-center justify-center">
                            <p className="text-gray-500">Your cart is empty.</p>
                        </div>
                    ) : (
                        <div className="flex-grow overflow-y-auto p-4">
                            {cart.map((item, index) => (
                                <div key={`${item.id}-${item.unit}-${index}`} className="flex items-center justify-between mb-4 pb-4 border-b last:border-b-0">
                                    <div className="flex-1 pr-2">
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.unit}</p>
                                        <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} / unit</p>
                                        {(item.offerPercentage || item.freeOffer) && (
                                            <p className="text-xs font-bold text-green-600 mt-1">
                                                {item.offerPercentage ? `${item.offerPercentage}% Off Applied` : `Offer Applied: ${item.freeOffer}`}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateCartQuantity(item.id, item.unit, parseInt(e.target.value, 10))}
                                            min="1"
                                            max={item.stock}
                                            className="w-16 text-center border rounded"
                                        />
                                        <button onClick={() => removeFromCart(item.id, item.unit)} className="text-red-500 hover:text-red-700">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isOrderConfirmed && cart.length > 0 && (
                        <div className="p-4 border-t bg-gray-50">
                            <div className="mb-4">
                                <label htmlFor="orderComments" className="block text-sm font-medium text-gray-700 mb-1">
                                    Comments / Instructions (Optional)
                                </label>
                                <textarea
                                    id="orderComments"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue text-sm"
                                    placeholder="Add notes about delivery or packing..."
                                    value={orderComments}
                                    onChange={(e) => setOrderComments(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-semibold">Total:</span>
                                <span className="text-2xl font-bold text-brand-blue">₹{totalAmount.toFixed(2)}</span>
                            </div>
                            <button 
                                onClick={handleConfirmOrder}
                                className={`w-full text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105 ${
                                    user?.creditStatus === 'Critical' 
                                    ? 'bg-red-500 hover:bg-red-600 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                                title={user?.creditStatus === 'Critical' ? "Order Blocked due to pending dues" : "Confirm Order"}
                            >
                                {user?.creditStatus === 'Critical' ? "Order Blocked (Pay Bill)" : "Confirm Order"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Cart;
