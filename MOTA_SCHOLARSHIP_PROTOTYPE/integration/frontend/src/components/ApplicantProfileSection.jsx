import React from 'react';
import { User } from 'lucide-react';

export default function ApplicantProfileSection({ applicant = {}, education = {}, financial = {} }) {
  // Fields to display: Name, DOB, Category, Tribe, Domicile, Institution, Course/Class, Percentage, Income
  const profileItems = [
    { label: 'Full Name', value: applicant.fullName },
    { label: 'Date of Birth', value: applicant.dateOfBirth },
    { label: 'Social Category', value: applicant.category },
    { label: 'Tribe Name', value: applicant.tribeName },
    { label: 'Domicile State', value: applicant.domicileState || applicant.state },
    { label: 'Institution Name', value: education.institution || education.institutionName },
    { label: 'Course / Class', value: education.course || education.class || education.currentClass || education.enrolledProgramme },
    { label: 'Qualifying %', value: education.percentage || (education.qualifyingPercentage ? `${education.qualifyingPercentage}%` : null) },
    { label: 'Annual Income', value: financial.annualIncome ? `₹${Number(financial.annualIncome).toLocaleString('en-IN')}` : (financial.annualFamilyIncome ? `₹${Number(financial.annualFamilyIncome).toLocaleString('en-IN')}` : null) }
  ];

  // Only display fields actually extracted
  const extractedItems = profileItems.filter(item => item.value !== null && item.value !== undefined && String(item.value).trim() !== '');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-700" />
            SECTION 4 — STRUCTURED APPLICANT PROFILE
          </h2>
          <p className="text-xs text-slate-500">
            Synthesized identity, academic, and financial profile extracted from verified authentic documents.
          </p>
        </div>
      </div>

      {extractedItems.length === 0 ? (
        <div className="text-xs text-slate-400 italic text-center py-4">
          No profile fields extracted yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {extractedItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200/90 rounded-lg p-3 text-xs"
            >
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                {item.label}
              </div>
              <div className="font-semibold text-slate-900 truncate text-xs sm:text-sm" title={String(item.value)}>
                {String(item.value)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
