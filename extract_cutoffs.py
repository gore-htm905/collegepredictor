import pdfplumber
import re
import pandas as pd
import os

pdf_path = "cutoff_data.pdf"
output_dir = os.path.join("server", "data")
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "final_cutoffs.csv")

institute_re = re.compile(r"^(\d{4,5})\s*-\s*(.*)")
branch_re = re.compile(r"^(\d{9,10})\s*-\s*(.*)")
status_re = re.compile(r"Status:\s*(.*)")

def determine_region(university_text, institute_name):
    text_to_search = str(university_text + " " + institute_name).lower()
    if any(x in text_to_search for x in ['vidarbha', 'amravati', 'nagpur', 'gondwana', 'wardha', 'yavatmal', 'chandrapur', 'gadchiroli', 'akola', 'buldana', 'washim', 'bhandara']):
        return 'Vidarbha'
    elif any(x in text_to_search for x in ['pune', 'ahmednagar', 'baramati', 'pimpri', 'pccoe', 'pict', 'coep', 'cummins', 'jayamukt']):
        return 'Pune'
    elif any(x in text_to_search for x in ['mumbai', 'konkan', 'lonere', 'thane', 'palghar', 'raigad', 'ratnagiri', 'sindhudurg', 'vjti', 'spit', 'sanghvi', 'vile parle']):
        return 'Konkan'
    elif any(x in text_to_search for x in ['marathwada', 'aurangabad', 'nanded', 'latur', 'osmanabad', 'parbhani', 'jalna', 'beed', 'hingoli', 'dharashiv', 'sambhajinagar', 'narendra deva']):
        return 'Marathwada'
    elif any(x in text_to_search for x in ['kolhapur', 'solapur', 'sangli', 'satara', 'shivaji', 'walchand', 'fule', 'karad']):
        return 'Western Maharashtra'
    elif any(x in text_to_search for x in ['jalgaon', 'dhule', 'nandurbar', 'khandesh', 'nashik', 'north maharashtra']):
        return 'Nashik'
    return 'Other'

def determine_city(institute_name):
    # Try getting city from after last comma
    parts = institute_name.split(',')
    if len(parts) > 1:
        potential_city = re.sub(r'[^a-zA-Z\s]', '', parts[-1]).strip()
        if potential_city:
            # If it's a multi-word string like "Dist Pune", take last word
            last_word = potential_city.split()[-1]
            if last_word.lower() not in ['pune', 'mumbai', 'nagpur', 'nashik', 'amravati', 'aurangabad', 'kolhapur', 'solapur', 'sangli', 'satara', 'akola', 'jalgaon', 'dhule', 'nandurbar', 'nanded', 'latur', 'thane']:
                # If last word is not recognizable, maybe the whole thing is the city
                return potential_city.capitalize()
            return last_word.capitalize()

    # Fallback: check known cities in the name
    known_cities = ['Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Amravati', 'Aurangabad', 'Kolhapur', 'Solapur', 'Sangli', 'Satara', 'Akola', 'Jalgaon', 'Dhule', 'Nandurbar', 'Nanded', 'Latur', 'Thane', 'Wardha', 'Yavatmal', 'Chandrapur', 'Gadchiroli', 'Ahmednagar', 'Ratnagiri', 'Chiplun', 'Karad', 'Shegaon', 'Lonere', 'Buldana', 'Washim', 'Bhandara', 'Gondia', 'Gadchiroli', 'Jalna', 'Beed', 'Osmanabad', 'Dharashiv', 'Hingoli', 'Parbhani', 'Sambhajinagar', 'Washim', 'Palghar', 'Raigad', 'Sindhudurg']
    for city in known_cities:
        if city.lower() in institute_name.lower():
            return city
            
    # Final fallback: last word excluding generics
    generics = ['technology', 'engineering', 'management', 'university', 'institute', 'polytechnic', 'college', 'research', 'center', 'centre', 'academy', 'society', 'trust', 'mandal', 'shikshan', 'prasarak', 'sanstha', 'campus', 'education', 'complex', 'foundation']
    words = [w for w in re.sub(r'[^a-zA-Z\s]', ' ', institute_name).split() if w.lower() not in generics]
    if words:
        return words[-1].capitalize()
    
    return "Unknown"

records = []
current_institute_code = None
current_institute_name = None
current_branch = None
current_city = None
current_region = None

print("Starting PDF Extraction...")

with pdfplumber.open(pdf_path) as pdf:
    total_pages = len(pdf.pages)
    for i, page in enumerate(pdf.pages):
        text = page.extract_text(x_tolerance=2, y_tolerance=2)
        if not text: continue
        
        lines = text.split('\n')
        
        cat_headers = []
        expecting = None
        
        for line in lines:
            line = line.strip()
            if not line: continue
            
            # Stop condition if we hit end characters
            if line.startswith("Legends:"):
                continue
            if line.startswith("Maharashtra State Seats"):
                continue
                
            m_inst = institute_re.match(line)
            if m_inst:
                current_institute_code = m_inst.group(1).strip()
                current_institute_name = m_inst.group(2).strip()
                current_institute_name = re.sub(r'\s+', ' ', current_institute_name).replace('"', '')
                current_city = determine_city(current_institute_name)
                current_region = determine_region("", current_institute_name)
                cat_headers = []
                expecting = None
                continue
            
            m_branch = branch_re.match(line)
            if m_branch:
                current_branch = m_branch.group(2).strip()
                current_branch = re.sub(r'\s+', ' ', current_branch)
                cat_headers = []
                expecting = None
                continue
                
            m_status = status_re.search(line)
            if m_status:
                uni_text = m_status.group(1).strip()
                current_region = determine_region(uni_text, current_institute_name)
                continue

            if line.startswith("Stage "):
                cat_headers = line.split()[1:]
                expecting = 'ranks'
                continue
                
            if expecting == 'ranks' and (line.startswith("I ") or line == "I"):
                expecting = 'percentiles'
                continue
                
            if expecting == 'percentiles' and "(" in line:
                # Sometimes percentiles might span multiple lines if too many columns, 
                # but usually pdfplumber puts them on one line.
                # Find all (XX.XXXXX)
                percentiles = re.findall(r'\(([\d\.]+)\)', line)
                ranks = [] # We don't need ranks right now but keeping structure aligned
                
                # Make sure we don't exceed category headers
                for cat, perc in zip(cat_headers, percentiles):
                    cat_code = cat.strip()
                    try:
                        perc_val = float(perc)
                    except ValueError:
                        continue
                    
                    gender = 'L' if cat_code.startswith('L') else 'G'
                    univ_type = 'Home' if cat_code.endswith('H') else 'Other'
                    
                    records.append({
                        'instituteCode': current_institute_code,
                        'instituteName': current_institute_name,
                        'branch': current_branch,
                        'category': cat_code,
                        'gender': gender,
                        'percentile': perc_val,
                        'city': current_city,
                        'region': current_region,
                        'universityType': univ_type,
                        'capRound': 1
                    })
                
                expecting = None
                cat_headers = []
        
        if i % 100 == 0:
            print(f"Processed {i}/{total_pages} pages...")

df = pd.DataFrame(records)
print(f"Extraction complete. Found {len(df)} records.")

# Validation check for required colleges
mandatory_colleges = ['coep', 'vjti', 'pict', 'spit', 'walchand', 'sanghvi', 'cummins', 'pccoe']
found_all = True
for college in mandatory_colleges:
    match = df[df['instituteName'].str.lower().str.contains(college)]
    if match.empty:
        print(f"WARNING: Mandatory college '{college}' NOT FOUND.")
        found_all = False
    else:
        print(f"Found '{college}': {match['instituteName'].iloc[0]}")

# Drop duplicates just in case
df = df.drop_duplicates()
print(f"Records after deduplication: {len(df)}")

df.to_csv(output_path, index=False)
print(f"Saved dataset to {output_path}")

