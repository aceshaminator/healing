/* eslint-disable @typescript-eslint/no-explicit-any */
export function Logo(props: any) {
  const { className = 'h-10 w-10' } = props;
  return (
    <div
      className={`${className} shrink-0 overflow-hidden rounded-xl border border-emerald-400/30 bg-emerald-400/10`}
    >
      <img src="/healing-logo.jpeg" alt="Healing logo" className="h-full w-full object-cover" />
    </div>
  );
}

export default Logo;