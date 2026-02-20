/**
 * Mobile message input with touch optimizations
 * Auto-resizing textarea with mobile-friendly controls
 */

import { useRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { MobileMessageInputProps } from './mobile-workspace-types';

export default function MobileMessageInput({
  value,
  onChange,
  onSend,
  disabled,
  placeholder
}: MobileMessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [value]);

  return (
    <div className="flex items-end gap-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 resize-none min-h-[44px] max-h-[120px] px-4 py-3 bg-surface-2 border border-accent/20 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="w-11 h-11 bg-accent text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-200"
      >
        <MessageSquare className="w-5 h-5" />
      </button>
    </div>
  );
}