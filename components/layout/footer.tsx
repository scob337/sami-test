'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Zap } from 'lucide-react'
import { Button } from '../ui/button'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-background pt-32 pb-12 overflow-hidden border-t border-border/50">
      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-2xl shadow-2xl shadow-primary/20 transition-transform group-hover:rotate-6">
                M
              </div>
              <span className="text-3xl font-black tracking-tighter text-foreground transition-colors group-hover:text-primary">MindMatch</span>
            </Link>
            <p className="text-muted-foreground text-lg leading-relaxed font-bold opacity-80">
              المنصة الأذكى عالمياً لتحليل الشخصية وتقديم رؤى مستقبلية تعتمد على أحدث المناهج العلمية وعلوم النفس الحديثة بأسلوب عصري.
            </p>
            <div className="flex gap-4">
              <button className="w-12 h-12 rounded-2xl bg-secondary/50 border border-border/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 group">
                <Mail className="w-5 h-5 opacity-70 group-hover:opacity-100" />
              </button>
              <button className="w-12 h-12 rounded-2xl bg-secondary/50 border border-border/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 group">
                <Phone className="w-5 h-5 opacity-70 group-hover:opacity-100" />
              </button>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-xl font-black text-foreground tracking-tight">المنصة</h4>
            <ul className="space-y-4">
              {[
                { name: 'الرئيسية', href: '/' },
                { name: 'الاختبارات', href: '/test-library' },
                { name: 'المميزات', href: '#features' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary font-bold transition-colors flex items-center gap-3 group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary group-hover:scale-150 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-xl font-black text-foreground tracking-tight">الدعم</h4>
            <ul className="space-y-4">
              {[
                { name: 'الخصوصية', href: '/privacy' },
                { name: 'الشروط', href: '/terms' },
                { name: 'تواصل معنا', href: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary font-bold transition-colors flex items-center gap-3 group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary group-hover:scale-150 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4 space-y-8">
            <h4 className="text-xl font-black text-foreground tracking-tight">اشترك في نشرتنا</h4>
            <p className="text-muted-foreground font-bold opacity-80">احصل على أحدث المقالات والنصائح لتطوير شخصيتك أسبوعياً.</p>
            <div className="flex flex-col gap-3">
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="بريدك الإلكتروني" 
                  className="w-full h-14 px-6 rounded-2xl bg-secondary/50 border-2 border-border/50 focus:border-primary/50 focus:outline-none transition-all font-bold pr-12"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Button className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-xl shadow-primary/20 transition-all active:scale-95">
                اشترك الآن
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-muted-foreground font-bold text-sm">
              © {currentYear} MindMatch. جميع الحقوق محفوظة.
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
