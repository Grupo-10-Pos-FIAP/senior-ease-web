import { Tabs } from '@shared/ui/primitives/Tabs'
import type { ReactNode } from 'react'
import './ActivityTabs.css'

interface ActivityTabOption<T extends string> {
  value: T
  label: string
}

interface ActivityTabsProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: ActivityTabOption<T>[]
  ariaLabel: string
  children: (activeValue: T) => ReactNode
}

export function ActivityTabs<T extends string>({
  value,
  onValueChange,
  options,
  ariaLabel,
  children,
}: ActivityTabsProps<T>) {
  return (
    <Tabs.Root value={value} onValueChange={(next) => onValueChange(next as T)}>
      <Tabs.List className="activity-tabs__list" aria-label={ariaLabel}>
        {options.map((option) => (
          <Tabs.Trigger key={option.value} value={option.value} className="activity-tabs__tab">
            {option.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {options.map((option) => (
        <Tabs.Content
          key={option.value}
          value={option.value}
          className="activity-tabs__panel"
          tabIndex={0}
        >
          {children(option.value)}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}
