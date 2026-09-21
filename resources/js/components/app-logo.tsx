import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex aspect-square size-9 items-center justify-center overflow-hidden rounded-lg bg-white shadow-xs border border-gray-100 dark:border-neutral-800">
                <img
                    src="/images/logo.png"
                    alt="Bazar Ghor"
                    className="size-8 object-contain"
                />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-[#2d6a27] dark:text-green-400">
                    Bazar Ghor
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                    এডমিন প্যানেল
                </span>
            </div>
        </div>
    );
}
