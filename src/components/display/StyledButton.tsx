import { ButtonHTMLAttributes } from 'react';

export const StyledButton = ({
  children,
  ...props
}: { children: React.ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={`cool-button group group-hover:from-pink-600 group-hover:to-blue-500 ${props?.className}`}>
      <span className="cool-button-inner group flex-center">{children}</span>
    </button>
  );
};
