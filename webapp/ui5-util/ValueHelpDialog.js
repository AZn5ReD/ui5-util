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
			// Get context if needed (in a table for example)
			var oContext = oEvent.getSource().getParent().getParent().getBindingContext(oParams.model) || null;

			// Define default functions
			var fnOk = function (oEvent) {
				var oToken = oEvent.getParameter("tokens")[0],
					oValueHelpSource = oEvent.getSource().data("valueHelpSource");
				oThis.getView().getModel(oParams.model).setProperty(oParams.key, oToken.data("row")[oParams.key], oContext);
				oThis.getView().getModel(oParams.model).setProperty(oParams.description, oToken.data("row")[oParams.description], oContext);
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
					value: oEvent.getSource()			// Keep reference of source
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
				// TODO Handle oDataModel and JSONModel
				// TODO Handle custom binding ? (filters, etc.)
				//        oTable.setModel(this.getModel("ProjectSet"), "ProjectSet");
				oTable.setModel(oThis.getView().getModel());
				oTable.bindRows({
					path: "/Products",
				});
			}

			oValueHelpDialog.open();
		}
	};

});