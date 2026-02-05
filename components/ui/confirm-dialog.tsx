'use client';

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './button';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false
}: ConfirmDialogProps) {
    const variantConfig = {
        danger: {
            icon: AlertTriangle,
            iconClass: 'bg-red-100 text-red-600',
            buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
        },
        warning: {
            icon: AlertTriangle,
            iconClass: 'bg-amber-100 text-amber-600',
            buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
        },
        info: {
            icon: AlertTriangle,
            iconClass: 'bg-teal-100 text-teal-600',
            buttonClass: 'bg-teal-600 hover:bg-teal-700 text-white',
        }
    };

    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <Transition show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
                                <div className="absolute right-4 top-4">
                                    <button
                                        type="button"
                                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                                        onClick={onClose}
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="p-8">
                                    <div className="sm:flex sm:items-start">
                                        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl sm:mx-0 sm:h-10 sm:w-10 ${config.iconClass}`}>
                                            <Icon className="h-6 w-6" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-xl font-black leading-6 text-gray-900 tracking-tight">
                                                {title}
                                            </Dialog.Title>
                                            <div className="mt-3">
                                                <p className="text-sm text-gray-500 leading-relaxed">
                                                    {description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50/50 px-8 py-6 flex flex-col sm:flex-row-reverse gap-3">
                                    <Button
                                        type="button"
                                        disabled={isLoading}
                                        className={`w-full sm:w-auto h-11 px-8 rounded-xl font-bold shadow-lg shadow-red-500/10 ${config.buttonClass}`}
                                        onClick={onConfirm}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                                Processing...
                                            </div>
                                        ) : confirmText}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full sm:w-auto h-11 px-8 rounded-xl font-bold border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300"
                                        onClick={onClose}
                                        disabled={isLoading}
                                    >
                                        {cancelText}
                                    </Button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
