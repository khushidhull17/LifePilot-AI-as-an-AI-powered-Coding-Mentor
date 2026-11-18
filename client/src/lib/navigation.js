import {
  LayoutDashboard,
  Map,
  MessageSquare,
  Bug,
  Trophy,
  FolderKanban,
  Settings,
} from 'lucide-react';

export const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Roadmap', to: '/roadmap', icon: Map },
  { label: 'AI Coding Mentor', to: '/mentor', icon: MessageSquare },
  { label: 'Code Debugger', to: '/debugger', icon: Bug },
  { label: 'Practice Zone', to: '/practice', icon: Trophy },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export const levelLabels = {
  'absolute-beginner': 'Absolute beginner',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
};
