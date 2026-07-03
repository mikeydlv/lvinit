export default function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-20 ${className}`}>
      {children}
    </div>
  );
}
