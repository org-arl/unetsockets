docs:
	python docs/generate_api_docs.py

build: docs
	PIP_USER=0 python3 -m build

testupload: build
	twine upload --repository testpypi dist/*

upload: build
	twine upload --repository pypi dist/*

test:
	pytest -o log_cli=true -o log_cli_level=DEBUG tests/

clean:
	rm -rf build/ dist/ unetsockets.egg-info/ python/docs/api/

.PHONY: docs build testupload upload