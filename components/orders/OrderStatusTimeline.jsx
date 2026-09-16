import React from 'react';
import { CheckCircle2, Circle, Clock, CreditCard, Sparkles, FolderCheck, AlertCircle } from 'lucide-react';

export function OrderStatusTimeline({ status }) {
    const steps = [
        { key: 'PENDING_PAYMENT', title: 'Order Created', desc: 'Brief Submitted', icon: Clock },
        { key: 'PAID', title: 'Payment Confirmed', desc: 'Paystack Ledger Ready', icon: CreditCard },
        { key: 'IN_PRODUCTION', title: 'In Production', desc: 'Creative Team Working', icon: Sparkles },
        { key: 'IN_REVIEW', title: 'In Quality Review', desc: 'Internal QA Verification', icon: Clock },
        { key: 'COMPLETED', title: 'Completed', desc: 'Deliverables Released', icon: FolderCheck },
    ];

    const statusOrder = ['PENDING_PAYMENT', 'PAID', 'AWAITING_INFORMATION', 'IN_PRODUCTION', 'IN_REVIEW', 'COMPLETED'];

    // Normalize status index
    let currentIdx = statusOrder.indexOf(status);
    if (status === 'AWAITING_INFORMATION') currentIdx = 1; // Maps near PAID/PRODUCTION

    const isCancelled = status === 'CANCELLED';

    if (isCancelled) {
        return (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                This project order has been cancelled. Please contact support if you have questions.
            </div>
        );
    }

    return (
        <div className="py-4">
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {steps.map((step, idx) => {
                    const isPassed = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;
                    const Icon = step.icon;

                    return (
                        <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 relative z-10">
                            {/* Status Circle Node */}
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${isPassed
                                        ? 'bg-synth-gradient text-white shadow-purple-200'
                                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                                    } ${isCurrent ? 'ring-4 ring-purple-100 scale-110' : ''}`}
                            >
                                {isPassed ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Icon className="w-5 h-5" />}
                            </div>

                            {/* Text Info */}
                            <div className="md:text-center space-y-0.5">
                                <p className={`text-xs font-bold ${isPassed ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {step.title}
                                </p>
                                <p className="text-[11px] text-gray-400 leading-tight">{step.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
