import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';

export default async function ServiceDetailPage({ params }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id || '')
        .single();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const { data: service } = await supabase
        .from('services')
        .select('*, packages(*)')
        .or(isUuid ? `id.eq.${id},slug.eq.${id}` : `slug.eq.${id}`)
        .single();

    if (!service) {
        notFound();
    }

    const isCustomConsultation = service.custom_consultation || service.packages?.length === 0;
    const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348100000000';
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
        `Hello Synth Media Agency! I am interested in inquiring about your "${service.name}" service for my organization.`
    )}`;

    return (
        <DashboardLayout userProfile={profile}>
            <div className="space-y-8 max-w-6xl">
                <div>
                    <Link href="/dashboard/services" className="inline-flex items-center text-xs font-semibold text-purple-600 hover:text-purple-700 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Services Catalog
                    </Link>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                                {service.category}
                            </span>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-2">{service.name}</h1>
                            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mt-1.5 leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Custom Consultation / WhatsApp Contact Banner for Tech Support & Full Enterprise Partnerships */}
                {isCustomConsultation ? (
                    <Card className="p-8 bg-synth-gradient text-white space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-pink-200">Custom Enterprise & Support Service</span>
                                <h2 className="text-xl font-black">Requires Tailored Consultation & Scope</h2>
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-purple-100 max-w-2xl leading-relaxed">
                            We do not display fixed public pricing for {service.name}. Every brand infrastructure and enterprise partnership has unique technical requirements. Reach out directly to our Front Desk on WhatsApp to discuss your scope.
                        </p>

                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-900 text-xs font-extrabold rounded-xl shadow-lg hover:bg-gray-100 transition-all"
                        >
                            <MessageSquare className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                            Connect with Front Desk on WhatsApp
                        </a>
                    </Card>
                ) : (
                    /* Standard Package Pricing Cards */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-extrabold text-gray-900">Select a Service Tier</h2>
                            <span className="text-xs text-gray-500 font-medium">All packages include Paystack instant checkout & order tracking</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {service.packages?.map((pkg) => {
                                const features = Array.isArray(pkg.features) ? pkg.features : [];

                                return (
                                    <Card key={pkg.id} className="p-6 flex flex-col justify-between space-y-6 hover:shadow-xl hover:border-purple-300 transition-all border-gray-200 relative overflow-hidden">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-black text-gray-900">{pkg.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">{pkg.description}</p>
                                                </div>
                                            </div>

                                            <div className="py-2 border-y border-gray-100">
                                                <span className="text-xs text-gray-400 font-medium block">Package Price</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-black text-gray-900">{formatCurrency(pkg.price)}</span>
                                                    {pkg.delivery_days >= 30 && <span className="text-xs font-bold text-gray-400">/ month</span>}
                                                </div>
                                            </div>

                                            <div className="space-y-2.5">
                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Included Features</span>
                                                {features.map((feat, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                        <span>{feat}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100">
                                            <Link href={`/dashboard/services/${service.slug || service.id}/order?packageId=${pkg.id}`}>
                                                <button className="w-full py-3 bg-synth-gradient text-white text-xs font-extrabold rounded-xl shadow-md hover:opacity-95 flex items-center justify-center gap-2">
                                                    Select {pkg.name} <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </Link>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
