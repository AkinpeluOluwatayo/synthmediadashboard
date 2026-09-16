import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { Sparkles, Palette, TrendingUp, Cpu, ArrowRight } from 'lucide-react';

export default async function ServicesMarketplacePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id || '')
        .single();

    // Fetch Active Services with Packages
    const { data: services } = await supabase
        .from('services')
        .select('*, packages(*)')
        .eq('active', true)
        .order('created_at', { ascending: true });

    const categories = [
        { key: 'CREATIVE', title: 'Creative & Design', icon: Palette, color: 'text-pink-500 bg-pink-50 border-pink-200' },
        { key: 'DIGITAL GROWTH', title: 'Digital Growth & Marketing', icon: TrendingUp, color: 'text-purple-500 bg-purple-50 border-purple-200' },
        { key: 'TECHNOLOGY', title: 'Technology & Web Solutions', icon: Cpu, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    ];

    return (
        <DashboardLayout userProfile={profile}>
            <div className="space-y-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-2">
                        <Sparkles className="w-3.5 h-3.5" /> SYNTH MEDIA PILLARS
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Services Marketplace</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Choose a service package to launch your next creative campaign, social media growth, or tech development project.
                    </p>
                </div>

                {categories.map((cat) => {
                    const categoryServices = (services || []).filter(s => s.category === cat.key);
                    const Icon = cat.icon;

                    return (
                        <div key={cat.key} className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                                <div className={`p-2 rounded-lg border ${cat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-extrabold text-gray-900">{cat.title}</h2>
                                    <p className="text-xs text-gray-500">Professional {cat.key.toLowerCase()} solutions tailored for your business</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categoryServices.map((service) => {
                                    const minPrice = service.packages?.length > 0
                                        ? Math.min(...service.packages.map(p => Number(p.price)))
                                        : null;

                                    return (
                                        <Card key={service.id} className="flex flex-col justify-between hover:shadow-md border-gray-200 transition-all">
                                            <div className="space-y-4">
                                                {service.image_url && (
                                                    <div className="h-40 w-full rounded-lg overflow-hidden bg-gray-100 relative">
                                                        <img
                                                            src={service.image_url}
                                                            alt={service.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                        <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-gray-900/80 text-white uppercase tracking-wider backdrop-blur-sm">
                                                            {service.category}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-base font-extrabold text-gray-900">{service.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                                                        {service.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] font-semibold text-gray-400 block uppercase">Starting from</span>
                                                    <span className="text-sm font-extrabold text-gray-900">
                                                        {minPrice !== null ? formatCurrency(minPrice) : 'Contact Us'}
                                                    </span>
                                                </div>
                                                <Link href={`/dashboard/services/${service.id}`}>
                                                    <button className="px-3.5 py-2 bg-synth-gradient text-white text-xs font-bold rounded-lg shadow-sm hover:opacity-95 flex items-center gap-1.5">
                                                        View Packages <ArrowRight className="w-3.5 h-3.5" />
                                                    </button>
                                                </Link>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </DashboardLayout>
    );
}
