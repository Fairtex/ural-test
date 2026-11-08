import { CircleAlert, LoaderCircle, RotateCcw } from 'lucide-react'

export default function PanelState({ icon: Icon, title, description, loading, error, onRetry, children }) {
  const StateIcon = error ? CircleAlert : loading ? LoaderCircle : Icon
  return (
    <div className={'panel-state' + (error ? ' has-error' : '')}>
      <span className="state-symbol" aria-hidden="true">
        <StateIcon size={24} strokeWidth={1.5} className={loading ? 'catalog-spinner' : undefined} />
      </span>
      <div role={error ? 'alert' : undefined}>
        <strong>{title}</strong>
        {description && <p>{description}</p>}
      </div>
      {onRetry && <button className="retry-control" onClick={event => {
        event.currentTarget.closest('section').focus({ preventScroll: true })
        onRetry()
      }}><RotateCcw size={15} aria-hidden="true" /> Повторить</button>}
      {children}
    </div>
  )
}
