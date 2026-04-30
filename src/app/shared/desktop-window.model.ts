import { Type } from '@angular/core';
import { WindowAction } from './components/shortcuts/shortcuts';

export interface DesktopWindow {
  id: number;
   action: WindowAction;
  component: Type<any>;
  title: string;
  icon: string;
  width: number;
  height: number;
  top: number;
  left: number;
  minimized: boolean;
  maximized: boolean;
  active: boolean;
  previousRect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}