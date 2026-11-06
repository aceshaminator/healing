/* eslint-disable @typescript-eslint/no-explicit-any */
export function Logo(props: any) {
  const { className = 'h-10 w-10' } = props;
  return (
    <div
      className={`${className} shrink-0 overflow-hidden rounded-xl border border-brand/30 bg-brand/10`}
    >

    </div>
  );
}

export default Logo;