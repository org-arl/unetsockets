build: docs
	PIP_USER=0 python3 -m build

docs: lint
	python docs/generate_api_docs.py

lint:
	mypy src/unetpy

testupload: build
	twine upload --repository testpypi dist/*

upload: build
	twine upload --repository pypi dist/*

test: lint
	pytest tests/

clean:
	rm -rf build/ dist/ unetpy.egg-info/ python/docs/api/

.PHONY: docs build testupload upload test clean