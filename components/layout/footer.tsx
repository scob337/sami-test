'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Zap } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-border bg-background pt-20 pb-10 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-30" />
      
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20">
                M
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground transition-colors">MindMatch</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              المنصة الأذكى عالمياً لتحليل الشخصية وتقديم رؤى مستقبلية تعتمد على أحدث المناهج العلمية وعلوم النفس الحديثة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-foreground mb-6">الروابط السريعة</h4>
            <ul className="space-y-4">
              {[
                { name: 'الرئيسية', href: '/' },
                { name: 'ابدأ الاختبار', href: '/test' },
                { name: 'حول الخدمة', href: '#about' },
                { name: 'المدونة', href: '/blog' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-all flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-foreground mb-6">قانوني</h4>
            <ul className="space-y-4">
              {[
                { name: 'سياسة الخصوصية', href: '/privacy' },
                { name: 'الشروط والأحكام', href: '/terms' },
                { name: 'سياسة ملفات الارتباط', href: '/cookies' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-all flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-foreground mb-6">ابقَ على اتصال</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all border border-border">
                  <Mail className="w-4 h-4" />
                </div>
                <span>support@mindmatch.app</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all border border-border">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+966 50 000 0000</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground font-medium">
            © {currentYear} MindMatch. جميع الحقوق محفوظة لمحبي الابتكار.
          </p>
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer">
                <Zap className="w-4 h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
