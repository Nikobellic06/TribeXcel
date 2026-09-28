import { Link } from 'react-router-dom';
import { useLang } from '../../../i18n/LanguageContext';
import { Field, FormSection, TextInput, TextArea, SelectInput, RadioGroup, binder } from '../../../components/ui/Field';
import Alert from '../../../components/ui/Alert';
import { GENDERS, STATES } from '../../../config/options';

export default function PersonalStep({ values, setValue, errors, profile }) {
  const { tx } = useLang();
  const bind = binder(values, errors, setValue);
  const kyc = Boolean(profile?.aadhaarVerified);
  const verifiedTag = kyc ? tx({ en: 'Aadhaar', hi: 'आधार' }) : null;
  const digitsOnly = (n) => (v) => v.replace(/\D/g, '').slice(0, n);

  return (
    <div className="space-y-8">
      {kyc ? (
        <Alert tone="success" title={tx({ en: 'Aadhaar e-KYC completed', hi: 'आधार ई-केवाईसी पूर्ण' })}>
          {tx({
            en: `Name, date of birth and gender come from Aadhaar (XXXX XXXX ${profile.aadhaarLast4 || '····'}) and cannot be edited here.`,
            hi: `नाम, जन्मतिथि और लिंग आधार (XXXX XXXX ${profile.aadhaarLast4 || '····'}) से लिए गए हैं और यहाँ बदले नहीं जा सकते।`,
          })}
        </Alert>
      ) : (
        <Alert
          tone="warn"
          title={tx({ en: 'Aadhaar e-KYC is pending', hi: 'आधार ई-केवाईसी लंबित है' })}
          action={
            <Link to="/profile" className="text-[13px] font-semibold text-navy underline-offset-2 hover:underline">
              {tx({ en: 'Complete now', hi: 'अभी पूरा करें' })}
            </Link>
          }
        >
          {tx({
            en: 'You can keep filling the form, but Aadhaar e-KYC is needed before final submission.',
            hi: 'आप फ़ॉर्म भरते रह सकते हैं, पर अंतिम जमा से पहले आधार ई-केवाईसी आवश्यक है।',
          })}
        </Alert>
      )}

      <FormSection title={tx({ en: 'Applicant', hi: 'आवेदक' })}>
        <Field label={tx({ en: 'Full name (as in Aadhaar)', hi: 'पूरा नाम (आधार अनुसार)' })} required htmlFor="fullName" error={errors.fullName} verified={verifiedTag}>
          <TextInput {...bind('fullName')} readOnly={kyc} autoComplete="name" />
        </Field>
        <Field label={tx({ en: 'Date of birth', hi: 'जन्मतिथि' })} required htmlFor="dob" error={errors.dob} verified={verifiedTag}>
          <TextInput {...bind('dob')} type="date" readOnly={kyc} max="2020-12-31" />
        </Field>
        <Field label={tx({ en: "Father's name", hi: 'पिता का नाम' })} required htmlFor="fatherName" error={errors.fatherName}>
          <TextInput {...bind('fatherName')} />
        </Field>
        <Field label={tx({ en: "Mother's name", hi: 'माता का नाम' })} required htmlFor="motherName" error={errors.motherName}>
          <TextInput {...bind('motherName')} />
        </Field>
        <Field label={tx({ en: 'Gender', hi: 'लिंग' })} required htmlFor="gender" error={errors.gender} verified={verifiedTag}>
          <RadioGroup {...bind('gender')} options={GENDERS} disabled={kyc} />
        </Field>
      </FormSection>

      <FormSection
        title={tx({ en: 'Contact', hi: 'संपर्क' })}
        description={tx({
          en: 'Status updates and OTPs are sent to this mobile number. Use the number linked to your bank account.',
          hi: 'स्थिति की सूचना और ओटीपी इसी मोबाइल नंबर पर भेजे जाते हैं। बैंक खाते से जुड़ा नंबर उपयोग करें।',
        })}
      >
        <Field label={tx({ en: 'Mobile number', hi: 'मोबाइल नंबर' })} required htmlFor="mobile" error={errors.mobile}>
          <TextInput {...bind('mobile')} transform={digitsOnly(10)} inputMode="numeric" autoComplete="tel" />
        </Field>
        <Field label={tx({ en: 'Alternate mobile', hi: 'वैकल्पिक मोबाइल' })} optional htmlFor="altMobile" error={errors.altMobile}>
          <TextInput {...bind('altMobile')} transform={digitsOnly(10)} inputMode="numeric" />
        </Field>
        <Field label={tx({ en: 'Email address', hi: 'ईमेल पता' })} required htmlFor="email" error={errors.email}>
          <TextInput {...bind('email')} type="email" autoComplete="email" />
        </Field>
      </FormSection>

      <FormSection title={tx({ en: 'Permanent address', hi: 'स्थायी पता' })}>
        <Field
          label={tx({ en: 'House / village, post office, block', hi: 'मकान / गाँव, डाकघर, ब्लॉक' })}
          required
          htmlFor="addressLine"
          error={errors.addressLine}
          className="md:col-span-2"
        >
          <TextArea {...bind('addressLine')} rows={2} autoComplete="street-address" />
        </Field>
        <Field label={tx({ en: 'State / UT', hi: 'राज्य / संघ राज्य क्षेत्र' })} required htmlFor="state" error={errors.state}>
          <SelectInput {...bind('state')} options={STATES} />
        </Field>
        <Field label={tx({ en: 'District', hi: 'जिला' })} required htmlFor="district" error={errors.district}>
          <TextInput {...bind('district')} />
        </Field>
        <Field label={tx({ en: 'PIN code', hi: 'पिन कोड' })} required htmlFor="pincode" error={errors.pincode}>
          <TextInput {...bind('pincode')} transform={digitsOnly(6)} inputMode="numeric" autoComplete="postal-code" />
        </Field>
      </FormSection>
    </div>
  );
}
