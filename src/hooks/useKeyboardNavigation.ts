import { useState, useEffect, useCallback } from 'react';

export interface KeyboardNavigationOptions<T = unknown> {
  /** Items to navigate through */
  items: T[];
  /** Initial focused index */
  initialIndex?: number;
  /** Loop navigation (wrap around at end/start) */
  loop?: boolean;
  /** Enable letter-based jump navigation */
  enableLetterJump?: boolean;
  /** Function to get searchable text for letter jump */
  getSearchText?: (item: T) => string;
  /** Callback when item is selected */
  onSelect?: (item: T, index: number) => void;
  /** Callback when focus changes */
  onFocusChange?: (item: T, index: number) => void;
}

export function useKeyboardNavigation<T = unknown>(options: KeyboardNavigationOptions<T>) {
  const {
    items,
    initialIndex = 0,
    loop = true,
    enableLetterJump = true,
    getSearchText = (item: T) => (item as { name?: string; title?: string }).name || (item as { name?: string; title?: string }).title || String(item),
    onSelect,
    onFocusChange
  } = options;

  const [focusedIndex, setFocusedIndex] = useState(Math.max(0, Math.min(initialIndex, items.length - 1)));

  // Update focused index when items change
  useEffect(() => {
    if (items.length === 0) {
      setFocusedIndex(0);
    } else if (focusedIndex >= items.length) {
      setFocusedIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, focusedIndex]);

  // Notify when focus changes
  useEffect(() => {
    if (items.length > 0 && focusedIndex < items.length && onFocusChange) {
      onFocusChange(items[focusedIndex], focusedIndex);
    }
  }, [focusedIndex, items, onFocusChange]);

  const moveFocus = useCallback((direction: 'up' | 'down' | 'first' | 'last', amount = 1) => {
    setFocusedIndex(prevIndex => {
      switch (direction) {
        case 'up':
          if (prevIndex > 0) {
            return Math.max(0, prevIndex - amount);
          } else if (loop) {
            return items.length - 1;
          }
          return prevIndex;

        case 'down':
          if (prevIndex < items.length - 1) {
            return Math.min(items.length - 1, prevIndex + amount);
          } else if (loop) {
            return 0;
          }
          return prevIndex;

        case 'first':
          return 0;

        case 'last':
          return Math.max(0, items.length - 1);

        default:
          return prevIndex;
      }
    });
  }, [items.length, loop]);

  const jumpToLetter = useCallback((letter: string) => {
    if (!enableLetterJump || items.length === 0) return;

    const currentIndex = focusedIndex;
    const searchLetter = letter.toLowerCase();
    
    // Look for next item starting with this letter (wrapping around)
    for (let i = 1; i <= items.length; i++) {
      const index = (currentIndex + i) % items.length;
      const searchText = getSearchText(items[index]).toLowerCase();
      
      if (searchText.startsWith(searchLetter)) {
        setFocusedIndex(index);
        break;
      }
    }
  }, [items, focusedIndex, enableLetterJump, getSearchText]);

  const selectCurrent = useCallback(() => {
    if (items.length > 0 && focusedIndex < items.length && onSelect) {
      onSelect(items[focusedIndex], focusedIndex);
    }
  }, [items, focusedIndex, onSelect]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveFocus('down');
        break;

      case 'ArrowUp':
        event.preventDefault();
        moveFocus('up');
        break;

      case 'Home':
        event.preventDefault();
        moveFocus('first');
        break;

      case 'End':
        event.preventDefault();
        moveFocus('last');
        break;

      case 'PageDown':
        event.preventDefault();
        moveFocus('down', 5); // Jump by 5 items
        break;

      case 'PageUp':
        event.preventDefault();
        moveFocus('up', 5);
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        selectCurrent();
        break;

      default:
        // Letter navigation
        if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
          jumpToLetter(event.key);
        }
        break;
    }
  }, [moveFocus, selectCurrent, jumpToLetter]);

  const getItemProps = useCallback((item: T, index: number) => ({
    tabIndex: focusedIndex === index ? 0 : -1,
    'aria-selected': focusedIndex === index,
    role: 'option',
    onFocus: () => setFocusedIndex(index),
    className: `${focusedIndex === index ? 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : ''}`
  }), [focusedIndex]);

  const getContainerProps = useCallback(() => ({
    role: 'listbox',
    tabIndex: 0,
    onKeyDown: handleKeyDown,
    'aria-activedescendant': `item-${focusedIndex}`
  }), [handleKeyDown, focusedIndex]);

  return {
    focusedIndex,
    setFocusedIndex,
    moveFocus,
    jumpToLetter,
    selectCurrent,
    handleKeyDown,
    getItemProps,
    getContainerProps,
    focusedItem: items[focusedIndex] || null
  };
}

export default useKeyboardNavigation;