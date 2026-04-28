'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/lib/store/auth-store'
import { toast } from 'sonner'
import { Bell, Lock, User, Globe } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.fullName || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)
      // TODO: Update user profile via PostgreSQL-backed API
      console.log('Updating profile:', formData)
      toast.success('تم حفظ التغييرات بنجاح')
    } catch (error) {
      toast.error('فشل حفظ التغييرات')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Section size="lg">
        <Container size="md">
          <div className="space-y-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold mb-2">الإعدادات</h1>
              <p className="text-muted-foreground">
                إدارة حسابك والتفضيلات الخاصة بك
              </p>
            </motion.div>

            {/* Profile Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">معلومات الملف الشخصي</h2>
              </div>

              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      الاسم الكامل
                    </label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="أحمد محمد"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      البريد الإلكتروني
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      disabled={true}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      البريد الإلكتروني غير قابل للتعديل
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      رقم الهاتف
                    </label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+966 55 000 0000"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Security Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">الأمان</h2>
              </div>

              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">تغيير كلمة المرور</h3>
                      <p className="text-sm text-muted-foreground">
                        قم بتحديث كلمة المرور الخاصة بك بانتظام
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      تحديث
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">الإشعارات</h2>
              </div>

              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">إشعارات البريد الإلكتروني</h3>
                    <p className="text-sm text-muted-foreground">
                      تلقي تحديثات حول حسابك والميزات الجديدة
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>

                <div className="border-t border-border/40 pt-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">رسائل SMS</h3>
                    <p className="text-sm text-muted-foreground">
                      تلقي الرسائل النصية المهمة
                    </p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </div>
              </Card>
            </motion.div>

            {/* Language Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">اللغة والمنطقة</h2>
              </div>

              <Card className="p-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    اللغة المفضلة
                  </label>
                  <select className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground">
                    <option>العربية</option>
                    <option>English</option>
                  </select>
                </div>
              </Card>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="space-y-6 pt-8 border-t border-destructive/20"
            >
              <h2 className="text-2xl font-bold text-destructive">منطقة الخطر</h2>

              <Card className="p-6 border-destructive/20">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-destructive mb-2">
                      حذف الحساب
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      حذف حسابك بشكل دائم جنباً إلى جنب مع جميع البيانات المرتبطة به
                    </p>
                    <Button variant="destructive">
                      حذف الحساب
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
