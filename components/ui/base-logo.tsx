interface BaseLogoProps {
  size?: number;
  className?: string;
}

export function BaseLogo({ size = 24, className = '' }: BaseLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 111 111"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF" />
      <path
        d="M55.4 93.5c-20.9 0-37.9-17-37.9-38s17-38 37.9-38c18.6 0 34.1 13.4 37.3 31.1H66.5c-2.8-7.3-9.8-12.5-18.4-12.5-10.7 0-19.4 8.7-19.4 19.4s8.7 19.4 19.4 19.4c8.6 0 15.9-5.6 18.5-13.3h26c-3.5 18.2-19.2 31.9-38.2 31.9z"
        fill="white"
      />
    </svg>
  );
}
