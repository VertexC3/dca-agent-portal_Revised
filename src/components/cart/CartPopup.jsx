import React from 'react';
import { ShoppingCart, X, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCart } from './CartContext';
import { Badge } from '@/components/ui/badge';

export default function CartPopup({ open, onClose }) {
  const { cartItems, removeFromCart, clearCart, updateCartItemComment } = useCart();

  const handleCheckout = () => {
    alert('Refill request submitted for ' + cartItems.length + ' prescription(s)');
    clearCart();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#8B1F1F]" />
            Refill Cart ({cartItems.length})
          </DialogTitle>
        </DialogHeader>

        {cartItems.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-2">Your cart is empty</p>
            <p className="text-sm text-gray-500">Add prescriptions to request refills</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.dosage}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {item.refills} refills remaining
                      </Badge>
                      <span className="text-xs text-gray-500">Dr. {item.prescriber}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={clearCart}
                className="flex-1"
              >
                Clear Cart
              </Button>
              <Button
                onClick={handleCheckout}
                className="flex-1 bg-[#8B1F1F] hover:bg-[#721919] text-white"
              >
                Submit Refill Request
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}