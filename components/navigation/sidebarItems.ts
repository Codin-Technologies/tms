import {
    Home,
    Box,
    Activity,
    Users,
    User,
    CheckCircle,
    BarChart,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export const sidebarItems: {
    name: string;
    href: string;
    icon: IconType;
}[] = [
    {
        name: "Dashboard",
        href: "/",
        icon: Home,
    },
    {
        name: "Tyre Stock",
        href: "/stock",
        icon: Box,
    },
    {
        name: "Tyre Operations",
        href: "/operations",
        icon: Activity,
    },
    {
        name: "TPMS",
        href: "/tpms",
        icon: Users,
    },
    {
        name: "Inspection",
        href: "/inspection",
        icon: CheckCircle,
    },
    {
        name: "Reports",
        href: "/reports",
        icon: BarChart,
    },
    {
        name: "Users",
        href: "/users",
        icon: User,
    },
];

export default sidebarItems;