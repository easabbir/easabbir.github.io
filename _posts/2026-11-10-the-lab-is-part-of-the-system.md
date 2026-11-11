---
title: "The Hardware Lab Is Part of the System Under Test"
description: "Telling lab problems apart from firmware bugs"
date: 2026-11-10 10:07:00 +0600
category: Embedded QA
tags: [hardware-lab, debugging, usb-serial]
series: Embedded QA Series
part: 7
---
Over two weeks we tested on five units of the same product. Several of our most confusing results had nothing to do with the firmware. Here are the lab problems we met, how each one looked from the test report, and how we told it apart from a real defect.

## 1. COM ports renumber on every reconnect

Each new unit, and sometimes the same unit after re-plugging, appeared on new COM port numbers. Even the port carrying the CLI moved from the second modem port to the first on one unit. **Fix:** the bench configuration file lists the ports per bench, and we find the CLI by sending a harmless info command to each port of the device's serial number before every session.

## 2. Another program holds the port

Every test reported skipped: interface not available. The cause was a serial terminal still connected to the port; Windows allows only one owner. **Fix:** check for terminal sessions first and treat "all skipped" as a failed run, never as a pass.

## 3. The device drops off USB during a reset

After a reset command, the serial driver reported I/O errors and the ports briefly disappeared, because the module re-enumerates its USB interfaces while rebooting. **Fix:** the framework's reset window expects this, waits for the device and reconnects. These errors are noise, not a firmware fault, and the test report should say so.

## 4. A unit without the application

Two units answered the modem's standard `AT` command with `OK` but never answered the CLI, and listening for 20 seconds showed no boot output. The module worked; the application was simply not flashed. **Fix:** a quick health check that separates "module alive" from "application running" before anyone opens a bug.

## 5. Running the wrong selection flashes the device

When the CI pipeline gained a setup step that flashes firmware, running the whole project folder would also collect that step. **Fix:** run the product test folder explicitly on a desk bench.

> **Takeaway:** Before blaming the firmware, rule out the lab: ports, port owners, USB re-enumeration, and whether the application is even there. A five-minute bench check saves hours of debugging the wrong layer.
