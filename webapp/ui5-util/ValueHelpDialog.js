sap.ui.define([
	"sap/ui/comp/valuehelpdialog/ValueHelpDialog",
	"sap/ui/comp/filterbar/FilterBar",
	"sap/ui/comp/filterbar/FilterGroupItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function (ValueHelpDialog, FilterBar, FilterGroupItem, JSONModel, Filter) {
	"use strict";

	return {
		handleValueHelpDialog: function (oContext, oEvent) {
			//TODO Add Object Param model
			//TODO Add Function model
			var that = oContext;
			//var oContext = oEvent.getSource().getParent().getParent().getBindingContext("detailData");

			var fnOk = function (oOkEvent) {
				var oToken = oEvent.getParameter("tokens")[0];
				that.getModel("detailData").setProperty("WBSElementExt", oToken.data("row").WBSExt, oContext);
				that.getModel("detailData").setProperty("WBSElementDescr", oToken.data("row").WBSDescr, oContext);
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

			var oValueHelpDialog = new ValueHelpDialog({
				title: this.getResourceBundle().getText("itemDetailAccountAssignmentProjectLabel"),
				ok: fnOK,
				cancel: fnCancel,
				afterClose: fnAfterClose,
				supportMultiselect: false,
				key: "WBSExt",
				descriptionKey: "WBSDescr",
				filterBar: new FilterBar({
					filterGroupItems: [
						new FilterGroupItem({
							name: "WBSExt",
							groupName: "__$INTERNAL$",
							label: this.getResourceBundle().getText("itemDetailAccountAssignmentProjectLabel"),
							visibleInFilterBar: true,
							control: new Input({
								name: "WBSExt"
							})
						}),
						new FilterGroupItem({
							name: "WBSDescr",
							groupName: "__$INTERNAL$",
							label: this.getResourceBundle().getText("detailTableColumnDescription"),
							visibleInFilterBar: true,
							control: new Input({
								name: "WBSDescr"
							})
						})
					],
					search: fnSearch
				})
			});

			var oTable = oValueHelpDialog.getTable();
			oTable.setModel(new JSONModel({
				"cols": [{
					"label": this.getResourceBundle().getText("itemDetailAccountAssignmentProjectLabel"),
					"template": "WBSExt"
				}, {
					"label": this.getResourceBundle().getText("detailTableColumnDescription"),
					"template": "WBSDescr"
				}]
			}), "columns");
			if (oTable.bindRows) {
				var sCompanyCode = this.getModel("detailData").getProperty("/Company/CompanyCode");
				//        oTable.setModel(this.getModel("ProjectSet"), "ProjectSet");
				oTable.setModel(that.getModel());
				oTable.bindRows({
					path: "/Products",
					// filters: [new Filter({
					// 	path: "CompanyCode",
					// 	operator: "EQ",
					// 	value1: sCompanyCode
					// })]
				});
			}
			
			oValueHelpDialog.open();
		}
	};

});