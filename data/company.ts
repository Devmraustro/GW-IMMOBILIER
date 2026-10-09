import type { Translated } from '@/types';

/**
 * Static company content used across the site.
 *
 * IMPORTANT: contact details (phone, WhatsApp, e-mail, address, social links)
 * are NOT stored here. They are read from environment variables — see
 * `lib/config.ts` — because they must be supplied and verified by the owner
 * before going live. Placeholder values are clearly flagged in the UI.
 */
export const company = {
  legalName: 'GW Immobilier',
  shortName: 'GW',
  established: 2024,
  tagline: {
    fr: 'Immobilier & location de véhicules — Alger',
    ar: 'عقارات وكراء السيارات — الجزائر',
  },
  positioning: {
    fr: 'Location, vente et gestion immobilière, meublés de courte durée et location de véhicules dans la wilaya d’Alger.',
    ar: 'الكراء والبيع والتسيير العقاري، والشقق المفروشة للإقامة القصيرة وكراء السيارات في ولاية الجزائر.',
  },
  story: {
    fr: 'GW Immobilier accompagne propriétaires et locataires sur l’ensemble de la wilaya d’Alger : location annuelle et meublée, vente, échange et location de véhicules. Notre méthode est simple : des biens vérifiés, des visites organisées, des contrats clairs et un interlocuteur unique du premier contact à la remise des clés.',
    ar: 'ترافق شركة جي دبليو العقارية الملاك والمستأجرين في كامل ولاية الجزائر: الكراء السنوي والمفروش، البيع، التبادل وكراء السيارات. طريقتنا بسيطة: عقارات معاينة، زيارات منظمة، عقود واضحة ومُخاطب واحد من أول اتصال إلى تسليم المفاتيح.',
  },
  mission: {
    fr: 'Rendre la location et l’achat immobilier plus lisibles : des informations complètes, des prix annoncés, une disponibilité honnête et une réponse rapide — par téléphone ou WhatsApp.',
    ar: 'جعل الكراء والشراء العقاري أكثر وضوحاً: معلومات كاملة، أسعار معلنة، توفّر صادق ورد سريع — عبر الهاتف أو واتساب.',
  },
  values: [
    {
      icon: 'ShieldCheck',
      title: { fr: 'Transparence', ar: 'الشفافية' },
      body: {
        fr: 'Prix, conditions et disponibilité annoncés avant la visite. Aucune surprise au moment de la signature.',
        ar: 'الأسعار والشروط والتوفّر معلنة قبل الزيارة. لا مفاجآت عند التوقيع.',
      },
    },
    {
      icon: 'MapPinned',
      title: { fr: 'Ancrage local', ar: 'جذور محلية' },
      body: {
        fr: 'Neuf communes couvertes, de Bab Ezzouar à Douaouda Marine, avec une connaissance terrain de chaque quartier.',
        ar: 'تسع بلديات مغطاة، من باب الزوار إلى دوودة مارين، بمعرفة ميدانية بكل حي.',
      },
    },
    {
      icon: 'Clock',
      title: { fr: 'Réactivité', ar: 'سرعة الاستجابة' },
      body: {
        fr: 'Une demande reçue est une demande traitée dans la journée, par WhatsApp ou par téléphone.',
        ar: 'كل طلب يصل تتم معالجته في نفس اليوم، عبر واتساب أو الهاتف.',
      },
    },
    {
      icon: 'FileCheck2',
      title: { fr: 'Dossiers propres', ar: 'ملفات سليمة' },
      body: {
        fr: 'Baux, états des lieux et pièces administratives préparés et relus avant signature.',
        ar: 'عقود الكراء ومحاضر المعاينة والوثائق الإدارية مُعدّة ومراجعة قبل التوقيع.',
      },
    },
  ],
  process: [
    {
      step: '01',
      title: { fr: 'Vous cherchez', ar: 'تبحث' },
      body: {
        fr: 'Filtrez par commune, type de bien et budget, ou explorez la carte interactive.',
        ar: 'صفِّ حسب البلدية ونوع العقار والميزانية، أو استكشف الخريطة التفاعلية.',
      },
    },
    {
      step: '02',
      title: { fr: 'Nous confirmons', ar: 'نؤكد نحن' },
      body: {
        fr: 'Un conseiller vérifie la disponibilité réelle et vous rappelle dans la journée.',
        ar: 'يتحقق مستشارنا من التوفّر الحقيقي ويعاود الاتصال بك في نفس اليوم.',
      },
    },
    {
      step: '03',
      title: { fr: 'Vous visitez', ar: 'تزور' },
      body: {
        fr: 'Visite planifiée, itinéraire envoyé sur votre téléphone, questions techniques traitées sur place.',
        ar: 'زيارة مجدولة، المسار مُرسل إلى هاتفك، والأسئلة التقنية تُعالج في الموقع.',
      },
    },
    {
      step: '04',
      title: { fr: 'Vous signez', ar: 'توقّع' },
      body: {
        fr: 'Contrat clair, état des lieux contradictoire, remise des clés et suivi après installation.',
        ar: 'عقد واضح، محضر معاينة متفق عليه، تسليم المفاتيح ومتابعة بعد السكن.',
      },
    },
  ],
  serviceAreasNote: {
    fr: 'Nos secteurs d’intervention sont mis à jour régulièrement. Un bien hors de ces communes peut être étudié sur demande.',
    ar: 'تُحدَّث مناطق تدخلنا بانتظام. يمكن دراسة أي عقار خارج هذه البلديات عند الطلب.',
  },
} as const;

/** Social links — left empty until the owner supplies the real URLs. */
export const socialLinks: { label: string; href: string; icon: string }[] = [];

/** Legal / administrative claims — intentionally empty (see README). */
export const legalRegistrations: Translated[] = [];
