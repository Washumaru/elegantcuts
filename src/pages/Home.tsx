import { useEffect, useState } from 'react';
import { Scissors, Calendar, Users, MapPin, Star, ArrowRight, Clock, Phone } from 'lucide-react';
import { shopService } from '../services/shopService';
import { Shop } from '../types/shop';
import ShopCard from '../components/shop/ShopCard';

export default function Home() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([]);

  useEffect(() => {
    const allShops = shopService.getShops();
    const activeShops = allShops.filter(shop => shop.isActive);
    setShops(activeShops);
    // Seleccionar 3 locales destacados aleatoriamente
    const randomShops = [...activeShops]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    setFeaturedShops(randomShops);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section con Parallax */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-primary-800">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
        </div>
        <div className="relative text-center text-white px-4 max-w-4xl mx-auto">
          <div className="animate-fade-in-up">
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 p-6 rounded-full backdrop-blur-sm">
                <Scissors className="w-20 h-20 text-white" />
              </div>
            </div>
            <h1 className="font-serif text-6xl mb-6">
              Elegant Cuts
            </h1>
            <p className="text-xl text-primary-100 mb-8 leading-relaxed">
              Descubre la excelencia en el cuidado personal. Reserva citas con los mejores barberos y estilistas de tu zona.
            </p>
            <a href="#featured" className="btn bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm inline-flex items-center space-x-2 py-3 px-6 text-lg">
              <span>Explorar Barberías</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="bg-white rounded-2xl shadow-soft-xl p-8 transform group-hover:scale-105 transition-all duration-300">
                <Calendar className="w-12 h-12 text-primary-600 mx-auto mb-6" />
                <h3 className="font-serif text-2xl mb-4">Reservas Sencillas</h3>
                <p className="text-primary-600">
                  Agenda tus citas en segundos con nuestro sistema intuitivo de reservas
                </p>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white rounded-2xl shadow-soft-xl p-8 transform group-hover:scale-105 transition-all duration-300">
                <Users className="w-12 h-12 text-primary-600 mx-auto mb-6" />
                <h3 className="font-serif text-2xl mb-4">Barberos Expertos</h3>
                <p className="text-primary-600">
                  Conecta con profesionales verificados y altamente calificados
                </p>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white rounded-2xl shadow-soft-xl p-8 transform group-hover:scale-105 transition-all duration-300">
                <Star className="w-12 h-12 text-primary-600 mx-auto mb-6" />
                <h3 className="font-serif text-2xl mb-4">Servicio Premium</h3>
                <p className="text-primary-600">
                  Disfruta de una experiencia de barbería de primera clase
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Shops Section */}
      <section id="featured" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl mb-4">Barberías Destacadas</h2>
            <p className="text-primary-600 max-w-2xl mx-auto">
              Descubre nuestras barberías más populares y experimenta un servicio excepcional
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredShops.map((shop) => (
              <div key={shop.id} className="transform hover:scale-105 transition-all duration-300">
                <ShopCard shop={shop} showAppointmentForm />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Shops Section */}
      <section className="py-24 bg-gradient-to-b from-white to-primary-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl mb-4">Todas las Barberías</h2>
            <p className="text-primary-600 max-w-2xl mx-auto">
              Explora nuestra completa selección de barberías y encuentra la perfecta para ti
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {shops.map((shop) => (
              <div key={shop.id} className="transform hover:scale-105 transition-all duration-300">
                <ShopCard shop={shop} showAppointmentForm />
              </div>
            ))}
            {shops.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <MapPin className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <p className="text-primary-600 text-lg">
                  No hay barberías disponibles en este momento
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-900 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="font-serif text-4xl mb-6">¿Eres un Barbero Profesional?</h2>
            <p className="text-xl text-primary-100 mb-8">
              Únete a nuestra red de barberos profesionales y lleva tu negocio al siguiente nivel
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <Users className="w-10 h-10 text-white mx-auto mb-4" />
                <h3 className="text-xl mb-2">Amplía tu Clientela</h3>
                <p className="text-primary-100">Accede a nuevos clientes y haz crecer tu negocio</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <Calendar className="w-10 h-10 text-white mx-auto mb-4" />
                <h3 className="text-xl mb-2">Gestión Eficiente</h3>
                <p className="text-primary-100">Administra tus citas de manera profesional</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <Star className="w-10 h-10 text-white mx-auto mb-4" />
                <h3 className="text-xl mb-2">Destaca tu Talento</h3>
                <p className="text-primary-100">Muestra tu trabajo y construye tu reputación</p>
              </div>
            </div>
            <a href="/register" className="btn bg-white text-primary-900 hover:bg-primary-50 inline-flex items-center space-x-2 py-3 px-8 text-lg">
              <span>Registrarme como Barbero</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}