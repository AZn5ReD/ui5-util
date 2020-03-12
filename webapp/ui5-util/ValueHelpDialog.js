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
				template: "Products>ID" // "ID"
			}, {
				label: "Label Name",
				template: "Products>Name" // "Name"
			}, {
				label: "Label Description",
				template: "Products>Description" // "Description"
			}],
			rows: {
				path: "Products>/results" // "/Products"
			},
			searchAllDescriptions: true // Only on description to search all the other columns
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
			var index, name;

			// Define default functions (can be redifined by oFunctions)
			var fnOk = function (oOkEvent) {
				var oToken = oOkEvent.getParameter("tokens")[0],
					oValueHelpSource = oOkEvent.getSource().data("valueHelpSource");
				oValueHelpSource.setValue(oToken.data("row")[oParams.key]);
				oValueHelpSource.setDescription(oToken.data("row")[oParams.description]);

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

				// Search on all descriptions
				var oDescriptionFilter = aFilters.find(function (el) {
					return el.sPath === oParams.description
				});
				if (oParams.searchAllDescriptions && oDescriptionFilter) {
					for (var i in oParams.cols) {
						if (i < 2) {
							continue;
						}
						index = oParams.cols[i].template.indexOf(">");
						var path = (index !== -1) ? oParams.cols[i].template.substring(index + 1, oParams.cols[i].template.length) : oParams.cols[i].template;
						aFilters.push(new Filter({
							path: path,
							operator: "Contains",
							value1: oDescriptionFilter.oValue1
						}));
					}
				}

				var oValueHelpDialog = oEvent.getSource().getParent().getParent().getParent();
				var oTable = oValueHelpDialog.getTable();
				oTable.getBinding("rows").filter(aFilters.length ? new Filter({
					filters: aFilters
				}) : new Filter());
				oValueHelpDialog.update();
			};
			
			// Replace with custom functions
			if (oFunctions) {
				fnOk = oFunctions.ok || fnOK;
				fnCancel = oFunctions.cancel || fnCancel;
				fnAfterClose = oFunctions.afterClose || fnAfterClose;
				fnSearch = oFunctions.search || fnSearch;
			}

			// Filter group items
			var aFilterGroupItems = [];
			for (var i in oParams.cols) {
				if (oParams.searchAllDescriptions && i === "2") { // Show only key and description input search
					break;
				}
				index = oParams.cols[i].template.indexOf(">");
				name = (index !== -1) ? oParams.cols[i].template.substring(index + 1, oParams.cols[i].template.length) : oParams.cols[i].template;
				aFilterGroupItems.push(
					new FilterGroupItem({
						name: name,
						groupName: "__$INTERNAL$",
						label: oParams.cols[i].label,
						visibleInFilterBar: true,
						control: new Input({
							name: name
						})
					})
				);
			}

			// Define value help dialog
			var oValueHelpDialog = new ValueHelpDialog({
				title: oParams.title,
				supportMultiselect: false,
				key: oParams.key,
				descriptionKey: oParams.description,
				filterBar: new FilterBar({
					filterGroupItems: aFilterGroupItems,
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

			// Columns
			oTable.setModel(new JSONModel({
				cols: oParams.cols
			}), "columns");

			// Rows
			index = oParams.rows.path.indexOf(">");
			if (index !== -1) { // Local model
				var sModel = oParams.rows.path.substring(0, index);
				oTable.setModel(oThis.getView().getModel(sModel), sModel);
			} else { // ODataModel
				oTable.setModel(oThis.getView().getModel());
			}
			oTable.bindRows(oParams.rows);

			oValueHelpDialog.open();
		}
	};

});