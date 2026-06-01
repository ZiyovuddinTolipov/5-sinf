import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { db } from "../src/db";
import {
  lessons,
  rankings,
  subjects,
  test_questions,
  tests,
  user_tests,
  user as userTable,
  profiles,
} from "../src/db/schema";
import { auth } from "../src/lib/auth";

const SUBJECT_DATA = [
  { name: "Matematika", lessons: ["Natural sonlar", "Qo'shish va ayirish", "Ko'paytirish", "Bo'lish", "Kasrlar", "Geometrik shakllar", "Burchaklar", "Masalalar yechish"] },
  { name: "Ona tili", lessons: ["Tovush va harf", "So'z turkumlari", "Ot", "Sifat", "Fe'l", "Gap bo'laklari", "Imlo qoidalari", "Matn tuzish"] },
  { name: "Adabiyot", lessons: ["Xalq og'zaki ijodi", "Maqollar", "Topishmoqlar", "She'r", "Hikoya", "Ertaklar", "Yozuvchilar hayoti"] },
  { name: "Ingliz tili", lessons: ["Alphabet", "Numbers 1-100", "Family", "Colors", "Animals", "My school", "Daily routine", "Present Simple"] },
  { name: "Tarix", lessons: ["Tarix nima?", "Qadimgi davr", "O'rta asrlar", "Amir Temur davri", "Mustaqillik", "Madaniy meros"] },
  { name: "Geografiya", lessons: ["Yer shari", "Materiklar", "Okeanlar", "O'zbekiston tabiati", "Iqlim", "Daryolar va ko'llar"] },
  { name: "Biologiya", lessons: ["Tabiat va inson", "O'simliklar dunyosi", "Hayvonlar dunyosi", "Inson tanasi", "Sog'lom hayot", "Atrof-muhitni asrash"] },
  { name: "Informatika", lessons: ["Kompyuter qismlari", "Klaviatura", "Sichqoncha", "Fayl va papka", "Matn muharriri", "Internet asoslari"] },
  { name: "Texnologiya", lessons: ["Qog'oz ishlari", "Origami", "Applikatsiya", "Tabiiy materiallar", "Loy ishlari"] },
  { name: "Tasviriy san'at", lessons: ["Ranglar", "Geometrik naqshlar", "Tabiat tasviri", "Natyurmort", "Portret asoslari"] },
];

interface QData {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  points: number;
}

const QUESTION_BANK: Record<string, QData[]> = {
  Matematika: [
    { question: "125 + 75 = ?", options: { A: "180", B: "200", C: "210", D: "190" }, correct: "B", points: 1 },
    { question: "7 × 8 = ?", options: { A: "54", B: "56", C: "58", D: "64" }, correct: "B", points: 1 },
    { question: "144 ÷ 12 = ?", options: { A: "10", B: "11", C: "12", D: "14" }, correct: "C", points: 2 },
    { question: "Eng kichik natural son qaysi?", options: { A: "0", B: "1", C: "-1", D: "10" }, correct: "B", points: 2 },
    { question: "1 km = ? metr", options: { A: "100", B: "500", C: "1000", D: "10000" }, correct: "C", points: 1 },
    { question: "Uchburchakning ichki burchaklari yig'indisi necha gradus?", options: { A: "90", B: "180", C: "270", D: "360" }, correct: "B", points: 3 },
    { question: "1/2 + 1/4 = ?", options: { A: "1/4", B: "2/6", C: "3/4", D: "1/2" }, correct: "C", points: 3 },
    { question: "Kvadratning tomoni 5 sm bo'lsa, perimetri qancha?", options: { A: "10", B: "15", C: "20", D: "25" }, correct: "C", points: 2 },
  ],
  "Ona tili": [
    { question: "\"Maktab\" so'zida nechta unli tovush bor?", options: { A: "1", B: "2", C: "3", D: "4" }, correct: "B", points: 1 },
    { question: "Quyidagilardan qaysi biri ot?", options: { A: "yugurmoq", B: "go'zal", C: "kitob", D: "tez" }, correct: "C", points: 1 },
    { question: "\"Yashil\" so'zi qaysi so'z turkumi?", options: { A: "ot", B: "sifat", C: "fe'l", D: "ravish" }, correct: "B", points: 2 },
    { question: "Gapning bosh bo'laklari qaysilar?", options: { A: "ega va kesim", B: "aniqlovchi", C: "to'ldiruvchi", D: "hol" }, correct: "A", points: 2 },
    { question: "Bo'g'in nima?", options: { A: "tovush", B: "harf", C: "bir nafas bilan aytiladigan tovushlar guruhi", D: "so'z" }, correct: "C", points: 2 },
  ],
  Adabiyot: [
    { question: "\"O'tkan kunlar\" asari muallifi kim?", options: { A: "A. Qodiriy", B: "A. Navoiy", C: "A. Oripov", D: "G'. G'ulom" }, correct: "A", points: 2 },
    { question: "Maqol nima?", options: { A: "qisqa hikoya", B: "she'r", C: "qisqa, hikmatli ibora", D: "ertak" }, correct: "C", points: 1 },
    { question: "\"Alpomish\" qaysi xalq dostoni?", options: { A: "rus", B: "o'zbek", C: "qozoq", D: "tojik" }, correct: "B", points: 2 },
    { question: "Topishmoqning maqsadi nima?", options: { A: "kuldirish", B: "o'rgatish", C: "fikrlashga undash", D: "qo'rqitish" }, correct: "C", points: 2 },
  ],
  "Ingliz tili": [
    { question: "What is 'kitob' in English?", options: { A: "pen", B: "book", C: "school", D: "table" }, correct: "B", points: 1 },
    { question: "'Salom' in English is...", options: { A: "Goodbye", B: "Thanks", C: "Hello", D: "Sorry" }, correct: "C", points: 1 },
    { question: "How do you say 'olma'?", options: { A: "apple", B: "orange", C: "banana", D: "grape" }, correct: "A", points: 1 },
    { question: "What color is the sun?", options: { A: "blue", B: "yellow", C: "green", D: "black" }, correct: "B", points: 2 },
    { question: "'Maktab' is...", options: { A: "house", B: "school", C: "car", D: "tree" }, correct: "B", points: 1 },
  ],
  Tarix: [
    { question: "Amir Temur necha yilda tug'ilgan?", options: { A: "1336", B: "1370", C: "1405", D: "1500" }, correct: "A", points: 2 },
    { question: "O'zbekiston Mustaqillik kuni qachon?", options: { A: "1 sentabr", B: "9 may", C: "1 yanvar", D: "21 mart" }, correct: "A", points: 1 },
    { question: "Samarqand qaysi davlatning poytaxti edi?", options: { A: "Sharqiy Rim", B: "Amir Temur saltanati", C: "Misr", D: "Rim" }, correct: "B", points: 2 },
    { question: "Buyuk Ipak yo'li orqali nima olib o'tilgan?", options: { A: "faqat ipak", B: "faqat oziq-ovqat", C: "turli mahsulotlar va madaniyat", D: "hech narsa" }, correct: "C", points: 3 },
  ],
  Geografiya: [
    { question: "O'zbekiston poytaxti qaysi?", options: { A: "Samarqand", B: "Toshkent", C: "Buxoro", D: "Andijon" }, correct: "B", points: 1 },
    { question: "Materiklar soni qancha?", options: { A: "5", B: "6", C: "7", D: "8" }, correct: "B", points: 2 },
    { question: "Eng katta okean qaysi?", options: { A: "Atlantika", B: "Tinch", C: "Hind", D: "Shimoliy muz" }, correct: "B", points: 2 },
    { question: "Amudaryo qaysi dengizga quyiladi?", options: { A: "Kaspiy", B: "Orol", C: "Qora", D: "Boltiq" }, correct: "B", points: 2 },
  ],
  Biologiya: [
    { question: "Inson tanasida nechta yurak bor?", options: { A: "1", B: "2", C: "3", D: "4" }, correct: "A", points: 1 },
    { question: "O'simliklar nima ishlab chiqaradi?", options: { A: "karbonat angidrid", B: "kislorod", C: "azot", D: "metan" }, correct: "B", points: 2 },
    { question: "Sutemizuvchilarga misol kelt:", options: { A: "qush", B: "baliq", C: "it", D: "ilon" }, correct: "C", points: 1 },
    { question: "Inson tanasidagi suyaklar soni taxminan...", options: { A: "100", B: "150", C: "206", D: "300" }, correct: "C", points: 3 },
  ],
  Informatika: [
    { question: "Kompyuterning miyasi nima?", options: { A: "monitor", B: "klaviatura", C: "protsessor", D: "sichqoncha" }, correct: "C", points: 2 },
    { question: "Internet nima?", options: { A: "kompyuter o'yini", B: "kompyuterlar tarmog'i", C: "dastur", D: "tovush" }, correct: "B", points: 1 },
    { question: "Faylni saqlash uchun qaysi tugma?", options: { A: "Delete", B: "Ctrl+S", C: "Esc", D: "F1" }, correct: "B", points: 2 },
    { question: ".docx kengaytmasi qaysi dastur uchun?", options: { A: "Excel", B: "Paint", C: "Word", D: "PowerPoint" }, correct: "C", points: 2 },
  ],
  Texnologiya: [
    { question: "Origami qanday san'at?", options: { A: "rasm chizish", B: "qog'oz buklash", C: "o'yib yasash", D: "qo'shiq aytish" }, correct: "B", points: 1 },
    { question: "Loydan nima yasash mumkin?", options: { A: "kitob", B: "qadoq", C: "haykalcha", D: "kiyim" }, correct: "C", points: 2 },
  ],
  "Tasviriy san'at": [
    { question: "Asosiy ranglar nechta?", options: { A: "2", B: "3", C: "5", D: "7" }, correct: "B", points: 1 },
    { question: "Ko'k + Sariq = ?", options: { A: "qizil", B: "yashil", C: "binafsha", D: "to'q sariq" }, correct: "B", points: 2 },
    { question: "Natyurmort nima?", options: { A: "odam portreti", B: "tabiat", C: "narsalar tasviri", D: "hayvon" }, correct: "C", points: 2 },
  ],
};

const UZBEK_FIRST = [
  "Akmal", "Anvar", "Aziz", "Bekzod", "Botir", "Diyor", "Elyor", "Farrux", "Hasan", "Husan",
  "Ilhom", "Jamol", "Javohir", "Kamol", "Komil", "Mahmud", "Nodir", "Otabek", "Rustam", "Sardor",
  "Sherzod", "Shoxruh", "Sirojiddin", "Sulton", "Temur", "Ulug'bek", "Umid", "Vali", "Yunus", "Zafar",
  "Zohid", "Asadbek", "Behruz", "Dilshod", "Eldor", "Fazliddin", "G'ayrat", "Hamid", "Iskandar", "Jasur",
  "Aziza", "Charos", "Dilnoza", "Durdona", "Feruza", "Gulnora", "Hilola", "Iroda", "Jamila", "Kamola",
  "Lola", "Madina", "Malika", "Munisa", "Nargiza", "Nigora", "Nilufar", "Oygul", "Rayhona", "Sevara",
  "Shahnoza", "Shoxida", "Sitora", "Surayyo", "Umida", "Yulduz", "Zarina", "Zilola", "Zuhra", "Aziza",
];

const UZBEK_LAST = [
  "Karimov", "Yusupov", "Nazarov", "Olimov", "Sodiqov", "Rahimov", "Ergashev", "Tursunov", "Ahmedov", "Hasanov",
  "Mirzayev", "Yo'ldoshev", "Saidov", "Qodirov", "Toshmatov", "Husanov", "Ismoilov", "Tojiboyev", "Rasulov", "Mahmudov",
  "Karimova", "Yusupova", "Nazarova", "Olimova", "Sodiqova", "Rahimova", "Ergasheva", "Tursunova", "Ahmedova", "Hasanova",
];

function rand<T>(arr: T[]): T {
  // Deterministic pseudo-random based on Date.now? Drizzle scripts can use Math.random
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function clearDemoData() {
  console.log("Tozalash...");
  await db.delete(user_tests);
  await db.delete(rankings);
  await db.delete(test_questions);
  await db.delete(tests);
  await db.delete(lessons);
  await db.delete(subjects);
  // delete profiles where user_id != admin
  // delete non-admin users
  const allUsers = await db.select({ id: userTable.id, email: userTable.email }).from(userTable);
  for (const u of allUsers) {
    if (u.email === process.env.SEED_ADMIN_EMAIL) continue;
    await db.delete(userTable).where(sql`${userTable.id} = ${u.id}`);
  }
  console.log("Tozalandi");
}

async function main() {
  await clearDemoData();

  console.log("Fanlar va darslar yaratilmoqda...");
  const subjectIds: Record<string, string> = {};
  for (const s of SUBJECT_DATA) {
    const [row] = await db.insert(subjects).values({ name: s.name }).returning({ id: subjects.id });
    subjectIds[s.name] = row.id;
    for (const title of s.lessons) {
      await db.insert(lessons).values({ subject_id: row.id, title });
    }
  }
  console.log(`${SUBJECT_DATA.length} ta fan, ${SUBJECT_DATA.reduce((a, s) => a + s.lessons.length, 0)} ta darslik`);

  console.log("Testlar va savollar yaratilmoqda...");
  const testIds: string[] = [];
  const questionPointsByTest: Record<string, { questionId: string; correct: "A" | "B" | "C" | "D"; points: number }[]> = {};

  const now = Date.now();
  for (const [subjectName, qs] of Object.entries(QUESTION_BANK)) {
    const subjId = subjectIds[subjectName];
    if (!subjId) continue;

    // Split into 2 tests per subject
    const chunkSize = Math.ceil(qs.length / 2);
    const chunks: QData[][] = [];
    for (let i = 0; i < qs.length; i += chunkSize) chunks.push(qs.slice(i, i + chunkSize));

    let chunkIdx = 0;
    for (const chunk of chunks) {
      chunkIdx++;
      const start = new Date(now - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const end = new Date(now + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      const [t] = await db
        .insert(tests)
        .values({
          subject_id: subjId,
          name: `${subjectName} testi #${chunkIdx}`,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        })
        .returning({ id: tests.id });
      testIds.push(t.id);
      questionPointsByTest[t.id] = [];

      let sortOrder = 0;
      for (const q of chunk) {
        const opts = [
          { label: "A", text: q.options.A },
          { label: "B", text: q.options.B },
          { label: "C", text: q.options.C },
          { label: "D", text: q.options.D },
        ];
        const [qRow] = await db
          .insert(test_questions)
          .values({
            test_id: t.id,
            question: q.question,
            options: opts,
            correct_option: q.correct,
            points: q.points,
            sort_order: sortOrder++,
          })
          .returning({ id: test_questions.id });
        questionPointsByTest[t.id].push({ questionId: qRow.id, correct: q.correct, points: q.points });
      }
    }
  }
  console.log(`${testIds.length} ta test, ${Object.values(questionPointsByTest).reduce((a, v) => a + v.length, 0)} ta savol`);

  console.log("100 ta o'quvchi yaratilmoqda...");
  const userIds: string[] = [];
  const usedEmails = new Set<string>();
  let createdCount = 0;
  let attempt = 0;
  while (createdCount < 100 && attempt < 200) {
    attempt++;
    const first = rand(UZBEK_FIRST);
    const last = rand(UZBEK_LAST);
    const num = randomBetween(10, 999);
    const baseEmail = `${first.toLowerCase().replace(/'/g, "")}.${last.toLowerCase().replace(/'/g, "")}${num}@5sinf.uz`;
    if (usedEmails.has(baseEmail)) continue;
    usedEmails.add(baseEmail);

    try {
      const res = await auth.api.signUpEmail({
        body: {
          email: baseEmail,
          password: "Demo12345!",
          name: `${first} ${last}`,
        },
      });
      const userId = res.user.id;
      userIds.push(userId);

      // Update profile name
      await db
        .insert(profiles)
        .values({ user_id: userId, full_name: `${first} ${last}` })
        .onConflictDoUpdate({
          target: profiles.user_id,
          set: { full_name: `${first} ${last}`, updated_at: sql`now()` },
        });
      createdCount++;
      if (createdCount % 25 === 0) console.log(`  ${createdCount} ta yaratildi...`);
    } catch (err) {
      // skip duplicate
    }
  }
  console.log(`${userIds.length} ta o'quvchi yaratildi`);

  console.log("Test natijalari (har bir o'quvchi tasodifiy testlarni topshiradi)...");
  let totalAnswers = 0;
  for (const uid of userIds) {
    // Each user takes 2-6 random tests
    const testsToTake = Math.min(testIds.length, randomBetween(2, 6));
    const chosenTestIds = [...testIds].sort(() => Math.random() - 0.5).slice(0, testsToTake);

    for (const tid of chosenTestIds) {
      const questions = questionPointsByTest[tid] ?? [];
      // Skill level per user (0.4 to 0.9 chance of correct)
      const skill = 0.4 + Math.random() * 0.5;
      const inserts = questions.map((q) => {
        const optionLabels: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
        const correct = Math.random() < skill;
        const selected = correct ? q.correct : rand(optionLabels.filter((o) => o !== q.correct));
        return {
          user_id: uid,
          question_id: q.questionId,
          selected_option: selected,
          points_earned: correct ? q.points : 0,
        };
      });

      if (inserts.length === 0) continue;
      try {
        await db.insert(user_tests).values(inserts);
        totalAnswers += inserts.length;
      } catch {
        // skip
      }
    }
  }
  console.log(`${totalAnswers} ta javob yozildi`);

  console.log("Reytinglar hisoblanmoqda...");
  // For each user, compute totals and upsert rankings
  for (const uid of userIds) {
    const [agg] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${user_tests.points_earned}),0)::int`,
        taken: sql<number>`COUNT(${user_tests.id})::int`,
      })
      .from(user_tests)
      .where(sql`${user_tests.user_id} = ${uid}`);

    if (agg.taken > 0) {
      await db
        .insert(rankings)
        .values({ user_id: uid, total_points: agg.total, tests_taken: agg.taken })
        .onConflictDoUpdate({
          target: rankings.user_id,
          set: { total_points: agg.total, tests_taken: agg.taken, updated_at: sql`now()` },
        });
    }
  }

  // Recompute rank positions
  await db.execute(sql`
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY total_points DESC, tests_taken DESC) AS new_rank
      FROM rankings
    )
    UPDATE rankings r SET rank_position = ranked.new_rank
    FROM ranked WHERE r.id = ranked.id
  `);
  console.log("Reytinglar yangilandi");

  console.log("\nTUGADI!");
  console.log(`- Fanlar: ${SUBJECT_DATA.length}`);
  console.log(`- Darsliklar: ${SUBJECT_DATA.reduce((a, s) => a + s.lessons.length, 0)}`);
  console.log(`- Testlar: ${testIds.length}`);
  console.log(`- O'quvchilar: ${userIds.length} (parol: Demo12345!)`);
  console.log(`- Test javoblari: ${totalAnswers}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
