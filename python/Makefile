.PHONY: all test lint format clean

all: test

test:
	[ -d test/unet ] || (mkdir -p test/unet ; curl -o test/unet/unet-community-3.1.0.tgz https://unetstack.net/downloads/unet-community-3.1.0.tgz ; cd test/unet && tar xvzf unet-community-3.1.0.tgz)
	python test/test.py

lint:
	ruff check src

format:
	ruff format src

clean:
	rm -rf test/unet

