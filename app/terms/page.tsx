import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الشروط والأحكام - 7Types',
  description: 'الشروط والأحكام الخاصة بنا',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Section size="lg">
        <Container size="sm">
          <div className="prose prose-invert max-w-none space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">الشروط والأحكام</h1>
              <p className="text-muted-foreground">
                آخر تحديث: 11 مارس 2024
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">1. قبول الشروط</h2>
                <p className="text-muted-foreground leading-relaxed">
                  باستخدام موقع 7Types، فإنك توافق على الالتزام بهذه الشروط والأحكام.
                  إذا كنت لا توافق على أي جزء من هذه الشروط، فيرجى عدم استخدام الموقع.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">2. الاستخدام الصحيح</h2>
                <p className="text-muted-foreground leading-relaxed">
                  أنت توافق على استخدام الموقع وفقاً للقوانين المعمول بها وعدم:
                </p>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside mt-4">
                  <li>نشر محتوى غير قانوني أو مسيء</li>
                  <li>محاولة اختراق أمان الموقع</li>
                  <li>التدخل في عمل الموقع</li>
                  <li>انتهاك حقوق الآخرين</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">3. الخدمات</h2>
                <p className="text-muted-foreground leading-relaxed">
                  نوفر خدمات اختبار الشخصية والموارد المرتبطة بها. قد نقوم بتعديل أو
                  إيقاف الخدمات في أي وقت دون إخطار مسبق.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">4. حدود المسؤولية</h2>
                <p className="text-muted-foreground leading-relaxed">
                  لا نتحمل مسؤولية عن أي أضرار مباشرة أو غير مباشرة ناشئة عن استخدام
                  الموقع أو الخدمات، بما في ذلك فقدان البيانات أو الخسائر المالية.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">5. الملكية الفكرية</h2>
                <p className="text-muted-foreground leading-relaxed">
                  جميع المحتوى والميزات والخدمات الموجودة على الموقع محمية بحقوق الملكية
                  الفكرية. لا يُسمح بإعادة إنتاجها أو توزيعها بدون إذن.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">6. التعديلات</h2>
                <p className="text-muted-foreground leading-relaxed">
                  قد نقوم بتعديل هذه الشروط والأحكام في أي وقت. سيتم إشعار المستخدمين
                  بأي تغييرات جوهرية عن طريق البريد الإلكتروني.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">7. القانون الواجب التطبيق</h2>
                <p className="text-muted-foreground leading-relaxed">
                  تخضع هذه الشروط والأحكام للقوانين السعودية، وتختص المحاكم السعودية
                  بالنظر في أي نزاع ينشأ عنها.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">8. التواصل</h2>
                <p className="text-muted-foreground leading-relaxed">
                  إذا كان لديك أي أسئلة حول هذه الشروط، يرجى الاتصال بنا على support@7types.app
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
