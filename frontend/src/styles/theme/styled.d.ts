import 'styled-components';
import { globalTheme } from './globalTheme';

declare module 'styled-components' {
  export interface DefaultTheme extends typeof globalTheme {}
}

