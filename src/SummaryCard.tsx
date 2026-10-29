import type {ComponentPropsWithoutRef} from 'react';
/** Shared, accessible interactive summary surface. Appearance is controlled by design tokens. */
export function SummaryCard({className='',type='button',...props}:ComponentPropsWithoutRef<'button'>){return <button type={type} className={`summary-card ${className}`} {...props}/>}
