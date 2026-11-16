import { SVGProps } from "react";

interface OpenCodeProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

// OpenCode's block "O" mark (via Simple Icons). Monochrome by design, so it
// follows currentColor and works in both themes.
const OpenCode = ({ size = 24, ...props }: OpenCodeProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path fillRule="evenodd" d="M22 24H2V0h20zM17 4.8H7v14.4h10z" />
  </svg>
);

export default OpenCode;
