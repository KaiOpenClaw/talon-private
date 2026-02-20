/**
 * TypeScript interfaces for mobile workspace components
 * Centralized type definitions for mobile workspace architecture
 */

export interface MobileWorkspaceProps {
  workspaceId: string;
}

export type PanelType = 'channels' | 'settings' | 'search' | null;

export interface MobileMessageProps {
  message: {
    role: string;
    content: string;
    time: string | number | Date;
  };
}

export interface MobileMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  placeholder: string;
}

export interface MobilePanelContentProps {
  type: PanelType;
  workspaceId: string;
  selectedChannel: any; // TODO: Import proper Channel type from use-workspace
  onSelectChannel: (channel: any) => void;
  onClose: () => void;
}

export interface MobileChannelsListProps {
  workspaceId: string;
  selectedChannel: any; // TODO: Import proper Channel type from use-workspace
  onSelectChannel: (channel: any) => void;
  onClose: () => void;
}

export interface Channel {
  id: string;
  name: string;
  type: string;
}

export interface PanelState {
  activePanel: PanelType;
  isTransitioning: boolean;
}

export interface SwipeGestureConfig {
  threshold: number;
  edgeSwipeThreshold: number;
}