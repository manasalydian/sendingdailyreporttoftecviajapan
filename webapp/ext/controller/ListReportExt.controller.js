sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/comp/smartfilterbar/SmartFilterBar",
    "sap/m/ComboBox"
], function (Filter, SmartFilterBar, ComboBox) {
    "use strict";
    return {
         getCustomAppStateDataExtension: function (oCustomData) {
            //the content of the custom field will be stored in the app state, so that it can be restored later, for example after a back navigation.
            //The developer has to ensure that the content of the field is stored in the object that is passed to this method.
            if (oCustomData) {

                // Use controller-level flag object to persist across hook calls
                if (!this._customDateDefaultsApplied) {
                    this._customDateDefaultsApplied = {};
                }

                var applyDefaultDateOnce = function (sFieldId) {
                    if (!this._customDateDefaultsApplied[sFieldId]) {
                        var oField = this.byId(sFieldId);

                        if (oField && !oField.getDateValue()) {
                            var oYesterday = new Date();
                            oYesterday.setDate(oYesterday.getDate() - 1);
                            oField.setDateValue(oYesterday);
                        }

                        this._customDateDefaultsApplied[sFieldId] = true;
                    }
                }.bind(this);

                // Use setTimeout to ensure controls are rendered
                setTimeout(function () {
                    applyDefaultDateOnce("idLastChangedDate");
                    applyDefaultDateOnce("idPurchaseOrdDate");
                    // Add more fields if needed
                }, 0);



            }
        },
        restoreCustomAppStateDataExtension: function (oCustomData) {
            //in order to restore the content of the custom field in the filter bar, for example after a back navigation,
            //an object with the content is handed over to this method. Now the developer has to ensure that the content of the custom filter is set to the control
            if (oCustomData) {
                if (oCustomData.PurchaseOrdDate) {
                    var oComboBox = this.oView.byId("idPurchaseOrdDate");
                    oComboBox.setDateValue(
                        oCustomData.PurchaseOrdDate
                    );
                }
            }
        },
        onBeforeRebindTableExtension: function (oEvent) {
            var oBindingParams = oEvent.getParameter("bindingParams");

            var oPurchaseOrdDateControl = this.oView.byId("idPurchaseOrdDate");
            var oLastChangedFieldControl = this.oView.byId("idLastChangedDate");

            var aFilters = [];

            if (oPurchaseOrdDateControl) {
                var oPurchaseOrdDate = oPurchaseOrdDateControl.getDateValue();
                var sFormattedPODate = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MM/dd/yyyy" }).format(oPurchaseOrdDate);
                if (oPurchaseOrdDate) {
                    aFilters.push(
                        new sap.ui.model.Filter("PODate", sap.ui.model.FilterOperator.EQ, sFormattedPODate)
                    );
                }
            }

            if (oLastChangedFieldControl) {
                var oLastChangedDate = oLastChangedFieldControl.getDateValue();
                var sFormattedLCDate = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MM/dd/yyyy" }).format(oLastChangedDate);
                if (oLastChangedDate) {
                    aFilters.push(
                        new sap.ui.model.Filter("LastChangeDateTime", sap.ui.model.FilterOperator.EQ, sFormattedLCDate)
                    );
                }
            }

            // Only add filters if there is at least one real filter
            if (aFilters.length > 0) {
                oBindingParams.filters.push(
                    new sap.ui.model.Filter({
                        filters: aFilters,
                        and: true // OR condition
                    })
                );
            }

            // If no filters, oBindingParams.filters remains untouched → loads all data
        }

    };
});