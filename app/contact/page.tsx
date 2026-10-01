"use client";

import { useState } from "react";
import Link from "next/link";
import IrregularHolidayNote from "@/components/IrregularHolidayNote";
import SectionHeading from "@/components/SectionHeading";
import StoreActions from "@/components/StoreActions";
import { STORE, STORE_FULL_ADDRESS } from "@/lib/store-info";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || '送信に失敗しました');
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('送信に失敗しました。しばらく時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };
  const fieldClass = "w-full border border-ink-2 bg-bg px-4 py-3 text-base placeholder:text-muted focus:outline-2 focus:outline-offset-2 focus:outline-ink";
  const labelClass = "mb-2 block text-sm font-semibold";
  const required = <span className="ml-1 text-xs font-normal text-muted">（必須）</span>;

  return (
    <div className="wrap pt-12">
      <SectionHeading as="h1" title="Contact" description="お問い合わせ" />
      <p className="max-w-[40em] text-ink-2">お問い合わせやご質問がございましたら、お気軽にご連絡ください。</p>

      <div className="mt-12 grid-lines grid-cols-12">
        {/* 店舗情報 */}
        <div className="col-span-5 grid content-start gap-8 p-[clamp(20px,3vw,40px)] max-[900px]:col-span-12">
          {[
            { title: "1F 85-Store", address: `${STORE_FULL_ADDRESS}`, extra: STORE.hours.note },
            { title: "2F 85-UpStore", address: `${STORE_FULL_ADDRESS} 2階` },
          ].map((floor) => (
            <div key={floor.title}>
              <h2 className="mb-3 font-display text-xl font-bold">{floor.title}</h2>
              <dl className="facts">
                <div><dt>住所</dt><dd>{floor.address}</dd></div>
                <div>
                  <dt>営業時間</dt>
                  <dd>
                    <span className="num">{STORE.hours.label}</span>（{STORE.hours.closedLabel}）
                    <IrregularHolidayNote className="text-muted" />
                    {floor.extra && (
                      <span className="block text-sm text-muted">
                        {floor.extra}
                        <Link href="/reserve" className="ml-1 underline underline-offset-4">事前予約はこちら</Link>
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
          <StoreActions showOnlineStore={false} />
        </div>

        {/* お問い合わせフォーム */}
        <div className="col-span-7 p-[clamp(20px,3vw,40px)] max-[900px]:col-span-12">
          <h2 className="mb-6 font-display text-xl font-bold">Form<span className="ml-2 font-sans text-sm font-normal text-muted">お問い合わせフォーム</span></h2>

          <div aria-live="polite">
            {submitStatus === 'success' && (
              <div className="mb-6 border border-accent-2 bg-accent-2 p-4 text-on-accent-2">
                <p className="font-semibold">送信しました</p>
                <p className="text-sm">お問い合わせを受け付けました。ありがとうございます。</p>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="mb-6 border border-ink p-4">
                <p className="font-semibold">送信できませんでした</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6">
            <div>
              <label htmlFor="name" className={labelClass}>お名前{required}</label>
              <input type="text" id="name" name="name" autoComplete="name" value={formData.name} onChange={handleInputChange} required className={fieldClass} placeholder="山田 太郎" />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>メールアドレス{required}</label>
              <input type="email" id="email" name="email" autoComplete="email" value={formData.email} onChange={handleInputChange} required className={fieldClass} placeholder="example@email.com" />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>電話番号</label>
              <input type="tel" id="phone" name="phone" autoComplete="tel" value={formData.phone} onChange={handleInputChange} className={fieldClass} placeholder="090-1234-5678" />
            </div>
            <div>
              <label htmlFor="subject" className={labelClass}>件名{required}</label>
              <select id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required className={fieldClass}>
                <option value="">選択してください</option>
                <option value="product">商品について</option>
                <option value="order">ご注文について</option>
                <option value="store">店舗について</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className={labelClass}>メッセージ{required}</label>
              <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={6} required className={`${fieldClass} resize-y`} placeholder="お問い合わせ内容をご記入ください" />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full disabled:opacity-60">
              {isSubmitting ? '送信中…' : '送信する'}
            </button>
          </form>
        </div>
      </div>

      <section className="section" aria-labelledby="access-heading">
        <SectionHeading id="access-heading" title="Access" description={STORE_FULL_ADDRESS} />
        <div className="aspect-[4/3] max-h-[480px] w-full bg-surface md:aspect-[16/9]">
          <iframe
            src={STORE.mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="85-Store の地図"
          />
        </div>
      </section>
    </div>
  );
}
