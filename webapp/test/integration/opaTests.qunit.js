/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ui5/util/ui5-util/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});