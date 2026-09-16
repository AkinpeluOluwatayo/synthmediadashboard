'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, UploadCloud, FileText, CreditCard } from 'lucide-react';

export default function OrderCreationPage({ service, selectedPackage, profile }) {
    const [projectTitle, setProjectTitle] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [deadline, setDeadline] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!projectTitle || !projectDescription) {
            setError('Please fill in the required project title and project description.');
            return;
        }

        setLoading(true);

        try {
            const orderNumber = `SM-${Math.floor(1000 + Math.random() * 9000)}`;

            // 1. Create Order Record
            const { data: newOrder, error: orderError } = await supabase
                .from('orders')
                .insert({
                    order_number: orderNumber,
                    customer_id: profile.id,
                    service_id: service.id,
                    package_id: selectedPackage.id,
                    project_title: projectTitle,
                    project_description: projectDescription,
                    instructions: instructions,
                    deadline: deadline || null,
                    status: 'PENDING_PAYMENT',
                    amount: selectedPackage.price,
                    currency: selectedPackage.currency || 'NGN',
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Upload Order Requirement File (if provided)
            if (file) {
                const fileExt = file.name.split('.').pop();
                const filePath = `${profile.id}/${newOrder.id}/${Date.now()}.${fileExt}`;

                // Attempt bucket upload
                const { data: storageData, error: uploadError } = await supabase.storage
                    .from('order-files')
                    .upload(filePath, file);

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('order-files')
                        .getPublicUrl(filePath);

                    await supabase.from('order_files').insert({
                        order_id: newOrder.id,
                        uploaded_by: profile.id,
                        file_name: file.name,
                        file_url: publicUrl || filePath,
                        storage_path: filePath,
                        file_type: file.type,
                        file_size: file.size,
                    });
                }
            }

            // 3. Create Payment Ledger Entry Boundary
            await supabase.from('payments').insert({
                order_id: newOrder.id,
                customer_id: profile.id,
                amount: selectedPackage.price,
                currency: selectedPackage.currency || 'NGN',
                reference: `PAY-${orderNumber}-${Date.now()}`,
                status: 'pending',
                provider: 'paystack',
            });

            // Redirect to Paystack payment link if available, else go to order detail
            if (selectedPackage.paystack_link) {
                window.location.href = selectedPackage.paystack_link;
            } else {
                router.push(`/dashboard/orders/${newOrder.id}`);
                router.refresh();
            }
        } catch (err) {
            setError(err.message || 'Failed to submit order requirements. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout userProfile={profile}>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <Link href={`/dashboard/services/${service.id}`} className="inline-flex items-center text-xs font-semibold text-purple-600 hover:text-purple-700 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Packages
                    </Link>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Submit Project Requirements</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Provide details for your project so our creative engineering team can start production immediately.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Brief Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleOrderSubmit} className="space-y-6">
                            <Card className="space-y-4">
                                <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Project Overview</h2>

                                <Input
                                    label="Project Title"
                                    required
                                    placeholder="e.g. Summer Campaign Promo Flyer 2026"
                                    value={projectTitle}
                                    onChange={(e) => setProjectTitle(e.target.value)}
                                />

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                                        Project Description & Requirements <span className="text-pink-500">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Describe your goals, required copy text, headline text, style preferences, target audience..."
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        value={projectDescription}
                                        onChange={(e) => setProjectDescription(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                                        Brand Guidelines / Colors / Font Instructions
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Preferred hex color codes, typography preferences, or reference links..."
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                    />
                                </div>

                                <Input
                                    label="Target Completion Deadline"
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                />
                            </Card>

                            {/* File Attachment */}
                            <Card className="space-y-4">
                                <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Reference Files & Assets</h2>
                                <p className="text-xs text-gray-500">
                                    Upload relevant brand logos, reference images, text documents, or design assets (Max 25MB).
                                </p>

                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                                    <UploadCloud className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                    <label className="cursor-pointer">
                                        <span className="text-xs font-bold text-purple-600 hover:underline">Click to upload file</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => setFile(e.target.files[0] || null)}
                                        />
                                    </label>
                                    {file && (
                                        <div className="mt-3 p-2 bg-purple-50 rounded-lg inline-flex items-center gap-2 text-xs text-purple-700 font-semibold">
                                            <FileText className="w-4 h-4" /> {file.name}
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <Button type="submit" isLoading={loading} className="w-full py-3.5 text-sm flex items-center justify-center gap-2">
                                <CreditCard className="w-4 h-4" /> PAY NOW
                            </Button>
                        </form>
                    </div>

                    {/* Selected Package Summary Sidebar */}
                    <div className="space-y-4">
                        <Card className="space-y-4 bg-gray-50 border-gray-200 sticky top-24">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-3">Order Summary</h3>

                            <div className="space-y-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 uppercase">
                                    {service.category}
                                </span>
                                <h4 className="text-base font-extrabold text-gray-900">{service.name}</h4>
                                <p className="text-xs font-bold text-purple-600">{selectedPackage.name} Package</p>
                            </div>

                            <div className="py-3 border-y border-gray-200 space-y-2 text-xs">
                                <div className="flex justify-between text-gray-600">
                                    <span>Package Price</span>
                                    <span className="font-bold text-gray-900">{formatCurrency(selectedPackage.price)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Estimated Delivery</span>
                                    <span className="font-bold text-gray-900">{selectedPackage.delivery_days} Days</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Revisions Included</span>
                                    <span className="font-bold text-gray-900">{selectedPackage.revisions}</span>
                                </div>
                            </div>

                            <div className="flex items-baseline justify-between pt-1">
                                <span className="text-sm font-bold text-gray-900">Total Payable</span>
                                <span className="text-2xl font-black text-gray-900">{formatCurrency(selectedPackage.price)}</span>
                            </div>

                            <p className="text-[11px] text-gray-400 text-center">
                                Fill in your brief on the left, then click <strong className="text-gray-600">PAY NOW</strong> to complete payment via Paystack.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
