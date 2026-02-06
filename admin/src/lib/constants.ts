import { BookOpen, FileText, ClipboardList, Trophy, Users } from "lucide-react";

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
    title: "O'quvchilar",
    href: "/students",
    icon: Users,
  },
  {
    title: "Reytinglar",
    href: "/rankings",
    icon: Trophy,
  },
] as const;
