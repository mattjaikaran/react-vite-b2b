import { HTMLAttributes, Ref } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

function Card({ ref, className, padding = 'md', children, ...props }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg bg-white shadow-sm border border-gray-200',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Card.displayName = 'Card'

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>
}

function CardHeader({ ref, className, ...props }: CardHeaderProps) {
  return (
    <div
      ref={ref}
      className={cn('border-b border-gray-200 pb-4 mb-4', className)}
      {...props}
    />
  )
}

CardHeader.displayName = 'CardHeader'

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  ref?: Ref<HTMLHeadingElement>
}

function CardTitle({ ref, className, children, ...props }: CardTitleProps) {
  return (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

CardTitle.displayName = 'CardTitle'

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>
}

function CardContent({ ref, className, ...props }: CardContentProps) {
  return <div ref={ref} className={cn('text-gray-600', className)} {...props} />
}

CardContent.displayName = 'CardContent'

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>
}

function CardFooter({ ref, className, ...props }: CardFooterProps) {
  return (
    <div
      ref={ref}
      className={cn('border-t border-gray-200 pt-4 mt-4', className)}
      {...props}
    />
  )
}

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardContent, CardFooter }
