import { BadgeCheck, CloudDownload } from 'lucide-react';
import { useLang } from '../../../i18n/LanguageContext';
import { Field, FormSection, TextInput, SelectInput, RadioGroup, binder } from '../../../components/ui/Field';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import { DOCUMENTS } from '../../../config/documents';
import { OCCUPATIONS, STATES, YES_NO } from '../../../config/options';
import { formatINR } from '../../../utils/format';

/* A "fetch from DigiLocker" strip shown above certificate fields. */
function DigiLockerStrip({ fetched, onFetch, label }) {
  const { tx } = useLang();
  const title = label.charAt(0).toUpperCase() + label.slice(1);
  if (fetched) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-leaf/30 bg-leaf-soft/70 px-3.5 py-2.5 text-[13px] text-ink md:col-span-2">
        <BadgeCheck className="h-4 w-4 shrink-0 text-leaf" aria-hidden="true" />
        {tx({ en: `${title} fetched from DigiLocker. Details below were filled automatically.`, hi: `${title} डिजिलॉकर से प्राप्त। नीचे का विवरण स्वतः भरा गया।` })}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 rounded-md border border-dashed border-navy/30 bg-navy-soft/40 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
      <p className="text-[13px] text-ink">
        {tx({ en: `Have your ${label} in DigiLocker? Fetch it to fill these details and attach the document.`, hi: `क्या आपका ${label} डिजिलॉकर में है? विवरण भरने और दस्तावेज़ जोड़ने हेतु इसे प्राप्त करें।` })}
      </p>
      <Button size="sm" variant="secondary" icon={CloudDownload} onClick={onFetch} className="shrink-0">
        {tx({ en: 'Fetch from DigiLocker', hi: 'डिजिलॉकर से प्राप्त करें' })}
      </Button>
    </div>
  );
}

export default function CategoryStep({ scheme, values, setValue, errors, documents = {}, attachDocument, openDigiLocker }) {
  const { tx } = useLang();
  const bind = binder(values, errors, setValue);
  const stFetched = documents.st_certificate?.source === 'digilocker';
  const incomeFetched = documents.income_certificate?.source === 'digilocker';
  const showIncome = scheme.hasIncomeRule;
  const orphan = values.isOrphan === 'yes';

  const fetchSt = () =>
    openDigiLocker([DOCUMENTS.st_certificate], ([rec]) => {
      if (!rec) return;
      attachDocument('st_certificate', rec);
      setValue('stCertificateNo', rec.certificateNo);
      setValue('stIssuingAuthority', rec.issuer);
      setValue('stIssueDate', rec.issuedOn);
    });

  const fetchIncome = () =>
    openDigiLocker([DOCUMENTS.income_certificate], ([rec]) => {
      if (!rec) return;
      attachDocument('income_certificate', rec);
      setValue('incomeCertificateNo', rec.certificateNo);
      setValue('incomeIssuingAuthority', rec.issuer);
      setValue('incomeCertificateDate', rec.issuedOn);
    });

  return (
    <div className="space-y-8">
      <FormSection
        title={tx({ en: 'Scheduled Tribe details', hi: 'अनुसूचित जनजाति विवरण' })}
        description={tx({
          en: 'The State/UT that issued your ST certificate is treated as your domicile State for this scheme.',
          hi: 'जिस राज्य/संघ राज्य क्षेत्र ने आपका एसटी प्रमाण पत्र जारी किया है, उसे इस योजना हेतु आपका अधिवास राज्य माना जाएगा।',
        })}
      >
        <DigiLockerStrip fetched={stFetched} onFetch={fetchSt} label={tx({ en: 'ST certificate', hi: 'एसटी प्रमाण पत्र' })} />
        <Field label={tx({ en: 'Category', hi: 'श्रेणी' })} htmlFor="categoryFixed">
          <TextInput id="categoryFixed" value={tx({ en: 'Scheduled Tribe (ST)', hi: 'अनुसूचित जनजाति (एसटी)' })} readOnly />
        </Field>
        <Field label={tx({ en: 'Tribe / community name', hi: 'जनजाति / समुदाय का नाम' })} required htmlFor="tribeName" error={errors.tribeName} hint={tx({ en: 'As written on your ST certificate, e.g. Santhal, Gond, Bhil', hi: 'एसटी प्रमाण पत्र के अनुसार, जैसे संथाल, गोंड, भील' })}>
          <TextInput {...bind('tribeName')} />
        </Field>
        <Field label={tx({ en: 'State/UT that issued the certificate', hi: 'प्रमाण पत्र जारी करने वाला राज्य/संघ राज्य क्षेत्र' })} required htmlFor="domicileState" error={errors.domicileState}>
          <SelectInput {...bind('domicileState')} options={STATES} />
        </Field>
        <Field
          label={tx({ en: 'Certificate number', hi: 'प्रमाण पत्र संख्या' })}
          required
          htmlFor="stCertificateNo"
          error={errors.stCertificateNo}
          sourceNote={stFetched ? 'Retrieved from DigiLocker' : undefined}
          diffNote={values.stCertificateNoSourceValue && values.stCertificateNo !== values.stCertificateNoSourceValue}
        >
          <TextInput {...bind('stCertificateNo')} />
        </Field>
        <Field
          label={tx({ en: 'Issuing authority', hi: 'जारीकर्ता प्राधिकारी' })}
          required
          htmlFor="stIssuingAuthority"
          error={errors.stIssuingAuthority}
          hint={tx({ en: 'e.g. Tehsildar, Sub-Divisional Magistrate', hi: 'जैसे तहसीलदार, उप-मंडल मजिस्ट्रेट' })}
          sourceNote={stFetched ? 'Retrieved from DigiLocker' : undefined}
        >
          <TextInput {...bind('stIssuingAuthority')} />
        </Field>
        <Field
          label={tx({ en: 'Date of issue', hi: 'जारी करने की तिथि' })}
          required
          htmlFor="stIssueDate"
          error={errors.stIssueDate}
          sourceNote={stFetched ? 'Retrieved from DigiLocker' : undefined}
        >
          <TextInput {...bind('stIssueDate')} type="date" />
        </Field>
        {scheme.id !== 'pre-matric' && (
          <Field
            label={tx({ en: 'Do you belong to a Particularly Vulnerable Tribal Group (PVTG)?', hi: 'क्या आप विशेष रूप से कमजोर जनजातीय समूह (पीवीटीजी) से हैं?' })}
            required
            htmlFor="isPVTG"
            error={errors.isPVTG}
            hint={tx({ en: 'Some awards are reserved for PVTG applicants. You will need a PVTG certificate.', hi: 'कुछ छात्रवृत्तियाँ पीवीटीजी आवेदकों हेतु आरक्षित हैं। पीवीटीजी प्रमाण पत्र आवश्यक होगा।' })}
          >
            <RadioGroup {...bind('isPVTG')} options={YES_NO} />
          </Field>
        )}
      </FormSection>

      <FormSection title={tx({ en: 'Disability', hi: 'दिव्यांगता' })}>
        <Field
          label={tx({ en: 'Are you a person with disability (Divyangjan)?', hi: 'क्या आप दिव्यांगजन हैं?' })}
          required
          htmlFor="hasDisability"
          error={errors.hasDisability}
          hint={tx({ en: 'Includes leprosy-cured, sickle cell anaemia and thalassaemia, with a certificate.', hi: 'प्रमाण पत्र सहित कुष्ठ-मुक्त, सिकल सेल एनीमिया और थैलेसीमिया भी शामिल।' })}
        >
          <RadioGroup {...bind('hasDisability')} options={YES_NO} />
        </Field>
        {values.hasDisability === 'yes' && (
          <>
            <Field label={tx({ en: 'Disability percentage', hi: 'दिव्यांगता प्रतिशत' })} required htmlFor="disabilityPercent" error={errors.disabilityPercent}>
              <TextInput {...bind('disabilityPercent')} type="number" min="0" max="100" inputMode="numeric" />
            </Field>
            <Field label={tx({ en: 'UDID number', hi: 'यूडीआईडी संख्या' })} optional htmlFor="udidNumber">
              <TextInput {...bind('udidNumber')} />
            </Field>
          </>
        )}
      </FormSection>

      {showIncome ? (
        <FormSection
          title={tx({ en: 'Family income', hi: 'पारिवारिक आय' })}
          description={tx({
            en: `Add the gross income of both parents from all sources, without tax deductions. Income of brothers, sisters or other members is not counted. Limit for this scheme: ${formatINR(scheme.rules.incomeLimit)} a year.`,
            hi: `माता-पिता दोनों की सभी स्रोतों से सकल आय, बिना कर कटौती के, भरें। भाई-बहन या अन्य सदस्यों की आय नहीं जोड़ी जाती। इस योजना की सीमा: ${formatINR(scheme.rules.incomeLimit)} प्रति वर्ष।`,
          })}
        >
          <Field
            label={tx({ en: 'Are you an orphan supported by a guardian?', hi: 'क्या आप अभिभावक द्वारा पोषित अनाथ हैं?' })}
            required
            htmlFor="isOrphan"
            error={errors.isOrphan}
            className="md:col-span-2"
          >
            <RadioGroup {...bind('isOrphan')} options={YES_NO} />
          </Field>
          {orphan ? (
            <div className="md:col-span-2">
              <Alert tone="info">
                {tx({ en: 'The income limit does not apply to orphans. No income certificate is needed.', hi: 'अनाथ छात्रों पर आय सीमा लागू नहीं होती। आय प्रमाण पत्र की आवश्यकता नहीं है।' })}
              </Alert>
            </div>
          ) : (
            <>
              <Field label={tx({ en: "Father's occupation", hi: 'पिता का व्यवसाय' })} required htmlFor="fatherOccupation" error={errors.fatherOccupation}>
                <SelectInput {...bind('fatherOccupation')} options={OCCUPATIONS} />
              </Field>
              <Field label={tx({ en: "Mother's occupation", hi: 'माता का व्यवसाय' })} required htmlFor="motherOccupation" error={errors.motherOccupation}>
                <SelectInput {...bind('motherOccupation')} options={OCCUPATIONS} />
              </Field>
              <Field label={tx({ en: 'Annual family income (₹)', hi: 'वार्षिक पारिवारिक आय (₹)' })} required htmlFor="familyIncome" error={errors.familyIncome} hint={values.familyIncome ? formatINR(values.familyIncome) : null}>
                <TextInput {...bind('familyIncome')} transform={(v) => v.replace(/\D/g, '').slice(0, 9)} inputMode="numeric" />
              </Field>
              <div className="hidden md:block" aria-hidden="true" />
              <DigiLockerStrip fetched={incomeFetched} onFetch={fetchIncome} label={tx({ en: 'income certificate', hi: 'आय प्रमाण पत्र' })} />
              <Field
                label={tx({ en: 'Income certificate number', hi: 'आय प्रमाण पत्र संख्या' })}
                required
                htmlFor="incomeCertificateNo"
                error={errors.incomeCertificateNo}
                sourceNote={incomeFetched ? 'Retrieved from DigiLocker' : undefined}
                diffNote={values.incomeCertificateNoSourceValue && values.incomeCertificateNo !== values.incomeCertificateNoSourceValue}
              >
                <TextInput {...bind('incomeCertificateNo')} />
              </Field>
              <Field
                label={tx({ en: 'Issuing authority', hi: 'जारीकर्ता प्राधिकारी' })}
                required
                htmlFor="incomeIssuingAuthority"
                error={errors.incomeIssuingAuthority}
                hint={tx({ en: 'Revenue officer not below Tehsildar. Self-declarations are not accepted.', hi: 'तहसीलदार से अनिम्न राजस्व अधिकारी। स्व-घोषणा मान्य नहीं।' })}
                sourceNote={incomeFetched ? 'Retrieved from DigiLocker' : undefined}
              >
                <TextInput {...bind('incomeIssuingAuthority')} />
              </Field>
              <Field
                label={tx({ en: 'Date of issue', hi: 'जारी करने की तिथि' })}
                required
                htmlFor="incomeCertificateDate"
                error={errors.incomeCertificateDate}
                sourceNote={incomeFetched ? 'Retrieved from DigiLocker' : undefined}
              >
                <TextInput {...bind('incomeCertificateDate')} type="date" />
              </Field>
            </>
          )}
        </FormSection>
      ) : (
        <Alert tone="info" title={tx({ en: 'No income limit', hi: 'कोई आय सीमा नहीं' })}>
          {tx({ en: 'The National Fellowship for ST students has no family income criteria, so income details are not needed.', hi: 'अनुसूचित जनजाति छात्रों हेतु राष्ट्रीय फेलोशिप में पारिवारिक आय का कोई मानदंड नहीं है, इसलिए आय विवरण आवश्यक नहीं है।' })}
        </Alert>
      )}
    </div>
  );
}
