import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "من نحن - تعرف على مدار للإلكترونيات ورؤيتنا وخدماتنا",
  description: "تعرف على مؤسسة مدار للإلكترونيات - رؤيتنا ورسالتنا والخدمات المميزة التي نقدمها لعملائنا في جميع أنحاء المملكة العربية السعودية. تقسيط مريح وشحن سريع وضمان معتمد.",
};

export default function AboutPage() {
  return <AboutClient />;
}
