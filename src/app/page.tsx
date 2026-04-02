import HeroCanvas from '@/components/home/HeroCanvas'
import Navbar from '@/components/layout/Navbar'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroCanvas />
      
      {/* Additional sections for B2B info */}
      <section className="relative z-10 py-32 px-6 bg-[#121212]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-arabic gold-text-gradient">
              الجودة والتميز في كل قطرة
            </h2>
            <p className="text-lg text-white/60 leading-relaxed">
              نقدم لكم أجود أنواع العطور والزيوت العطرية بالجملة، مصممة خصيصاً لتلبية احتياجات سوقكم وتجاوز توقعات عملائكم.
            </p>
            <div className="flex gap-4">
              <button className="gold-gradient px-8 py-3 rounded-full text-black font-bold hover:scale-105 transition-transform">
                Explore Collection
              </button>
            </div>
          </div>
          <div className="glass-card aspect-square relative overflow-hidden group">
             {/* Placeholder for high-end product image or decorative element */}
             <div className="absolute inset-0 bg-gold/10 mix-blend-overlay group-hover:bg-gold/20 transition-colors" />
          </div>
        </div>
      </section>
    </main>
  )
}
