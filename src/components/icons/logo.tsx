import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo({className, ...props}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      className={className}
      {...props}
    >
      <g clipPath="url(#clip0_105_2)">
        <path
          d="M20.5 10C17.5 10 15 12.5 15 15.5V34.5C15 37.5 17.5 40 20.5 40H22.5V10H20.5Z"
          className="fill-current text-primary"
        />
        <path
          d="M39.5 10C42.5 10 45 12.5 45 15.5V34.5C45 37.5 42.5 40 39.5 40H22.5V10H39.5Z"
          className="fill-current text-primary"
        />
        <circle cx="22.5" cy="18.5" r="2.5" className="fill-current text-accent" />
        <path
          d="M22.5 25H25.5V28H22.5V25Z"
          className="fill-current text-accent"
        />
         <path
          d="M27.5 27H30.5V30H27.5V27Z"
          className="fill-current text-accent"
        />
         <path
          d="M32.5 29H35.5V32H32.5V29Z"
          className="fill-current text-accent"
        />
      </g>
      <text
        x="55"
        y="33"
        fontFamily="'PT Sans', sans-serif"
        fontSize="28"
        fontWeight="bold"
        className="fill-current"
      >
        FormaAfrique
      </text>
      <defs>
        <clipPath id="clip0_105_2">
          <rect width="60" height="50" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
