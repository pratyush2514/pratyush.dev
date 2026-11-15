export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  period: string;
  note?: string;
}

export interface CertificationStatus {
  id: string;
  title: string;
  issuer?: string;
  status: "Certified" | "In progress" | "Studying";
}

export const educationSectionConfig = {
  title: "Education",
  certificationsLabel: "Certifications",
};

export const educationConfig: EducationItem[] = [
  {
    id: "geu",
    degree: "B.Sc. Information Technology",
    school: "Graphic Era University",
    period: "2022 – 2025",
    note: "CGPA 7.64",
  },
];

export const certificationStatus: CertificationStatus[] = [
  { id: "data-science", title: "Data Science", issuer: "Great Learning", status: "Certified" },
  { id: "oracle-java", title: "Oracle Java", status: "In progress" },
  { id: "aws-sa", title: "AWS Solutions Architect", status: "Studying" },
];
