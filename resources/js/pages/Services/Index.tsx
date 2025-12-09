import { Head, Link } from '@inertiajs/react';

interface Service {
    id: number;
    name: string;
    description: string;
    base_price: number;
    estimated_duration_minutes: number;
}

interface Category {
    id: number;
    name: string;
    description: string;
    services: Service[];
}

interface Props {
    categories: Category[];
}

export default function Index({ categories }: Props) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Our Services" />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900">Professional Cleaning Services</h1>
                    <p className="mt-4 text-xl text-gray-600">Choose the perfect service for your home</p>
                </div>

                <div className="space-y-12">
                    {categories.map(category => (
                        <div key={category.id}>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">{category.name}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {category.services.map(service => (
                                    <div key={service.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6 flex flex-col">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                                        <p className="text-gray-600 mb-4 flex-grow">{service.description}</p>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                            <div>
                                                <span className="block text-2xl font-bold text-indigo-600">{service.base_price} MAD</span>
                                                <span className="text-sm text-gray-500">Approx. {service.estimated_duration_minutes} mins</span>
                                            </div>
                                            <Link
                                                href={route('agents.index', { service_id: service.id })}
                                                className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-100 transition font-medium"
                                            >
                                                Find Agents
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
