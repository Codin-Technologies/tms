import {
    Home,
    Box,
    Activity,
    Users,
    User,
    CheckCircle,
    BarChart,
    LayoutDashboard,
    Database,
    ClipboardList,
    ArrowLeftRight,
    LineChart,
    Trash2,
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
            href: "/stock/dashboard",
            icon: Home,
        },
        {
            name: "Inventory",
            href: "/inventory",
            icon: Box,
        },
        {
            name: "Transfers",
            href: "/stock/transfers",
            icon: ArrowLeftRight,
        },
        {
            name: "Reorder & Forecast",
            href: "/stock/reorder",
            icon: LineChart,
        },
        {
            name: "Scrap & Quarantine",
            href: "/stock/scrap",
            icon: Trash2,
        },
        {
            name: "Operations",
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