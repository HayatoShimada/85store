import Link from "next/link";
import Image from "next/image";

interface HeroSectionProps {
  backgroundImage?: string;
  title?: string;
  subtitle?: string;
}

export default function HeroSection({ 
  backgroundImage = "/hero/HeroSample.jpg",
  subtitle = "Short-Term & Long-Term"
}: HeroSectionProps) {
  return (
    <section className="relative h-screen flex items-center justify-center -mt-16 overflow-hidden">
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}
      
      {!backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-background to-background-dark" />
      )}

      <div className="relative z-10 text-center text-white">
        <h1 className="md:text-2xl font-bold mb-4 tracking-wider">
          <span className={`font-futura ${backgroundImage ? "text-white" : "text-secondary"}`}>&ldquo;今好きなもの&rdquo;が&ldquo;ずっと好きなもの&rdquo;をつくる</span>
        </h1>
        <p className={`text-xl md:text-2xl mb-8 font-noto ${backgroundImage ? "text-white" : "text-charcoal"}`}>
          {subtitle}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="https://shop.85-store.com/" className="btn-primary">
            Online Shop
          </Link>
          <Link href="/blog" className={backgroundImage ? "btn-outline border-white text-white hover:bg-white hover:text-charcoal" : "btn-outline"}>
            Blog
          </Link>
        </div>
      </div>
    </section>
  );
}