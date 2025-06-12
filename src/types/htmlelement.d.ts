declare global {
  interface HTMLInputElement {
    webkitdirectory?: boolean;
    directory?: boolean;
  }
}

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: boolean;
    directory?: boolean;
  }
}

export {}; 