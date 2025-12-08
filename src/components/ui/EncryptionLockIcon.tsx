"use client";

import { Lock } from "lucide-react";

export function EncryptionLockIcon() {
    // Plus button is at bottom-8 (32px) and is ~56px tall, so it extends to ~88px from bottom
    // Position encryption lock below it with proper spacing
    return (
        <div className="fixed right-4 mb-4 lg:right-8 z-30 group" style={{ bottom: '8px' }}>
            {/* <div className="flex items-center justify-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-2.5 py-1.5 rounded-lg shadow-lg border-2 border-green-500 dark:border-green-400 cursor-pointer transition-all hover:bg-green-100 dark:hover:bg-green-900/30 hover:shadow-xl">
                <Lock size={16} className="text-green-600 dark:text-green-400 flex-shrink-0" />
            </div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="bg-green-600 dark:bg-green-500 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                    End to End Encrypted
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600 dark:border-t-green-500"></div>
                </div>
            </div> */}
        </div>
    );
}
