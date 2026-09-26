export interface CompanyData {
  _id?: string;
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  phone: string;
  whatsapp: string;
  website: string;
  email: string;
  currencyAr: string;
  currencyEn: string;
  taxNumber: string;
  shippingCompany: string;
  paymentMethod: string;
  details: string;
  logo: string;
  header: string;
  footer: string;
  stamp: string;
  cancelStamp: string;
  [key: string]: string | undefined;
}

export type CompanyFieldKey = keyof Omit<CompanyData, "_id">;

export interface CompanyFieldDefinition {
  key: keyof CompanyData;
  label: string;
  placeholder?: string;
  type?: "text" | "tel" | "email" | "url" | "select" | "textarea";
  dir?: "rtl" | "ltr";
  options?: { value: string; label: string }[];
}

export interface CompanyImageFieldDefinition {
  key: "logo" | "header" | "footer" | "stamp" | "cancelStamp";
  label: string;
  description: string;
  aspectHint?: string;
}
