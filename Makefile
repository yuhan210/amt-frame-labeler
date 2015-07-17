# Makefile
# Sets up directory structure.

# Change this if the Apache server is not located in "/var/www":
BASE_DIR = /var/www/

# Get LabelMe path settings:
LM_URL_HOME = http://$(shell hostname --long)/$(shell pwd | sed -e s@$(BASE_DIR)@@)/
LM_TOOL_HOME = $(shell pwd)/

# Get path for perl scripts:
SET_LM_HOME = $(shell pwd)/

all: write_permissions

basic: write_permissions

write_permissions:
	@echo "Setting write permissions";
	$(shell chmod -R 777 ./annos)
	$(shell chmod -R 777 ./icons)
