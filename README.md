# Profile Hub

[![Build Status](https://github.com/AtlasOfLivingAustralia/profile-hub/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/AtlasOfLivingAustralia/profile-hub/actions)

## Technologies

* Grails 7.2.1 / Java 17 / Groovy 4
* Gradle 8.14.4 (via the Gradle wrapper, `./gradlew`)

## Prerequisites

* JDK 17
* An external configuration file at `/data/profile-hub/config/profile-hub-config.properties` (or as configured in `application.yml`). External configuration (`grails.config.locations`) is built into Grails 7; the `external-config` plugin is no longer required.

## Running

Everything runs through the Gradle wrapper:

```
./gradlew bootRun
```

## Design notes and setup instructions

See the [project wiki](https://github.com/AtlasOfLivingAustralia/profile-hub/wiki/).

## Project set up

See the [project setup page](https://github.com/AtlasOfLivingAustralia/profile-hub/wiki/Project-Setup) on the wiki.

## Name Matching

This content has been moved to the [project wiki](https://github.com/AtlasOfLivingAustralia/profile-hub/wiki/Name-Matching).
