import json, re

TITLES = [
    "Natural sonlar va amallar",
    "Kasrlar va o'nli kasrlar",
    "So'z turkumlari",
    "Gap va uning bo'laklari",
    "Xalq og'zaki ijodi",
    "O'zbek klasssik adabiyoti",
    "Alphabet & Numbers",
    "Present Simple & Family",
    "Qadimgi Sharq sivilizatsiyalari",
    "O'rta Osiyo tarixidan sahifalar",
    "Yer shari va materiklar",
    "O'zbekiston tabiati va iqlimi",
    "O'simliklar dunyosi",
    "Inson tanasi tuzilishi",
    "Kompyuter qismlari va funksiyalari",
    "Internet va xavfsizlik asoslari",
    "Qog'oz va loy ishlari",
    "Mato va kashtachilik",
    "Ranglar va geometrik shakllar",
    "Natyurmort va peyzaj asoslari",
    "Algebraik ifodalar va tenglamalar",
    "Manfiy sonlar va modullari",
    "O'zbek tili va imlo qoidalari",
    "So'z yasalishi va sinonimlar",
]

def slugify(title):
    s = title.lower()
    s = re.sub(r"['`‘’]", "", s)
    s = s.encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-z0-9\s_-]", "", s)
    s = re.sub(r"\s+", "_", s.strip())
    return s[:60] or "lesson"

mapping = {t: f"/api/files/lessons/{slugify(t)}.docx" for t in TITLES}
with open("lesson_file_mapping.json", "w", encoding="utf-8") as f:
    json.dump(mapping, f, ensure_ascii=False, indent=2)
print("saved lesson_file_mapping.json")
for t, u in mapping.items():
    print(f"  {t}: {u}")
