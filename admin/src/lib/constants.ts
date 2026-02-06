import { BookOpen, FileText, ClipboardList, Trophy } from "lucide-react";

export const NAV_ITEMS = [
  {
    title: "Fanlar",
    href: "/subjects",
    icon: BookOpen,
  },
  {
    title: "Darsliklar",
    href: "/lessons",
    icon: FileText,
  },
  {
    title: "Testlar",
    href: "/tests",
    icon: ClipboardList,
  },
  {
    title: "Reytinglar",
    href: "/rankings",
    icon: Trophy,
  },
] as const;
