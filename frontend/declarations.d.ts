// declared in order to prevent typescript errors from missing types for imports of png assets
declare module '*.png' {
  const value: string;
  export default value;
}
