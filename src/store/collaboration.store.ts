import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CommunityPost, CommunityPostType, VerifiedActionRef } from "@/types/community";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

/** Illustrative seed posts (fictional residents) for the prototype feed. */
function seedPosts(): CommunityPost[] {
  return [
    {
      id: "p_demo_1",
      author: { name: "Dewi Lestari", initials: "DL", kecamatan: "Gubeng" },
      createdAt: hoursAgo(1),
      type: "IDEA",
      content:
        "Rek, yo opo lek saben balai RW disiapno drop-box khusus botol plastik karo minyak jelantah? Nang peta PACUL ketok warga Gubeng wes paling sregep pilah sampah, eman lek ga dimaksimalkan!",
      tags: ["#PilahSampah", "#Gubeng", "#Jelantah"],
      likes: 38,
      replies: 14,
      isDemo: true,
    },
    {
      id: "p_demo_2",
      author: { name: "Cak Rian", initials: "CR", kecamatan: "Wonokromo" },
      createdAt: hoursAgo(2),
      type: "VERIFIED_ACTION",
      content: "Iki mau budhal nang kampus Unesa gowes pit ontel liwat Joyoboyo. Hawane seger, gak kenek macet DTC, tur oleh EcoPoints pisan rek!",
      tags: ["#TransportasiHijau", "#Wonokromo"],
      verifiedAction: {
        actionId: "demo_va_1",
        actionType: "sustainable_transport",
        mode: "demo",
        impactSummary: "Gowes 6 km · cegah 0,68 kg CO₂e",
      },
      likes: 54,
      replies: 16,
      isDemo: true,
    },
    {
      id: "p_demo_3",
      author: { name: "Ning Siti Aminah", initials: "SA", kecamatan: "Tegalsari" },
      createdAt: hoursAgo(4),
      type: "EVENT",
      content:
        "Monggo dolor-dolor Tegalsari, dino Minggu isuk cangkruk bareng nang balai RW sinau urban farming. Sing duwe botol bekas gowoen kabeh yo, digawe pot hidroponik!",
      tags: ["#UrbanFarming", "#Tegalsari"],
      likes: 67,
      replies: 23,
      isDemo: true,
    },
    {
      id: "p_demo_4",
      author: { name: "Pak RT Budi", initials: "PB", kecamatan: "Rungkut" },
      createdAt: hoursAgo(6),
      type: "UPDATE",
      content:
        "Alhamdulillah rek, wulan iki RT 03 Rungkut wes ngumpulno 18 liter jelantah teko pawon emak-emak. Wes langsung disetor nang bank sampah kelurahan, mantep tenan!",
      tags: ["#Jelantah", "#Rungkut"],
      likes: 42,
      replies: 9,
      isDemo: true,
    },
    {
      id: "p_demo_5",
      author: { name: "Cak Dimas", initials: "CD", kecamatan: "Genteng" },
      createdAt: hoursAgo(7),
      type: "MOVEMENT",
      content:
        "Ayo rek, arek-arek Genteng ojok sampek kalah! Saiki saben tuku kopi nggowo tumbler dewe nang warkop. Lumayan dapet diskon sisan kurangi sampah cup plastik.",
      tags: ["#BawaTumbler", "#Genteng", "#ArekSuroboyo"],
      likes: 35,
      replies: 11,
      isDemo: true,
    },
    {
      id: "p_demo_6",
      author: { name: "Ning Ratna", initials: "NR", kecamatan: "Sukolilo" },
      createdAt: hoursAgo(9),
      type: "VERIFIED_ACTION",
      content: "Mari nyetor 3 jeriken jelantah nang bank sampah Manyar. Duit voucher-e langsung tak ijolno sayur organik nang Pasar Hijau, berkah rek!",
      tags: ["#SetorJelantah", "#Sukolilo"],
      verifiedAction: {
        actionId: "demo_va_2",
        actionType: "used_cooking_oil",
        mode: "demo",
        impactSummary: "Setor 3 L minyak jelantah",
      },
      likes: 49,
      replies: 13,
      isDemo: true,
    },
    {
      id: "p_demo_7",
      author: { name: "Bagus Prasetyo", initials: "BP", kecamatan: "Tambaksari" },
      createdAt: hoursAgo(11),
      type: "IDEA",
      content:
        "Usul rek, CFD Taman Bungkul sesuk yok opo lek PACUL nggae booth edukasi pilah sampah organik? Cik arek enom-enom ga mung jogging tok tapi paham daur ulang.",
      tags: ["#CFDSurabaya", "#Tambaksari", "#EdukasiHijau"],
      likes: 62,
      replies: 28,
      isDemo: true,
    },
    {
      id: "p_demo_8",
      author: { name: "Ning Endang", initials: "NE", kecamatan: "Sawahan" },
      createdAt: hoursAgo(13),
      type: "UPDATE",
      content:
        "Banyu Urip resik tenan saiki! Got-got kampung wes dikeruk bareng warga minggu wingi, ga mambet maneh. Suwun sanget kabeh sing wes melok kerja bakti rek.",
      tags: ["#KerjaBakti", "#Sawahan", "#ResikSuroboyo"],
      likes: 40,
      replies: 7,
      isDemo: true,
    },
    {
      id: "p_demo_9",
      author: { name: "Cak Slamet", initials: "CS", kecamatan: "Mulyorejo" },
      createdAt: hoursAgo(15),
      type: "VERIFIED_ACTION",
      content: "Nandur 3 bibit pelem ning pekarangan omah sak marine subuhan. Cik kampung Sutorejo tambah ijo royo-royo, hawane adem rek!",
      tags: ["#TanamPohon", "#Mulyorejo"],
      verifiedAction: {
        actionId: "demo_va_3",
        actionType: "tree_planting",
        mode: "demo",
        impactSummary: "3 pohon ditanam di pekarangan",
      },
      likes: 71,
      replies: 19,
      isDemo: true,
    },
    {
      id: "p_demo_10",
      author: { name: "Komunitas Mangrove", initials: "KM", kecamatan: "Kenjeran" },
      createdAt: hoursAgo(18),
      type: "EVENT",
      content:
        "Halo rek Kenjeran! Sabtu isuk ayo kumpul nang pesisir Pantai Ria, resik-resik sampah plastik pesisir bareng komunitas mangrove. Ono snack karo EcoPoints gratis rek!",
      tags: ["#BersihPantai", "#Kenjeran", "#JagaLaut"],
      likes: 83,
      replies: 34,
      isDemo: true,
    },
    {
      id: "p_demo_11",
      author: { name: "Ning Wahyu", initials: "NW", kecamatan: "Sukomanunggal" },
      createdAt: hoursAgo(20),
      type: "IDEA",
      content:
        "Ibu-ibu PKK Simomulyo niki mulai gawe pupuk kompos teko godhong garing karo sisa sayur dapur. Hasil composter-e subur tenan gawe nandur lombok!",
      tags: ["#KomposRumah", "#Sukomanunggal"],
      likes: 36,
      replies: 10,
      isDemo: true,
    },
    {
      id: "p_demo_12",
      author: { name: "Cak Fajar", initials: "CF", kecamatan: "Semampir" },
      createdAt: hoursAgo(22),
      type: "VERIFIED_ACTION",
      content: "Hari ini numpak angkutan WiraWiri teko Ampel sampek stasiun. AC-ne anyep, bayare praktis nggawe QRIS, hemat bensin karo kurangi emisi knalpot tenan rek.",
      tags: ["#WiraWiriSuroboyo", "#Semampir"],
      verifiedAction: {
        actionId: "demo_va_4",
        actionType: "sustainable_transport",
        mode: "demo",
        impactSummary: "Perjalanan transit 5,2 km · cegah 0,59 kg CO₂e",
      },
      likes: 58,
      replies: 15,
      isDemo: true,
    },
    {
      id: "p_demo_13",
      author: { name: "Pak RW Hendro", initials: "PH", kecamatan: "Benowo" },
      createdAt: hoursAgo(25),
      type: "UPDATE",
      content:
        "Warga Sememi Benowo kompak pol! Pilah sampah organik sak RW wes tembus 2 kuintal wulan iki, siap diolah dadi pakan budidaya maggot BSF.",
      tags: ["#PilahSampah", "#Benowo", "#MaggotSby"],
      likes: 52,
      replies: 8,
      isDemo: true,
    },
    {
      id: "p_demo_14",
      author: { name: "Ning Maya", initials: "NM", kecamatan: "Wiyung" },
      createdAt: hoursAgo(27),
      type: "MOVEMENT",
      content:
        "Monggo dolor Babatan Wiyung, gerakan sedekah jelantah dibuka maneh tiap Jumat berkah. Ojo dibuang nang got maneh yo rek, eman banyune dadi buthek!",
      tags: ["#JelantahBerkah", "#Wiyung"],
      likes: 44,
      replies: 12,
      isDemo: true,
    },
    {
      id: "p_demo_15",
      author: { name: "Rizky Firmansyah", initials: "RF", kecamatan: "Dukuh Pakis" },
      createdAt: hoursAgo(30),
      type: "VERIFIED_ACTION",
      content: "Ganti kabeh lampu bohlam omah gawe LED hemat energi. Tagihan PLN mudun lumayan akeh, PACUL verifikasi cepet pol!",
      tags: ["#HematListrik", "#DukuhPakis"],
      verifiedAction: {
        actionId: "demo_va_5",
        actionType: "energy_saving",
        mode: "demo",
        impactSummary: "Hemat 12 kWh listrik · cegah 10,4 kg CO₂",
      },
      likes: 63,
      replies: 17,
      isDemo: true,
    },
    {
      id: "p_demo_16",
      author: { name: "Ning Farida", initials: "NF", kecamatan: "Jambangan" },
      createdAt: hoursAgo(33),
      type: "UPDATE",
      content:
        "Jambangan kampung percontohan lingkungan! Eco-enzym sak tong wes panen, langsung dibagi-bagi nang tetangga gawe ngepel omah karo pupuk kembang.",
      tags: ["#EcoEnzyme", "#Jambangan"],
      likes: 77,
      replies: 22,
      isDemo: true,
    },
    {
      id: "p_demo_17",
      author: { name: "Cak Eko", initials: "CE", kecamatan: "Karang Pilang" },
      createdAt: hoursAgo(36),
      type: "IDEA",
      content:
        "Nang Kebraon akeh lahan kosong pinggir dalan, piye rek lek disulap dadi kebun sayur toga bareng pemuda karang taruna? Ben ga dadi sarang uwuh liar.",
      tags: ["#TogaKampung", "#KarangPilang"],
      likes: 41,
      replies: 14,
      isDemo: true,
    },
    {
      id: "p_demo_18",
      author: { name: "Kartika Sari", initials: "KS", kecamatan: "Gayungan" },
      createdAt: hoursAgo(39),
      type: "VERIFIED_ACTION",
      content: "Isuk-isuk mlaku 5.000 langkah keliling Menanggal. Sehat awake, dapet EcoPoints, nambahi target tantangan komunitas mingguan!",
      tags: ["#LangkahHijau", "#Gayungan"],
      verifiedAction: {
        actionId: "demo_va_6",
        actionType: "sustainable_transport",
        mode: "demo",
        impactSummary: "Jalan kaki 3,8 km · cegah 0,43 kg CO₂e",
      },
      likes: 50,
      replies: 9,
      isDemo: true,
    },
    {
      id: "p_demo_19",
      author: { name: "Aris Munandar", initials: "AM", kecamatan: "Krembangan" },
      createdAt: hoursAgo(42),
      type: "EVENT",
      content:
        "Warga Perak Barat monggo kumpul dino Minggu! Bedah edukasi bahaya limbah aki karo baterai bekas cik gak kecampur sampah dapur rumah tangga.",
      tags: ["#LimbahB3", "#Krembangan"],
      likes: 33,
      replies: 6,
      isDemo: true,
    },
    {
      id: "p_demo_20",
      author: { name: "Ning Laila", initials: "NL", kecamatan: "Wonocolo" },
      createdAt: hoursAgo(45),
      type: "UPDATE",
      content:
        "Alhamdulillah penukaran voucher sembako nang warung bu Tini lancar jaya! Modal nuker poin aksi pilah sampah tok rek, lumayan gawe blonjo pawon.",
      tags: ["#PasarHijau", "#Wonocolo"],
      likes: 68,
      replies: 21,
      isDemo: true,
    },
    {
      id: "p_demo_21",
      author: { name: "Cak Anam", initials: "CA", kecamatan: "Tandes" },
      createdAt: hoursAgo(48),
      type: "MOVEMENT",
      content:
        "Ayo rek Tandes, biasakno gowo tas blonjo kain lek blonjo nang pasar tradisional. Isin rek lek jek njaluk kresek abang ireng!",
      tags: ["#DietKantongPlastik", "#Tandes"],
      likes: 47,
      replies: 13,
      isDemo: true,
    },
    {
      id: "p_demo_22",
      author: { name: "Ning Tri", initials: "NT", kecamatan: "Pabean Cantian" },
      createdAt: hoursAgo(52),
      type: "VERIFIED_ACTION",
      content: "Sore iki nimbang koran karo kardus bekas packing nang bank sampah Songoyudan. 15 kg resik kabeh, omah dadi plong tur oleh poin!",
      tags: ["#DaurUlang", "#PabeanCantian"],
      verifiedAction: {
        actionId: "demo_va_7",
        actionType: "waste_sorting",
        mode: "demo",
        impactSummary: "Pilah 15 kg kardus dan kertas daur ulang",
      },
      likes: 59,
      replies: 11,
      isDemo: true,
    },
    {
      id: "p_demo_23",
      author: { name: "Danang Setiawan", initials: "DS", kecamatan: "Bulak" },
      createdAt: hoursAgo(56),
      type: "IDEA",
      content:
        "Suroboyo pesisir Bulak koyoke perlu luwih akeh tempat sampah terpilah nang cedak sentra iwak bulak rek, cik turis ga mbuang sampah sembarangan ning pantai.",
      tags: ["#BulakResik", "#SurabayaPesisir"],
      likes: 39,
      replies: 15,
      isDemo: true,
    },
    {
      id: "p_demo_24",
      author: { name: "Ning Nita", initials: "NN", kecamatan: "Sambikerep" },
      createdAt: hoursAgo(60),
      type: "UPDATE",
      content:
        "Taman toga RT 02 Lontar wes panen serai karo jahe rek! Monggo warga sing butuh bumbu pawon iso methik sak cukupe, asil gotong royong bareng.",
      tags: ["#TogaRukun", "#Sambikerep"],
      likes: 56,
      replies: 18,
      isDemo: true,
    },
    {
      id: "p_demo_25",
      author: { name: "Cak Yanto", initials: "CY", kecamatan: "Pakal" },
      createdAt: hoursAgo(64),
      type: "VERIFIED_ACTION",
      content: "Numpak Suroboyo Bus teko Benowo nang Tunjungan Plaza. Nyaman tenan rek, rekomen gawe arek kerja sing males macet-macetan ning dalan gedhe.",
      tags: ["#SuroboyoBus", "#Pakal"],
      verifiedAction: {
        actionId: "demo_va_8",
        actionType: "sustainable_transport",
        mode: "demo",
        impactSummary: "Naik bus kota 14 km · cegah 1,58 kg CO₂e",
      },
      likes: 82,
      replies: 26,
      isDemo: true,
    },
    {
      id: "p_demo_26",
      author: { name: "Ning Asih", initials: "NA", kecamatan: "Asemrowo" },
      createdAt: hoursAgo(68),
      type: "IDEA",
      content:
        "Yok opo lek tiap RT nggawe arisan sedekah minyak jelantah? Sing oleh arisan dapet bibit wit-witan gawe ngijokno gang kampung Asemrowo.",
      tags: ["#AsemrowoHijau", "#Jelantah"],
      likes: 34,
      replies: 8,
      isDemo: true,
    },
    {
      id: "p_demo_27",
      author: { name: "Ilham Mahasiswa", initials: "IM", kecamatan: "Tenggilis Mejoyo" },
      createdAt: hoursAgo(72),
      type: "MOVEMENT",
      content:
        "Arek kos-kosan Ubaya & Rungkut monggo gabung pilah botol skincare & botol air mineral. Tak sediakno kardus khusus nang pos satpam gang kos rek!",
      tags: ["#ArekKosHijau", "#Tenggilis"],
      likes: 65,
      replies: 20,
      isDemo: true,
    },
    {
      id: "p_demo_28",
      author: { name: "Ning Rini", initials: "NR", kecamatan: "Gunung Anyar" },
      createdAt: hoursAgo(76),
      type: "VERIFIED_ACTION",
      content: "Panen kangkung hidroponik sak bak ning balkon omah. Mangan sayur seger tanpa pestisida, seger tenan rek!",
      tags: ["#UrbanFarming", "#GunungAnyar"],
      verifiedAction: {
        actionId: "demo_va_9",
        actionType: "tree_planting",
        mode: "demo",
        impactSummary: "Panen hidroponik 2 kg sayur segar",
      },
      likes: 73,
      replies: 16,
      isDemo: true,
    },
    {
      id: "p_demo_29",
      author: { name: "Cak Wawan", initials: "CW", kecamatan: "Simokerto" },
      createdAt: hoursAgo(80),
      type: "UPDATE",
      content:
        "Kampung Kapasan mari pasang biopori 20 titik rek sak durunge musim udan. Supoyo banyu udan langsung ngresep nang njero lemah, ga banjir.",
      tags: ["#Biopori", "#Simokerto"],
      likes: 48,
      replies: 12,
      isDemo: true,
    },
    {
      id: "p_demo_30",
      author: { name: "Bella Cantika", initials: "BC", kecamatan: "Genteng" },
      createdAt: hoursAgo(84),
      type: "VERIFIED_ACTION",
      content: "Tuku es kopi ning kedai lokal Genteng gowo tumbler PACUL, dapet potongan 15% plus poin aksi terverifikasi! Mantep pol rek!",
      tags: ["#PasarHijau", "#KopiHijau", "#Suroboyo"],
      verifiedAction: {
        actionId: "demo_va_10",
        actionType: "waste_sorting",
        mode: "demo",
        impactSummary: "Kurangi 1 cup plastik sekali pakai",
      },
      likes: 95,
      replies: 31,
      isDemo: true,
    },
  ];
}

interface NewPostInput {
  author: CommunityPost["author"];
  type: Exclude<CommunityPostType, "VERIFIED_ACTION">;
  content: string;
  tags: string[];
}

interface CollaborationStore {
  posts: CommunityPost[];
  addPost: (input: NewPostInput) => CommunityPost;
  shareVerifiedAction: (author: CommunityPost["author"], content: string, ref: VerifiedActionRef) => CommunityPost;
  toggleLike: (postId: string) => void;
  reset: () => void;
}

function postId() {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
}

export const useCollaborationStore = create<CollaborationStore>()(
  persist(
    (set) => ({
      posts: seedPosts(),

      addPost: (input) => {
        const post: CommunityPost = {
          ...input,
          id: postId(),
          createdAt: new Date().toISOString(),
          likes: 0,
          replies: 0,
        };
        set((s) => ({ posts: [post, ...s.posts] }));
        return post;
      },

      shareVerifiedAction: (author, content, ref) => {
        const post: CommunityPost = {
          id: postId(),
          author,
          createdAt: new Date().toISOString(),
          type: "VERIFIED_ACTION",
          content,
          tags: [],
          likes: 0,
          replies: 0,
          verifiedAction: ref,
        };
        set((s) => ({ posts: [post, ...s.posts] }));
        return post;
      },

      toggleLike: (id) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === id
              ? {
                  ...p,
                  likes: p.likedByMe ? Math.max(0, p.likes - 1) : p.likes + 1,
                  likedByMe: !p.likedByMe,
                }
              : p
          ),
        })),

      reset: () => set({ posts: seedPosts() }),
    }),
    {
      name: "pacul-community",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: () => ({ posts: seedPosts() }),
    }
  )
);
