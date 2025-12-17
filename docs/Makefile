# Makefile pentru compilarea documentelor LaTeX
# Proiect Criptografie - OTP și Algoritmi Criptografici

# Directoare
PRESENTATION_DIR = presentation
REPORT_DIR = report
OUTPUT_DIR = output

# Fișiere
PRESENTATION_TEX = $(PRESENTATION_DIR)/presentation.tex
REPORT_TEX = $(REPORT_DIR)/project_report.tex

# Compilator LaTeX
LATEX = pdflatex
LATEX_FLAGS = -interaction=nonstopmode -output-directory=$(OUTPUT_DIR)

# Targets
.PHONY: all presentation report clean help

all: presentation report

# Crează directorul output dacă nu există
$(OUTPUT_DIR):
	mkdir -p $(OUTPUT_DIR)

# Compilează prezentarea
presentation: $(OUTPUT_DIR)
	@echo "=== Compilare Prezentare ==="
	$(LATEX) $(LATEX_FLAGS) $(PRESENTATION_TEX)
	$(LATEX) $(LATEX_FLAGS) $(PRESENTATION_TEX)
	@echo "Prezentare generată: $(OUTPUT_DIR)/presentation.pdf"

# Compilează raportul
report: $(OUTPUT_DIR)
	@echo "=== Compilare Raport ==="
	$(LATEX) $(LATEX_FLAGS) $(REPORT_TEX)
	$(LATEX) $(LATEX_FLAGS) $(REPORT_TEX)
	@echo "Raport generat: $(OUTPUT_DIR)/project_report.pdf"

# Curăță fișierele auxiliare
clean:
	@echo "=== Curățare fișiere auxiliare ==="
	rm -rf $(OUTPUT_DIR)/*.aux $(OUTPUT_DIR)/*.log $(OUTPUT_DIR)/*.nav
	rm -rf $(OUTPUT_DIR)/*.out $(OUTPUT_DIR)/*.snm $(OUTPUT_DIR)/*.toc
	rm -rf $(OUTPUT_DIR)/*.vrb

# Curăță totul inclusiv PDF-urile
cleanall: clean
	@echo "=== Curățare completă ==="
	rm -rf $(OUTPUT_DIR)

# Afișează ajutor
help:
	@echo "Makefile pentru Proiect Criptografie"
	@echo ""
	@echo "Comenzi disponibile:"
	@echo "  make all          - Compilează toate documentele"
	@echo "  make presentation - Compilează doar prezentarea"
	@echo "  make report       - Compilează doar raportul"
	@echo "  make clean        - Șterge fișierele auxiliare"
	@echo "  make cleanall     - Șterge tot (inclusiv PDF)"
	@echo "  make help         - Afișează acest mesaj"
