import os
import re
import json

articles_dir = r"C:\Users\Jonathan\Desktop\blogs\HadithCriticBlog\src\content\articles"
files = [f for f in os.listdir(articles_dir) if f.endswith(".mdx")]

articles = []

for f in files:
    path = os.path.join(articles_dir, f)
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
        
        # parse frontmatter
        title = ""
        category = ""
        
        match_title = re.search(r'title:\s*["\']?(.*?)["\']?\n', content)
        if match_title: title = match_title.group(1).strip()
            
        match_cat = re.search(r'category:\s*["\']?(.*?)["\']?\n', content)
        if match_cat: category = match_cat.group(1).strip()
            
        articles.append({
            "file": f,
            "title": title,
            "category": category
        })

print(f"Total articles: {len(articles)}")

# Current distribution
dist = {}
for a in articles:
    dist[a['category']] = dist.get(a['category'], 0) + 1
print("Current distribution:", dist)

# Propose 4 categories
# 1. Prophecies & Eschatology (combines Prophecies + Hadith Prophecies)
# 2. Theology & Epistemology (combines Theology + Philosophy + Hadith Criticism)
# 3. Transmission & Narrators (split from History)
# 4. Origins & Early History (split from History)

def categorize(a):
    cat = a['category']
    title = a['title'].lower()
    
    if cat in ["Prophecies", "Hadith Prophecies"]:
        return "Prophecies & Eschatology"
    elif cat in ["Theology", "Philosophy", "Hadith Criticism"]:
        return "Theology & Epistemology"
    elif cat == "History":
        # simple heuristic for splitting History
        transmission_keywords = ["isnad", "narrator", "transmitter", "hadith", "bukhari", "amash", "hisham", "shia", "fabrication", "transmission"]
        if any(kw in title or kw in a['file'] for kw in transmission_keywords):
            return "Transmission & Narrators"
        else:
            return "Origins & Early History"
    else:
        return "Origins & Early History"

new_dist = {}
mapping = {}
for a in articles:
    new_cat = categorize(a)
    new_dist[new_cat] = new_dist.get(new_cat, 0) + 1
    if new_cat not in mapping:
        mapping[new_cat] = []
    mapping[new_cat].append(a)

print("New distribution:", new_dist)

with open(r"C:\Users\Jonathan\Desktop\blogs\HadithCriticBlog\mapping.json", "w") as f:
    json.dump(mapping, f, indent=2)
