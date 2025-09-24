import React, { useState } from "react";

const MaterialCalculator = () => {
  const [mode, setMode] = useState("select");
  const [weight, setWeight] = useState(0);

  const GST_PERCENTAGE = 0.18;
  const TCS_PERCENTAGE = 0.01;

  const formatNumber = (num) => num.toFixed(2);

  // All calculated values
  let heteroRate = 0;
  let customsTax = 0;
  let pcbCharges = 0;
  let apemclCharges = 0.07; // common
  let materialCost = 0;
  let materialPriceHetero = 0;
  let gstHetero = 0;
  let materialPriceGst = 0;
  let tcs = 0;
  let genetiqueToHetero = 0;
  let genetiqueMaterialCost = 0;
  let materialPriceGenetique = 0;
  let gstGenetique = 0;
  let vpcsToGenetique = 0;

  if (mode === "etp") {
    heteroRate = 18.0;
    customsTax = heteroRate * 0.11;
    pcbCharges = 2.0;
    materialCost = heteroRate + customsTax;
    materialPriceHetero = materialCost * weight;
    gstHetero = materialPriceHetero * GST_PERCENTAGE;
    materialPriceGst = materialPriceHetero + gstHetero;
    tcs = materialPriceGst * TCS_PERCENTAGE;
    genetiqueToHetero = materialPriceGst + tcs;
    genetiqueMaterialCost =
      heteroRate + customsTax + pcbCharges + apemclCharges;
    materialPriceGenetique = genetiqueMaterialCost * weight;
    gstGenetique = materialPriceGenetique * GST_PERCENTAGE;
    vpcsToGenetique = materialPriceGenetique + gstGenetique;
  } else if (mode === "stripper") {
    heteroRate = 4.0;
    customsTax = 0.0;
    pcbCharges = 1.0;
    materialCost = heteroRate + pcbCharges;
    materialPriceHetero = heteroRate * weight;
    gstHetero = materialPriceHetero * GST_PERCENTAGE;
    materialPriceGst = materialPriceHetero + gstHetero;
    tcs = materialPriceGst * TCS_PERCENTAGE;
    genetiqueToHetero = materialPriceGst + tcs;
    genetiqueMaterialCost = heteroRate + pcbCharges + apemclCharges;
    materialPriceGenetique = genetiqueMaterialCost * weight;
    gstGenetique = materialPriceGenetique * GST_PERCENTAGE;
    vpcsToGenetique = materialPriceGenetique + gstGenetique;
  }

  return (
    <div className="container">
      <h1>Material Cost Calculation</h1>

      <div className="input-section">
        <label>Material:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{ width: "100%", padding: "8px", fontSize: "1rem" }}
        >
          <option value="select">Select</option>
          <option value="etp">ETP</option>
          <option value="stripper">Stripper</option>
        </select>

        <label>Weight:</label>
        <input
          type="number"
          value={weight}
          min="0"
          step="1"
          placeholder="Enter weight"
          onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "1rem",
            textAlign: "left",
          }}
        />
      </div>

      <div className="results-table">
        <div className="table-row header">
          <div className="component">Component</div>
          <div className="value">Value</div>
          <div className="comments">Comments</div>
        </div>

        <div className="table-row">
          <div className="component">Total Weight</div>
          <div className="value">{formatNumber(weight)}</div>
          <div className="comments">Total weight of the material.</div>
        </div>

        <div className="table-row">
          <div className="component">Hetero material Rate</div>
          <div className="value">{formatNumber(heteroRate)}</div>
          <div className="comments">Rate per unit for Hetero material.</div>
        </div>

        <div className="table-row">
          <div className="component">Customs Tax</div>
          <div className="value">{formatNumber(customsTax)}</div>
          <div className="comments">
            11% of Hetero Material Rate for ETP, 0% for Stripper.
          </div>
        </div>

        <div className="table-row">
          <div className="component">Material cost</div>
          <div className="value">{formatNumber(materialCost)}</div>
          <div className="comments">Hetero rate + Customs tax</div>
        </div>

        <div className="table-row">
          <div className="component">Material Price @Hetero</div>
          <div className="value">{formatNumber(materialPriceHetero)}</div>
          <div className="comments">Material cost * Weight</div>
        </div>

        <div className="table-row">
          <div className="component">GST</div>
          <div className="value">{formatNumber(gstHetero)}</div>
          <div className="comments">18% of Material Price @ Hetero.</div>
        </div>

        <div className="table-row">
          <div className="component">Material price+GST</div>
          <div className="value">{formatNumber(materialPriceGst)}</div>
          <div className="comments">Sum of Material Price @ Hetero and GST.</div>
        </div>

        <div className="table-row">
          <div className="component">TCS</div>
          <div className="value">{formatNumber(tcs)}</div>
          <div className="comments">1% of (Material price+GST)</div>
        </div>

        <div className="table-row highlight">
          <div className="highlight">Genetique to Hetero</div>
          <div className="value">{formatNumber(genetiqueToHetero)}</div>
          <div className="comments">Material price+GST+TCS</div>
        </div>

        <div className="table-row">
          <div className="component">PCB Charges</div>
          <div className="value">{formatNumber(pcbCharges)}</div>
          <div className="comments">PCB Charges ETP 2.00, Stripper 1.00</div>
        </div>

        <div className="table-row">
          <div className="component">APEMCL charges</div>
          <div className="value">{formatNumber(apemclCharges)}</div>
          <div className="comments">Additional charges for APEMCL.</div>
        </div>

        <div className="table-row">
          <div className="component">Genetique material cost</div>
          <div className="value">{formatNumber(genetiqueMaterialCost)}</div>
          <div className="comments">
            Hetero rate + Customs tax + PCB charges + MPCL Charges
          </div>
        </div>

        <div className="table-row">
          <div className="component">Material Price @ Genetique</div>
          <div className="value">{formatNumber(materialPriceGenetique)}</div>
          <div className="comments">Genetique material cost * Weight</div>
        </div>

        <div className="table-row">
          <div className="component">GST</div>
          <div className="value">{formatNumber(gstGenetique)}</div>
          <div className="comments">18% of Material price @Genetique</div>
        </div>

        <div className="table-row highlight">
          <div className="highlight">VPCS to Genetique</div>
          <div className="value">{formatNumber(vpcsToGenetique)}</div>
          <div className="comments">Material Price @ Genetique + GST</div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCalculator;
