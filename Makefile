SHELL := /bin/bash
BUN := bun

MOBILE := apps/mobile
TV     := apps/tv
API    := packages/api
CORE   := packages/core
PLAYER := packages/mpv-player

.DEFAULT_GOAL := help

.PHONY: help
help:
	@echo "Lunarr Client Makefile"
	@echo ""
	@echo "Run / typecheck"
	@echo "  make typecheck      typecheck apps + packages"
	@echo "  make typecheck-mobile"
	@echo "  make typecheck-tv"
	@echo "  make typecheck-api"
	@echo "  make typecheck-core"
	@echo "  make typecheck-player"
	@echo ""
	@echo "Formatting"
	@echo "  make format         prettier --write on apps + packages"
	@echo "  make format-mobile"
	@echo "  make format-tv"
	@echo "  make format-check   prettier --check on apps + packages"
	@echo ""
	@echo "API generation"
	@echo "  make gen-api        regenerate the shared API client"
	@echo "  make gen-openapi    regenerate openapi.json from lunarr-go"
	@echo ""
	@echo "Versioning"
	@echo "  make version V=1.1.0   bump version in apps + packages"
	@echo "  make version-mobile V=1.1.0"
	@echo "  make version-tv V=1.1.0"
	@echo "  make version-show     print current versions"
	@echo ""
	@echo "EAS build / submit (PLATFORM=all|ios|android, PROFILE=production)"
	@echo "  make build-mobile [PLATFORM=all]   eas build mobile"
	@echo "  make build-tv [PLATFORM=all]       eas build tv"
	@echo "  make submit-mobile [PLATFORM=all]  eas submit mobile"
	@echo "  make submit-tv [PLATFORM=all]      eas submit tv"
	@echo "  make release-mobile [PLATFORM=all] build + auto-submit mobile"
	@echo "  make release-tv [PLATFORM=all]     build + auto-submit tv"
	@echo "  make release                       build + auto-submit mobile and tv"
	@echo ""
	@echo "Local build / run (production by default)"
	@echo "  make build-mobile-ios               production iOS build (mobile)"
	@echo "  make build-mobile-android           production Android build (mobile)"
	@echo "  make build-tv-ios                   production iOS build (tv)"
	@echo "  make build-tv-android               production Android build (tv)"
	@echo "  make build-mobile-ios TEAM_ID=XXXX  override Apple Developer Team ID"
	@echo "  make dev-mobile PLATFORM=ios        dev build + install (mobile)"
	@echo "  make dev-tv PLATFORM=ios            dev build + install (tv)"
	@echo "  make prebuild-mobile                regenerate native projects (mobile)"
	@echo "  make prebuild-tv                    regenerate native projects (tv)"
	@echo "  make submit-local-mobile PLATFORM=ios PATH=app.ipa   submit local artifact"
	@echo "  make submit-local-tv PLATFORM=ios PATH=app.ipa       submit local artifact"
	@echo ""
	@echo "Common"
	@echo "  make install        bun install in mobile + tv"
	@echo "  make clean          remove node_modules + ios/android in apps"

## ---------------------------------------------------------------- typecheck

.PHONY: typecheck typecheck-mobile typecheck-tv typecheck-api typecheck-core typecheck-player
typecheck: typecheck-mobile typecheck-tv typecheck-api typecheck-core typecheck-player
typecheck-mobile: ; $(BUN) run --cwd $(MOBILE) typecheck
typecheck-tv: ; $(BUN) run --cwd $(TV) typecheck
typecheck-api: ; $(BUN) run --cwd $(API) typecheck
typecheck-core: ; $(BUN) run --cwd $(CORE) typecheck
typecheck-player: ; $(BUN) run --cwd $(PLAYER) typecheck

## ---------------------------------------------------------------- format

.PHONY: format format-mobile format-tv format-check
format: format-mobile format-tv
format-mobile: ; $(BUN) run --cwd $(MOBILE) format
format-tv: ; $(BUN) run --cwd $(TV) format
format-check: ; $(BUN) run --cwd $(MOBILE) format:check && $(BUN) run --cwd $(TV) format:check

## ---------------------------------------------------------------- api gen

.PHONY: gen-api gen-openapi
gen-api: ; $(BUN) run --cwd $(MOBILE) gen:api
gen-openapi: ; $(BUN) run --cwd $(MOBILE) gen:openapi

## ---------------------------------------------------------------- version

# Files that carry the app/store version. Shared packages are kept in sync too.
MOBILE_FILES := $(MOBILE)/package.json $(MOBILE)/app.json
TV_FILES     := $(TV)/package.json $(TV)/app.json
PKG_FILES    := package.json $(API)/package.json $(CORE)/package.json $(PLAYER)/package.json

define set-version
	@if [ -z "$(V)" ]; then \
		echo "usage: make $@ V=<version>  (e.g. make $@ V=1.1.0)"; exit 1; \
	fi
endef

.PHONY: version version-mobile version-tv version
version: version-mobile version-tv
	@$(foreach f,$(PKG_FILES), $(BUN) x json -I -f $(f) -e 'this.version="$(V)"' &&) true
	@echo "bumped shared packages to $(V)"

version-mobile:
	$(call set-version)
	@$(BUN) x json -I -f $(MOBILE)/package.json -e 'this.version="$(V)"'
	@$(BUN) x json -I -f $(MOBILE)/app.json -e 'this.expo.version="$(V)"'
	@echo "mobile -> $(V)"

version-tv:
	$(call set-version)
	@$(BUN) x json -I -f $(TV)/package.json -e 'this.version="$(V)"'
	@$(BUN) x json -I -f $(TV)/app.json -e 'this.expo.version="$(V)"'
	@echo "tv -> $(V)"

.PHONY: version-show
version-show:
	@echo "root:      $$($(BUN) x json -f package.json version)"
	@echo "mobile:    $$($(BUN) x json -f $(MOBILE)/package.json version)  (app.json: $$($(BUN) x json -f $(MOBILE)/app.json expo.version))"
	@echo "tv:        $$($(BUN) x json -f $(TV)/package.json version)  (app.json: $$($(BUN) x json -f $(TV)/app.json expo.version))"
	@echo "api:       $$($(BUN) x json -f $(API)/package.json version)"
	@echo "core:      $$($(BUN) x json -f $(CORE)/package.json version)"
	@echo "mpv-player:$$($(BUN) x json -f $(PLAYER)/package.json version)"

## ---------------------------------------------------------------- eas build / submit

EAS := eas
# Default platform for build/submit targets: all | ios | android
PLATFORM ?= all
# EAS profile: development | preview | production
PROFILE ?= production

.PHONY: build-mobile build-tv submit-mobile submit-tv release-mobile release-tv release
build-mobile: ; cd $(MOBILE) && $(EAS) build --platform $(PLATFORM) --profile $(PROFILE)
build-tv: ; cd $(TV) && $(EAS) build --platform $(PLATFORM) --profile $(PROFILE)

submit-mobile: ; cd $(MOBILE) && $(EAS) submit --platform $(PLATFORM) --profile $(PROFILE)
submit-tv: ; cd $(TV) && $(EAS) submit --platform $(PLATFORM) --profile $(PROFILE)

# Build + auto-submit to the store in a single EAS run.
release-mobile: ; cd $(MOBILE) && $(EAS) build --platform $(PLATFORM) --profile $(PROFILE) --auto-submit
release-tv: ; cd $(TV) && $(EAS) build --platform $(PLATFORM) --profile $(PROFILE) --auto-submit

release: release-mobile release-tv

.PHONY: build-all submit-all
build-all: build-mobile build-tv
submit-all: submit-mobile submit-tv

## ---------------------------------------------------------------- local build / run

EAS := eas
PLATFORM ?= all
PROFILE ?= production

IOS_WS  := Lunarr.xcworkspace
TV_WS   := LunarrTV.xcworkspace
IOS_APP := Lunarr
TV_APP  := LunarrTV
# Apple Developer Team ID used for iOS/tvOS code signing.
TEAM_ID ?= XXZ9FNDH73

# Local production builds from source on this machine.
#   make build-mobile-ios | build-mobile-android | build-tv-ios | build-tv-android
.PHONY: build-mobile-ios build-tv-ios
build-mobile-ios: ; cd $(MOBILE)/ios && xcodebuild -workspace $(IOS_WS) -scheme $(IOS_APP) -configuration Release -sdk iphoneos -derivedDataPath build/DerivedData -allowProvisioningUpdates DEVELOPMENT_TEAM=$(TEAM_ID) build
build-tv-ios: ; cd $(TV)/ios && xcodebuild -workspace $(TV_WS) -scheme $(TV_APP) -configuration Release -sdk appletvos -derivedDataPath build/DerivedData -allowProvisioningUpdates DEVELOPMENT_TEAM=$(TEAM_ID) build

.PHONY: build-mobile-android build-tv-android
build-mobile-android: ; cd $(MOBILE)/android && ./gradlew assembleRelease
build-tv-android: ; cd $(TV)/android && ./gradlew assembleRelease

# Dev builds via Metro (installs to simulator/device).
.PHONY: dev-mobile dev-tv
dev-mobile: ; cd $(MOBILE) && $(BUN) run $(PLATFORM)
dev-tv: ; cd $(TV) && EXPO_TV=1 $(BUN) run $(PLATFORM)

# Regenerate native projects (prebuild) without building.
.PHONY: prebuild-mobile prebuild-tv
prebuild-mobile: ; cd $(MOBILE) && $(BUN) run prebuild
prebuild-tv: ; cd $(TV) && EXPO_TV=1 $(BUN) run prebuild$(shell test "$(PLATFORM)" = "android" && echo ":android" || true)

# Submit a locally built artifact to the store.
#   make submit-local-mobile PLATFORM=ios PATH=path/to/app.ipa
#   make submit-local-mobile PLATFORM=android PATH=path/to/app.aab
.PHONY: submit-local-mobile submit-local-tv
submit-local-mobile: ; cd $(MOBILE) && $(EAS) submit --platform $(PLATFORM) --profile $(PROFILE) --path $(PATH)
submit-local-tv: ; cd $(TV) && $(EAS) submit --platform $(PLATFORM) --profile $(PROFILE) --path $(PATH)

## ---------------------------------------------------------------- common

.PHONY: install clean
install:
	$(BUN) install --cwd $(MOBILE)
	$(BUN) install --cwd $(TV)

clean:
	rm -rf $(MOBILE)/node_modules $(TV)/node_modules
	rm -rf $(MOBILE)/ios $(MOBILE)/android $(TV)/ios $(TV)/android
	@echo "cleaned apps"