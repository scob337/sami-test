import { Footer } from '@/components/layout/footer'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية - Sami-Test',
  description: 'سياسة الخصوصية والحماية الخاصة بنا',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Section size="lg">
        <Container size="sm">
          <div className="prose prose-invert max-w-none space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">سياسة الخصوصية</h1>
              <p className="text-muted-foreground">
                آخر تحديث: 11 مارس 2024
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">مقدمة</h2>
                <p className="text-muted-foreground leading-relaxed">
                  نحن نقدر خصوصيتك ونلتزم بحماية بيانات شخصية. تشرح هذه السياسة كيفية
                  جمعنا واستخدامنا وحمايتنا لبيانات المستخدمين.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">البيانات التي نجمعها</h2>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                  <li>البريد الإلكتروني ورقم الهاتف</li>
                  <li>إجاباتك على أسئلة الاختبار</li>
                  <li>معلومات الملف الشخصي</li>
                  <li>معلومات استخدام الموقع</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">استخدام البيانات</h2>
                <p className="text-muted-foreground leading-relaxed">
                  نستخدم بيانات المستخدم لـ:
                </p>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside mt-4">
                  <li>تقديم الخدمات والميزات</li>
                  <li>تحسين تجربة المستخدم</li>
                  <li>الاتصال الضروري والدعم</li>
                  <li>الامتثال للمتطلبات القانونية</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">حماية البيانات</h2>
                <p className="text-muted-foreground leading-relaxed">
                  نستخدم التشفير والتدابير الأمنية الأخرى لحماية بيانات المستخدم من
                  الوصول غير المصرح به أو التعديل أو الحذف.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">حقوقك</h2>
                <p className="text-muted-foreground leading-relaxed">
                  لديك الحق في الوصول إلى بيانات شخصية وتصحيحها وحذفها. للقيام بذلك،
                  يرجى الاتصال بنا على support@Sami-Test.app
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">التغييرات على هذه السياسة</h2>
                <p className="text-muted-foreground leading-relaxed">
                  قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم إشعار المستخدمين بأي
                  تغييرات جوهرية عن طريق البريد الإلكتروني.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
      <Footer />
    </main>
  )
}
