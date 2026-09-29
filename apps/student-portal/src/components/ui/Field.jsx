import { CircleAlert, BadgeCheck } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';

/*
 * Form building blocks used by every step of the application.
 *
 *   const bind = binder(values, errors, setValue);
 *   <Field label="Father's name" required error={errors.fatherName} htmlFor="fatherName">
 *     <TextInput {...bind('fatherName')} />
 *   </Field>
 */

export function binder(values, errors, setValue) {
  return (name) => ({
    id: name,
    name,
    value: values?.[name] ?? '',
    invalid: Boolean(errors?.[name]),
    onChange: (val) => setValue(name, val),
  });
}

const baseInput =
  'w-full rounded-md border px-3 text-[14px] text-ink placeholder:text-[#9aa6b4] transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-navy/25 focus:border-navy disabled:bg-paper disabled:text-muted';

const stateClass = (invalid, readOnly) =>
  readOnly
    ? 'border-line bg-paper text-ink cursor-default'
    : invalid
    ? 'border-alert bg-[#fff8f7]'
    : 'border-line bg-white hover:border-[#b9c3cf]';

export function Field({ label, required, optional, hint, error, htmlFor, verified, sourceNote, diffNote, className = '', children }) {
  const { t } = useLang();
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-ink">
          <span>
            {label}
            {required && <span className="ml-0.5 text-alert" aria-hidden="true">*</span>}
          </span>
          {optional && <span className="text-[12px] font-normal text-muted">({t('common.optional')})</span>}
          {verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-leaf-soft px-2 py-0.5 text-[11px] font-semibold text-leaf">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {verified}
            </span>
          )}
          {sourceNote && (
            <span className="inline-flex items-center gap-1 rounded bg-navy/10 px-1.5 py-0.5 text-[10px] font-semibold text-navy">
              {sourceNote}
            </span>
          )}
        </label>
      )}
      {children}
      {diffNote && (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-700 font-medium bg-amber-50 rounded px-2 py-0.5 border border-amber-200">
          <span>⚠ Application value differs from retrieved document value.</span>
        </p>
      )}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} className="mt-1.5 flex items-start gap-1.5 text-[12px] text-alert" role="alert">
          <CircleAlert className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t(error)}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{hint}</p>
      )}
    </div>
  );
}

export function TextInput({ id, name, value, onChange, invalid, readOnly, type = 'text', transform, className = '', ...rest }) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      readOnly={readOnly}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      onChange={(e) => onChange?.(transform ? transform(e.target.value) : e.target.value)}
      className={`${baseInput} h-11 ${stateClass(invalid, readOnly)} ${className}`}
      {...rest}
    />
  );
}

export function TextArea({ id, name, value, onChange, invalid, readOnly, rows = 3, className = '', ...rest }) {
  return (
    <textarea
      id={id}
      name={name}
      rows={rows}
      value={value}
      readOnly={readOnly}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange?.(e.target.value)}
      className={`${baseInput} py-2.5 ${stateClass(invalid, readOnly)} ${className}`}
      {...rest}
    />
  );
}

/** options: [{ value, label }] where label may be a string or { en, hi } */
export function SelectInput({ id, name, value, onChange, invalid, options = [], placeholder, disabled, className = '' }) {
  const { t, tx } = useLang();
  return (
    <select
      id={id}
      name={name}
      value={value}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange?.(e.target.value)}
      className={`${baseInput} h-11 pr-8 ${stateClass(invalid, false)} ${className}`}
    >
      <option value="">{placeholder || `— ${t('common.select')} —`}</option>
      {options.map((opt) => {
        const o = typeof opt === 'string' ? { value: opt, label: opt } : opt;
        return (
          <option key={o.value} value={o.value}>
            {tx(o.label)}
          </option>
        );
      })}
    </select>
  );
}

/** Segmented radio buttons — used for yes/no and short choices. */
export function RadioGroup({ id, name, value, onChange, invalid, options = [], disabled }) {
  const { tx } = useLang();
  return (
    <div
      id={id}
      role="radiogroup"
      aria-invalid={invalid || undefined}
      className={`inline-flex flex-wrap gap-2 ${invalid ? 'rounded-md ring-1 ring-alert ring-offset-2' : ''}`}
    >
      {options.map((o) => {
        const checked = value === o.value;
        return (
          <label
            key={o.value}
            className={`inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-md border px-3.5 text-[13px] font-medium transition-colors ${
              checked ? 'border-navy bg-navy text-white' : 'border-line bg-white text-ink hover:border-navy/50'
            } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={checked}
              onChange={() => onChange?.(o.value)}
              className="sr-only"
            />
            {tx(o.label)}
          </label>
        );
      })}
    </div>
  );
}

export function Checkbox({ id, checked, onChange, invalid, children }) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3.5 text-[13px] leading-relaxed transition-colors ${
        invalid ? 'border-alert bg-alert-soft/40' : checked ? 'border-navy/40 bg-navy-soft/60' : 'border-line bg-white'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#1a3557]"
      />
      <span className="text-ink">{children}</span>
    </label>
  );
}

/** A titled group of fields inside a step, laid out as a responsive grid. */
export function FormSection({ title, description, children, columns = 2 }) {
  const grid = columns === 3 ? 'md:grid-cols-3' : columns === 1 ? '' : 'md:grid-cols-2';
  return (
    <fieldset className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      {title && <legend className="float-left w-full font-serif text-[17px] font-bold text-navy">{title}</legend>}
      {description && <p className="clear-both mt-1 max-w-2xl text-[13px] leading-relaxed text-muted">{description}</p>}
      <div className={`clear-both mt-4 grid grid-cols-1 gap-x-5 gap-y-5 ${grid}`}>{children}</div>
    </fieldset>
  );
}
