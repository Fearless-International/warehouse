import connectDB from '@/lib/db/mongodb';
import Product from '@/lib/db/models/Product';
import Link from 'next/link';
import ProductActionsClient from '@/components/ProductActionsClient';

export default async function ProductsPage() {
  await connectDB();
  
  const products = await Product.find()
    .sort({ category: 1, name: 1 })
    .lean();

  const stats = {
    total: products.length,
    crm: products.filter((p: any) => p.category === 'CRM').length,
    rm: products.filter((p: any) => p.category === 'RM').length,
    beverage: products.filter((p: any) => p.category === 'Beverage').length,
    totalStock: products.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0),
    lowStock: products.filter((p: any) => (p.quantity || 0) < 10).length
  };

  // Convert to plain objects
  const plainProducts = products.map(product => ({
    _id: product._id.toString(),
    name: product.name,
    category: product.category || '',
    unit: product.unit || '',
    quantity: product.quantity || 0,
    price: product.price || 0,
    supplier: product.supplier || '',
    isActive: product.isActive ?? true
  }));

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <div className="flex gap-3">
          <Link 
            href="/warehouse/products/import"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
          >
            📥 Import Excel
          </Link>
          <Link 
            href="/warehouse/products/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-blue-700 text-sm font-medium">Total Products</p>
          <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
          <p className="text-purple-700 text-sm font-medium">CRM</p>
          <p className="text-3xl font-bold text-purple-900">{stats.crm}</p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <p className="text-green-700 text-sm font-medium">RM</p>
          <p className="text-3xl font-bold text-green-900">{stats.rm}</p>
        </div>
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <p className="text-orange-700 text-sm font-medium">Beverage</p>
          <p className="text-3xl font-bold text-orange-900">{stats.beverage}</p>
        </div>
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg">
          <p className="text-indigo-700 text-sm font-medium">Total Stock</p>
          <p className="text-3xl font-bold text-indigo-900">{stats.totalStock}</p>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700 text-sm font-medium">Low Stock</p>
          <p className="text-3xl font-bold text-red-900">{stats.lowStock}</p>
        </div>
      </div>

      {/* Products Table with Client Actions */}
      <ProductActionsClient products={plainProducts} />

      {/* Low Stock Alert */}
      {stats.lowStock > 0 && (
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Low Stock Alert
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                {stats.lowStock} product{stats.lowStock !== 1 ? 's' : ''} {stats.lowStock === 1 ? 'has' : 'have'} low stock (less than 10 units). 
                Consider restocking soon.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}