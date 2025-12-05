export enum Tab {
  Home = 'home',
  Styles = 'styles',
  History = 'history',
  Profile = 'profile',
}

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface FaceLandmarks {
  mouth_left: [number, number];
  mouth_right: [number, number];
  nose_bottom: [number, number];
  chin_bottom: [number, number];
  jaw_left: [number, number];
  jaw_right: [number, number];
  sideburn_left: [number, number];
  sideburn_right: [number, number];
}

export interface ScanResult {
  faceShape: string;
  landmarks: FaceLandmarks;
  beardType?: string;
  densityMap?: {
    cheeks: 'sparse' | 'medium' | 'dense';
    chin: 'sparse' | 'medium' | 'dense';
    mustache: 'sparse' | 'medium' | 'dense';
  };
  steps?: string[];
}

export interface BeardStyle {
  id: string;
  name: string;
  category: 'Stubble' | 'Full Beard' | 'Goatee' | 'Mustache' | 'All';
  description: string;
  tags: string[];
  difficulty: 'Beginner' | 'Advanced';
  faceShapes: string[];
}

export interface HistoryItem {
  id: string;
  styleName: string;
  date: string;
  mode: 'Beginner' | 'Advanced';
}