import { cn } from '@/lib/utils';

export default function Section({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return <section className={cn('p-4 md:py-4 md:px-20', className)}>{children}</section>;
}
