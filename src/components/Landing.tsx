
export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md border-b border-indigo-100 shadow-sm">
        <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          MapViz
        </div>
        <div className="space-x-8 flex items-center">
          <button className="text-gray-600 hover:text-indigo-600 transition font-medium">Features</button>
          <button className="text-gray-600 hover:text-indigo-600 transition font-medium">About</button>
          <button className="text-gray-600 hover:text-indigo-600 transition font-medium">Contact</button>
          <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105">
            Access App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex items-center justify-center min-h-[calc(100vh-80px)] px-8 py-20">
        <div className="max-w-5xl text-center space-y-8">
          <h1 className="text-7xl font-bold leading-tight text-gray-900">
            Explore Oil & Gas Fields
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {' '}with Precision
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto font-medium">
            Interactive visualization of oil and gas field data from the Norwegian Petroleum Directorate. Explore geological boundaries, field information, and geographic locations with our intuitive, modern geospatial platform.
          </p>

          <div className="flex gap-5 justify-center pt-8 flex-wrap">
            <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:shadow-lg transition transform hover:scale-105 active:scale-95">
              Launch Explorer
            </button>
            <button className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold text-lg transition transform hover:scale-105">
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-8 py-16 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <p className="text-lg font-medium opacity-90">Oil & Gas Fields</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">Real-time</div>
              <p className="text-lg font-medium opacity-90">Live Data Updates</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <p className="text-lg font-medium opacity-90">Official Sources</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-6 text-gray-900">What You Can Do</h2>
          <p className="text-center text-gray-600 mb-16 text-lg">Comprehensive tools for exploring Norwegian oil and gas field data</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 hover:shadow-2xl transition hover:border-indigo-300">
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Interactive Maps</h3>
              <p className="text-gray-700 leading-relaxed">
                Explore multiple map views with integrated geospatial data from official Norwegian Petroleum Directorate sources in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-200 hover:shadow-2xl transition hover:border-purple-300">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Field Data</h3>
              <p className="text-gray-700 leading-relaxed">
                Access comprehensive oil and gas field information including boundaries, operators, discovery years, and current operational status.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-8 rounded-2xl border border-cyan-200 hover:shadow-2xl transition hover:border-blue-300">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Real-time Updates</h3>
              <p className="text-gray-700 leading-relaxed">
                Stay informed with live data from official APIs. Field information is always current, accurate, and continuously updated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Fields Section */}
      <section className="px-8 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-6 text-gray-900">Featured Oil Fields</h2>
          <p className="text-center text-gray-600 mb-16 text-lg">Start exploring major North Sea fields</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Johan Sverdrup */}
            <div className="bg-white p-8 rounded-2xl border-l-4 border-indigo-600 hover:shadow-2xl transition">
              <h3 className="text-3xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                <span className="text-3xl">🛢️</span> Johan Sverdrup
              </h3>
              <p className="text-gray-700 mb-5 leading-relaxed text-lg">
                One of the largest oil fields discovered on the Norwegian continental shelf in the North Sea.
              </p>
              <div className="space-y-3 text-gray-600 font-medium">
                <p><span className="text-indigo-600 font-bold">Operator:</span> Equinor</p>
                <p><span className="text-indigo-600 font-bold">Discovery Year:</span> 2010</p>
                <p><span className="text-indigo-600 font-bold">Status:</span> <span className="text-green-600 font-bold">Producing</span></p>
              </div>
            </div>

            {/* More Fields */}
            <div className="bg-white p-8 rounded-2xl border-l-4 border-blue-600 hover:shadow-2xl transition">
              <h3 className="text-3xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                <span className="text-3xl">🔍</span> Explore More
              </h3>
              <p className="text-gray-700 mb-5 leading-relaxed text-lg">
                Browse through our comprehensive database of Norwegian oil and gas fields with detailed geographic and operational data.
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105">
                Explore All Fields →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-20 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-bold">Ready to Explore?</h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Start visualizing oil and gas field data right now with our interactive mapping platform. Access official data from Norwegian Petroleum Directorate.
          </p>
          <button className="px-10 py-4 bg-white text-indigo-600 rounded-lg font-bold text-lg hover:shadow-2xl transition transform hover:scale-105 active:scale-95">
            Launch Application Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 bg-gray-900 text-gray-300">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-indigo-400 transition">Maps</button></li>
                <li><button className="hover:text-indigo-400 transition">Features</button></li>
                <li><button className="hover:text-indigo-400 transition">API</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Data Sources</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-indigo-400 transition">NPD</button></li>
                <li><button className="hover:text-indigo-400 transition">SODIR</button></li>
                <li><button className="hover:text-indigo-400 transition">OpenStreetMap</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-indigo-400 transition">Documentation</button></li>
                <li><button className="hover:text-indigo-400 transition">Blog</button></li>
                <li><button className="hover:text-indigo-400 transition">FAQ</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-indigo-400 transition">About</button></li>
                <li><button className="hover:text-indigo-400 transition">Contact</button></li>
                <li><button className="hover:text-indigo-400 transition">Privacy</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 MapViz. All rights reserved. | Data sourced from Norwegian Petroleum Directorate</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
