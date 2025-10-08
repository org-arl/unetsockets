.PHONY: all test clean

build:
	python setup.py sdist
	python setup.py bdist_wheel

test:
	[ -d test/unet ] || (mkdir -p test/unet ; curl -o test/unet/unet-community-3.1.0.tgz https://unetstack.net/downloads/unet-community-3.1.0.tgz ; cd test/unet && tar xvzf unet-community-3.1.0.tgz)
	python test/test.py

clean:
	rm -rf test/unet
	rm -rf build dist *.egg-info

testupload: build
	twine upload --repository testpypi dist/*

upload: build
	twine upload --repository pypi dist/*
