import pypdf

def convert_pdf_to_md(pdf_path, md_path):
    with open(pdf_path, 'rb') as pdf_file:
        pdf_reader = pypdf.PdfReader(pdf_file)
        text = ''
        for page in pdf_reader.pages:
            text += page.extract_text()

    with open(md_path, 'w', encoding='utf-8') as md_file:
        md_file.write(text)

if __name__ == '__main__':
    convert_pdf_to_md('D:\\personal\\RoyAalekh.github.io\\assets\\Aalekh_Roy_Resume.pdf', 'D:\\personal\\RoyAalekh.github.io\\resume.md')
