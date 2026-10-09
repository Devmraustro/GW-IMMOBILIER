import type { Service } from '@/types';

export const services: Service[] = [
  {
    id: 's-1',
    slug: 'location-immobiliere',
    icon: 'Building2',
    title: { fr: 'Location immobilière', ar: 'الكراء العقاري' },
    summary: {
      fr: 'Appartements F2, F3, studios et villas, à l’année ou au mois.',
      ar: 'شقق F2 و F3 وستوديوهات وفيلات، بالسنة أو بالشهر.',
    },
    description: {
      fr: 'Nous sélectionnons des biens visités et vérifiés, rédigeons des baux clairs et assurons la remise des clés avec état des lieux contradictoire. Un interlocuteur unique suit votre dossier de la première visite à l’installation.',
      ar: 'نختار عقارات تمت معاينتها والتحقق منها، ونحرر عقود كراء واضحة ونتكفل بتسليم المفاتيح مع محضر معاينة متفق عليه. يتابع ملفك مُخاطب واحد من أول زيارة إلى السكن.',
    },
    bullets: [
      { fr: 'Recherche ciblée selon commune, budget et durée', ar: 'بحث موجه حسب البلدية والميزانية والمدة' },
      { fr: 'Visites planifiées et itinéraire envoyé', ar: 'زيارات مجدولة مع إرسال المسار' },
      { fr: 'Bail rédigé et état des lieux contradictoire', ar: 'عقد كراء محرر ومحضر معاينة متفق عليه' },
      { fr: 'Suivi après installation', ar: 'متابعة بعد السكن' },
    ],
    href: '/properties?category=rent',
  },
  {
    id: 's-2',
    slug: 'vente-immobiliere',
    icon: 'KeyRound',
    title: { fr: 'Vente immobilière', ar: 'البيع العقاري' },
    summary: {
      fr: 'Estimation, mise en marché et sécurisation administrative de la transaction.',
      ar: 'تقييم، عرض في السوق وتأمين الإجراءات الإدارية للعملية.',
    },
    description: {
      fr: 'Estimation argumentée à partir de transactions comparables dans la même commune, dossier technique complet et coordination avec le notaire jusqu’à la signature de l’acte authentique.',
      ar: 'تقييم مبني على معاملات مماثلة في نفس البلدية، ملف تقني كامل وتنسيق مع الموثق حتى توقيع العقد الرسمي.',
    },
    bullets: [
      { fr: 'Estimation comparative documentée', ar: 'تقييم مقارن موثق' },
      { fr: 'Dossier technique et administratif complet', ar: 'ملف تقني وإداري كامل' },
      { fr: 'Coordination notaire et signature', ar: 'التنسيق مع الموثق والتوقيع' },
    ],
    href: '/properties?category=sale',
  },
  {
    id: 's-3',
    slug: 'meubles-courte-duree',
    icon: 'Sofa',
    title: { fr: 'Meublés & courte durée', ar: 'المفروشة والإقامة القصيرة' },
    summary: {
      fr: 'Séjours de quelques nuits à plusieurs mois, charges incluses.',
      ar: 'إقامات من بضع ليالٍ إلى عدة أشهر، المصاريف مشمولة.',
    },
    description: {
      fr: 'Logements meublés et équipés pour les missions professionnelles, les familles en transition et les séjours balnéaires. Linge fourni, charges incluses, check-in flexible et assistance pendant le séjour.',
      ar: 'سكنات مفروشة ومجهزة للمهام المهنية والعائلات في مرحلة انتقالية والإقامات الشاطئية. المفروشات متوفرة، المصاريف مشمولة، تسجيل وصول مرن ومساعدة طوال الإقامة.',
    },
    bullets: [
      { fr: 'Charges, eau, électricité et internet inclus', ar: 'المصاريف والماء والكهرباء والإنترنت مشمولة' },
      { fr: 'Check-in flexible, y compris en soirée', ar: 'تسجيل وصول مرن، بما في ذلك مساءً' },
      { fr: 'Linge de maison fourni', ar: 'مفروشات المنزل متوفرة' },
    ],
    href: '/properties?period=daily',
  },
  {
    id: 's-4',
    slug: 'echange-de-biens',
    icon: 'ArrowLeftRight',
    title: { fr: 'Échange de biens', ar: 'تبادل العقارات' },
    summary: {
      fr: 'Étude de compatibilité, évaluation et soulte éventuelle.',
      ar: 'دراسة التوافق، تقييم وفرق مالي محتمل.',
    },
    description: {
      fr: 'Vous souhaitez changer de commune ou de typologie sans passer par une vente ? Nous rapprochons les deux parties, évaluons les biens et cadrons la soulte éventuelle dans un protocole écrit.',
      ar: 'ترغب في تغيير البلدية أو نوع العقار دون بيع؟ نقوم بالتقريب بين الطرفين وتقييم العقارين وتحديد الفرق المالي المحتمل في اتفاق مكتوب.',
    },
    bullets: [
      { fr: 'Mise en relation de deux dossiers compatibles', ar: 'ربط ملفين متوافقين' },
      { fr: 'Double évaluation contradictoire', ar: 'تقييم مزدوج متفق عليه' },
      { fr: 'Protocole d’échange et soulte écrits', ar: 'اتفاق التبادل والفرق المالي مكتوبان' },
    ],
    href: '/properties?category=exchange',
  },
  {
    id: 's-5',
    slug: 'location-vehicules',
    icon: 'Car',
    title: { fr: 'Location de véhicules', ar: 'كراء السيارات' },
    summary: {
      fr: 'De la citadine au véhicule de prestige, avec ou sans chauffeur.',
      ar: 'من السيارة المدنية إلى الفاخرة، مع سائق أو بدونه.',
    },
    description: {
      fr: 'Flotte disponible à la journée, à la semaine ou au mois, avec retrait sur les communes couvertes ou livraison à l’aéroport. Contrat, assurance et caution encadrés par écrit.',
      ar: 'أسطول متاح باليوم أو الأسبوع أو الشهر، مع الاستلام في البلديات المغطاة أو التوصيل إلى المطار. العقد والتأمين والضمان منظمة كتابياً.',
    },
    bullets: [
      { fr: 'Tarification à la journée, à la semaine ou au mois', ar: 'تسعيرة باليوم أو الأسبوع أو الشهر' },
      { fr: 'Livraison possible à l’aéroport', ar: 'التوصيل إلى المطار ممكن' },
      { fr: 'Chauffeur disponible en option', ar: 'سائق متاح اختيارياً' },
    ],
    href: '/cars',
  },
  {
    id: 's-6',
    slug: 'assistance-administrative',
    icon: 'FileCheck2',
    title: { fr: 'Assistance administrative', ar: 'المساعدة الإدارية' },
    summary: {
      fr: 'Baux, états des lieux, dossiers et formalités liés au bien.',
      ar: 'عقود الكراء، محاضر المعاينة، الملفات والإجراءات المتعلقة بالعقار.',
    },
    description: {
      fr: 'Rédaction du bail, état des lieux, attestations, déclarations et suivi des pièces administratives. Un gain de temps réel pour les propriétaires comme pour les locataires.',
      ar: 'تحرير عقد الكراء، محضر المعاينة، الشهادات، التصريحات ومتابعة الوثائق الإدارية. توفير حقيقي للوقت للملاك والمستأجرين على حد سواء.',
    },
    bullets: [
      { fr: 'Rédaction du bail et de l’état des lieux', ar: 'تحرير عقد الكراء ومحضر المعاينة' },
      { fr: 'Constitution et vérification du dossier', ar: 'إعداد الملف والتحقق منه' },
      { fr: 'Suivi des échéances et des renouvellements', ar: 'متابعة الآجال والتجديدات' },
    ],
    href: '/contact',
  },
];

export default services;
