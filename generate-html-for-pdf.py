#!/usr/bin/env python3
"""
Skript pro konverzi Markdown dokumentace do HTML pro tisk/PDF export
"""

import markdown
from pathlib import Path

def convert_md_to_html(md_file, html_file):
    """Převede markdown soubor na HTML připravené pro tisk"""
    
    # Načíst markdown obsah
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Konvertovat markdown na HTML
    html_body = markdown.markdown(
        md_content,
        extensions=['tables', 'fenced_code', 'toc']
    )
    
    # HTML šablona s CSS styly
    html_template = f"""<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stavební Aplikace - Uživatelská dokumentace</title>
    <style>
        @media print {{
            @page {{
                margin: 2cm;
                size: A4;
            }}
            body {{
                font-size: 10pt;
            }}
            h1 {{
                page-break-before: always;
            }}
            h1:first-of-type {{
                page-break-before: avoid;
            }}
            pre, table, blockquote {{
                page-break-inside: avoid;
            }}
            .print-button, .print-instructions {{
                display: none;
            }}
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }}
        
        h1 {{
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            margin-top: 40px;
        }}
        
        h2 {{
            color: #1e40af;
            margin-top: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
        }}
        
        h3 {{
            color: #1e3a8a;
            margin-top: 20px;
        }}
        
        h4 {{
            color: #334155;
            margin-top: 15px;
        }}
        
        code {{
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }}
        
        pre {{
            background: #1f2937;
            color: #f9fafb;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
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
        }}
        
        th, td {{
            border: 1px solid #e5e7eb;
            padding: 12px;
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
        
        a:hover {{
            text-decoration: underline;
        }}
        
        .cover-page {{
            text-align: center;
            padding: 100px 0;
            page-break-after: always;
        }}
        
        .cover-page h1 {{
            font-size: 3em;
            border: none;
            margin-bottom: 20px;
        }}
        
        .cover-page .subtitle {{
            font-size: 1.5em;
            color: #64748b;
            margin-bottom: 50px;
        }}
        
        .cover-page .version {{
            font-size: 1.2em;
            color: #94a3b8;
        }}
        
        .print-button {{
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 1000;
        }}
        
        .print-button:hover {{
            background: #1e40af;
        }}
        
        .print-instructions {{
            background: #eff6ff;
            border: 2px solid #2563eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0 40px 0;
        }}
        
        .print-instructions h3 {{
            margin-top: 0;
            color: #2563eb;
        }}
        
        .print-instructions ol {{
            margin: 10px 0;
        }}
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">🖨️ Vytisknout / Uložit jako PDF</button>
    
    <div class="cover-page">
        <h1>Stavební Aplikace</h1>
        <div class="subtitle">Uživatelská dokumentace</div>
        <div class="version">Verze 1.0 | Leden 2026</div>
    </div>
    
    <div class="print-instructions">
        <h3>📥 Jak vytvořit PDF z tohoto dokumentu:</h3>
        <ol>
            <li>Klikněte na tlačítko "🖨️ Vytisknout / Uložit jako PDF" v pravém horním rohu</li>
            <li>V dialogu tisku vyberte jako tiskárnu <strong>"Uložit jako PDF"</strong> nebo <strong>"Microsoft Print to PDF"</strong></li>
            <li>Nastavte velikost papíru na <strong>A4</strong></li>
            <li>Klikněte na <strong>"Uložit"</strong> nebo <strong>"Tisk"</strong></li>
            <li>Vyberte umístění a název souboru</li>
        </ol>
        <p><strong>Tip:</strong> V nastavení tisku můžete upravit okraje a orientaci stránky.</p>
    </div>
    
    {html_body}
</body>
</html>
"""
    
    # Uložit HTML
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_template)
    
    print(f"✅ HTML vytvořeno: {html_file}")
    print(f"📄 Otevřete soubor v prohlížeči a použijte Cmd+P (Mac) nebo Ctrl+P (Win) pro vytvoření PDF")
    
    # Vypsat velikost souboru
    size_kb = Path(html_file).stat().st_size / 1024
    print(f"📊 Velikost HTML: {size_kb:.1f} KB")

if __name__ == "__main__":
    md_file = "UZIVATELSKA_DOKUMENTACE.md"
    html_file = "UZIVATELSKA_DOKUMENTACE_print.html"
    
    convert_md_to_html(md_file, html_file)
