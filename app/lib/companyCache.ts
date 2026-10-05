import { cache } from "react";
import { unstable_cache } from "next/cache";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

export const COMPANY_TAG = "company";

export const getCompanyData = cache(
  unstable_cache(
    async () => {
      try {
        const res = await fetch(`${BACKEND}/api/admin/company`, {
          next: { tags: [COMPANY_TAG] },
        });
        return res.ok ? await res.json() : {};
      } catch {
        return {};
      }
    },
    ["company-data"],
    { tags: [COMPANY_TAG], revalidate: 3600 }
  )
);
