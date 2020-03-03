sap.ui.define([
	"sap/ui/core/message/Message",
	"sap/ui/core/MessageType",
	"sap/ui/core/ValueState"
], function (Message, MessageType, ValueState) {
	"use strict";

	return {
		handleValueHelp: function (oEvent) {
			var that = this;
			var oContext = oEvent.getSource().getParent().getParent().getBindingContext("detailData");
			var oValueHelpDialog = new ValueHelpDialog({
				title: this.getResourceBundle().getText("itemDetailAccountAssignmentProjectLabel"),
				ok: function (oEvent) {
					var oToken = oEvent.getParameter("tokens")[0];
					that.getModel("detailData").setProperty("WBSElementExt", oToken.data("row").WBSExt, oContext);
					that.getModel("detailData").setProperty("WBSElementDescr", oToken.data("row").WBSDescr, oContext);
					this.close();
				},
				cancel: function () {
					this.close();
				},
				afterClose: function () {
					this.destroy();
					delete this;
				},
				supportMultiselect: false,
				key: "WBSExt",
				descriptionKey: "WBSDescr",
				filterBar: new FilterBar({
					filterGroupItems: [
						new GroupItem({
							name: "WBSExt",
							groupName: "__$INTERNAL$",
							label: this.getResourceBundle().getText("itemDetailAccountAssignmentProjectLabel"),
							visibleInFilterBar: true,
							control: new Input({
								name: "WBSExt"
							})
						}),
						new GroupItem({
							name: "WBSDescr",
							groupName: "__$INTERNAL$",
							label: this.getResourceBundle().getText("detailTableColumnDescription"),
							visibleInFilterBar: true,
							control: new Input({
								name: "WBSDescr"
							})
						})
					],
					search: function (oEvent) {
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
					}
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
					path: "/WBSSet",
					filters: [new Filter({
						path: "CompanyCode",
						operator: "EQ",
						value1: sCompanyCode
					})]
				});
			}
			oValueHelpDialog.open();
		}
	};

});