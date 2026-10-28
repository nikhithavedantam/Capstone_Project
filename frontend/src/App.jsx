
import { useState } from 'react'
import {
  LayoutDashboard, ShoppingBag, ChartNoAxesCombined, Sparkles,
  Search, Bell, ChevronDown, ArrowUpRight, ArrowDownRight,
  IndianRupee, ReceiptText, Package, Users, Download, Menu,
  X, CircleCheck, Activity
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

const monthlySales = [
  { month: 'Dec', revenue: 821452 },
  { month: 'Jan', revenue: 689811 },
  { month: 'Feb', revenue: 522545 },
  { month: 'Mar', revenue: 716215 },
  { month: 'Apr', revenue: 536968 },
  { month: 'May', revenue: 769296 },
  { month: 'Jun', revenue: 760547 },
  { month: 'Jul', revenue: 718076 },
  { month: 'Aug', revenue: 757841 },
  { month: 'Sep', revenue: 1056435 },
  { month: 'Oct', revenue: 1151263 },
  { month: 'Nov', revenue: 1503866 },
]

const products = [
  { id: '22423', name: 'Regency Cakestand 3 Tier', revenue: 174156.54, quantity: 13851 },
  { id: '23843', name: 'Paper Craft, Little Birdie', revenue: 168469.60, quantity: 80995 },
  { id: '85123A', name: 'White Hanging Heart T-Light Holder', revenue: 104284.24, quantity: 37580 },
  { id: '47566', name: 'Party Bunting', revenue: 99445.23, quantity: 18283 },
  { id: '85099B', name: 'Jumbo Bag Red Retrospot', revenue: 94159.81, quantity: 48371 },
]

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Products', icon: ShoppingBag },
  { label: 'Sales Analytics', icon: ChartNoAxesCombined },
  { label: 'Recommendations', icon: Sparkles },
]

const money = value => '₹' + Number(value).toLocaleString('en-IN', {
  maximumFractionDigits: 0
})

function App() {
  const [page, setPage] = useState('Overview')
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filteredProducts = products.filter(product =>
    `${product.id} ${product.name}`.toLowerCase().includes(search.toLowerCase())
  )

  const metrics = [
    { label: 'Total Revenue', value: money(10642110.8), change: '12.8%', icon: IndianRupee, note: 'Gross sales recorded' },
    { label: 'Transactions', value: '19,960', change: '8.4%', icon: ReceiptText, note: 'Unique invoices' },
    { label: 'Unique Products', value: '3,922', change: '5.2%', icon: Package, note: 'Products in dataset' },
    { label: 'Customers', value: '4,338', change: '6.1%', icon: Users, note: 'Identified customers' },
  ]

  function exportProducts() {
    const rows = [
      ['Stock Code', 'Product', 'Revenue', 'Quantity'],
      ...filteredProducts.map(p => [p.id, p.name, p.revenue, p.quantity])
    ]
    const csv = rows.map(row =>
      row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')
    ).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'top-products.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
      {sidebarOpen && (
        <button aria-label="Close menu" onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <ChartNoAxesCombined size={23} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">CommerceIQ</h1>
              <p className="text-xs text-slate-400">Analytics platform</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-8">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon
              const active = page === item.label
              return (
                <button key={item.label} onClick={() => { setPage(item.label); setSidebarOpen(false) }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <Icon size={19} />
                  {item.label}
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600" />}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
              <Sparkles size={18} />
            </div>
            <p className="text-sm font-semibold text-slate-800">Smarter decisions</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Discover product patterns and sales trends in one place.</p>
            <button onClick={() => setPage('Recommendations')}
              className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-700">
              Explore recommendations <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">EA</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Project Workspace</p>
              <p className="text-xs text-slate-400">Capstone team</p>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={21} />
            </button>
            <div>
              <p className="text-xs text-slate-400">Workspace / Analytics</p>
              <h2 className="mt-1 text-lg font-bold">{page}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
              <Search size={16} className="text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
                className="w-36 bg-transparent text-sm outline-none placeholder:text-slate-400" />
              <kbd className="rounded border border-slate-200 bg-white px-1.5 text-[10px] text-slate-400">/</kbd>
            </div>
            <button aria-label="Notifications" className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>
            <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 sm:flex">E</div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
                <Activity size={13} /> DEMO DATA · API NOT CONNECTED
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {page === 'Overview' ? 'Good insights start here.' : page}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {page === 'Overview'
                  ? 'Your retail performance, at a glance.'
                  : `Explore your ${page.toLowerCase()} insights.`}
              </p>
            </div>
            <button onClick={exportProducts}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-slate-50">
              <Download size={16} /> Export products
            </button>
          </div>

          {page === 'Overview' && (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map(metric => {
                  const Icon = metric.icon
                  return (
                    <div key={metric.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30">
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Icon size={21} />
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                          <ArrowUpRight size={13} /> {metric.change}
                        </span>
                      </div>
                      <p className="mt-5 text-sm font-medium text-slate-500">{metric.label}</p>
                      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{metric.value}</p>
                      <p className="mt-2 text-xs text-slate-400">{metric.note}</p>
                    </div>
                  )
                })}
              </section>

              <section className="grid gap-6 xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-6 xl:col-span-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900">Revenue overview</h3>
                      <p className="mt-1 text-xs text-slate-400">Monthly gross revenue · sample project figures</p>
                    </div>
                    <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">Dec 2010 – Dec 2011</span>
                  </div>
                  <div className="mt-7 h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlySales} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.22} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#eef0f6" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }}
                          tickFormatter={value => `₹${(value / 100000).toFixed(0)}L`} width={45} />
                        <Tooltip formatter={value => [money(value), 'Revenue']}
                          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 8px 30px #0f172a10' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3}
                          fill="url(#revenueFill)" activeDot={{ r: 5, strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/30">
                  <h3 className="font-bold text-slate-900">Dataset snapshot</h3>
                  <p className="mt-1 text-xs text-slate-400">Retail transactions dataset</p>
                  <div className="mt-6 space-y-5">
                    {[
                      ['Transaction records', '524,878', 100],
                      ['Unique invoices', '19,960', 72],
                      ['Unique products', '3,922', 45],
                      ['Identified customers', '4,338', 49],
                    ].map(([label, value, width]) => (
                      <div key={label}>
                        <div className="mb-2 flex justify-between gap-2 text-sm">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-semibold text-slate-800">{value}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-7 rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CircleCheck size={16} className="text-emerald-500" /> Data pipeline prepared
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Figures shown are from the locally processed retail dataset; API integration is pending.</p>
                  </div>
                </div>
              </section>

              <ProductTable products={filteredProducts} onExport={exportProducts} />
            </>
          )}

          {page === 'Products' && (
            <ProductTable products={filteredProducts} onExport={exportProducts} />
          )}

          {page === 'Sales Analytics' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-bold">Monthly revenue</h3>
              <p className="mt-1 text-sm text-slate-500">Revenue values from the processed dataset.</p>
              <div className="mt-6 h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySales}>
                    <CartesianGrid stroke="#eef0f6" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={value => `₹${(value / 100000).toFixed(0)}L`} />
                    <Tooltip formatter={value => money(value)} />
                    <Area dataKey="revenue" stroke="#6366f1" fill="#c7d2fe" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {page === 'Recommendations' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Sparkles size={28} />
              </div>
              <h3 className="mt-5 text-xl font-bold">Product recommendation engine</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                This page will connect to the Python recommendation endpoint and show similar products based on the model's similarity scores.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                <Activity size={16} /> Waiting for backend API integration
              </div>
            </section>
          )}

          <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
            <span>CommerceIQ · E-commerce Analytics Capstone</span>
            <span>React · Vite · Tailwind CSS · Recharts</span>
          </footer>
        </main>
      </div>
    </div>
  )
}

function ProductTable({ products, onExport }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/30">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
        <div>
          <h3 className="font-bold text-slate-900">Top products</h3>
          <p className="mt-1 text-xs text-slate-400">Ranked by gross revenue · sample values</p>
        </div>
        <button onClick={onExport} className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">
          View export <ArrowUpRight size={15} className="inline" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] text-left text-sm">
          <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold">Product</th>
              <th className="px-6 py-4 font-semibold">Stock code</th>
              <th className="px-6 py-4 text-right font-semibold">Quantity</th>
              <th className="px-6 py-4 text-right font-semibold">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product, index) => (
              <tr key={product.id} className="transition hover:bg-slate-50/70">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-600">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <span className="font-medium text-slate-800">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{product.id}</td>
                <td className="px-6 py-4 text-right text-slate-600">{product.quantity.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-right font-semibold text-slate-800">{money(product.revenue)}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">No products match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-400">
        Showing {products.length} products · Demo preview
      </div>
    </section>
  )
}

export default App
