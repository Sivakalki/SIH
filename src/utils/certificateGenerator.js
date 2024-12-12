import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Function to add digital signature
const addDigitalSignature = (doc, mroDetails) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  // Digital Signature Section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Digital Signature Details', margin, pageHeight - 60);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Signed by: ${mroDetails.name}`, margin, pageHeight - 50);
  doc.text(`Designation: Micro Regional Officer (MRO)`, margin, pageHeight - 40);
  doc.text(`Digital Signature ID: ${mroDetails.digitalSignatureId}`, margin, pageHeight - 30);
  doc.text(`Date of Signing: ${new Date().toLocaleString()}`, margin, pageHeight - 20);

  return doc;
};

export const generateCasteCertificatePDF = (applicationData, mroDetails) => {
  const doc = new jsPDF();
  
  // Page Margins
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  // Header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('REVENUE DEPARTMENT, GOVT OF NCT OF DELHI', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(11);
  doc.text('OFFICE OF THE DISTRICT MAGISTRATE', pageWidth / 2, 40, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text('KALKAJI: SOUTH EAST DISTRICT', pageWidth / 2, 50, { align: 'center' });

  // Certificate Type
  doc.setFontSize(14);
  doc.text('CASTE CERTIFICATE', pageWidth / 2, 65, { align: 'center' });

  // Detailed Applicant Information
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Create a structured layout for applicant details
  const detailsLayout = [
    { label: 'Certificate Number', value: applicationData.applicationId },
    { label: 'Applicant Name', value: applicationData.name },
    { label: 'Father\'s Name', value: applicationData.fatherName },
    { label: 'Date of Birth', value: applicationData.dob },
    { label: 'Caste', value: applicationData.caste },
    { label: 'Address', value: applicationData.address },
    { label: 'District', value: applicationData.district },
    { label: 'State', value: applicationData.state },
    { label: 'Pincode', value: applicationData.pincode }
  ];

  // Render details in a table-like format
  detailsLayout.forEach((detail, index) => {
    doc.text(`${detail.label}: ${detail.value}`, margin, 100 + (index * 10));
  });

  // Main Certification Text
  const mainText = `This is to certify that the above-mentioned person belongs to the ${applicationData.caste} community, which is recognized as a valid caste category in the government records.`;
  
  doc.text(mainText, margin, 250);

  // Additional Notes
  const notes = [
    "1. This certificate is issued based on the verification of submitted documents.",
    "2. The certificate is valid for all legal and governmental purposes.",
    "3. Any misrepresentation will lead to legal action."
  ];

  notes.forEach((note, index) => {
    doc.text(note, margin, 280 + (index * 10));
  });

  // Add Digital Signature
  addDigitalSignature(doc, mroDetails);

  return doc;
};

export const downloadPDF = (doc, filename) => {
  doc.save(filename || 'CasteCertificate.pdf');
};

export const sendCertificateByEmail = async (applicationData, mroDetails, pdfDoc) => {
  try {
    const pdfBase64 = pdfDoc.output('datauristring');
    
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/send-certificate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: applicationData.email,
        pdfBase64,
        applicationId: applicationData.applicationId,
        mroDetails: {
          name: mroDetails.name,
          email: mroDetails.email
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send certificate');
    }
    
    return true;
  } catch (error) {
    console.error('Error sending certificate:', error);
    return false;
  }
};
