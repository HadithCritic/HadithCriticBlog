import os
import json
import re

articles_dir = r"C:\Users\Jonathan\Desktop\blogs\HadithCriticBlog\src\content\articles"
mapping_path = r"C:\Users\Jonathan\Desktop\blogs\HadithCriticBlog\mapping.json"

with open(mapping_path, 'r', encoding='utf-8') as f:
    mapping = json.load(f)

# Flatten mapping to easily look up the new category for each file
file_to_new_cat = {}
for new_cat, items in mapping.items():
    for item in items:
        file_to_new_cat[item['file']] = new_cat

# Iterate through files and replace category
success_count = 0
for file_name, new_cat in file_to_new_cat.items():
    file_path = os.path.join(articles_dir, file_name)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace category
    new_content = re.sub(
        r'(^category:\s*)["\']?(.*?)["\']?(\s*$)',
        f"\\g<1>\"{new_cat}\"\\3",
        content,
        flags=re.MULTILINE
    )
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        success_count += 1


print(f"Successfully updated {success_count} files.")
