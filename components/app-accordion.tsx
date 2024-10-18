import AppMarkdown from './app-markdown'

interface AppAccordionToggle {
  title: string
  controlId: string
  color?: 'primary' | 'pink' | 'yellow'
}

function AppAccordionToggle(props: AppAccordionToggle) {
  const { controlId, title, color = 'primary' } = props

  const colorVariants: { [key: string]: string } = {
    primary:
      'bg-primary-200 hover:bg-primary hs-accordion-active:text-primary-700',
    pink: 'bg-pink-200 hover:bg-pink-600 hs-accordion-active:text-pink-700',
    yellow:
      'bg-yellow-200 hover:bg-yellow-600 hs-accordion-active:text-yellow-700',
  }

  return (
    <button
      className={`hs-accordion-toggle hs-accordion-active:hover:text-gray-50 py-3 px-2 inline-flex items-center gap-x-3 w-full font-semibold text-start text-gray-800 hover:text-gray-50 focus:outline-none rounded-lg disabled:opacity-50 disabled:pointer-events-none ${colorVariants[color]}`}
      aria-expanded={false}
      aria-controls={controlId}
    >
      <svg
        className="hs-accordion-active:hidden block size-4"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6"></path>
      </svg>
      <svg
        className="hs-accordion-active:block hidden size-4"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 15-6-6-6 6"></path>
      </svg>
      {title}
    </button>
  )
}

interface AppAccordionContentProps {
  id: string
  labeledById: string
  body?: string
  children?: React.ReactNode
}

function AppAccordionContent(props: AppAccordionContentProps) {
  const { id, labeledById, body, children } = props

  return (
    <div
      id={id}
      className={`hs-accordion-content w-full overflow-hidden transition-[height] duration-300`}
      role="region"
      aria-labelledby={labeledById}
      style={{ height: '0px' }}
    >
      <div className="p-4 space-y-4">
        {body && <AppMarkdown>{body}</AppMarkdown>}
        {children}
      </div>
    </div>
  )
}

export interface AppAccordionItem {
  title: string
  body?: string
  items?: {
    title: string
    body?: string
    items?: AppAccordionItem[]
  }[]
}

interface AppAccordionRootProps {
  children?: React.ReactNode
  items: AppAccordionItem[]
  alwaysOpen?: boolean
  itemRender: (item: AppAccordionItem, index: number) => React.ReactNode
}

function AppAccordionRoot(props: AppAccordionRootProps) {
  const { children, items, alwaysOpen, itemRender } = props

  return (
    <div
      className="hs-accordion-group space-y-4"
      data-hs-accordion-always-open={alwaysOpen}
    >
      {items.map(itemRender)}
      {children}
    </div>
  )
}

interface AppAccordionItemProps {
  id: string
  children: React.ReactNode
}

function AppAccordionItem(props: AppAccordionItemProps) {
  const { id, children } = props

  return (
    <div className={`hs-accordion rounded-lg bg-gray-100`} id={id}>
      {children}
    </div>
  )
}

const defaultItemRender = (alwaysOpen?: boolean, level: number = 0) =>
  function AppAccordionItemDefault(item: AppAccordionItem, index: number) {
    const loopedLevel = level % 3
    const levelColor: { [key: string]: 'primary' | 'pink' | 'yellow' } = {
      0: 'primary',
      1: 'yellow',
      2: 'pink',
    }

    return (
      <AppAccordion.Item key={index} id={`${item.title}-item-${index}`}>
        <AppAccordion.Toggle
          controlId={`${item.title}-content-${index}`}
          title={item.title}
          color={levelColor[loopedLevel]}
        />
        <AppAccordion.Content
          id={`${item.title}-content-${index}`}
          labeledById={`${item.title}-item-${index}`}
          body={item.body}
        >
          {item.items && (
            <AppAccordion.Root
              items={item.items}
              itemRender={defaultItemRender(alwaysOpen, loopedLevel + 1)}
              alwaysOpen={alwaysOpen}
            />
          )}
        </AppAccordion.Content>
      </AppAccordion.Item>
    )
  }

const AppAccordion = {
  Root: AppAccordionRoot,
  Toggle: AppAccordionToggle,
  Content: AppAccordionContent,
  Item: AppAccordionItem,
  itemRender: defaultItemRender,
}

interface AppAccordionDefaultProps {
  items: AppAccordionItem[]
  alwaysOpen?: boolean
}

function AppAccordionDefault(props: AppAccordionDefaultProps) {
  const { items, alwaysOpen } = props

  return (
    <AppAccordionRoot
      itemRender={defaultItemRender(alwaysOpen)}
      items={items}
      alwaysOpen={true}
    />
  )
}

export default AppAccordion

export { AppAccordionDefault }