export const applicationCategories = [
  { value: "eye_camp", label: "👁️ Eye Checkup" },
  { value: "book_distribution", label: "📚 Book Distribution" },
  { value: "flood_relief", label: "🌊 Flood Relief" },
  { value: "general", label: "🤝 Community Program" },
  { value: "custom", label: "✨ Other / Custom" },
];

export const applicationTemplates = {
  eye_camp: [
    { name: "patientName", label: "Patient Name", type: "text", required: true },
    { name: "age", label: "Age", type: "number", required: true },
    { name: "gender", label: "Gender", type: "text", required: false },
    { name: "phone", label: "Contact Phone", type: "tel", required: true },
    { name: "address", label: "Address", type: "textarea", required: true },
    { name: "visionIssue", label: "Vision Concern", type: "textarea", required: false },
  ],
  book_distribution: [
    { name: "studentName", label: "Student Name", type: "text", required: true },
    { name: "age", label: "Student Age", type: "number", required: true },
    { name: "className", label: "Class / Academic Standard", type: "text", required: true },
    { name: "school", label: "School / College", type: "text", required: true },
    { name: "guardianName", label: "Parent / Guardian Name", type: "text", required: true },
    { name: "phone", label: "Contact Phone", type: "tel", required: true },
    { name: "address", label: "Residential Address", type: "textarea", required: true },
    { name: "booksNeeded", label: "Required Subjects / Books", type: "textarea", required: true },
    { name: "notes", label: "Additional Information", type: "textarea", required: false },
  ],
  flood_relief: [
    { name: "applicantName", label: "Applicant Name", type: "text", required: true },
    { name: "phone", label: "Contact Phone", type: "tel", required: true },
    { name: "address", label: "Affected Address / Village", type: "textarea", required: true },
    { name: "householdSize", label: "People in Household", type: "number", required: true },
    { name: "assistanceNeeded", label: "Assistance Needed", type: "textarea", required: true },
  ],
  general: [
    { name: "applicantName", label: "Applicant Name", type: "text", required: true },
    { name: "phone", label: "Contact Phone", type: "tel", required: true },
    { name: "address", label: "Address", type: "textarea", required: true },
    { name: "details", label: "Application Details", type: "textarea", required: true },
  ],
  custom: [
    { name: "applicantName", label: "Applicant Name", type: "text", required: true },
    { name: "phone", label: "Contact Phone", type: "tel", required: true },
    { name: "address", label: "Address", type: "textarea", required: true },
    { name: "details", label: "Details", type: "textarea", required: true },
  ],
};

export function getApplicationCategoryLabel(category, customLabel) {
  if (category === "custom" && customLabel) return customLabel;
  return applicationCategories.find((item) => item.value === category)?.label || "Community Program";
}
