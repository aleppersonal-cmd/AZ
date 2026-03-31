import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { Menu, X, ChevronDown, Phone, Mail } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../components/ui/navigation-menu';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';

const Header = () => {
  const { settings, services } = useSite();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const profileSubpages = [
    { title: 'Chi Siamo', href: '/profilo/chi-siamo' },
    { title: 'AZ Ricerca e Sviluppo', href: '/profilo/az-ricerca-sviluppo' },
    { title: 'AZ per il Sociale', href: '/profilo/az-per-il-sociale' },
    { title: 'AZ per la Qualità', href: '/profilo/az-per-la-qualita' },
    { title: 'AZ Formazione', href: '/profilo/az-formazione' },
    { title: 'Lavora con Noi', href: '/profilo/lavora-con-noi' },
  ];

  const onlineServiceLinks = [
    { title: 'Portale degli Enti', href: '/servizi-online/portale-enti' },
    { title: 'Portale dei Contribuenti', href: '/servizi-online/portale-contribuenti' },
    { title: 'Portale Pagamento Imposte', href: '/servizi-online/portale-pagamenti' },
    { title: 'Portale Operatori AZ', href: '/servizi-online/portale-operatori' },
  ];

  return (
    <header className="az-header fixed top-0 left-0 right-0 z-50" data-testid="main-header">
      {/* Top bar */}
      <div className="bg-slate-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href={`tel:${settings?.phone || '0921 600348'}`} className="flex items-center gap-2 hover:text-[#1E88E5] transition-colors">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{settings?.phone || '0921 600348'}</span>
            </a>
            <a href={`mailto:${settings?.email || 'info@azriscossione.it'}`} className="flex items-center gap-2 hover:text-[#1E88E5] transition-colors">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">{settings?.email || 'info@azriscossione.it'}</span>
            </a>
          </div>
          <Link to="/admin" className="hover:text-[#1E88E5] transition-colors" data-testid="admin-link">
            Area Riservata
          </Link>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="AZ Riscossione" className="h-12" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#1E88E5] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl font-['Outfit']">AZ</span>
                </div>
                <div className="hidden sm:block">
                  <span className="font-['Outfit'] font-semibold text-slate-900 text-lg">AZ Riscossione</span>
                  <span className="block text-xs text-slate-500">Tributi Locali S.r.l.</span>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <Link to="/">
                    <NavigationMenuLink className={`px-4 py-2 text-sm font-medium transition-colors hover:text-[#1E88E5] ${isActive('/') ? 'text-[#1E88E5]' : 'text-slate-700'}`}>
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium text-slate-700 hover:text-[#1E88E5]">
                    Profilo
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-1 p-3">
                      {profileSubpages.map((item) => (
                        <li key={item.href}>
                          <Link to={item.href}>
                            <NavigationMenuLink className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#1E88E5] rounded-md transition-colors">
                              {item.title}
                            </NavigationMenuLink>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium text-slate-700 hover:text-[#1E88E5]">
                    Servizi AZ
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-3 md:grid-cols-2">
                      {services.map((service) => (
                        <li key={service.slug}>
                          <Link to={`/servizi/${service.slug}`}>
                            <NavigationMenuLink className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#1E88E5] rounded-md transition-colors">
                              {service.name}
                            </NavigationMenuLink>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium text-slate-700 hover:text-[#1E88E5]">
                    Servizi Online
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-1 p-3">
                      {onlineServiceLinks.map((item) => (
                        <li key={item.href}>
                          <Link to={item.href}>
                            <NavigationMenuLink className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#1E88E5] rounded-md transition-colors">
                              {item.title}
                            </NavigationMenuLink>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/clienti">
                    <NavigationMenuLink className={`px-4 py-2 text-sm font-medium transition-colors hover:text-[#1E88E5] ${isActive('/clienti') ? 'text-[#1E88E5]' : 'text-slate-700'}`}>
                      Clienti AZ
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/contatti">
                    <NavigationMenuLink className={`px-4 py-2 text-sm font-medium transition-colors hover:text-[#1E88E5] ${isActive('/contatti') ? 'text-[#1E88E5]' : 'text-slate-700'}`}>
                      Contatti
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="mobile-menu-btn">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#1E88E5] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold font-['Outfit']">AZ</span>
                      </div>
                      <span className="font-['Outfit'] font-semibold text-slate-900">Menu</span>
                    </div>
                  </div>
                  <nav className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-slate-700 hover:text-[#1E88E5]">
                        Home
                      </Link>
                      
                      <div>
                        <span className="block py-2 font-medium text-slate-900">Profilo</span>
                        <div className="pl-4 space-y-2">
                          {profileSubpages.map((item) => (
                            <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)} className="block py-1 text-sm text-slate-600 hover:text-[#1E88E5]">
                              {item.title}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="block py-2 font-medium text-slate-900">Servizi AZ</span>
                        <div className="pl-4 space-y-2">
                          {services.map((service) => (
                            <Link key={service.slug} to={`/servizi/${service.slug}`} onClick={() => setMobileOpen(false)} className="block py-1 text-sm text-slate-600 hover:text-[#1E88E5]">
                              {service.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="block py-2 font-medium text-slate-900">Servizi Online</span>
                        <div className="pl-4 space-y-2">
                          {onlineServiceLinks.map((item) => (
                            <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)} className="block py-1 text-sm text-slate-600 hover:text-[#1E88E5]">
                              {item.title}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <Link to="/clienti" onClick={() => setMobileOpen(false)} className="block py-2 text-slate-700 hover:text-[#1E88E5]">
                        Clienti AZ
                      </Link>

                      <Link to="/contatti" onClick={() => setMobileOpen(false)} className="block py-2 text-slate-700 hover:text-[#1E88E5]">
                        Contatti
                      </Link>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
