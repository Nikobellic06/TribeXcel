/**
 * DigiLocker / API Setu Official Document Catalogue
 * Maps standard scholarship document types to official DigiLocker document types and issuers.
 */

const DIGILOCKER_DOCUMENT_CATALOGUE = {
  st_certificate: {
    docType: 'CASTC',
    name: 'Scheduled Tribe (ST) Certificate',
    description: 'Caste / Tribe Certificate issued by State Revenue / e-District portals',
    supportedIssuers: [
      { id: 'in.gov.edistrict.jharkhand', name: 'e-District Jharkhand / Revenue Department' },
      { id: 'in.gov.edistrict.odisha', name: 'e-District Odisha / Revenue and Disaster Management' },
      { id: 'in.gov.edistrict.mp', name: 'MP e-District / Revenue Department' },
      { id: 'in.gov.edistrict.chhattisgarh', name: 'Chhattisgarh e-District / Revenue Department' },
      { id: 'in.gov.edistrict.rajasthan', name: 'Rajasthan Jan Soochna / Revenue' },
      { id: 'in.gov.mahaonline', name: 'MahaOnline / Government of Maharashtra' },
      { id: 'in.gov.edistrict.assam', name: 'e-District Assam' },
      { id: 'in.gov.edistrict.delhi', name: 'Revenue Department, GNCTD' },
    ],
    parameters: [
      { name: 'Certificate_Number', label: 'Certificate Number', required: true },
      { name: 'Year_of_Issue', label: 'Year of Issue', required: false },
    ],
  },

  class10_certificate: {
    docType: '10CR',
    name: 'Class X Passing Certificate / Marksheet',
    description: 'Secondary School Board Examination Certificate / Marksheet (Proof of DOB)',
    supportedIssuers: [
      { id: 'cbse', name: 'Central Board of Secondary Education (CBSE)' },
      { id: 'cisce', name: 'Council for the Indian School Certificate Examinations (CISCE)' },
      { id: 'bseb', name: 'Bihar School Examination Board' },
      { id: 'jac', name: 'Jharkhand Academic Council' },
      { id: 'upmsp', name: 'UP Board of High School and Intermediate Education' },
      { id: 'bseodisha', name: 'Board of Secondary Education, Odisha' },
      { id: 'mpbse', name: 'Madhya Pradesh Board of Secondary Education' },
      { id: 'cgbse', name: 'Chhattisgarh Board of Secondary Education' },
      { id: 'nios', name: 'National Institute of Open Schooling' },
    ],
    parameters: [
      { name: 'Roll_Number', label: 'Roll Number', required: true },
      { name: 'Passing_Year', label: 'Year of Passing', required: true },
    ],
  },

  family_income_proof: {
    docType: 'INCER',
    name: 'Income Certificate',
    description: 'Income Certificate issued by Tahsildar / Executive Magistrate',
    supportedIssuers: [
      { id: 'in.gov.edistrict.jharkhand', name: 'e-District Jharkhand / Revenue' },
      { id: 'in.gov.edistrict.odisha', name: 'e-District Odisha / Revenue' },
      { id: 'in.gov.edistrict.mp', name: 'MP e-District' },
      { id: 'in.gov.edistrict.chhattisgarh', name: 'Chhattisgarh e-District' },
      { id: 'in.gov.mahaonline', name: 'MahaOnline / Maharashtra Revenue' },
      { id: 'in.gov.edistrict.rajasthan', name: 'Rajasthan Revenue' },
    ],
    parameters: [
      { name: 'Application_Number', label: 'Application / Certificate Number', required: true },
    ],
  },

  disability_certificate: {
    docType: 'DISCR',
    name: 'Unique Disability ID (UDID) Certificate',
    description: 'Disability Certificate / UDID issued by Department of Empowerment of Persons with Disabilities',
    supportedIssuers: [
      { id: 'in.gov.swavlambancard', name: 'UDID Portal, Ministry of Social Justice & Empowerment' },
    ],
    parameters: [
      { name: 'UDID_Number', label: 'UDID Card Number', required: true },
    ],
  },

  pg_marksheet: {
    docType: 'DEGRR',
    name: "Master's Degree / Consolidated Marksheet",
    description: 'Academic Award / Degree Record from National Academic Depository (NAD)',
    supportedIssuers: [
      { id: 'in.gov.nad', name: 'National Academic Depository / ABC ID Registry' },
      { id: 'in.ac.du', name: 'University of Delhi' },
      { id: 'in.ac.bhu', name: 'Banaras Hindu University' },
      { id: 'in.ac.jnu', name: 'Jawaharlal Nehru University' },
      { id: 'in.ac.uohyd', name: 'University of Hyderabad' },
      { id: 'in.ac.ignou', name: 'Indira Gandhi National Open University' },
    ],
    parameters: [
      { name: 'Registration_No', label: 'Registration / Enrolment Number', required: true },
      { name: 'Year', label: 'Passing Year', required: true },
    ],
  },

  qualifying_degree: {
    docType: 'DEGRR',
    name: 'Qualifying Degree Certificate',
    description: 'Bachelor / Master Degree issued by University via NAD',
    supportedIssuers: [
      { id: 'in.gov.nad', name: 'National Academic Depository (NAD)' },
    ],
    parameters: [
      { name: 'Roll_Number', label: 'Roll / Registration Number', required: true },
      { name: 'Year', label: 'Passing Year', required: true },
    ],
  },
};

module.exports = {
  DIGILOCKER_DOCUMENT_CATALOGUE,
};
