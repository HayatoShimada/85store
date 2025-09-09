import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    // バリデーション
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      );
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '正しいメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    // メール送信設定
    // 実際の使用時は環境変数で設定してください
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 管理者宛メール
    const adminMailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || 'admin@85store.com',
      subject: `【85-Store】お問い合わせ: ${subject}`,
      html: `
        <h2>お問い合わせが届きました</h2>
        <p><strong>お名前:</strong> ${name}</p>
        <p><strong>メールアドレス:</strong> ${email}</p>
        <p><strong>電話番号:</strong> ${phone || '未入力'}</p>
        <p><strong>件名:</strong> ${subject}</p>
        <p><strong>メッセージ:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>送信日時: ${new Date().toLocaleString('ja-JP')}</small></p>
      `,
    };

    // お客様宛自動返信メール
    const customerMailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: '【85-Store】お問い合わせありがとうございます',
      html: `
        <h2>お問い合わせありがとうございます</h2>
        <p>${name} 様</p>
        <p>この度は、85-Storeにお問い合わせいただき、誠にありがとうございます。</p>
        <p>以下の内容でお問い合わせを承りました。</p>
        <hr>
        <p><strong>件名:</strong> ${subject}</p>
        <p><strong>メッセージ:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>内容を確認の上、2営業日以内にご返信いたします。</p>
        <p>お急ぎの場合は、お電話にてお問い合わせください。</p>
        <br>
        <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        <p><strong>85-Store</strong></p>
        <p>〒932-0217 富山県南砺市本町４丁目１００</p>
        <p>営業時間: 平日 10:00-19:00 / 土日祝 10:00-18:00</p>
        <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
      `,
    };

    // メール送信
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(customerMailOptions);

    return NextResponse.json(
      { message: 'お問い合わせを受け付けました。ありがとうございます。' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: '送信に失敗しました。しばらく時間をおいて再度お試しください。' },
      { status: 500 }
    );
  }
}
