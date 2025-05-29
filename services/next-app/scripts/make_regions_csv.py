import re, csv, os

input_path  = os.path.join('public', 'data', 'regionNames.txt')
output_path = os.path.join('public', 'data', 'regions.csv')

# Read the raw lines
with open(input_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Extract and clean names
names = []
for line in lines:
    if 'Region found:' in line:
        name = line.split('Region found:', 1)[1].strip()
        names.append(name)

# Dedupe & strip any trailing '_1'
unique = sorted({n[:-2] if n.endswith('_1') else n for n in names})

# Write CSV
with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['regionId'])
    for r in unique:
        writer.writerow([r])

print(f"Wrote {len(unique)} regions to {output_path}")