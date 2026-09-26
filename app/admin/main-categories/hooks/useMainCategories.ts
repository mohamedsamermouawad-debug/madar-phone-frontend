"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";
import type { Category } from "../types";

const BASE = "/api/admin/main-categories";

export function useMainCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiFetch(`${BASE}/extra`, { credentials: "include" });
      const data: Category[] = res.ok ? await res.json() : [];
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("فشل تحميل التصنيفات");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل إضافة التصنيف");
        return;
      }
      setShowModal(false);
      setName("");
      toast.success(`تم إضافة "${data.name}" بنجاح 🎉`);
      fetchCategories();
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editCat || !editName.trim()) return;
    setEditError("");
    setEditLoading(true);
    try {
      const res = await apiFetch(`${BASE}/rename`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldName: editCat.name, newName: editName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "فشل تعديل التصنيف");
        return;
      }
      setEditCat(null);
      toast.success("تم حفظ التعديلات بنجاح ✅");
      fetchCategories();
    } catch {
      setEditError("حدث خطأ في الاتصال");
    } finally {
      setEditLoading(false);
    }
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    const catName = confirmDelete;
    setConfirmDelete(null);
    try {
      const res = await apiFetch(`${BASE}/remove`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: catName }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "فشل حذف التصنيف");
        return;
      }
      toast.success(`تم حذف "${catName}" بنجاح ✅`);
      fetchCategories();
    } catch {
      toast.error("حدث خطأ في الاتصال");
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.trim().toLowerCase();
    return categories.filter((c) => c.name?.toLowerCase().includes(q));
  }, [categories, search]);

  return {
    categories,
    filtered,
    search,
    setSearch,
    initialLoading,
    showModal,
    setShowModal,
    name,
    setName,
    error,
    loading,
    handleAdd,
    editCat,
    setEditCat,
    editName,
    setEditName,
    editError,
    editLoading,
    handleEdit,
    confirmDelete,
    setConfirmDelete,
    confirmDeleteAction,
  };
}
