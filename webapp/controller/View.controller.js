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
					this.getView().setModel(new sap.ui.model.json.JSONModel(oData), "Products");
				}.bind(this),
				error: function (oError) {
					console.log("Not connected to Northwind")
					console.log(oError);
				}
			});

			this.getView().setModel(new sap.ui.model.json.JSONModel(), "InputModel");
		},

		onValueHelpDialog: function (oEvent) {
			ValueHelpDialog.handleValueHelpDialog(this, oEvent, {
				title: "Title Products",
				key: "ID",
				description: "Name",
				cols: [{
					label: "Label ID",
					template: "Products>ID" // "ID"
				}, {
					label: "Label Name",
					template: "Products>Name" // "Name"
				}],
				rows: {
					path: "Products>/results" // "/Products"
				}
			}, {
				ok: function (oOkEvent) {
					var oToken = oOkEvent.getParameter("tokens")[0],
						oValueHelpSource = oOkEvent.getSource().data("valueHelpSource");
					oValueHelpSource.setValue(oToken.data("row")["ID"]);
					oValueHelpSource.setDescription(oToken.data("row")["Name"]);
					oOkEvent.getSource().close();
				}
			});
		}
	});
});