import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/db";
import { subjects, tests, test_questions, lessons } from "../src/db/schema";

const START = new Date().toISOString();
const END = "2026-06-30T23:59:59+05:00";

// 2 tests × 5 questions per subject
const SUBJECT_DATA: Record<
  string,
  {
    tests: Array<{
      name: string;
      questions: Array<{
        question: string;
        options: Array<{ label: string; text: string }>;
        correct_option: string;
        points: number;
      }>;
    }>;
    lessons: string[];
  }
> = {
  Matematika: {
    tests: [
      {
        name: "Matematika — 1-test",
        questions: [
          { question: "256 + 144 = ?", options: [{ label: "A", text: "390" }, { label: "B", text: "400" }, { label: "C", text: "410" }, { label: "D", text: "380" }], correct_option: "B", points: 1 },
          { question: "12 × 13 = ?", options: [{ label: "A", text: "144" }, { label: "B", text: "152" }, { label: "C", text: "156" }, { label: "D", text: "160" }], correct_option: "C", points: 2 },
          { question: "1000 ÷ 25 = ?", options: [{ label: "A", text: "35" }, { label: "B", text: "40" }, { label: "C", text: "45" }, { label: "D", text: "50" }], correct_option: "B", points: 2 },
          { question: "Kvadratning tomoni 7 sm. Yuzasi = ?", options: [{ label: "A", text: "14 sm²" }, { label: "B", text: "28 sm²" }, { label: "C", text: "49 sm²" }, { label: "D", text: "56 sm²" }], correct_option: "C", points: 3 },
          { question: "1/3 + 1/6 = ?", options: [{ label: "A", text: "1/2" }, { label: "B", text: "2/9" }, { label: "C", text: "1/3" }, { label: "D", text: "2/6" }], correct_option: "A", points: 3 },
        ],
      },
      {
        name: "Matematika — 2-test",
        questions: [
          { question: "500 - 237 = ?", options: [{ label: "A", text: "263" }, { label: "B", text: "273" }, { label: "C", text: "253" }, { label: "D", text: "283" }], correct_option: "A", points: 1 },
          { question: "9² = ?", options: [{ label: "A", text: "18" }, { label: "B", text: "81" }, { label: "C", text: "72" }, { label: "D", text: "63" }], correct_option: "B", points: 2 },
          { question: "Uchburchak ichki burchaklari yig'indisi = ?", options: [{ label: "A", text: "90°" }, { label: "B", text: "270°" }, { label: "C", text: "180°" }, { label: "D", text: "360°" }], correct_option: "C", points: 2 },
          { question: "0.5 × 0.4 = ?", options: [{ label: "A", text: "0.09" }, { label: "B", text: "0.2" }, { label: "C", text: "2" }, { label: "D", text: "0.02" }], correct_option: "B", points: 3 },
          { question: "Eng kichik natural son = ?", options: [{ label: "A", text: "0" }, { label: "B", text: "-1" }, { label: "C", text: "1" }, { label: "D", text: "2" }], correct_option: "C", points: 2 },
        ],
      },
    ],
    lessons: ["Natural sonlar va amallar", "Kasrlar va o'nli kasrlar"],
  },

  "Ona tili": {
    tests: [
      {
        name: "Ona tili — 1-test",
        questions: [
          { question: "\"Kitob\" so'zi qaysi so'z turkumi?", options: [{ label: "A", text: "Fe'l" }, { label: "B", text: "Sifat" }, { label: "C", text: "Ot" }, { label: "D", text: "Ravish" }], correct_option: "C", points: 1 },
          { question: "\"Yashil\" so'zi qaysi so'z turkumi?", options: [{ label: "A", text: "Ot" }, { label: "B", text: "Sifat" }, { label: "C", text: "Fe'l" }, { label: "D", text: "Son" }], correct_option: "B", points: 1 },
          { question: "Gapning bosh bo'laklari?", options: [{ label: "A", text: "Aniqlovchi va to'ldiruvchi" }, { label: "B", text: "Ega va kesim" }, { label: "C", text: "Hol va aniqlovchi" }, { label: "D", text: "To'ldiruvchi va hol" }], correct_option: "B", points: 2 },
          { question: "\"Yugurmoq\" qaysi so'z turkumi?", options: [{ label: "A", text: "Ot" }, { label: "B", text: "Sifat" }, { label: "C", text: "Fe'l" }, { label: "D", text: "Ravish" }], correct_option: "C", points: 2 },
          { question: "Bo'g'in nima?", options: [{ label: "A", text: "Harf" }, { label: "B", text: "Tovush" }, { label: "C", text: "So'z" }, { label: "D", text: "Bir nafas bilan aytiladigan tovushlar" }], correct_option: "D", points: 3 },
        ],
      },
      {
        name: "Ona tili — 2-test",
        questions: [
          { question: "O'zbek alifbosida nechta harf bor?", options: [{ label: "A", text: "29" }, { label: "B", text: "32" }, { label: "C", text: "35" }, { label: "D", text: "26" }], correct_option: "A", points: 2 },
          { question: "\"Maktab\" so'zida nechta unli tovush?", options: [{ label: "A", text: "1" }, { label: "B", text: "2" }, { label: "C", text: "3" }, { label: "D", text: "4" }], correct_option: "B", points: 2 },
          { question: "Undov gapning belgisi?", options: [{ label: "A", text: "." }, { label: "B", text: "?" }, { label: "C", text: "!" }, { label: "D", text: "..." }], correct_option: "C", points: 1 },
          { question: "\"Tez\" so'zi qaysi so'z turkumi?", options: [{ label: "A", text: "Sifat" }, { label: "B", text: "Ravish" }, { label: "C", text: "Ot" }, { label: "D", text: "Fe'l" }], correct_option: "B", points: 2 },
          { question: "Ko'plik qo'shimchasi?", options: [{ label: "A", text: "-chi" }, { label: "B", text: "-lar" }, { label: "C", text: "-ning" }, { label: "D", text: "-da" }], correct_option: "B", points: 2 },
        ],
      },
    ],
    lessons: ["So'z turkumlari", "Gap va uning bo'laklari"],
  },

  Adabiyot: {
    tests: [
      {
        name: "Adabiyot — 1-test",
        questions: [
          { question: "\"O'tkan kunlar\" muallifi kim?", options: [{ label: "A", text: "A. Navoiy" }, { label: "B", text: "A. Qodiriy" }, { label: "C", text: "G'. G'ulom" }, { label: "D", text: "A. Oripov" }], correct_option: "B", points: 2 },
          { question: "\"Alpomish\" qaysi xalq dostoni?", options: [{ label: "A", text: "Rus" }, { label: "B", text: "Tojik" }, { label: "C", text: "O'zbek" }, { label: "D", text: "Qozoq" }], correct_option: "C", points: 2 },
          { question: "Maqol nima?", options: [{ label: "A", text: "Qisqa hikoya" }, { label: "B", text: "Qisqa hikmatli ibora" }, { label: "C", text: "She'r turi" }, { label: "D", text: "Ertak turi" }], correct_option: "B", points: 1 },
          { question: "A. Navoiy qaysi asarni yozgan?", options: [{ label: "A", text: "Xamsa" }, { label: "B", text: "Boburnoma" }, { label: "C", text: "Qutadg'u bilig" }, { label: "D", text: "Devonu lug'atit turk" }], correct_option: "A", points: 3 },
          { question: "Topishmoqning maqsadi?", options: [{ label: "A", text: "Kuldirish" }, { label: "B", text: "Fikrlashga undash" }, { label: "C", text: "Qo'rqitish" }, { label: "D", text: "O'rgatish" }], correct_option: "B", points: 2 },
        ],
      },
      {
        name: "Adabiyot — 2-test",
        questions: [
          { question: "She'rning asosiy xususiyati?", options: [{ label: "A", text: "Nasrda yoziladi" }, { label: "B", text: "Qofiyasi bo'ladi" }, { label: "C", text: "Dialog bo'ladi" }, { label: "D", text: "Uzun bo'ladi" }], correct_option: "B", points: 2 },
          { question: "Ertak qanday tugaydi?", options: [{ label: "A", text: "Fojiа bilan" }, { label: "B", text: "Baxtli yakun bilan" }, { label: "C", text: "Savolga javob" }, { label: "D", text: "Ochiq yakun" }], correct_option: "B", points: 1 },
          { question: "\"Boburnoma\" muallifi?", options: [{ label: "A", text: "Amir Temur" }, { label: "B", text: "Ulug'bek" }, { label: "C", text: "Zahiriddin Muhammad Bobur" }, { label: "D", text: "A. Navoiy" }], correct_option: "C", points: 3 },
          { question: "Xalq og'zaki ijodiga nima kiradi?", options: [{ label: "A", text: "Roman" }, { label: "B", text: "Ertak, doston, maqol" }, { label: "C", text: "Drama" }, { label: "D", text: "Povest" }], correct_option: "B", points: 2 },
          { question: "Lirik she'rda nima tasvirlanadi?", options: [{ label: "A", text: "Voqea" }, { label: "B", text: "Tabiat, his-tuyg'u" }, { label: "C", text: "Jang" }, { label: "D", text: "Tarix" }], correct_option: "B", points: 2 },
        ],
      },
    ],
    lessons: ["Xalq og'zaki ijodi", "O'zbek klasssik adabiyoti"],
  },

  "Ingliz tili": {
    tests: [
      {
        name: "English — Test 1",
        questions: [
          { question: "How many letters in English alphabet?", options: [{ label: "A", text: "24" }, { label: "B", text: "26" }, { label: "C", text: "28" }, { label: "D", text: "30" }], correct_option: "B", points: 1 },
          { question: "\"I ___ a student.\" — to'g'ri fe'l?", options: [{ label: "A", text: "am" }, { label: "B", text: "is" }, { label: "C", text: "are" }, { label: "D", text: "be" }], correct_option: "A", points: 2 },
          { question: "\"Book\" tarjimasi?", options: [{ label: "A", text: "Daftar" }, { label: "B", text: "Qalam" }, { label: "C", text: "Kitob" }, { label: "D", text: "Sumka" }], correct_option: "C", points: 1 },
          { question: "\"They ___ playing football.\" — to'g'ri fe'l?", options: [{ label: "A", text: "is" }, { label: "B", text: "am" }, { label: "C", text: "are" }, { label: "D", text: "was" }], correct_option: "C", points: 2 },
          { question: "Colours: Red, Blue, ___ — yetishmayotgan?", options: [{ label: "A", text: "Dog" }, { label: "B", text: "Green" }, { label: "C", text: "Cat" }, { label: "D", text: "Table" }], correct_option: "B", points: 2 },
        ],
      },
      {
        name: "English — Test 2",
        questions: [
          { question: "\"School\" tarjimasi?", options: [{ label: "A", text: "Uy" }, { label: "B", text: "Do'kon" }, { label: "C", text: "Maktab" }, { label: "D", text: "Kasalxona" }], correct_option: "C", points: 1 },
          { question: "Numbers: 1=one, 2=two, 3=?", options: [{ label: "A", text: "four" }, { label: "B", text: "five" }, { label: "C", text: "three" }, { label: "D", text: "six" }], correct_option: "C", points: 1 },
          { question: "\"My father ___ a doctor.\" — to'g'ri fe'l?", options: [{ label: "A", text: "am" }, { label: "B", text: "are" }, { label: "C", text: "is" }, { label: "D", text: "be" }], correct_option: "C", points: 2 },
          { question: "Animals: Cat, Dog, ___ — hayvon?", options: [{ label: "A", text: "Pen" }, { label: "B", text: "Bird" }, { label: "C", text: "Chair" }, { label: "D", text: "Table" }], correct_option: "B", points: 2 },
          { question: "\"Good morning\" qachon aytiladi?", options: [{ label: "A", text: "Kechqurun" }, { label: "B", text: "Tunda" }, { label: "C", text: "Ertalab" }, { label: "D", text: "Tushda" }], correct_option: "C", points: 2 },
        ],
      },
    ],
    lessons: ["Alphabet & Numbers", "Present Simple & Family"],
  },

  Tarix: {
    tests: [
      {
        name: "Tarix — Umumiy test 1",
        questions: [
          { question: "O'zbekiston mustaqillikka qachon erishdi?", options: [{ label: "A", text: "1991-yil 1-sentyabr" }, { label: "B", text: "1990-yil 1-yanvar" }, { label: "C", text: "1992-yil 8-dekabr" }, { label: "D", text: "1993-yil 31-avgust" }], correct_option: "A", points: 2 },
          { question: "Amir Temur qachon tug'ilgan?", options: [{ label: "A", text: "1336-yil" }, { label: "B", text: "1370-yil" }, { label: "C", text: "1400-yil" }, { label: "D", text: "1300-yil" }], correct_option: "A", points: 3 },
          { question: "Samarqandning qadimgi nomi?", options: [{ label: "A", text: "Ershi" }, { label: "B", text: "Marakanda" }, { label: "C", text: "Nisa" }, { label: "D", text: "Bityan" }], correct_option: "B", points: 3 },
          { question: "Ipak yo'li qaysi davlatlarni bog'lagan?", options: [{ label: "A", text: "Xitoy va G'arbiy Yevropa" }, { label: "B", text: "Hindiston va Afrika" }, { label: "C", text: "Rim va Misr" }, { label: "D", text: "Arabiston va Xitoy" }], correct_option: "A", points: 2 },
          { question: "Al-Xorazmiy qaysi fan asosini yaratgan?", options: [{ label: "A", text: "Fizika" }, { label: "B", text: "Algebra" }, { label: "C", text: "Kimyo" }, { label: "D", text: "Biologiya" }], correct_option: "B", points: 3 },
        ],
      },
      {
        name: "Tarix — Umumiy test 2",
        questions: [
          { question: "Zardushtiylikning muqaddas kitobi?", options: [{ label: "A", text: "Injil" }, { label: "B", text: "Tavrot" }, { label: "C", text: "Avesto" }, { label: "D", text: "Qur'on" }], correct_option: "C", points: 2 },
          { question: "Buyuk Xitoy devori nima uchun qurilgan?", options: [{ label: "A", text: "Sayyohlar uchun" }, { label: "B", text: "Ko'chmanchilardan himoya" }, { label: "C", text: "Suv to'siq" }, { label: "D", text: "Savdo yo'li" }], correct_option: "B", points: 2 },
          { question: "Demokratiya qayerda paydo bo'lgan?", options: [{ label: "A", text: "Rimda" }, { label: "B", text: "Misrda" }, { label: "C", text: "Afinada" }, { label: "D", text: "Hindistonda" }], correct_option: "C", points: 3 },
          { question: "Hammurapi qonunlari qayerda yaratilgan?", options: [{ label: "A", text: "Misr" }, { label: "B", text: "Bobil" }, { label: "C", text: "Rim" }, { label: "D", text: "Hindiston" }], correct_option: "B", points: 3 },
          { question: "Nil daryosi qaysi mamlakatda?", options: [{ label: "A", text: "Iroq" }, { label: "B", text: "Eron" }, { label: "C", text: "Misr" }, { label: "D", text: "Turkiya" }], correct_option: "C", points: 1 },
        ],
      },
    ],
    lessons: ["Qadimgi Sharq sivilizatsiyalari", "O'rta Osiyo tarixidan sahifalar"],
  },

  Geografiya: {
    tests: [
      {
        name: "Geografiya — 1-test",
        questions: [
          { question: "Yer sharidagi eng katta materik?", options: [{ label: "A", text: "Amerika" }, { label: "B", text: "Afrika" }, { label: "C", text: "Osiyo" }, { label: "D", text: "Antarktida" }], correct_option: "C", points: 2 },
          { question: "Dunyodagi eng chuqur ko'l?", options: [{ label: "A", text: "Kaspiy" }, { label: "B", text: "Baykal" }, { label: "C", text: "Orol" }, { label: "D", text: "Superior" }], correct_option: "B", points: 3 },
          { question: "O'zbekiston qaysi qit'ada?", options: [{ label: "A", text: "Yevropa" }, { label: "B", text: "Afrika" }, { label: "C", text: "Osiyo" }, { label: "D", text: "Amerika" }], correct_option: "C", points: 1 },
          { question: "Amudaryo qayerga quyiladi?", options: [{ label: "A", text: "Kaspiy dengiziga" }, { label: "B", text: "Orol dengiziga" }, { label: "C", text: "Qora dengiziga" }, { label: "D", text: "Fors ko'rfaziga" }], correct_option: "B", points: 2 },
          { question: "Yer sharidagi eng baland tog'?", options: [{ label: "A", text: "Elbrus" }, { label: "B", text: "K2" }, { label: "C", text: "Everest" }, { label: "D", text: "Kilimanjaro" }], correct_option: "C", points: 2 },
        ],
      },
      {
        name: "Geografiya — 2-test",
        questions: [
          { question: "O'zbekistonning poytaxti?", options: [{ label: "A", text: "Samarqand" }, { label: "B", text: "Buxoro" }, { label: "C", text: "Namangan" }, { label: "D", text: "Toshkent" }], correct_option: "D", points: 1 },
          { question: "Okeanlarga misal?", options: [{ label: "A", text: "Kaspiy, Orol" }, { label: "B", text: "Tinch, Atlantika" }, { label: "C", text: "Boltiq, Qora" }, { label: "D", text: "Baykal, Viktoriya" }], correct_option: "B", points: 2 },
          { question: "Ekvator nima?", options: [{ label: "A", text: "Yer o'qi" }, { label: "B", text: "Yer markazidan o'tuvchi chiziq" }, { label: "C", text: "Yer sirtini teng ikkiga bo'luvchi chiziq" }, { label: "D", text: "Meridian chiziq" }], correct_option: "C", points: 3 },
          { question: "Materiklar soni?", options: [{ label: "A", text: "5" }, { label: "B", text: "6" }, { label: "C", text: "7" }, { label: "D", text: "8" }], correct_option: "C", points: 2 },
          { question: "Sahara cho'li qayerda?", options: [{ label: "A", text: "Osiyo" }, { label: "B", text: "Afrika" }, { label: "C", text: "Amerika" }, { label: "D", text: "Avstraliya" }], correct_option: "B", points: 2 },
        ],
      },
    ],
    lessons: ["Yer shari va materiklar", "O'zbekiston tabiati va iqlimi"],
  },

  Biologiya: {
    tests: [
      {
        name: "Biologiya — 1-test",
        questions: [
          { question: "O'simliklar nima orqali nafas oladi?", options: [{ label: "A", text: "Ildiz" }, { label: "B", text: "Barg" }, { label: "C", text: "Gul" }, { label: "D", text: "Meva" }], correct_option: "B", points: 2 },
          { question: "Fotosintez nima?", options: [{ label: "A", text: "O'simlik chirishishi" }, { label: "B", text: "Quyosh nuri yordamida oziq yaratish" }, { label: "C", text: "O'simlik nafas olishi" }, { label: "D", text: "Suv yutilishi" }], correct_option: "B", points: 3 },
          { question: "Eng kichik tirik organizm?", options: [{ label: "A", text: "Chuvalchang" }, { label: "B", text: "Chivin" }, { label: "C", text: "Bakteriya" }, { label: "D", text: "Qurt" }], correct_option: "C", points: 2 },
          { question: "Qon qizil rangda — sababi?", options: [{ label: "A", text: "Oqsil" }, { label: "B", text: "Gemoglobin" }, { label: "C", text: "Yog'" }, { label: "D", text: "Kraxmal" }], correct_option: "B", points: 3 },
          { question: "Inson tanasida nechta suyak?", options: [{ label: "A", text: "100" }, { label: "B", text: "206" }, { label: "C", text: "300" }, { label: "D", text: "150" }], correct_option: "B", points: 3 },
        ],
      },
      {
        name: "Biologiya — 2-test",
        questions: [
          { question: "O'simliklar qanday ovqatlanadi?", options: [{ label: "A", text: "Boshqa hayvonlarni yeydi" }, { label: "B", text: "Fotosintez orqali" }, { label: "C", text: "Yerdan tayyor oziq oladi" }, { label: "D", text: "Havoni yutadi" }], correct_option: "B", points: 2 },
          { question: "Qaysi hayvon sut emizuvchi?", options: [{ label: "A", text: "Qushlar" }, { label: "B", text: "Baliq" }, { label: "C", text: "Ilon" }, { label: "D", text: "It" }], correct_option: "D", points: 1 },
          { question: "Ildizning asosiy vazifasi?", options: [{ label: "A", text: "Fotosintez" }, { label: "B", text: "Yer-suv yutish" }, { label: "C", text: "Gullash" }, { label: "D", text: "Meva berish" }], correct_option: "B", points: 2 },
          { question: "Hujayra nima?", options: [{ label: "A", text: "Organlar tizimi" }, { label: "B", text: "Tirik organizmning asosiy qurilish birligi" }, { label: "C", text: "To'qima turi" }, { label: "D", text: "Tizim" }], correct_option: "B", points: 3 },
          { question: "Qaysi organ qon tozalaydi?", options: [{ label: "A", text: "O'pka" }, { label: "B", text: "Yurak" }, { label: "C", text: "Buyrak" }, { label: "D", text: "Me'da" }], correct_option: "C", points: 3 },
        ],
      },
    ],
    lessons: ["O'simliklar dunyosi", "Inson tanasi tuzilishi"],
  },

  Informatika: {
    tests: [
      {
        name: "Informatika — 1-test",
        questions: [
          { question: "Kompyuterning \"miyasi\" nima?", options: [{ label: "A", text: "Monitor" }, { label: "B", text: "Protsessor (CPU)" }, { label: "C", text: "Klaviatura" }, { label: "D", text: "Printer" }], correct_option: "B", points: 2 },
          { question: "WWW nima?", options: [{ label: "A", text: "Dastur turi" }, { label: "B", text: "Jahon to'ri (World Wide Web)" }, { label: "C", text: "Kompyuter tili" }, { label: "D", text: "Antivirus" }], correct_option: "B", points: 2 },
          { question: "Faylni o'chirish tugmasi?", options: [{ label: "A", text: "Enter" }, { label: "B", text: "Escape" }, { label: "C", text: "Delete" }, { label: "D", text: "Caps Lock" }], correct_option: "C", points: 1 },
          { question: "1 kilobayt = ?", options: [{ label: "A", text: "100 bayt" }, { label: "B", text: "1024 bayt" }, { label: "C", text: "1000 bayt" }, { label: "D", text: "512 bayt" }], correct_option: "B", points: 3 },
          { question: "Sichqonchaning asosiy funksiyasi?", options: [{ label: "A", text: "Matn yozish" }, { label: "B", text: "Kursor boshqarish" }, { label: "C", text: "Ovoz chiqarish" }, { label: "D", text: "Chop etish" }], correct_option: "B", points: 1 },
        ],
      },
      {
        name: "Informatika — 2-test",
        questions: [
          { question: "Internet brauzeriga misol?", options: [{ label: "A", text: "Word" }, { label: "B", text: "Excel" }, { label: "C", text: "Chrome" }, { label: "D", text: "PowerPoint" }], correct_option: "C", points: 2 },
          { question: "Ctrl+C nima qiladi?", options: [{ label: "A", text: "Kesib oladi" }, { label: "B", text: "Ko'chirib oladi" }, { label: "C", text: "Qo'yadi" }, { label: "D", text: "O'chiradi" }], correct_option: "B", points: 2 },
          { question: "Dastur nima?", options: [{ label: "A", text: "Kompyuter qismi" }, { label: "B", text: "Kompyuterga buyruqlar to'plami" }, { label: "C", text: "Monitor turi" }, { label: "D", text: "Internet turi" }], correct_option: "B", points: 3 },
          { question: "Fayl kengaytmasi .docx — qaysi dastur?", options: [{ label: "A", text: "Excel" }, { label: "B", text: "Paint" }, { label: "C", text: "Word" }, { label: "D", text: "Notepad" }], correct_option: "C", points: 2 },
          { question: "Antivirus nima uchun?", options: [{ label: "A", text: "Tezlashtirish" }, { label: "B", text: "Virus va zararli dasturlardan himoya" }, { label: "C", text: "Internet uchun" }, { label: "D", text: "Fayllarni o'chirish" }], correct_option: "B", points: 2 },
        ],
      },
    ],
    lessons: ["Kompyuter qismlari va funksiyalari", "Internet va xavfsizlik asoslari"],
  },

  Texnologiya: {
    tests: [
      {
        name: "Texnologiya — 1-test",
        questions: [
          { question: "Origami nima?", options: [{ label: "A", text: "Loy ishlari" }, { label: "B", text: "Qog'ozdan shakllar yasash" }, { label: "C", text: "Rasm chizish" }, { label: "D", text: "Kashtachilik" }], correct_option: "B", points: 2 },
          { question: "Applikatsiya uchun nima kerak?", options: [{ label: "A", text: "Loy va suv" }, { label: "B", text: "Qog'oz, qaychi, yelim" }, { label: "C", text: "Bo'yoq va cho'tka" }, { label: "D", text: "Ip va ignа" }], correct_option: "B", points: 2 },
          { question: "Kashtachilikda nima ishlatiladi?", options: [{ label: "A", text: "Qaychi va qog'oz" }, { label: "B", text: "Ip va igna" }, { label: "C", text: "Loy va suv" }, { label: "D", text: "Bo'yoq" }], correct_option: "B", points: 2 },
          { question: "Qaysi material tabiiy hisoblanadi?", options: [{ label: "A", text: "Plastmassa" }, { label: "B", text: "Shisha" }, { label: "C", text: "Paxta" }, { label: "D", text: "Metall" }], correct_option: "C", points: 3 },
          { question: "Loy qayerdan olinadi?", options: [{ label: "A", text: "Daraxtdan" }, { label: "B", text: "Yerdan" }, { label: "C", text: "Dengizdan" }, { label: "D", text: "O'simlikdan" }], correct_option: "B", points: 1 },
        ],
      },
      {
        name: "Texnologiya — 2-test",
        questions: [
          { question: "Qog'oz nechta o'lchamda bo'ladi? (A formatlari)", options: [{ label: "A", text: "1-2" }, { label: "B", text: "Bir xil" }, { label: "C", text: "A1-A7 va boshqalar" }, { label: "D", text: "Faqat A4" }], correct_option: "C", points: 2 },
          { question: "Pishirilgan loydan nimalar yasaladi?", options: [{ label: "A", text: "Qog'oz" }, { label: "B", text: "Idish-tovoq, chinni" }, { label: "C", text: "Mato" }, { label: "D", text: "Yog'och buyumlar" }], correct_option: "B", points: 2 },
          { question: "Asbob-uskunalar bilan ishlashda nima muhim?", options: [{ label: "A", text: "Tez ishlash" }, { label: "B", text: "Xavfsizlik qoidalari" }, { label: "C", text: "Ko'p narsa yasash" }, { label: "D", text: "Balandroq ishlash" }], correct_option: "B", points: 3 },
          { question: "Ipak qayerdan olinadi?", options: [{ label: "A", text: "Paxta" }, { label: "B", text: "Jun" }, { label: "C", text: "Ipak qurti" }, { label: "D", text: "Zig'ir" }], correct_option: "C", points: 3 },
          { question: "Tikuv mashina nima uchun?", options: [{ label: "A", text: "Qog'oz kesish" }, { label: "B", text: "Mato tikish" }, { label: "C", text: "Bo'yash" }, { label: "D", text: "Yog'och kesish" }], correct_option: "B", points: 1 },
        ],
      },
    ],
    lessons: ["Qog'oz va loy ishlari", "Mato va kashtachilik"],
  },

  "Tasviriy san'at": {
    tests: [
      {
        name: "Tasviriy san'at — 1-test",
        questions: [
          { question: "Asosiy ranglar qaysilar?", options: [{ label: "A", text: "Qizil, sariq, ko'k" }, { label: "B", text: "Yashil, to'q sariq, binafsha" }, { label: "C", text: "Qora, oq, kulrang" }, { label: "D", text: "Jigarrang, zangori, qo'ng'ir" }], correct_option: "A", points: 2 },
          { question: "Natyurmort nima?", options: [{ label: "A", text: "Tabiat manzarasi" }, { label: "B", text: "Odam surati" }, { label: "C", text: "Harakatsiz narsalar tasviri" }, { label: "D", text: "Abstrakt rasm" }], correct_option: "C", points: 3 },
          { question: "Portret nima tasvirlaydi?", options: [{ label: "A", text: "Tabiat" }, { label: "B", text: "Inson yuzi va ko'rinishi" }, { label: "C", text: "Shahar" }, { label: "D", text: "Hayvonlar" }], correct_option: "B", points: 2 },
          { question: "Bo'yoqlarni aralashtirish natijasi: sariq + ko'k = ?", options: [{ label: "A", text: "Qizil" }, { label: "B", text: "Binafsha" }, { label: "C", text: "Yashil" }, { label: "D", text: "To'q sariq" }], correct_option: "C", points: 3 },
          { question: "Karandash bilan chiziq turlaridan biri?", options: [{ label: "A", text: "Silliq" }, { label: "B", text: "To'lqinsimon" }, { label: "C", text: "Aylana" }, { label: "D", text: "Barchasida to'g'ri" }], correct_option: "D", points: 2 },
        ],
      },
      {
        name: "Tasviriy san'at — 2-test",
        questions: [
          { question: "Peyzaj nima?", options: [{ label: "A", text: "Odam tasviri" }, { label: "B", text: "Tabiat manzarasi tasviri" }, { label: "C", text: "Harakatsiz narsalar" }, { label: "D", text: "Arxitektura" }], correct_option: "B", points: 2 },
          { question: "Akvarell nima?", options: [{ label: "A", text: "Moy bo'yoq" }, { label: "B", text: "Suv bilan suyuladigan bo'yoq" }, { label: "C", text: "Qo'rg'oshin qalam" }, { label: "D", text: "Pastell" }], correct_option: "B", points: 3 },
          { question: "Geometrik shakllar misolini ko'rsating?", options: [{ label: "A", text: "Daraxt, gul" }, { label: "B", text: "Uchburchak, kvadrat, doira" }, { label: "C", text: "Tog', daryo" }, { label: "D", text: "Uy, ko'cha" }], correct_option: "B", points: 1 },
          { question: "Naqsh nima?", options: [{ label: "A", text: "Tasodifiy chiziq" }, { label: "B", text: "Takrorlanuvchi bezak elementi" }, { label: "C", text: "Rasm turi" }, { label: "D", text: "Grafika turi" }], correct_option: "B", points: 2 },
          { question: "Qizil + sariq = ?", options: [{ label: "A", text: "Ko'k" }, { label: "B", text: "Yashil" }, { label: "C", text: "To'q sariq (apelsin)" }, { label: "D", text: "Binafsha" }], correct_option: "C", points: 3 },
        ],
      },
    ],
    lessons: ["Ranglar va geometrik shakllar", "Natyurmort va peyzaj asoslari"],
  },

  Algebra: {
    tests: [
      {
        name: "Algebra — 1-test",
        questions: [
          { question: "x + 5 = 12. x = ?", options: [{ label: "A", text: "5" }, { label: "B", text: "7" }, { label: "C", text: "17" }, { label: "D", text: "6" }], correct_option: "B", points: 2 },
          { question: "2x = 18. x = ?", options: [{ label: "A", text: "9" }, { label: "B", text: "16" }, { label: "C", text: "20" }, { label: "D", text: "36" }], correct_option: "A", points: 2 },
          { question: "3x - 6 = 9. x = ?", options: [{ label: "A", text: "3" }, { label: "B", text: "4" }, { label: "C", text: "5" }, { label: "D", text: "6" }], correct_option: "C", points: 3 },
          { question: "a² + b² = c² — bu qaysi teoreма?", options: [{ label: "A", text: "Pifagor" }, { label: "B", text: "Ferma" }, { label: "C", text: "Tales" }, { label: "D", text: "Evklid" }], correct_option: "A", points: 3 },
          { question: "Algebraning asoschisi kim?", options: [{ label: "A", text: "Evklid" }, { label: "B", text: "Arastu" }, { label: "C", text: "Al-Xorazmiy" }, { label: "D", text: "Newton" }], correct_option: "C", points: 3 },
        ],
      },
      {
        name: "Algebra — 2-test",
        questions: [
          { question: "5x + 3 = 23. x = ?", options: [{ label: "A", text: "3" }, { label: "B", text: "4" }, { label: "C", text: "5" }, { label: "D", text: "6" }], correct_option: "B", points: 3 },
          { question: "(-3) × (-4) = ?", options: [{ label: "A", text: "-12" }, { label: "B", text: "-7" }, { label: "C", text: "12" }, { label: "D", text: "7" }], correct_option: "C", points: 2 },
          { question: "Manfiy son × Manfiy son = ?", options: [{ label: "A", text: "Manfiy" }, { label: "B", text: "Musbat" }, { label: "C", text: "Nol" }, { label: "D", text: "Aniqlanmagan" }], correct_option: "B", points: 2 },
          { question: "|−7| = ?", options: [{ label: "A", text: "-7" }, { label: "B", text: "0" }, { label: "C", text: "7" }, { label: "D", text: "49" }], correct_option: "C", points: 2 },
          { question: "x² = 25. x = ?", options: [{ label: "A", text: "5" }, { label: "B", text: "±5" }, { label: "C", text: "-5" }, { label: "D", text: "12.5" }], correct_option: "B", points: 3 },
        ],
      },
    ],
    lessons: ["Algebraik ifodalar va tenglamalar", "Manfiy sonlar va modullari"],
  },

  "O'zbek tili": {
    tests: [
      {
        name: "O'zbek tili — 1-test",
        questions: [
          { question: "O'zbek tili davlat tili sifatida qabul qilingan yil?", options: [{ label: "A", text: "1989" }, { label: "B", text: "1991" }, { label: "C", text: "1995" }, { label: "D", text: "2000" }], correct_option: "A", points: 3 },
          { question: "O'zbek alifbosi qachon lotin yozuviga o'tilgan?", options: [{ label: "A", text: "1993" }, { label: "B", text: "1995" }, { label: "C", text: "2000" }, { label: "D", text: "2005" }], correct_option: "B", points: 3 },
          { question: "\"Mehribon\" so'zida nechta harf?", options: [{ label: "A", text: "7" }, { label: "B", text: "8" }, { label: "C", text: "9" }, { label: "D", text: "6" }], correct_option: "B", points: 2 },
          { question: "So'z yasovchi qo'shimcha?", options: [{ label: "A", text: "-da" }, { label: "B", text: "-chi" }, { label: "C", text: "-ni" }, { label: "D", text: "-ga" }], correct_option: "B", points: 2 },
          { question: "\"Kitoblar\" so'zida qanday qo'shimcha bor?", options: [{ label: "A", text: "Kelishik" }, { label: "B", text: "Ko'plik" }, { label: "C", text: "Egalik" }, { label: "D", text: "Fe'l" }], correct_option: "B", points: 2 },
        ],
      },
      {
        name: "O'zbek tili — 2-test",
        questions: [
          { question: "Imlo qoidasi: \"Baxt\" so'zini qo'sh so'z bilan yozing?", options: [{ label: "A", text: "baxt-saodat" }, { label: "B", text: "baxt saodat" }, { label: "C", text: "baxt_saodat" }, { label: "D", text: "Baxtsaodat" }], correct_option: "A", points: 2 },
          { question: "O'zaro sinonim so'zlar?", options: [{ label: "A", text: "Baland — past" }, { label: "B", text: "Katta — ulkan" }, { label: "C", text: "Issiq — sovuq" }, { label: "D", text: "Qora — oq" }], correct_option: "B", points: 2 },
          { question: "Antonim nima?", options: [{ label: "A", text: "Bir xil ma'noli so'zlar" }, { label: "B", text: "Qarama-qarshi ma'noli so'zlar" }, { label: "C", text: "Ko'p ma'noli so'zlar" }, { label: "D", text: "Yangi so'zlar" }], correct_option: "B", points: 2 },
          { question: "Paronim so'zlarga misol?", options: [{ label: "A", text: "Baland–past" }, { label: "B", text: "Adabiy–adabiyot" }, { label: "C", text: "Kitob–daftar" }, { label: "D", text: "Issiq–sovuq" }], correct_option: "B", points: 3 },
          { question: "Buyruq maylidagi gap?", options: [{ label: "A", text: "Men maktabga bordim." }, { label: "B", text: "U o'qiydi." }, { label: "C", text: "Kitobni o'qi!" }, { label: "D", text: "Ular o'ynaydi." }], correct_option: "C", points: 3 },
        ],
      },
    ],
    lessons: ["O'zbek tili va imlo qoidalari", "So'z yasalishi va sinonimlar"],
  },
};

async function main() {
  const allSubjects = await db.select().from(subjects);
  console.log(`Found ${allSubjects.length} subjects\n`);

  let totalTests = 0;
  let totalQuestions = 0;
  let totalLessons = 0;

  for (const subject of allSubjects) {
    const data = SUBJECT_DATA[subject.name];
    if (!data) {
      console.log(`  SKIP (no data): ${subject.name}`);
      continue;
    }

    // Insert 2 tests
    for (const testData of data.tests) {
      const [test] = await db
        .insert(tests)
        .values({
          subject_id: subject.id,
          name: testData.name,
          start_time: START,
          end_time: END,
        })
        .returning();

      const questionRows = testData.questions.map((q, i) => ({
        test_id: test.id,
        question: q.question,
        options: q.options,
        correct_option: q.correct_option,
        points: q.points,
        sort_order: i + 1,
      }));

      await db.insert(test_questions).values(questionRows);
      console.log(`  + Test: ${testData.name} (${questionRows.length} savol)`);
      totalTests++;
      totalQuestions += questionRows.length;
    }

    // Insert 2 lessons
    for (const lessonTitle of data.lessons) {
      await db.insert(lessons).values({
        subject_id: subject.id,
        title: lessonTitle,
        version: 1,
      });
      console.log(`  + Darslik: ${lessonTitle}`);
      totalLessons++;
    }
  }

  console.log(`\nDone: ${totalTests} tests, ${totalQuestions} questions, ${totalLessons} lessons`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
