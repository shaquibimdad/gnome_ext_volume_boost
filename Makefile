# Makefile for GNOME Shell Extension
UUID := $(shell grep -Po '(?<="uuid": ")[^"]*' metadata.json)
SRC := $(wildcard *.js) metadata.json schemas/gschema.xml
SCHEMAS_DIR := schemas
INSTDIR := $(HOME)/.local/share/gnome-shell/extensions/$(UUID)
ZIPFILE := $(UUID).zip

.PHONY: all
all: zip

.PHONY: install
install: compile-schemas
	@echo "Installing extension to $(INSTDIR)"
	@mkdir -pv $(INSTDIR)
	@cp -v $(SRC) $(INSTDIR)
	@if [ -d $(SCHEMAS_DIR) ]; then \
		mkdir -pv $(INSTDIR)/schemas; \
		cp -v $(SCHEMAS_DIR)/gschema.xml $(INSTDIR)/schemas/; \
		glib-compile-schemas $(INSTDIR)/schemas; \
	fi
	@echo "Extension installed successfully. Restart GNOME Shell with Alt+F2, then 'r'"

.PHONY: uninstall
uninstall:
	@echo "Removing extension from $(INSTDIR)"
	@rm -frv $(INSTDIR)
	@echo "Extension uninstalled. Restart GNOME Shell with Alt+F2, then 'r'"

.PHONY: zip
zip: $(ZIPFILE)

$(ZIPFILE): $(SRC)
	@echo "Creating extension zip file: $(ZIPFILE)"
	@rm -f $(ZIPFILE)
	@zip -j $(ZIPFILE) $(SRC)
	@if [ -d $(SCHEMAS_DIR) ]; then \
		zip -r $(ZIPFILE) $(SCHEMAS_DIR); \
	fi

.PHONY: compile-schemas
compile-schemas:
	@if [ -d $(SCHEMAS_DIR) ]; then \
		echo "Compiling schemas..."; \
		glib-compile-schemas $(SCHEMAS_DIR); \
	fi

.PHONY: clean
clean:
	@rm -fv $(ZIPFILE)
	@if [ -d $(SCHEMAS_DIR) ]; then \
		rm -fv $(SCHEMAS_DIR)/gschema.compiled; \
	fi