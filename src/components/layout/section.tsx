import { cn } from '@/lib/utils';

export default function Section({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return <section className={cn('py-8 md:py-10 px-20', className)}>{children}</section>;
}
