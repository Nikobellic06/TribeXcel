import { useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useLang } from '../../../i18n/LanguageContext';
import { Field, FormSection, TextInput, RadioGroup, Checkbox, binder } from '../../../components/ui/Field';
import Alert from '../../../components/ui/Alert';

/*
 * Bank details for Direct Benefit Transfer. Typing a valid IFSC looks up the
 * bank and branch from the public Razorpay IFSC directory; if that service is
 * unreachable the student simply types them.
 */
export default function BankStep({ scheme, values, setValue, errors }) {
  const { tx } = useLang();
  const bind = binder(values, errors, setValue);
  const [lookup, setLookup] = useState('idle');
  const lastLooked = useRef((values.ifsc || '').toUpperCase());

  useEffect(() => {
    const code = (values.ifsc || '').toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(code) || code === lastLooked.current) return undefined;
    lastLooked.current = code;
    const ctrl = new AbortController();
    setLookup('loading');
    fetch(`https://ifsc.razorpay.com/${code}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('not found'))))
      .then((d) => {
        if (d?.BANK) setValue('bankName', d.BANK);
        if (d?.BRANCH) setValue('branchName', [d.BRANCH, d.CITY].filter(Boolean).join(', '));
        setLookup('found');
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setLookup('notfound');
      });
    return () => ctrl.abort();
  }, [values.ifsc, setValue]);

  const digitsOnly = (v) => v.replace(/\D/g, '').slice(0, 18);
  const parentAllowed = scheme.id === 'pre-matric';

  return (
    <div className="space-y-8">
      <Alert tone="info" title={tx({ en: 'Scholarship is paid by Direct Benefit Transfer (DBT)', hi: 'छात्रवृत्ति प्रत्यक्ष लाभ अंतरण (डीबीटी) से दी जाती है' })}>
        {tx({
          en: 'Use an active account in a scheduled bank, linked (seeded) with your Aadhaar and mobile number. A dormant account delays payment.',
          hi: 'किसी अनुसूचित बैंक का सक्रिय खाता दें, जो आधार और मोबाइल नंबर से जुड़ा (सीडेड) हो। निष्क्रिय खाते से भुगतान में देरी होती है।',
        })}
      </Alert>

      <FormSection title={tx({ en: 'Account details', hi: 'खाता विवरण' })}>
        {parentAllowed && (
          <Field label={tx({ en: 'Account held in the name of', hi: 'खाता किसके नाम पर है' })} htmlFor="accountOf" className="md:col-span-2">
            <RadioGroup
              {...bind('accountOf')}
              options={[
                { value: 'student', label: { en: 'Student', hi: 'छात्र' } },
                { value: 'parent', label: { en: 'Parent / guardian', hi: 'माता-पिता / अभिभावक' } },
              ]}
            />
          </Field>
        )}
        <Field label={tx({ en: 'Account holder name (as in passbook)', hi: 'खाताधारक का नाम (पासबुक अनुसार)' })} required htmlFor="accountHolder" error={errors.accountHolder} className="md:col-span-2">
          <TextInput {...bind('accountHolder')} autoComplete="off" />
        </Field>
        <Field label={tx({ en: 'Account number', hi: 'खाता संख्या' })} required htmlFor="accountNumber" error={errors.accountNumber}>
          <TextInput {...bind('accountNumber')} transform={digitsOnly} inputMode="numeric" autoComplete="off" />
        </Field>
        <Field label={tx({ en: 'Re-enter account number', hi: 'खाता संख्या पुनः दर्ज करें' })} required htmlFor="confirmAccountNumber" error={errors.confirmAccountNumber}>
          <TextInput
            {...bind('confirmAccountNumber')}
            transform={digitsOnly}
            inputMode="numeric"
            autoComplete="off"
            onPaste={(e) => e.preventDefault()}
          />
        </Field>
        <Field
          label="IFSC"
          required
          htmlFor="ifsc"
          error={errors.ifsc}
          hint={
            lookup === 'loading' ? (
              <span className="inline-flex items-center gap-1.5"><LoaderCircle className="h-3.5 w-3.5 animate-spin" />{tx({ en: 'Looking up branch…', hi: 'शाखा खोजी जा रही है…' })}</span>
            ) : lookup === 'found' ? (
              tx({ en: 'Bank and branch filled from the IFSC directory.', hi: 'बैंक और शाखा आईएफएससी निर्देशिका से भरी गई।' })
            ) : lookup === 'notfound' ? (
              tx({ en: 'Could not look up this IFSC. Please check it and type the bank details.', hi: 'यह आईएफएससी नहीं मिला। जाँचें और बैंक विवरण स्वयं भरें।' })
            ) : (
              tx({ en: '11 characters, printed on your passbook or cheque.', hi: '11 अक्षर, पासबुक या चेक पर छपा।' })
            )
          }
        >
          <TextInput {...bind('ifsc')} transform={(v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11)} autoComplete="off" />
        </Field>
        <div className="hidden md:block" aria-hidden="true" />
        <Field label={tx({ en: 'Bank name', hi: 'बैंक का नाम' })} required htmlFor="bankName" error={errors.bankName}>
          <TextInput {...bind('bankName')} />
        </Field>
        <Field label={tx({ en: 'Branch', hi: 'शाखा' })} required htmlFor="branchName" error={errors.branchName}>
          <TextInput {...bind('branchName')} />
        </Field>
      </FormSection>

      <Checkbox
        id="aadhaarSeeded"
        checked={values.aadhaarSeeded === 'yes'}
        onChange={(c) => setValue('aadhaarSeeded', c ? 'yes' : '')}
        invalid={Boolean(errors.aadhaarSeeded)}
      >
        {tx({
          en: 'I confirm this account is active and linked with my Aadhaar and mobile number for DBT.',
          hi: 'मैं पुष्टि करता/करती हूँ कि यह खाता सक्रिय है और डीबीटी हेतु मेरे आधार एवं मोबाइल नंबर से जुड़ा है।',
        })}
      </Checkbox>
    </div>
  );
}
