import { cn } from '@/lib/utils';

export default function Section({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return <section className={cn('mx-auto w-full max-w-5xl px-4 py-6 md:px-10 lg:py-8', className)}>{children}</section>;
}
