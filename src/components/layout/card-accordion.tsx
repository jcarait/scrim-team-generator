"use client";

import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const CardAccordion = Accordion;

type CardAccordionItemProps = React.ComponentProps<typeof AccordionItem>;

function CardAccordionItem({ className, ...props }: CardAccordionItemProps) {
  return (
    <AccordionItem
      className={cn(
        "group overflow-hidden rounded-2xl border border-primary/15 bg-white/95 shadow-[0_18px_46px_-18px_rgba(194,104,20,0.35)] backdrop-blur",
        "border-none",
        className,
      )}
      {...props}
    />
  );
}

type CardAccordionTriggerProps = React.ComponentProps<typeof AccordionTrigger>;

function CardAccordionTrigger({
  className,
  ...props
}: CardAccordionTriggerProps) {
  return (
    <AccordionTrigger
      className={cn(
        "px-5 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-primary/80",
        "items-center gap-3 select-none",
        className,
      )}
      {...props}
    />
  );
}

type CardAccordionContentProps = React.ComponentProps<typeof AccordionContent>;

function CardAccordionContent({
  className,
  ...props
}: CardAccordionContentProps) {
  return (
    <AccordionContent
      className={cn(
        "px-5 pb-6",
        className,
      )}
      {...props}
    />
  );
}

export {
  CardAccordion,
  CardAccordionContent,
  CardAccordionItem,
  CardAccordionTrigger,
};
