sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../ui5-util/Validator",
	"../ui5-util/ValueHelpDialog"
], function (Controller, Validator, ValueHelpDialog) {
	"use strict";

	return Controller.extend("ui5.util.ui5-util.controller.View", {
		onInit: function () {
			var validator = new Validator();
			
			this.getView().getModel().read("/Products", {
				success: function (oData) {
					console.log("Connected to Northwind");
					console.log("Products:", oData);
				},
				error: function (oError) {
					console.log("Not connected to Northwind")
					console.log(oError);
				}
			})
		},
		
		onValueHelpDialog: function (oEvent) {
			ValueHelpDialog.handleValueHelpDialog(this, oEvent);
		}
	});
});