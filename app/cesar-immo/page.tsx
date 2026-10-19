import Link from "next/link";
import { ArrowLeft, Building2, CheckCircle2, ChevronLeft, House, MapPin, MessageCircle, Phone, Ruler, ShieldCheck, Trees } from "lucide-react";

const listings = [
  {
    type: "شقة للبيع",
    title: "شقة F4 مجددة بالكامل",
    location: "حي 200 مسكن، شرشال",
    area: "80 م²",
    price: "السعر عند الاتصال",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
    tag: "فرصة مميزة",
  },
  {
    type: "أرض سكنية",
    title: "قطعة أرض للبناء",
    location: "Garami، شرشال",
    area: "420 م²",
    price: "السعر عند الاتصال",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85",
    tag: "عقد ملكية متوفر",
  },
  {
    type: "عقار تجاري",
    title: "قطعة أرض بموقع استراتيجي",
    location: "القليعة، تيبازة",
    area: "750 م²",
    price: "السعر عند الاتصال",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
    tag: "موقع تجاري",
  },
];

const phone = "213770131394";
const whatsapp = "https://wa.me/" + phone + "?text=" + encodeURIComponent("السلام عليكم، أريد الاستفسار عن عقارات CESAR IMMO.");

export default function CesarImmoDemoPage() {
  return (
    <main dir="rtl" className="min-h-screen overflow-hidden bg-[#f7f6f2] text-[#172033]">
      <div className="bg-[#111b2e] px-4 py-2 text-center text-xs font-medium text-white/80 sm:text-sm">
        CESAR IMMO — شريككم في اختيار العقار المناسب
      </div>
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/cesar-immo" className="flex items-center gap-3" aria-label="CESAR IMMO الرئيسية">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#11213b] text-[#e7b94e] shadow-lg"><Building2 size={27} /></span>
            <span><span className="block text-xl font-black tracking-wide text-[#12213a]">CESAR IMMO</span><span className="block text-[11px] font-semibold text-slate-500">وكالة عقارية معتمدة</span></span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-bold text-slate-600 md:flex">
            <a href="#properties" className="transition hover:text-amber-600">العقارات</a>
            <a href="#services" className="transition hover:text-amber-600">خدماتنا</a>
            <a href="#about" className="transition hover:text-amber-600">لماذا نحن؟</a>
            <a href="#contact" className="transition hover:text-amber-600">اتصل بنا</a>
          </nav>
          <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#d9a938] px-4 py-2.5 text-sm font-extrabold text-[#172033] shadow-sm transition hover:bg-[#edc35b] sm:px-5">
            <MessageCircle size={17} /><span className="hidden sm:inline">تحدث معنا</span><span className="sm:hidden">اتصال</span>
          </a>
        </div>
      </header>

      <section className="relative isolate">
        <div className="absolute inset-0 -z-20 bg-[#111b2e]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-l from-[#111b2e]/95 via-[#111b2e]/75 to-[#111b2e]/25" />
        <div className="absolute inset-0 -z-10 opacity-35" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85)", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="mx-auto grid min-h-[570px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e7b94e]/40 bg-white/10 px-4 py-2 text-sm font-bold text-[#f1cb6b] backdrop-blur"><ShieldCheck size={17} /> ثقة، وضوح، ومرافقة حتى إتمام المعاملة</div>
            <h1 className="text-4xl font-black leading-[1.25] tracking-tight sm:text-5xl lg:text-6xl">عقارك القادم يبدأ <span className="text-[#e7b94e]">من هنا.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">نساعدك في العثور على الشقة المناسبة، الأرض التي تحلم بها، أو الموقع التجاري الذي يخدم مشروعك — بخطوات واضحة ومرافقة شخصية.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#properties" className="inline-flex items-center gap-2 rounded-full bg-[#e7b94e] px-6 py-3.5 font-extrabold text-[#172033] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f4ce70]">اكتشف العقارات <ChevronLeft size={18} /></a>
              <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/20"><MessageCircle size={18} /> استشارة مجانية</a>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6">
              <div><p className="text-2xl font-black text-[#e7b94e]">بيع</p><p className="mt-1 text-xs text-white/70 sm:text-sm">شراء العقارات</p></div>
              <div><p className="text-2xl font-black text-[#e7b94e]">أراضٍ</p><p className="mt-1 text-xs text-white/70 sm:text-sm">سكنية وتجارية</p></div>
              <div><p className="text-2xl font-black text-[#e7b94e]">مرافقة</p><p className="mt-1 text-xs text-white/70 sm:text-sm">من أول اتصال</p></div>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2rem] border border-[#e7b94e]/35" />
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/20 bg-white p-3 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85" alt="واجهة منزل عصري" className="h-[320px] w-full rounded-[1.2rem] object-cover sm:h-[390px]" />
              <div className="flex items-center justify-between gap-3 px-3 py-4">
                <div><p className="font-black">اختيارك العقاري بثقة</p><p className="mt-1 text-sm text-slate-500">نبحث معك عن أفضل الخيارات المتاحة</p></div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f8edcf] text-[#8b6818]"><House size={24} /></span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl sm:-left-8"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 size={22} /></span><span><b className="block text-sm">مرافقة واضحة</b><small className="text-slate-500">معلومات قبل اتخاذ القرار</small></span></div>
          </div>
        </div>
      </section>

      <section id="properties" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-sm font-extrabold tracking-widest text-[#ad8120]">اختياراتنا لكم</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">اكتشف العقارات المميزة</h2><p className="mt-3 max-w-xl leading-7 text-slate-500">مجموعة مختارة من أنواع العقارات التي تبحث عنها، مع إمكانية طلب التفاصيل وتحديد موعد للمعاينة.</p></div>
          <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 font-extrabold text-[#8c681b] hover:text-[#bd8e25]">اطلب عقارًا يناسبك <ArrowLeft size={18} /></a>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => <article key={item.title} className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(20,30,50,.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(20,30,50,.12)]">
            <div className="relative overflow-hidden"><img src={item.image} alt={item.title} className="h-60 w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute right-4 top-4 rounded-full bg-[#11213b] px-3 py-1.5 text-xs font-extrabold text-white">{item.tag}</span><span className="absolute bottom-4 right-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-slate-800">{item.type}</span></div>
            <div className="p-5"><h3 className="text-xl font-black">{item.title}</h3><p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><MapPin size={16} className="text-[#b58a29]" />{item.location}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="flex items-center gap-2 text-sm font-bold text-slate-600"><Ruler size={17} />{item.area}</span><span className="text-sm font-extrabold text-[#9a741e]">{item.price}</span></div><a href={whatsapp} target="_blank" rel="noreferrer" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#11213b] px-4 py-3 font-bold text-white transition hover:bg-[#1d3459]">اطلب التفاصيل <ArrowLeft size={17} /></a></div>
          </article>)}
        </div>
        <p className="mt-5 text-center text-xs text-slate-400">معروضات توضيحية للنسخة التجريبية؛ يتم تأكيد التوفر والأسعار مباشرة مع الوكالة.</p>
      </section>

      <section id="services" className="scroll-mt-24 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-extrabold tracking-widest text-[#ad8120]">خدماتنا</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">كل ما تحتاجه في مكان واحد</h2><p className="mt-4 leading-7 text-slate-500">نرافقك في كل خطوة لتختار العقار المناسب بوضوح وراحة بال.</p></div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[{icon:House,title:"بيع وشراء العقارات",desc:"شقق، منازل، وفيلات حسب احتياجاتك."},{icon:Trees,title:"الأراضي",desc:"قطع أرض سكنية وتجارية لمشاريعك."},{icon:Building2,title:"العقارات التجارية",desc:"محلات ومساحات لمختلف الأنشطة."},{icon:ShieldCheck,title:"مرافقة في المعاملة",desc:"توضيح الوثائق والخطوات قبل الالتزام."}].map((s)=><div key={s.title} className="rounded-3xl border border-slate-100 bg-[#fbfaf7] p-6 transition hover:border-[#e7b94e]/60 hover:shadow-lg"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6e9c5] text-[#8b6818]"><s.icon size={26}/></span><h3 className="mt-5 text-lg font-black">{s.title}</h3><p className="mt-2 text-sm leading-7 text-slate-500">{s.desc}</p></div>)}
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-24 mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 lg:px-8">
        <div className="overflow-hidden rounded-[2rem]"><img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85" alt="مساحة معيشة بتصميم عصري" className="h-[360px] w-full object-cover sm:h-[450px]" /></div>
        <div><p className="text-sm font-extrabold tracking-widest text-[#ad8120]">لماذا CESAR IMMO؟</p><h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">قرار عقاري مهم، يستحق مرافقة جادة.</h2><p className="mt-5 leading-8 text-slate-600">نعرف أن شراء العقار أو بيعه خطوة كبيرة. لذلك نركز على توضيح المعلومات، فهم احتياجاتك، ومساعدتك على الانتقال من البحث إلى المعاينة واتخاذ القرار.</p><ul className="mt-7 space-y-4">{["تواصل مباشر للإجابة عن استفساراتك","تفاصيل واضحة حول العقار قبل المعاينة","تنسيق مواعيد الزيارة حسب الاتفاق","اهتمام بالعقارات السكنية والتجارية"].map((x)=><li key={x} className="flex items-start gap-3 font-bold text-slate-700"><CheckCircle2 size={21} className="mt-0.5 shrink-0 text-emerald-600"/>{x}</li>)}</ul><a href={whatsapp} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#11213b] px-6 py-3.5 font-extrabold text-white transition hover:bg-[#1d3459]">تواصل مع الوكالة <ArrowLeft size={18}/></a></div>
      </section>

      <section id="contact" className="scroll-mt-24 bg-[#111b2e] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div><p className="text-sm font-extrabold tracking-widest text-[#e7b94e]">هل وجدت ما تبحث عنه؟</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">خلينا نلقاو العقار المناسب ليك.</h2><p className="mt-4 max-w-xl leading-7 text-white/65">تواصل معنا للاستفسار عن المعروضات أو لتخبرنا بالمواصفات التي تبحث عنها.</p></div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"><a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e7b94e] px-6 py-4 font-black text-[#172033] hover:bg-[#f4ce70]"><MessageCircle size={19}/> WhatsApp</a><a href="tel:0770131394" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-4 font-bold text-white hover:bg-white/10"><Phone size={18}/> 0770 13 13 94</a></div>
        </div>
        <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-white/45">© {new Date().getFullYear()} CESAR IMMO · نموذج تجريبي لعرض التصميم والتجربة</div>
      </section>
      <a href={whatsapp} target="_blank" rel="noreferrer" aria-label="التواصل عبر واتساب" className="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105"><MessageCircle size={26}/></a>
    </main>
  );
}
