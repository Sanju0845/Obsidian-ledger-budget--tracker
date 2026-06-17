import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

interface SplitBillModalProps {
  onClose: () => void;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [people, setPeople] = useState('2');
  
  return (
    <div className="space-y-6">
      <div>
        <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2 block">Total Amount</label>
        <input 
          type="number" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full bg-surface-container-low border border-white/5 rounded-2xl p-4 text-2xl font-bold focus:border-primary outline-none transition-colors"
        />
      </div>

      <div>
        <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2 block">Number of People</label>
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => setPeople(Math.max(1, parseInt(people) - 1).toString())}
            className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary"
          >
            <Minus size={20} />
          </button>
          <span className="text-2xl font-bold flex-1 text-center">{people}</span>
          <button 
            type="button"
            onClick={() => setPeople((parseInt(people) + 1).toString())}
            className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {amount && parseInt(people) > 0 && (
        <div className="bg-primary/10 p-6 rounded-3xl border border-primary/20">
          <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1">Each Person Pays</p>
          <p className="text-3xl font-bold text-primary">₹{(parseFloat(amount) / parseInt(people)).toFixed(2)}</p>
        </div>
      )}

      <button 
        type="button"
        onClick={() => {
          alert(`Requesting ₹${(parseFloat(amount) / parseInt(people)).toFixed(2)} from ${parseInt(people) - 1} people`);
          onClose();
        }}
        className="w-full py-4 bg-primary text-surface font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        Send Split Request
      </button>
    </div>
  );
};

interface RequestMoneyModalProps {
  onClose: () => void;
}

export const RequestMoneyModal: React.FC<RequestMoneyModalProps> = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  
  return (
    <div className="space-y-6">
      <div>
        <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2 block">Amount</label>
        <input 
          type="number" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full bg-surface-container-low border border-white/5 rounded-2xl p-4 text-2xl font-bold focus:border-primary outline-none transition-colors"
        />
      </div>

      <div>
        <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2 block">Payer UPI ID</label>
        <input 
          type="text" 
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="example@upi"
          className="w-full bg-surface-container-low border border-white/5 rounded-2xl p-4 font-bold focus:border-primary outline-none transition-colors"
        />
      </div>

      <button 
        type="button"
        onClick={() => {
          alert(`Request for ₹${amount} sent to ${upiId}`);
          onClose();
        }}
        className="w-full py-4 bg-primary text-surface font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        Send Request
      </button>
    </div>
  );
};
