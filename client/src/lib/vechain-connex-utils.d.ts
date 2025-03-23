declare module '@vechain.energy/connex-utils' {
  export const utils: any;
  
  interface ConnexOptions {
    node?: string;
    network?: string;
    genesis?: string;
    [key: string]: any;
  }
  
  export function getConnex(options: ConnexOptions): Promise<any>;
  export function createConnex(options: ConnexOptions): Promise<any>;
}