REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) ./test/*.js

test-cov: lib-cov
	@FENDJS_MODEL_MONGO_COV=1 $(MAKE) test REPORTER=html-cov > ./coverage.html
	@rm -rf ./lib-cov

test-coveralls: lib-cov
	echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	@FENDJS_MODEL_MONGO_COV=1 $(MAKE) test REPORTER=mocha-lcov-reporter | ./node_modules/.bin/coveralls
	@rm -rf ./lib-cov

lib-cov:
	@./node_modules/.bin/jscoverage ./lib ./lib-cov

clean:
	@rm -f ./coverage.html

.PHONY: test test-cov test-coveralls lib-cov clean
