chrome_build_dir = $(shell pwd)/chrome-extension

.PHONY: build package clean

package:
		@rm -rf ${chrome_build_dir}
		@echo "✅ Deleted Existing Chrome Build Directory"
		@echo "🗂  Moving Required Files to the CHROME-EXTENSION"
		@mkdir ${chrome_build_dir} ${chrome_build_dir}/css ${chrome_build_dir}/js
		@cp ./dist/assets/main.js ${chrome_build_dir}/js
		@cp ./dist/assets/style.css ${chrome_build_dir}/css
		@cp -r ./extension-resources/ ${chrome_build_dir}/
		@cp -r ./images/ ${chrome_build_dir}/images
		@mkdir ${chrome_build_dir}/css/color-themes
		@cp -r ./src/css/color-themes/ ${chrome_build_dir}/css/color-themes
		@cp -r ./src/css/codemirror.css ${chrome_build_dir}/css/codemirror.css
		@cp -r ./src/options/js/ ${chrome_build_dir}/js/
		@cp -r ./src/options/css/ ${chrome_build_dir}/css/
		@cp -r ./src/scripts/ ${chrome_build_dir}/js/
		@cd $(chrome_build_dir); \
		zip -r chrome-extension.zip .
		@echo "✅ Package has been created successfuly. And ready to be shiped 🎁"

clean:
	@rm -rf ${chrome_build_dir}
	@rm -rf ./dist
	@echo "✅ Deleted BUILD and CHROME_EXTENSION Directories"