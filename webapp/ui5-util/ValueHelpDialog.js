/*
Usage :

// XML
<Input value="{InputModel>/value}" description="{InputModel>/description}" showValueHelp="true" valueHelpRequest="onValueHelpDialog"/>

// JS
onValueHelpDialog: function (oEvent) {
	ValueHelpDialog.handleValueHelpDialog(this, oEvent, {
		title: "Title Products",
		key: "ID",
		description: "Name",
		cols: [{
			label: "Label ID",
			template: "Products>ID" // "ID" for ODataModel
		}, {
			label: "Label Name",
			template: "Products>Name" // "Name" for ODataModel
		}],
		rows: {
			path: "Products>/results" // "/Products" for ODataModel
		}
	}, {
		ok: function (oOkEvent) {
			var oToken = oOkEvent.getParameter("tokens")[0],
				oValueHelpSource = oOkEvent.getSource().data("valueHelpSource");
			oValueHelpSource.setValue(oToken.data("row")["ID"]);
			oValueHelpSource.setDescription(oToken.data("row")["Name"]);
			this.close();
		}
		cancel: function (oEvent) { ... },
		afterClose: function (oEvent) { ... },
		search: function (oEvent) { ... }
	});
}

*/

sap.ui.define([
	"sap/ui/comp/valuehelpdialog/ValueHelpDialog",
	"sap/ui/comp/filterbar/FilterBar",
	"sap/ui/comp/filterbar/FilterGroupItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/Input"
], function (ValueHelpDialog, FilterBar, FilterGroupItem, JSONModel, Filter, Input) {
	"use strict";

	return {
		handleValueHelpDialog: function (oThis, oEvent, oParams, oFunctions) {
			// Define default functions (can be redifined by oFunctions)
			var fnOk = function (oOkEvent) {
				// var oToken = oOkEvent.getParameter("tokens")[0],
				// 	oValueHelpSource = oOkEvent.getSource().data("valueHelpSource");
				// oValueHelpSource.setValue(oToken.data("row")[oParams.key]);
				// oValueHelpSource.setDescription(oToken.data("row")[oParams.description]);

				// Working with context if needed (in a table for example)
				// var oContext = oValueHelpSource.getBindingContext("model");
				// oThis.getView().getModel("model").setProperty(oParams.key, oToken.data("row")[oParams.key], oContext);
				// oThis.getView().getModel("model").setProperty(oParams.description, oToken.data("row")[oParams.description], oContext);

				this.close();
			};

			var fnCancel = function () {
				this.close();
			};

			var fnAfterClose = function () {
				this.destroy();
				delete this;
			};

			var fnSearch = function (oEvent) {
				var aSelectionSet = oEvent.getParameter("selectionSet");
				var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
					if (oControl.getValue()) {
						aResult.push(new Filter({
							path: oControl.getName(),
							operator: "Contains",
							value1: oControl.getValue()
						}));
					}
					return aResult;
				}, []);

				var oValueHelpDialog = oEvent.getSource().getParent().getParent().getParent();
				var oTable = oValueHelpDialog.getTable();
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(aFilters);
				}
				oValueHelpDialog.update();
			};

			// Replace with custom functions
			if (oFunctions) {
				fnOk = oFunctions.ok || fnOK;
				fnCancel = oFunctions.cancel || fnCancel;
				fnAfterClose = oFunctions.afterClose || fnAfterClose;
				fnSearch = oFunctions.search || fnSearch;
			}

			// Define value help dialog
			var oValueHelpDialog = new ValueHelpDialog({
				title: oParams.title,
				supportMultiselect: false,
				key: oParams.key,
				descriptionKey: oParams.description,
				filterBar: new FilterBar({
					filterGroupItems: [
						new FilterGroupItem({
							name: oParams.key,
							groupName: "__$INTERNAL$",
							label: oParams.cols[0].label, // 1st column label
							visibleInFilterBar: true,
							control: new Input({
								name: oParams.key
							})
						}),
						new FilterGroupItem({
							name: oParams.description,
							groupName: "__$INTERNAL$",
							label: oParams.cols[1].label, // 2nd column label
							visibleInFilterBar: true,
							control: new Input({
								name: oParams.key
							})
						})
					],
					search: fnSearch
				}),
				customData: [{
					key: "valueHelpSource",
					value: oEvent.getSource() // Keep reference of source
				}],
				ok: fnOk,
				cancel: fnCancel,
				afterClose: fnAfterClose
			});

			// Set value help dialog models
			var oTable = oValueHelpDialog.getTable();
			oTable.setModel(new JSONModel({
				cols: oParams.cols
			}), "columns");

			if (oTable.bindRows) {
				var index = oParams.rows.path.indexOf(">");
				if (index !== -1) { // Local model
					var sModel = oParams.rows.path.substring(0, index);
					oTable.setModel(oThis.getView().getModel(sModel), sModel);
				} else { // ODataModel
					oTable.setModel(oThis.getView().getModel());
				}
				oTable.bindRows(oParams.rows);
			}

			oValueHelpDialog.open();
		}
	};

});