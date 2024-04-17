UUID := $(shell cat metadata.json | jq -r .uuid)
SRC  := extension.js metadata.json
INSTDIR := ~/.local/share/gnome-shell/extensions/$(UUID)

all: zip

.PHONY: install
install:
	mkdir -pv $(INSTDIR)
	cp -v $(SRC) $(INSTDIR)

.PHONY: uninstall
uninstall:
	rm -fr $(INSTDIR)

.PHONY: zip
zip:
	rm -f $(UUID).zip
	zip -j $(UUID).zip $(SRC)
