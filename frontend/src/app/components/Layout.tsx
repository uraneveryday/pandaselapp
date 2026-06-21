import { Outlet } from "react-router-dom";
import { useHomework } from "../context/HomeworkContext";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Layout() {
  const { hasHomework } = useHomework();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 flex flex-col items-center">
      <div className="w-full max-w-md flex-1 bg-white shadow-sm relative flex flex-col">
        {hasHomework && (
          <div className="bg-red-50 border-b border-red-100 px-4 py-3 flex items-start gap-3 sticky top-0 z-50 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-700 m-0">{t("components.layout.homeworkBannerTitle")}</h3>
              <p className="text-xs text-red-600 mt-0.5">{t("components.layout.homeworkBannerDescription")}</p>
            </div>
          </div>
        )}
        <main className="flex-1 w-full flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
