import fitz
import os

pdf_path = r'C:\Users\MnZ\Documents\Omaki\02. Cardápio e Fichas Técnicas\Cardápio_Omaki_Outubro-26.pdf'
doc = fitz.open(pdf_path)
out_dir = r'c:\Users\MnZ\Documents\Omaki\cardapio-digital-omaki\scratch\extracted_raw_images'
os.makedirs(out_dir, exist_ok=True)

print(f"Total pages: {len(doc)}")
seen_xrefs = set()

for pno in range(len(doc)):
    page = doc[pno]
    img_list = page.get_images(full=True)
    print(f"Page {pno+1}: {len(img_list)} images")
    for idx, img in enumerate(img_list):
        xref = img[0]
        if xref in seen_xrefs:
            continue
        seen_xrefs.add(xref)
        bi = doc.extract_image(xref)
        ext = bi['ext']
        w = bi['width']
        h = bi['height']
        filename = f"p{pno+1:02d}_img{idx+1:02d}_xref{xref}_{w}x{h}.{ext}"
        filepath = os.path.join(out_dir, filename)
        with open(filepath, 'wb') as f:
            f.write(bi['image'])
        print(f"   Saved {filename} ({w}x{h}) - {len(bi['image'])} bytes")

print("Done extracting raw images!")
