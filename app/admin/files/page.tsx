"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { FiUpload, FiLink, FiExternalLink, FiTrash2, FiPlus, FiCheck, FiAlertCircle } from "react-icons/fi";

type FooterItem = {
  _id?: string;
  image: string;
  linkType: "link" | "file";
  link: string;
  file: string;
};

type Data = {
  qrImage: string;
  qrLink: string;
  qrLinkType: "link" | "file";
  qrFile: string;
  img1: string;
  link1: string;
  linkType1: "link" | "file";
  file1: string;
  img2: string;
  link2: string;
  linkType2: "link" | "file";
  file2: string;
  footerItems: FooterItem[];
};

export default function FilesPage() {
  const [data, setData] = useState<Data>({
    qrImage: "",
    qrLink: "",
    qrLinkType: "link",
    qrFile: "",
    img1: "",
    link1: "",
    linkType1: "link",
    file1: "",
    img2: "",
    link2: "",
    linkType2: "link",
    file2: "",
    footerItems: [],
  });

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Record<string, { type: "success" | "error"; text: string }>>({});
  const [imgKeys, setImgKeys] = useState<Record<string, number>>({});

  const qrRef = useRef<HTMLInputElement>(null);
  const qrFileRef = useRef<HTMLInputElement>(null);
  const img1Ref = useRef<HTMLInputElement>(null);
  const img2Ref = useRef<HTMLInputElement>(null);
  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);
  const imgRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  function bumpKey(k: string) {
    setImgKeys((p) => ({ ...p, [k]: Date.now() }));
  }

  function showMsg(section: string, text: string, type: "success" | "error" = "success") {
    setMsgs((p) => ({ ...p, [section]: { type, text } }));
    setTimeout(() => {
      setMsgs((p) => {
        const next = { ...p };
        delete next[section];
        return next;
      });
    }, 3500);
  }

  function openFile(url: string) {
    if (!url) return;
    window.open(`/file-view?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
  }

  const loadData = useCallback(() => {
    fetch(`/api/admin/company`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const normalize = (item: Partial<FooterItem>): FooterItem => ({
          _id: (item as any)._id,
          image: item.image || "",
          linkType: item.linkType === "file" ? "file" : "link",
          link: item.link || "",
          file: item.file || "",
        });

        const items = Array.isArray(d.footerItems)
          ? d.footerItems.map(normalize)
          : [];

        setData({
          qrImage: d.qrImage || "",
          qrLink: d.qrLink || "",
          qrLinkType: (d.qrLinkType === "file" || (!d.qrLinkType && d.qrFile)) ? "file" : "link",
          qrFile: d.qrFile || "",
          img1: d.img1 || "",
          link1: d.link1 || "",
          linkType1: (d.link1Type === "file" || d.linkType1 === "file" || (!d.link1Type && !d.linkType1 && d.file1)) ? "file" : "link",
          file1: d.file1 || "",
          img2: d.img2 || "",
          link2: d.link2 || "",
          linkType2: (d.link2Type === "file" || d.linkType2 === "file" || (!d.link2Type && !d.linkType2 && d.file2)) ? "file" : "link",
          file2: d.file2 || "",
          footerItems: items.length > 0 ? items : [{ image: "", linkType: "link", link: "", file: "" }],
        });
      })
      .catch(() => showMsg("global", "تعذر جلب البيانات", "error"))
      .finally(() => setLoadingInitial(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Upload handlers
  async function uploadImageField(fieldKey: "qrImage" | "img1" | "img2", file: File) {
    setUploading(fieldKey);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await fetch(`/api/admin/company/footer-image/${fieldKey}`, { method: "POST", credentials: "include", body: fd });
      const json = await r.json();
      if (json.url) {
        setData((p) => ({ ...p, [fieldKey]: json.url }));
        bumpKey(fieldKey);
        showMsg(fieldKey === "qrImage" ? "qr" : fieldKey === "img1" ? "s1" : "s2", "تم رفع الصورة بنجاح");
      } else {
        showMsg(fieldKey === "qrImage" ? "qr" : fieldKey === "img1" ? "s1" : "s2", json.error || "فشل الرفع", "error");
      }
    } catch {
      showMsg(fieldKey === "qrImage" ? "qr" : fieldKey === "img1" ? "s1" : "s2", "حدث خطأ أثناء الرفع", "error");
    } finally {
      setUploading(null);
    }
  }

  async function deleteImageField(fieldKey: "qrImage" | "img1" | "img2") {
    const section = fieldKey === "qrImage" ? "qr" : fieldKey === "img1" ? "s1" : "s2";
    setDeletingKey(fieldKey);
    try {
      const r = await fetch(`/api/admin/company/footer-image/${fieldKey}`, { method: "DELETE", credentials: "include" });
      if (r.ok) {
        setData((p) => ({ ...p, [fieldKey]: "" }));
        showMsg(section, "تم حذف الصورة");
      } else {
        showMsg(section, "تعذر حذف الصورة", "error");
      }
    } catch {
      showMsg(section, "حدث خطأ أثناء الحذف", "error");
    } finally {
      setDeletingKey(null);
    }
  }

  async function uploadDocField(fieldKey: "qrFile" | "file1" | "file2", file: File) {
    setUploading(fieldKey);
    const section = fieldKey === "qrFile" ? "qr" : fieldKey === "file1" ? "s1" : "s2";
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`/api/admin/company/footer-file/${fieldKey}`, { method: "POST", credentials: "include", body: fd });
      const json = await r.json();
      if (json.url) {
        setData((p) => ({ ...p, [fieldKey]: json.url }));
        showMsg(section, "تم رفع الملف بنجاح");
      } else {
        showMsg(section, json.error || "فشل الرفع", "error");
      }
    } catch {
      showMsg(section, "حدث خطأ أثناء الرفع", "error");
    } finally {
      setUploading(null);
    }
  }

  async function deleteDocField(fieldKey: "qrFile" | "file1" | "file2") {
    const section = fieldKey === "qrFile" ? "qr" : fieldKey === "file1" ? "s1" : "s2";
    setDeletingKey(fieldKey);
    try {
      const r = await fetch(`/api/admin/company/footer-file/${fieldKey}`, { method: "DELETE", credentials: "include" });
      if (r.ok) {
        setData((p) => ({ ...p, [fieldKey]: "" }));
        showMsg(section, "تم حذف الملف");
      } else {
        showMsg(section, "تعذر حذف الملف", "error");
      }
    } catch {
      showMsg(section, "حدث خطأ أثناء الحذف", "error");
    } finally {
      setDeletingKey(null);
    }
  }

  // Footer Items Handlers
  async function uploadItemImg(index: number, file: File) {
    setUploading(`img-${index}`);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await fetch(`/api/admin/company/footer-items/image/${index}`, { method: "POST", credentials: "include", body: fd });
      const json = await r.json();
      if (json.url) {
        setData((p) => {
          const items = [...p.footerItems];
          items[index] = { ...items[index], image: json.url };
          return { ...p, footerItems: items };
        });
        bumpKey(`img-${index}`);
        showMsg("items", "تم رفع صورة العنصر");
      } else {
        showMsg("items", json.error || "فشل رفع الصورة", "error");
      }
    } catch {
      showMsg("items", "حدث خطأ أثناء الرفع", "error");
    } finally {
      setUploading(null);
    }
  }

  async function deleteItemImg(index: number) {
    setDeletingKey(`img-${index}`);
    try {
      const r = await fetch(`/api/admin/company/footer-items/image/${index}`, { method: "DELETE", credentials: "include" });
      if (r.ok) {
        setData((p) => {
          const items = [...p.footerItems];
          items[index] = { ...items[index], image: "" };
          return { ...p, footerItems: items };
        });
        showMsg("items", "تم حذف صورة العنصر");
      }
    } catch {
      showMsg("items", "حدث خطأ أثناء الحذف", "error");
    } finally {
      setDeletingKey(null);
    }
  }

  async function uploadItemFile(index: number, file: File) {
    setUploading(`file-${index}`);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`/api/admin/company/footer-items/file/${index}`, { method: "POST", credentials: "include", body: fd });
      const json = await r.json();
      if (json.url) {
        setData((p) => {
          const items = [...p.footerItems];
          items[index] = { ...items[index], file: json.url };
          return { ...p, footerItems: items };
        });
        showMsg("items", "تم رفع ملف العنصر");
      } else {
        showMsg("items", json.error || "فشل رفع الملف", "error");
      }
    } catch {
      showMsg("items", "حدث خطأ أثناء الرفع", "error");
    } finally {
      setUploading(null);
    }
  }

  async function deleteItemFile(index: number) {
    setDeletingKey(`file-${index}`);
    try {
      const r = await fetch(`/api/admin/company/footer-items/file/${index}`, { method: "DELETE", credentials: "include" });
      if (r.ok) {
        setData((p) => {
          const items = [...p.footerItems];
          items[index] = { ...items[index], file: "" };
          return { ...p, footerItems: items };
        });
        showMsg("items", "تم حذف ملف العنصر");
      }
    } catch {
      showMsg("items", "حدث خطأ أثناء الحذف", "error");
    } finally {
      setDeletingKey(null);
    }
  }

  async function addFooterItem() {
    setSavingSection("items");
    try {
      const r = await fetch(`/api/admin/company/footer-items/add`, { method: "POST", credentials: "include" });
      const json = await r.json();
      if (r.ok) {
        setData((p) => ({
          ...p,
          footerItems: [...p.footerItems, { image: "", linkType: "link", link: "", file: "" }],
        }));
        showMsg("items", "تمت إضافة عنصر جديد");
      } else {
        showMsg("items", json.error || "تعذر إضافة عنصر", "error");
      }
    } catch {
      showMsg("items", "حدث خطأ أثناء الإضافة", "error");
    } finally {
      setSavingSection(null);
    }
  }

  async function removeFooterItem(index: number) {
    if (!confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;
    setDeletingKey(`item-${index}`);
    try {
      const r = await fetch(`/api/admin/company/footer-items/${index}`, { method: "DELETE", credentials: "include" });
      if (r.ok) {
        setData((p) => {
          const next = [...p.footerItems];
          next.splice(index, 1);
          return { ...p, footerItems: next };
        });
        showMsg("items", "تم حذف العنصر بنجاح");
      } else {
        showMsg("items", "فشل حذف العنصر", "error");
      }
    } catch {
      showMsg("items", "حدث خطأ أثناء حذف العنصر", "error");
    } finally {
      setDeletingKey(null);
    }
  }

  function updateItem(index: number, field: keyof FooterItem, value: any) {
    setData((p) => {
      const items = [...p.footerItems];
      items[index] = { ...items[index], [field]: value };
      return { ...p, footerItems: items };
    });
  }

  async function saveSection(section: string, body: object) {
    setSavingSection(section);
    try {
      const r = await fetch(`/api/admin/company`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        showMsg(section, "تم الحفظ بنجاح");
      } else {
        showMsg(section, "حدث خطأ أثناء الحفظ", "error");
      }
    } catch {
      showMsg(section, "فشل الاتصال بالخادم", "error");
    } finally {
      setSavingSection(null);
    }
  }

  if (loadingInitial) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center" dir="rtl">
        <div className="flex items-center gap-3 text-gray-500 text-sm">
          <span className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>جاري تحميل الإعدادات والملفات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 sm:space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">الملفات والصور والروابط</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            إدارة روابط وملفات التوثيق، الشهادات، ومعروف في أسفل الموقع
          </p>
        </div>
      </div>

      {/* QR */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h2 className="text-sm font-bold text-gray-700">الكيو آر (QR Code)</h2>
          </div>
          <div className="flex items-center gap-2">
            {msgs["qr"] && (
              <span
                className={`text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 ${
                  msgs["qr"].type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {msgs["qr"].type === "success" ? <FiCheck size={12} /> : <FiAlertCircle size={12} />}
                {msgs["qr"].text}
              </span>
            )}
            <button
              onClick={() =>
                saveSection("qr", {
                  qrLink: data.qrLink,
                  qrLinkType: data.qrLinkType,
                  qrFile: data.qrFile,
                })
              }
              disabled={savingSection === "qr"}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
            >
              {savingSection === "qr" ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 sm:px-5 sm:py-5">
          {/* QR Image */}
          <div className="relative shrink-0">
            <div
              onClick={() => qrRef.current?.click()}
              className="relative w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group overflow-hidden"
              title="اضغط لرفع صورة الكيو آر"
            >
              {uploading === "qrImage" ? (
                <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : data.qrImage ? (
                <>
                  <Image
                    key={imgKeys["qrImage"] || data.qrImage}
                    src={data.qrImage}
                    alt="qr"
                    fill
                    sizes="96px"
                    className="object-contain p-1.5"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiUpload className="text-white" size={18} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-gray-400 group-hover:text-blue-600 transition-colors">
                  <FiUpload size={22} />
                  <span className="text-[11px] font-medium">رفع صورة</span>
                </div>
              )}
              <input
                ref={qrRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) uploadImageField("qrImage", f);
                }}
              />
            </div>
            {data.qrImage && (
              <button
                onClick={() => deleteImageField("qrImage")}
                disabled={deletingKey === "qrImage"}
                className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow disabled:opacity-50"
                title="حذف الصورة"
              >
                {deletingKey === "qrImage" ? (
                  <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiTrash2 size={12} />
                )}
              </button>
            )}
          </div>

          {/* QR Link/File */}
          <div className="flex-1 min-w-0 w-full space-y-3">
            <div className="flex items-center gap-6">
              {(["link", "file"] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input
                    type="radio"
                    name="type-qr"
                    value={t}
                    checked={data.qrLinkType === t}
                    onChange={() => setData((p) => ({ ...p, qrLinkType: t }))}
                    className="accent-blue-600 w-4 h-4 cursor-pointer"
                  />
                  {t === "link" ? "رابط إلكتروني" : "ملف مستند / PDF"}
                </label>
              ))}
            </div>

            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs w-full">
              <span className="shrink-0">⚠️</span>
              <span>يمكنك اختيار رابط مباشر أو رفع ملف مستند للفتح عند الضغط على الكيو آر</span>
            </div>

            {data.qrLinkType === "link" ? (
              <div key="qr-link" className="flex items-center gap-2 w-full">
                <FiLink className="text-gray-400 shrink-0" size={16} />
                <input
                  type="text"
                  value={data.qrLink ?? ""}
                  onChange={(e) => setData((p) => ({ ...p, qrLink: e.target.value }))}
                  placeholder="https://qr.saudibusiness.gov.sa/..."
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>
            ) : (
              <div key="qr-file" className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => qrFileRef.current?.click()}
                  disabled={uploading === "qrFile"}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shrink-0"
                >
                  {uploading === "qrFile" ? (
                    <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiUpload size={14} />
                  )}
                  رفع ملف PDF / صورة
                </button>
                <input
                  type="file"
                  className="hidden"
                  ref={qrFileRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) uploadDocField("qrFile", f);
                  }}
                />
                {data.qrFile && (
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                    <button
                      onClick={() => openFile(data.qrFile)}
                      className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs hover:underline"
                    >
                      <FiExternalLink size={13} />
                      عرض الملف الحالي
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => deleteDocField("qrFile")}
                      disabled={deletingKey === "qrFile"}
                      className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                    >
                      {deletingKey === "qrFile" ? "جاري الحذف..." : "حذف الملف"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Items (معروف) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-bold text-gray-700">معروف وعناصر التذييل</h2>
          </div>
          <div className="flex items-center gap-2">
            {msgs["items"] && (
              <span
                className={`text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 ${
                  msgs["items"].type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {msgs["items"].type === "success" ? <FiCheck size={12} /> : <FiAlertCircle size={12} />}
                {msgs["items"].text}
              </span>
            )}
            <button
              onClick={addFooterItem}
              disabled={savingSection === "items"}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              <FiPlus size={13} />
              إضافة عنصر
            </button>
            <button
              onClick={() => saveSection("items", { footerItems: data.footerItems })}
              disabled={savingSection === "items"}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
            >
              {savingSection === "items" ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </button>
          </div>
        </div>

        {data.footerItems.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-400 space-y-3">
            <p>لا توجد عناصر مضافة حالياً</p>
            <button
              onClick={addFooterItem}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition"
            >
              <FiPlus size={14} />
              إضافة أول عنصر
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.footerItems.map((item, i) => (
              <div key={item._id || i} className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 sm:px-5 sm:py-5 relative">
                {/* Image */}
                <div className="relative shrink-0">
                  <div
                    onClick={() => imgRefs.current[i]?.click()}
                    className="relative w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group overflow-hidden"
                    title="اضغط لرفع صورة"
                  >
                    {uploading === `img-${i}` ? (
                      <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : item.image ? (
                      <>
                        <Image
                          key={imgKeys[`img-${i}`] || item.image}
                          src={item.image}
                          alt={`item-${i}`}
                          fill
                          sizes="96px"
                          className="object-contain p-1.5"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <FiUpload className="text-white" size={18} />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-gray-400 group-hover:text-blue-600 transition-colors">
                        <FiUpload size={22} />
                        <span className="text-[11px] font-medium">رفع صورة</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => {
                        imgRefs.current[i] = el;
                      }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) uploadItemImg(i, f);
                      }}
                    />
                  </div>
                  {item.image && (
                    <button
                      onClick={() => deleteItemImg(i)}
                      disabled={deletingKey === `img-${i}`}
                      className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow disabled:opacity-50"
                      title="حذف الصورة"
                    >
                      {deletingKey === `img-${i}` ? (
                        <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiTrash2 size={12} />
                      )}
                    </button>
                  )}
                </div>

                {/* Link / File */}
                <div className="flex-1 min-w-0 w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {(["link", "file"] as const).map((t) => (
                        <label key={t} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                          <input
                            type="radio"
                            name={`type-${i}`}
                            value={t}
                            checked={(item.linkType ?? "link") === t}
                            onChange={() => updateItem(i, "linkType", t)}
                            className="accent-blue-600 w-4 h-4 cursor-pointer"
                          />
                          {t === "link" ? "رابط خارجي" : "ملف مستند / PDF"}
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={() => removeFooterItem(i)}
                      disabled={deletingKey === `item-${i}`}
                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 font-medium"
                      title="حذف العنصر بالكامل"
                    >
                      <FiTrash2 size={13} />
                      حذف العنصر
                    </button>
                  </div>

                  {(item.linkType ?? "link") === "link" ? (
                    <div key={`link-input-${i}`} className="flex items-center gap-2 w-full">
                      <FiLink className="text-gray-400 shrink-0" size={16} />
                      <input
                        type="text"
                        value={item.link ?? ""}
                        onChange={(e) => updateItem(i, "link", e.target.value)}
                        placeholder="https://maroof.sa/..."
                        className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                  ) : (
                    <div key={`file-input-${i}`} className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => fileRefs.current[i]?.click()}
                        disabled={uploading === `file-${i}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shrink-0"
                      >
                        {uploading === `file-${i}` ? (
                          <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiUpload size={14} />
                        )}
                        رفع ملف PDF / صورة
                      </button>
                      <input
                        type="file"
                        className="hidden"
                        ref={(el) => {
                          fileRefs.current[i] = el;
                        }}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) uploadItemFile(i, f);
                        }}
                      />
                      {item.file && (
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                          <button
                            onClick={() => openFile(item.file)}
                            className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs hover:underline"
                          >
                            <FiExternalLink size={13} />
                            عرض الملف الحالي
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => deleteItemFile(i)}
                            disabled={deletingKey === `file-${i}`}
                            className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                          >
                            {deletingKey === `file-${i}` ? "جاري الحذف..." : "حذف الملف"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 1 - مركز الاعمال السعودي */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <h2 className="text-sm font-bold text-gray-700">مركز الأعمال السعودي</h2>
          </div>
          <div className="flex items-center gap-2">
            {msgs["s1"] && (
              <span
                className={`text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 ${
                  msgs["s1"].type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {msgs["s1"].type === "success" ? <FiCheck size={12} /> : <FiAlertCircle size={12} />}
                {msgs["s1"].text}
              </span>
            )}
            <button
              onClick={() =>
                saveSection("s1", {
                  link1: data.link1,
                  link1Type: data.linkType1,
                  linkType1: data.linkType1,
                  file1: data.file1,
                })
              }
              disabled={savingSection === "s1"}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
            >
              {savingSection === "s1" ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 sm:px-5 sm:py-5">
          <div className="relative shrink-0">
            <div
              onClick={() => img1Ref.current?.click()}
              className="relative w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group overflow-hidden"
              title="اضغط لرفع صورة الشعار"
            >
              {uploading === "img1" ? (
                <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : data.img1 ? (
                <>
                  <Image
                    key={imgKeys["img1"] || data.img1}
                    src={data.img1}
                    alt="img1"
                    fill
                    sizes="96px"
                    className="object-contain p-1.5"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiUpload className="text-white" size={18} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-gray-400 group-hover:text-blue-600 transition-colors">
                  <FiUpload size={22} />
                  <span className="text-[11px] font-medium">رفع صورة</span>
                </div>
              )}
              <input
                ref={img1Ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) uploadImageField("img1", f);
                }}
              />
            </div>
            {data.img1 && (
              <button
                onClick={() => deleteImageField("img1")}
                disabled={deletingKey === "img1"}
                className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow disabled:opacity-50"
                title="حذف الصورة"
              >
                {deletingKey === "img1" ? (
                  <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiTrash2 size={12} />
                )}
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0 w-full space-y-3">
            <div className="flex items-center gap-6">
              {(["link", "file"] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input
                    type="radio"
                    name="type-1"
                    value={t}
                    checked={data.linkType1 === t}
                    onChange={() => setData((p) => ({ ...p, linkType1: t }))}
                    className="accent-blue-600 w-4 h-4 cursor-pointer"
                  />
                  {t === "link" ? "رابط إلكتروني" : "ملف مستند / PDF"}
                </label>
              ))}
            </div>

            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs w-full">
              <span className="shrink-0">⚠️</span>
              <span>يمكنك إدخال رابط شهادة مركز الأعمال السعودي أو رفع ملف PDF للشهادة</span>
            </div>

            {data.linkType1 === "link" ? (
              <div key="s1-link" className="flex items-center gap-2 w-full">
                <FiLink className="text-gray-400 shrink-0" size={16} />
                <input
                  type="text"
                  value={data.link1 ?? ""}
                  onChange={(e) => setData((p) => ({ ...p, link1: e.target.value }))}
                  placeholder="https://eauthenticate.saudibusiness.gov.sa/..."
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>
            ) : (
              <div key="s1-file" className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => fileRef1.current?.click()}
                  disabled={uploading === "file1"}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shrink-0"
                >
                  {uploading === "file1" ? (
                    <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiUpload size={14} />
                  )}
                  رفع ملف الشهادة
                </button>
                <input
                  type="file"
                  className="hidden"
                  ref={fileRef1}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) uploadDocField("file1", f);
                  }}
                />
                {data.file1 && (
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                    <button
                      onClick={() => openFile(data.file1)}
                      className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs hover:underline"
                    >
                      <FiExternalLink size={13} />
                      عرض الملف الحالي
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => deleteDocField("file1")}
                      disabled={deletingKey === "file1"}
                      className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                    >
                      {deletingKey === "file1" ? "جاري الحذف..." : "حذف الملف"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2 - ضريبة القيمة المضافة */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <h2 className="text-sm font-bold text-gray-700">ضريبة القيمة المضافة (ZATCA / VAT)</h2>
          </div>
          <div className="flex items-center gap-2">
            {msgs["s2"] && (
              <span
                className={`text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 ${
                  msgs["s2"].type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {msgs["s2"].type === "success" ? <FiCheck size={12} /> : <FiAlertCircle size={12} />}
                {msgs["s2"].text}
              </span>
            )}
            <button
              onClick={() =>
                saveSection("s2", {
                  link2: data.link2,
                  link2Type: data.linkType2,
                  linkType2: data.linkType2,
                  file2: data.file2,
                })
              }
              disabled={savingSection === "s2"}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
            >
              {savingSection === "s2" ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 sm:px-5 sm:py-5">
          <div className="relative shrink-0">
            <div
              onClick={() => img2Ref.current?.click()}
              className="relative w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group overflow-hidden"
              title="اضغط لرفع صورة الشعار"
            >
              {uploading === "img2" ? (
                <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : data.img2 ? (
                <>
                  <Image
                    key={imgKeys["img2"] || data.img2}
                    src={data.img2}
                    alt="img2"
                    fill
                    sizes="96px"
                    className="object-contain p-1.5"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiUpload className="text-white" size={18} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-gray-400 group-hover:text-blue-600 transition-colors">
                  <FiUpload size={22} />
                  <span className="text-[11px] font-medium">رفع صورة</span>
                </div>
              )}
              <input
                ref={img2Ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) uploadImageField("img2", f);
                }}
              />
            </div>
            {data.img2 && (
              <button
                onClick={() => deleteImageField("img2")}
                disabled={deletingKey === "img2"}
                className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow disabled:opacity-50"
                title="حذف الصورة"
              >
                {deletingKey === "img2" ? (
                  <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiTrash2 size={12} />
                )}
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0 w-full space-y-3">
            <div className="flex items-center gap-6">
              {(["link", "file"] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input
                    type="radio"
                    name="type-2"
                    value={t}
                    checked={data.linkType2 === t}
                    onChange={() => setData((p) => ({ ...p, linkType2: t }))}
                    className="accent-blue-600 w-4 h-4 cursor-pointer"
                  />
                  {t === "link" ? "رابط إلكتروني" : "ملف مستند / PDF"}
                </label>
              ))}
            </div>

            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs w-full">
              <span className="shrink-0">⚠️</span>
              <span>يمكنك إدخال رابط شهادة الضريبة أو رفع ملف PDF لشهادة تسجيل ضريبة القيمة المضافة</span>
            </div>

            {data.linkType2 === "link" ? (
              <div key="s2-link" className="flex items-center gap-2 w-full">
                <FiLink className="text-gray-400 shrink-0" size={16} />
                <input
                  type="text"
                  value={data.link2 ?? ""}
                  onChange={(e) => setData((p) => ({ ...p, link2: e.target.value }))}
                  placeholder="https://zatca.gov.sa/..."
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>
            ) : (
              <div key="s2-file" className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => fileRef2.current?.click()}
                  disabled={uploading === "file2"}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shrink-0"
                >
                  {uploading === "file2" ? (
                    <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiUpload size={14} />
                  )}
                  رفع ملف الشهادة
                </button>
                <input
                  type="file"
                  className="hidden"
                  ref={fileRef2}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) uploadDocField("file2", f);
                  }}
                />
                {data.file2 && (
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                    <button
                      onClick={() => openFile(data.file2)}
                      className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs hover:underline"
                    >
                      <FiExternalLink size={13} />
                      عرض الملف الحالي
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => deleteDocField("file2")}
                      disabled={deletingKey === "file2"}
                      className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                    >
                      {deletingKey === "file2" ? "جاري الحذف..." : "حذف الملف"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
