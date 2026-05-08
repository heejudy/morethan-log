.PHONY: setup dev run

NOTION_PAGE_ID ?=
setup:
	@test -n "$(NOTION_PAGE_ID)" || (echo "Usage: make setup NOTION_PAGE_ID=<your-notion-page-id>" && exit 1)
	docker build . -t morethan-log ; \
	docker run -it --rm -v $(PWD):/app morethan-log /bin/bash -c "yarn install" ; \
	echo NOTION_PAGE_ID=$(NOTION_PAGE_ID) > .env.local

dev:
	docker run -it --rm -v $(PWD):/app -p 8001:3000 morethan-log /bin/bash -c "yarn run dev"

run:
	docker run -it --rm -v $(PWD):/app morethan-log /bin/bash
