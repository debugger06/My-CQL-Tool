test:
ifeq ($(TEST_MODE), test_mode_is_enabled)
	@./node_modules/.bin/mocha -u tdd
else
	@echo "Please run the shell script run_tests.sh"
endif

.PHONY: test