import os
import pymupdf

dir_path = 'sample-documents'
os.makedirs(dir_path, exist_ok=True)

def make_pdf(filename, title, lines):
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842) # A4 size
    page.insert_text((50, 60), title, fontsize=15)
    y = 100
    for line in lines:
        page.insert_text((50, y), line, fontsize=11)
        y += 24
    doc.save(os.path.join(dir_path, filename))
    doc.close()

# 1. Income Certificate
make_pdf('sample_income_certificate.pdf',
    'GOVERNMENT OF JHARKHAND - REVENUE DEPARTMENT',
    [
        'OFFICE OF THE CIRCLE OFFICER, DUMKA SADAR',
        'CERTIFICATE OF ANNUAL FAMILY INCOME',
        'Application / Certificate No: INC/JH/2023/45120',
        'Date of Issue: 20/04/2023',
        'This is to certify that Sunita Soren, daughter of Mangal Soren,',
        'resident of Village Haripur, PO Dumka, District Dumka, Jharkhand.',
        'The gross annual family income from all sources is Rs. 140000 (Rupees One Lakh Forty Thousand only).',
        'Financial Year: 2023-2024',
        'Issuing Authority: Circle Officer, Dumka Sadar'
    ]
)

# 2. ST Certificate
make_pdf('sample_st_certificate.pdf',
    'GOVERNMENT OF JHARKHAND - OFFICE OF SUB-DIVISIONAL OFFICER',
    [
        'SCHEDULED TRIBE CASTE CERTIFICATE',
        'Certificate No: JH/ST/2021/88921',
        'Date of Issue: 12/08/2021',
        'This is to certify that Sunita Soren, daughter of Mangal Soren,',
        'resident of Village Haripur, District Dumka, State Jharkhand.',
        'Belongs to the Santhal community which is recognized as a Scheduled Tribe',
        'under the Constitution (Scheduled Tribes) Order, 1950.',
        'Issuing Authority: Sub-Divisional Officer, Dumka'
    ]
)

# 3. Marksheet
make_pdf('sample_marksheet.pdf',
    'JHARKHAND ACADEMIC COUNCIL (JAC) RANCHI',
    [
        'STATEMENT OF MARKS - HIGHER SECONDARY EXAMINATION (CLASS XII)',
        'Roll Number: JAC-2022-88124',
        'Candidate Name: Sunita Soren',
        "Institution / College: St. Xavier's Inter College, Ranchi",
        'Examination: Annual Higher Secondary Examination 2022',
        'Subject 1: Physics - Marks Obtained: 88 (Max: 100)',
        'Subject 2: Chemistry - Marks Obtained: 84 (Max: 100)',
        'Subject 3: Mathematics - Marks Obtained: 91 (Max: 100)',
        'Subject 4: English - Marks Obtained: 85 (Max: 100)',
        'Subject 5: Computer Science - Marks Obtained: 87 (Max: 100)',
        'Total Marks: 435 / 500',
        'Aggregate Percentage: 87.0%',
        'Result: First Division (Distinction)'
    ]
)

# 4. Bank Passbook
make_pdf('sample_bank_passbook.pdf',
    'STATE BANK OF INDIA - SAVINGS BANK PASSBOOK',
    [
        'Branch: Dumka Main Branch, Jharkhand',
        'Account Holder: Sunita Soren',
        'Savings Account No: 398821045621',
        'IFSC Code: SBIN0000214',
        'Customer ID / CIF: 882104921',
        'Mode of Operation: Single',
        'Account Status: Active'
    ]
)

# 5. Unrelated Document (Receipt / Menu)
make_pdf('sample_unrelated_receipt.pdf',
    'BLUE SKY CAFE & BAKERY',
    [
        'Table No: 04',
        'Item: Cappuccino - 2 x Rs. 150 = Rs. 300',
        'Item: Blueberry Muffin - 1 x Rs. 120 = Rs. 120',
        'Subtotal: Rs. 420',
        'GST (5%): Rs. 21',
        'Total Amount: Rs. 441',
        'Thank you for visiting! Have a great day.'
    ]
)

# 6. Aadhaar Card
make_pdf('sample_aadhaar_card.pdf',
    'UNIQUE IDENTIFICATION AUTHORITY OF INDIA (UIDAI)',
    [
        'GOVERNMENT OF INDIA',
        'Enrollment No: 1024/55891/00192',
        'Name: Sunita Soren',
        'DOB: 15/05/2004',
        'Gender: Female',
        'Address: D/O Mangal Soren, Village Haripur, PO Dumka, District Dumka, Jharkhand - 814101',
        'Aadhaar Number: 5412 8891 2304',
        'Mera Aadhaar, Meri Pehchan'
    ]
)

print('Sample PDFs generated successfully!')
