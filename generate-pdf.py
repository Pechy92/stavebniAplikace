#!/usr/bin/env python3
"""
Skript pro konverzi Markdown dokumentace do PDF
"""

import markdown
from weasyprint import HTML, CSS
from pathlib import Path

def convert_md_to_pdf(md_file, pdf_file):
    """Převede markdown soubor na PDF s pěkným stylingem"""
    
    # Načíst markdown obsah
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Konvertovat markdown na HTML
    html_content = markdown.markdown(
        md_content,
        extensions=['tables', 'fenced_code', 'toc']
    )
    
    # HTML šablona s CSS styly
    html_template = f"""
    <!DOCTYPE html>
    <html lang="cs">
    <head>
        <meta charset="UTF-8">
        <title>Stavební Aplikace - Uživatelská dokumentace</title>
        <style>
            @page {{
                margin: 2.5cm;
                size: A4;
                @bottom-right {{
                    content: "Strana " counter(page) " z " counter(pages);
                    font-size: 9pt;
                    color: #666;
                }}
            }}
            
            body {{
                font-family: 'DejaVu Sans', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                font-size: 11pt;
            }}
            
            h1 {{
                color: #2563eb;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 10px;
                margin-top: 40px;
                page-break-before: always;
                font-size: 24pt;
            }}
            
            h1:first-of-type {{
                page-break-before: avoid;
                margin-top: 0;
            }}
            
            h2 {{
                color: #1e40af;
                margin-top: 30px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 5px;
                font-size: 18pt;
                page-break-after: avoid;
            }}
            
            h3 {{
                color: #1e3a8a;
                margin-top: 20px;
                font-size: 14pt;
                page-break-after: avoid;
            }}
            
            h4 {{
                color: #334155;
                margin-top: 15px;
                font-size: 12pt;
                page-break-after: avoid;
            }}
            
            code {{
                background: #f3f4f6;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'DejaVu Sans Mono', 'Courier New', monospace;
                font-size: 9pt;
            }}
            
            pre {{
                background: #1f2937;
                color: #f9fafb;
                padding: 15px;
                border-radius: 5px;
                overflow-x: auto;
                page-break-inside: avoid;
                margin: 15px 0;
            }}
            
            pre code {{
                background: transparent;
                color: inherit;
                padding: 0;
            }}
            
            table {{
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
                page-break-inside: avoid;
                font-size: 10pt;
            }}
            
            th, td {{
                border: 1px solid #e5e7eb;
                padding: 8px 12px;
                text-align: left;
            }}
            
            th {{
                background: #f3f4f6;
                font-weight: 600;
            }}
            
            tr:nth-child(even) {{
                background: #f9fafb;
            }}
            
            blockquote {{
                border-left: 4px solid #2563eb;
                margin: 20px 0;
                padding: 10px 20px;
                background: #eff6ff;
                page-break-inside: avoid;
            }}
            
            ul, ol {{
                margin: 15px 0;
                padding-left: 30px;
            }}
            
            li {{
                margin: 5px 0;
            }}
            
            a {{
                color: #2563eb;
                text-decoration: none;
            }}
            
            strong {{
                color: #1e40af;
            }}
            
            hr {{
                border: none;
                border-top: 2px solid #e5e7eb;
                margin: 30px 0;
            }}
            
            .cover-page {{
                text-align: center;
                padding-top: 200px;
                page-break-after: always;
            }}
            
            .cover-page h1 {{
                font-size: 36pt;
                border: none;
                margin-bottom: 20px;
                color: #2563eb;
            }}
            
            .cover-page .subtitle {{
                font-size: 18pt;
                color: #64748b;
                margin-bottom: 50px;
            }}
            
            .cover-page .version {{
                font-size: 14pt;
                color: #94a3b8;
            }}
        </style>
    </head>
    <body>
        <div class="cover-page">
            <h1>Stavební Aplikace</h1>
            <div class="subtitle">Uživatelská dokumentace</div>
            <div class="version">Verze 1.0<br>Leden 2026</div>
        </div>
        {html_content}
    </body>
    </html>
    """
    
    # Konvertovat HTML na PDF
    print(f"📄 Konvertuji {md_file} → {pdf_file}")
    HTML(string=html_template).write_pdf(pdf_file)
    print(f"✅ PDF úspěšně vytvořeno: {pdf_file}")
    
    # Vypsat velikost souboru
    size_kb = Path(pdf_file).stat().st_size / 1024
    print(f"📊 Velikost: {size_kb:.1f} KB")

if __name__ == "__main__":
    md_file = "UZIVATELSKA_DOKUMENTACE.md"
    pdf_file = "UZIVATELSKA_DOKUMENTACE.pdf"
    
    convert_md_to_pdf(md_file, pdf_file)
