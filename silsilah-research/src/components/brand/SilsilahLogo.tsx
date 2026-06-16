interface SilsilahLogoProps {
  className?: string;
  title?: string;
}

export function SilsilahLogo({ className = '', title = 'SilsilahResearch geometric emblem' }: SilsilahLogoProps) {
  return (
    <span className={`sr-logo-mark ${className}`} role="img" aria-label={title}>
      <svg viewBox="0 0 1024 1024" aria-hidden="true" focusable="false">
        <g transform="translate(340.218 78.000) scale(0.908901)">
          <g className="sr-logo-mark__ring sr-logo-mark__ring--top">
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M 18.0 126.0 L 18.0 314.0 L 42.0 331.0 L 47.0 332.0 L 83.0 308.0 L 55.0 289.0 L 55.0 148.0 L 188.0 64.0 L 322.0 148.0 L 322.0 289.0 L 294.0 309.0 L 331.0 332.0 L 335.0 331.0 L 359.0 314.0 L 359.0 125.0 L 192.0 19.0 L 187.0 18.0 Z"
            />
          </g>
          <g className="sr-logo-mark__ring sr-logo-mark__ring--middle">
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M 188.0 266.0 L 127.0 304.0 L 122.0 309.0 L 157.0 332.0 L 164.0 330.0 L 185.0 316.0 L 190.0 315.0 L 322.0 399.0 L 322.0 547.0 L 296.0 564.0 L 294.0 567.0 L 333.0 590.0 L 359.0 572.0 L 359.0 373.0 Z M 254.0 378.0 L 221.0 357.0 L 217.0 357.0 L 190.0 374.0 L 187.0 374.0 L 103.0 320.0 L 18.0 373.0 L 18.0 572.0 L 34.0 584.0 L 46.0 590.0 L 83.0 566.0 L 55.0 547.0 L 55.0 399.0 L 59.0 395.0 L 103.0 369.0 L 178.0 417.0 L 190.0 422.0 L 255.0 380.0 Z M 122.0 637.0 L 123.0 640.0 L 187.0 680.0 L 195.0 677.0 L 256.0 638.0 L 221.0 615.0 L 214.0 617.0 L 188.0 633.0 L 158.0 614.0 Z"
            />
          </g>
          <g className="sr-logo-mark__ring sr-logo-mark__ring--bottom">
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M 187.0 524.0 L 87.0 586.0 L 18.0 632.0 L 18.0 828.0 L 189.0 936.0 L 359.0 828.0 L 359.0 631.0 L 192.0 525.0 Z M 187.0 573.0 L 192.0 574.0 L 322.0 656.0 L 322.0 804.0 L 189.0 889.0 L 55.0 804.0 L 55.0 656.0 L 59.0 652.0 Z"
            />
          </g>
        </g>
      </svg>
    </span>
  );
}
