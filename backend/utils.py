import pdfplumber
import os

def read_file(path: str) -> str:
    """Reads a .txt or .pdf file and returns the text content."""
    ext = os.path.splitext(path)[1].lower()

    if ext == ".txt":
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    elif ext == ".pdf":
        text = ""
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        if not text.strip():
            raise ValueError("PDF appears to be empty or scanned — no text could be extracted.")
        return text

    else:
        raise ValueError(f"Unsupported file type: {ext}. Use .txt or .pdf")