import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'motion/react';
import { Trash2, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { SMOOTH_TRANSITION } from './constants';

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  className?: string;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({ 
  children, 
  onDelete, 
  onEdit, 
  className 
}) => {
  const [isOpen, setIsOpen] = useState<'delete' | 'edit' | null>(null);
  const controls = useAnimation();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -50) {
      if (isMounted.current) controls.start({ x: -80, transition: SMOOTH_TRANSITION });
      setIsOpen('delete');
    } else if (info.offset.x > 50) {
      if (isMounted.current) controls.start({ x: 80, transition: SMOOTH_TRANSITION });
      setIsOpen('edit');
    } else {
      if (isMounted.current) controls.start({ x: 0, transition: SMOOTH_TRANSITION });
      setIsOpen(null);
    }
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Background Actions */}
      <div className="absolute inset-0 flex justify-between items-center">
        <div 
          onClick={() => {
            if (onEdit) onEdit();
            else onDelete?.();
            controls.start({ x: 0 });
            setIsOpen(null);
          }}
          className={cn(
            "h-full w-20 flex items-center justify-center cursor-pointer",
            onEdit ? "bg-primary text-[#39008c]" : "bg-error text-white"
          )}
        >
          {onEdit ? <Edit2 size={20} /> : <Trash2 size={20} />}
        </div>
        <div 
          onClick={() => {
            onDelete?.();
            controls.start({ x: 0 });
            setIsOpen(null);
          }}
          className="h-full w-20 bg-error text-white flex items-center justify-center cursor-pointer"
        >
          <Trash2 size={20} />
        </div>
      </div>

      {/* Foreground Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 80 }}
        dragElastic={0.1}
        animate={controls}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
};
