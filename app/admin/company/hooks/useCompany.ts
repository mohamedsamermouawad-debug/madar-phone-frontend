"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useCompanyStore } from "../../../store/companyStore";
import { defaultData, toFullUrl } from "../constants";
import type { CompanyData } from "../types";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function useCompany() {
  const { setLogo } = useCompanyStore();
  const [data, setData] = useState<CompanyData>(defaultData);
  const [initialData, setInitialData] = useState<CompanyData>(defaultData);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const fetchCompanyData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/company`, { cache: "no-store" });
      if (!res.ok) throw new Error("تعذر جلب البيانات من الخادم");
      const resData = await res.json();

      const imageKeys = ["logo", "header", "footer", "stamp", "cancelStamp"];
      const merged: CompanyData = { ...defaultData };

      for (const k of Object.keys(defaultData) as (keyof CompanyData)[]) {
        if (resData[k] !== undefined && resData[k] !== null && resData[k] !== "") {
          merged[k] = imageKeys.includes(k) ? toFullUrl(resData[k]) : resData[k];
        }
      }

      setData(merged);
      setInitialData(merged);
      if (merged.logo) {
        setLogo(merged.logo);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "فشل تحميل بيانات الشركة");
    } finally {
      setLoading(false);
    }
  }, [setLogo]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, initialData]);

  const handleChange = useCallback((key: keyof CompanyData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleImageChange = useCallback(
    async (key: string, file: File) => {
      if (!file) return;

      // 1. Client-side file type validation
      if (!file.type.startsWith("image/")) {
        toast.error("يرجى اختيار ملف صورة صالح (PNG, JPG, WebP, SVG)");
        return;
      }

      // 2. Client-side file size validation (Save bandwidth & server load)
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        toast.error(`حجم الصورة (${sizeMb}MB) يتجاوز الحد الأقصى المسموح (5MB)`);
        return;
      }

      setUploadingKey(key);
      const toastId = toast.loading(`جاري رفع ${key}...`);

      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch(`/api/admin/company/upload/${key}`, {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "فشل رفع الصورة");
        }

        const fullUrl = toFullUrl(json.url);
        setData((prev) => {
          const updated = { ...prev, [key]: fullUrl };
          setInitialData((init) => ({ ...init, [key]: fullUrl }));
          return updated;
        });

        if (key === "logo") {
          setLogo(fullUrl);
        }

        toast.success("تم رفع الصورة بنجاح وتحديث المتجر", { id: toastId });
      } catch (err: any) {
        console.error("Upload error:", err);
        toast.error(err?.message || "فشل رفع الصورة", { id: toastId });
      } finally {
        setUploadingKey(null);
      }
    },
    [setLogo]
  );

  const handleImageDelete = useCallback(
    async (key: string) => {
      setDeletingKey(key);
      const toastId = toast.loading("جاري حذف الصورة...");
      try {
        const res = await fetch(`/api/admin/company/image/${key}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || "فشل حذف الصورة");
        }

        setData((prev) => {
          const updated = { ...prev, [key]: "" };
          setInitialData((init) => ({ ...init, [key]: "" }));
          return updated;
        });

        if (key === "logo") {
          setLogo("");
        }

        toast.success("تم حذف الصورة بنجاح", { id: toastId });
      } catch (err: any) {
        console.error("Delete error:", err);
        toast.error(err?.message || "فشل حذف الصورة", { id: toastId });
      } finally {
        setDeletingKey(null);
      }
    },
    [setLogo]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    const toastId = toast.loading("جاري حفظ التعديلات...");
    try {
      const res = await fetch(`/api/admin/company`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "فشل حفظ البيانات في الخادم");
      }

      setInitialData(data);
      if (data.logo) {
        setLogo(data.logo);
      }
      toast.success("تم حفظ وتحديث بيانات الشركة بنجاح ✨", { id: toastId });
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err?.message || "فشل حفظ البيانات", { id: toastId });
    } finally {
      setSaving(false);
    }
  }, [data, setLogo]);

  const handleReset = useCallback(() => {
    setData(initialData);
    toast("تم إلغاء التغييرات غير المحفوظة", { icon: "↩️" });
  }, [initialData]);

  return {
    data,
    loading,
    saving,
    isDirty,
    uploadingKey,
    deletingKey,
    handleChange,
    handleImageChange,
    handleImageDelete,
    handleSave,
    handleReset,
    refetch: fetchCompanyData,
  };
}
