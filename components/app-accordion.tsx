import AppMarkdown from './app-markdown'

interface AppAccordionToggle {
  title: string
  controlId: string
}

function AppAccordionToggle(props: AppAccordionToggle) {
  const { controlId, title } = props

  return (
    <button
      className={`hs-accordion-toggle hs-accordion-active:text-primary-600 hs-accordion-active:hover:text-gray-50 bg-primary-200 py-3 px-2 inline-flex items-center gap-x-3 w-full font-semibold text-start text-gray-800 hover:bg-primary hover:text-gray-50 focus:outline-none rounded-lg disabled:opacity-50 disabled:pointer-events-none`}
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
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
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
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
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
  itemRender: (item: AppAccordionItem, index: number) => React.ReactNode
}

function AppAccordionRoot(props: AppAccordionRootProps) {
  const { children, items, itemRender } = props

  return (
    <div className="hs-accordion-group space-y-4">
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
    <div className={`hs-accordion rounded-lg bg-gray-200`} id={id}>
      {children}
    </div>
  )
}

const itemRender = (item: AppAccordionItem, index: number) => (
  <AppAccordion.Item key={index} id={`${item.title}-item-${index}`}>
    <AppAccordion.Toggle
      controlId={`${item.title}-content-${index}`}
      title={item.title}
    />
    <AppAccordion.Content
      id={`${item.title}-content-${index}`}
      labeledById={`${item.title}-item-${index}`}
      body={item.body}
    >
      {item.items && (
        <AppAccordion.Root items={item.items} itemRender={itemRender} />
      )}
    </AppAccordion.Content>
  </AppAccordion.Item>
)

const AppAccordion = {
  Root: AppAccordionRoot,
  Toggle: AppAccordionToggle,
  Content: AppAccordionContent,
  Item: AppAccordionItem,
  itemRender,
}

interface AppAccordionDefaultProps {
  items: AppAccordionItem[]
}

export function AppAccordionDefault(props: AppAccordionDefaultProps) {
  const { items } = props

  return <AppAccordion.Root itemRender={itemRender} items={items} />
}

export default AppAccordion
