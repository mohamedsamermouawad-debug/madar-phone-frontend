import { CompanyData, CompanyFieldDefinition, CompanyImageFieldDefinition } from "./types";

export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const defaultData: CompanyData = {
  nameAr: "",
  nameEn: "",
  addressAr: "",
  addressEn: "",
  phone: "",
  whatsapp: "",
  website: "",
  email: "",
  currencyAr: "ر.س",
  currencyEn: "SAR",
  taxNumber: "",
  shippingCompany: "",
  paymentMethod: "حوالات وبطاقة بنكية",
  details: "",
  logo: "",
  header: "",
  footer: "",
  stamp: "",
  cancelStamp: "",
};

export const basicFields: CompanyFieldDefinition[] = [
  { key: "nameAr", label: "اسم الشركة (عربي)", placeholder: "مثال: متجر مدار الإلكتروني", dir: "rtl" },
  { key: "nameEn", label: "اسم الشركة (إنجليزي)", placeholder: "مثال: Madar Electronics", dir: "ltr" },
  { key: "currencyAr", label: "رمز العملة (عربي)", placeholder: "مثال: ر.س أو ج.م", dir: "rtl" },
  { key: "currencyEn", label: "رمز العملة (إنجليزي)", placeholder: "مثال: SAR أو EGP", dir: "ltr" },
];

export const contactFields: CompanyFieldDefinition[] = [
  { key: "phone", label: "رقم الهاتف الأساسي", placeholder: "+966500000000", type: "tel", dir: "ltr" },
  { key: "whatsapp", label: "رقم الواتساب", placeholder: "+966500000000", type: "tel", dir: "ltr" },
  { key: "email", label: "البريد الإلكتروني", placeholder: "support@madarelectronic.com", type: "email", dir: "ltr" },
  { key: "website", label: "رابط الموقع الإلكتروني", placeholder: "https://madarelectronic.com", type: "url", dir: "ltr" },
];

export const operationalFields: CompanyFieldDefinition[] = [
  { key: "addressAr", label: "العنوان الرسمي (عربي)", placeholder: "الرياض، المملكة العربية السعودية", dir: "rtl" },
  { key: "addressEn", label: "العنوان الرسمي (إنجليزي)", placeholder: "Riyadh, Saudi Arabia", dir: "ltr" },
  { key: "taxNumber", label: "الرقم الضريبي / السجل التجاري", placeholder: "300000000000003", dir: "ltr" },
  { key: "shippingCompany", label: "اسم شركة الشحن الافتراضية", placeholder: "مثال: أرامكس / سمسا / الشحن السريع", dir: "rtl" },
];

export const paymentOptions = [
  { value: "حوالات وبطاقة بنكية", label: "حوالات بنكية وبطاقات دفع إلكتروني" },
  { value: "حوالات بنكية فقط", label: "حوالات بنكية فقط" },
  { value: "بطاقة بنكية فقط", label: "بطاقة بنكية فقط" },
  { value: "الدفع عند الاستلام وبطاقة بنكية", label: "الدفع عند الاستلام وبطاقة بنكية" },
  { value: "جميع وسائل الدفع متاحة", label: "جميع وسائل الدفع متاحة" },
];

export const imageFields: CompanyImageFieldDefinition[] = [
  {
    key: "logo",
    label: "شعار المتجر (Logo)",
    description: "يظهر في شريط التنقل والفواتير والصفحة الرئيسية",
    aspectHint: "PNG / WebP بخلفية شفافة (مستحسن 512x512)",
  },
  {
    key: "header",
    label: "ترويسة الفاتورة (Header)",
    description: "تظهر أعلى فواتير الطلبات وملفات PDF",
    aspectHint: "عرض كامل مناسب للطباعة",
  },
  {
    key: "footer",
    label: "تذييل الفاتورة (Footer)",
    description: "يظهر أسفل الفواتير الرسمية والمستندات",
    aspectHint: "شريط أفقي عريض",
  },
  {
    key: "stamp",
    label: "الختم الرسمي (Stamp)",
    description: "يُوضع على فواتير المبيعات المعتمدة",
    aspectHint: "صورة دائرية أو مستطيلة شفافة",
  },
  {
    key: "cancelStamp",
    label: "ختم الإلغاء (Cancel Stamp)",
    description: "يُوضع على الفواتير الملغاة والمسترجعة",
    aspectHint: "ختم باللون الأحمر أو شفاف",
  },
];

export const toFullUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${API}${url.startsWith("/") ? "" : "/"}${url}`;
};
